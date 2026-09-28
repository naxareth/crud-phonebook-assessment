import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('API: GET /api/health returns 200 OK', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(typeof data.configured, 'boolean');
});

test('API: POST /api/contacts validates missing fields and returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', phone: '' })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Validation failed');
  assert.ok(data.details.name);
  assert.ok(data.details.phone);
});

test('API: POST /api/contacts validates invalid email and returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Valid Name',
      phone: '+1 555 123 4567',
      email: 'not-an-email'
    })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Validation failed');
  assert.ok(data.details.email);
});

test('API: PUT /api/contacts/:id validates malformed UUID and returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/contacts/not-a-valid-uuid`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Valid Name', phone: '123-456-7890' })
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Invalid contact ID format.');
});

test('API: DELETE /api/contacts/:id validates malformed UUID and returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/contacts/invalid-uuid-string`, {
    method: 'DELETE'
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'Invalid contact ID format.');
});

test('API: Unmatched /api route returns 404', async () => {
  const res = await fetch(`${baseUrl}/api/nonexistent`);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.error, 'Endpoint not found');
});

test('Frontend Static: GET / returns 200 and serves HTML', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes('Paper Directory'));
});
