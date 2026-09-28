import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContactInput, isValidUUID, sanitizeString } from '../utils/validation.js';

test('Validation: Valid contact with all fields', () => {
  const result = validateContactInput({
    name: '  Jane Doe  ',
    phone: ' +1 (555) 123-4567 ',
    email: ' JANE.DOE@example.COM '
  });

  assert.equal(result.isValid, true);
  assert.equal(result.sanitized.name, 'Jane Doe');
  assert.equal(result.sanitized.phone, '+1 (555) 123-4567');
  assert.equal(result.sanitized.email, 'jane.doe@example.com');
  assert.deepEqual(result.errors, {});
});

test('Sanitization: Strips HTML elements and preserves clean text', () => {
  const result = validateContactInput({
    name: '<b>Dr. John Watson</b>',
    phone: '+1 (555) 000-1111',
    email: 'john.watson@example.com'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.sanitized.name, 'Dr. John Watson');
  assert.equal(result.sanitized.email, 'john.watson@example.com');
});

test('Sanitization: Removes non-printable control characters and null bytes', () => {
  const dirtyName = 'Arthur\x00\x08\x1B Pendelton\x7F';
  const cleaned = sanitizeString(dirtyName);
  assert.equal(cleaned, 'Arthur Pendelton');
});

test('Sanitization: Collapses excessive internal whitespace into single space', () => {
  const result = validateContactInput({
    name: 'Eleanor     Vance',
    phone: '+1   555   432   8765'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.sanitized.name, 'Eleanor Vance');
  assert.equal(result.sanitized.phone, '+1 555 432 8765');
});

test('Validation: Supports international Unicode names with accents and characters', () => {
  const names = [
    'María José',
    'François Müller',
    'Björn Stroustrup',
    '佐藤 健',
    "Patrick O'Connor",
    'Jean-Luc Picard',
    'Dr. Arthur Pendelton Jr.'
  ];

  for (const name of names) {
    const res = validateContactInput({ name, phone: '+1 555 123 4567' });
    assert.equal(res.isValid, true, `Expected valid name for: ${name}`);
    assert.equal(res.sanitized.name, name);
  }
});

test('Validation: Reject names containing numbers or random symbols', () => {
  const invalidNames = [
    'Arthur f34324',
    'John Doe 123',
    'User#99',
    '!@#$%^&*()',
    'A' // Under 2 letters
  ];

  for (const name of invalidNames) {
    const res = validateContactInput({ name, phone: '+1 555 123 4567' });
    assert.equal(res.isValid, false, `Expected invalid name for: ${name}`);
    assert.ok(res.errors.name);
  }
});

test('Validation: Reject phone numbers containing letters or invalid formatting', () => {
  const invalidPhones = [
    '3243465erytrty45645645645654yttryr',
    'phone-number-123',
    '123-abc-4567',
    '+1+555+1234',
    '555+1234'
  ];

  for (const phone of invalidPhones) {
    const res = validateContactInput({ name: 'Valid Name', phone });
    assert.equal(res.isValid, false, `Expected invalid phone for: ${phone}`);
    assert.ok(res.errors.phone);
  }
});

test('Validation: Reject invalid email format, double dots, and invalid extensions', () => {
  const invalidEmails = [
    'invalid-email',
    'test@example..com',
    '@nodomain.com',
    'missingtld@domain',
    'name@example.comfwere',
    'arthur.p@example.comdsd'
  ];

  for (const email of invalidEmails) {
    const result = validateContactInput({
      name: 'Clara Oswald',
      phone: '+1 555 432 1111',
      email
    });
    assert.equal(result.isValid, false, `Expected invalid email for: ${email}`);
    assert.ok(result.errors.email);
  }
});

test('Validation: Valid contact with optional email omitted', () => {
  const result = validateContactInput({
    name: 'Arthur Pendelton',
    phone: '07700 900461'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.sanitized.name, 'Arthur Pendelton');
  assert.equal(result.sanitized.phone, '07700 900461');
  assert.equal(result.sanitized.email, null);
  assert.deepEqual(result.errors, {});
});

test('Validation: Preserves international and leading zeros in phone numbers', () => {
  const phones = [
    '07700 900461',
    '+44 20 7946 0912',
    '+1 (555) 890-1234',
    '+61 2 9876 5432',
    '0912-345-6789',
    '+81 3 1234 5678'
  ];

  for (const phone of phones) {
    const res = validateContactInput({ name: 'Test Contact', phone });
    assert.equal(res.isValid, true, `Expected valid phone for: ${phone}`);
    assert.equal(res.sanitized.phone, phone);
  }
});

test('Validation: Reject missing or empty name and phone', () => {
  const result = validateContactInput({
    name: '   ',
    phone: ''
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.phone);
});

test('Validation: Reject non-object or array payloads', () => {
  const res1 = validateContactInput(null);
  assert.equal(res1.isValid, false);

  const res2 = validateContactInput([1, 2, 3]);
  assert.equal(res2.isValid, false);

  const res3 = validateContactInput('string payload');
  assert.equal(res3.isValid, false);
});

test('Validation: UUID format validation', () => {
  assert.equal(isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), true);
  assert.equal(isValidUUID('not-a-uuid'), false);
  assert.equal(isValidUUID('12345'), false);
  assert.equal(isValidUUID(null), false);
  assert.equal(isValidUUID(undefined), false);
});

test('Validation: Every deterministic schema seed ID is accepted by CRUD routes', async () => {
  const { readFile } = await import('node:fs/promises');
  const schema = await readFile(new URL('../../supabase/schema.sql', import.meta.url), 'utf8');
  const ids = [...schema.matchAll(/'([0-9a-f-]{36})'/g)].map(match => match[1]);
  assert.equal(ids.length, 6);
  for (const id of ids) assert.equal(isValidUUID(id), true, id);
});
