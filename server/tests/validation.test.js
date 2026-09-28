import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContactInput, isValidUUID } from '../utils/validation.js';

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

test('Validation: Valid contact with empty whitespace email', () => {
  const result = validateContactInput({
    name: 'Beatrix Thorne',
    phone: '+44 20 7946 0912',
    email: '   '
  });

  assert.equal(result.isValid, true);
  assert.equal(result.sanitized.email, null);
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

test('Validation: Reject invalid email format', () => {
  const result = validateContactInput({
    name: 'Clara Oswald',
    phone: '+1 555 432 1111',
    email: 'invalid-email-address'
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.email);
});

test('Validation: UUID format validation', () => {
  assert.equal(isValidUUID('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), true);
  assert.equal(isValidUUID('not-a-uuid'), false);
  assert.equal(isValidUUID('12345'), false);
  assert.equal(isValidUUID(null), false);
  assert.equal(isValidUUID(undefined), false);
});
