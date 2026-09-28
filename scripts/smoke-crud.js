// Creates and removes only its own fictional record. Works locally or on a deployed URL.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = new URL('/api/contacts', process.argv[2] || 'http://localhost:3001');
let createdId;
async function request(path = '', method = 'GET', body) {
  return fetch(`${base}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000)
  });
}
try {
  const invalid = await request('', 'POST', { name: '', phone: '' });
  assert.equal(invalid.status, 400, 'Blank fields must be rejected');
  const created = await request('', 'POST', {
    name: `Demo Smoke ${randomUUID()}`,
    phone: '07700 900123'
  });
  assert.equal(created.status, 201, 'Create must return 201');
  const contact = await created.json();
  createdId = contact.id;
  assert.ok(createdId);
  assert.equal(contact.phone, '07700 900123');
  assert.equal(contact.email, null);
  const updated = await request(`/${createdId}`, 'PUT', {
    name: contact.name,
    phone: '+1 (555) 010-0200',
    email: 'demo@example.com'
  });
  assert.equal(updated.status, 200, 'Update must return 200');
  const list = await request();
  assert.equal(list.status, 200);
  const saved = (await list.json()).find(row => row.id === createdId);
  assert.equal(saved?.phone, '+1 (555) 010-0200');
  assert.equal(saved?.email, 'demo@example.com');
  assert.equal((await request(`/${createdId}`, 'DELETE')).status, 204);
  const fresh = await request();
  assert.equal(fresh.status, 200);
  assert.equal((await fresh.json()).some(row => row.id === createdId), false);
  assert.equal((await request(`/${createdId}`, 'DELETE')).status, 404);
  createdId = undefined;
  console.log('PASS: validation, create, update, fresh read, delete, and missing-record response.');
} finally {
  if (createdId) {
    const cleanup = await request(`/${createdId}`, 'DELETE');
    if (![204, 404].includes(cleanup.status)) {
      console.error(`Cleanup failed for fictional smoke contact ${createdId}: HTTP ${cleanup.status}`);
      process.exitCode = 1;
    }
  }
}
