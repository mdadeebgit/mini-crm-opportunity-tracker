import test from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

// Test env must be set before app/config is imported.
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '2h';
process.env.NODE_ENV = 'test';

const { default: app } = await import('../src/app.js');

let mongo;

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

test.after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const registerUser = (overrides = {}) =>
  request(app)
    .post('/api/auth/register')
    .send({ name: 'User', email: `u${Date.now()}${Math.random()}@x.com`, password: 'secret123', ...overrides });

test('registers a user and returns a token (password hashed, not returned)', async () => {
  const res = await registerUser({ email: 'alice@example.com' });
  assert.equal(res.status, 201);
  assert.ok(res.body.token, 'expected a JWT');
  assert.equal(res.body.user.email, 'alice@example.com');
  assert.equal(res.body.user.password, undefined, 'password must not be returned');
});

test('rejects duplicate email registration with 409', async () => {
  await registerUser({ email: 'dupe@example.com' });
  const res = await registerUser({ email: 'dupe@example.com' });
  assert.equal(res.status, 409);
});

test('rejects registration with invalid email (400)', async () => {
  const res = await registerUser({ email: 'not-an-email' });
  assert.equal(res.status, 400);
});

test('login with wrong password returns 401', async () => {
  await registerUser({ email: 'bob@example.com', password: 'rightpass' });
  const res = await request(app).post('/api/auth/login').send({ email: 'bob@example.com', password: 'wrongpass' });
  assert.equal(res.status, 401);
});

test('opportunity routes require authentication (401 without token)', async () => {
  const res = await request(app).get('/api/opportunities');
  assert.equal(res.status, 401);
});

test('owner is derived from JWT, not the request body', async () => {
  const reg = await registerUser({ email: 'creator@example.com' });
  const token = reg.body.token;
  const realOwnerId = reg.body.user._id;
  const fakeOwnerId = new mongoose.Types.ObjectId().toString();

  const res = await request(app)
    .post('/api/opportunities')
    .set('Authorization', `Bearer ${token}`)
    .send({ customerName: 'Acme', requirement: 'Need CRM', owner: fakeOwnerId, estimatedValue: 1000 });

  assert.equal(res.status, 201);
  assert.equal(res.body.owner._id, realOwnerId, 'owner must come from the token');
  assert.notEqual(res.body.owner._id, fakeOwnerId);
});

test('a non-owner cannot update or delete (403)', async () => {
  const owner = await registerUser({ email: 'owner2@example.com' });
  const other = await registerUser({ email: 'other2@example.com' });

  const created = await request(app)
    .post('/api/opportunities')
    .set('Authorization', `Bearer ${owner.body.token}`)
    .send({ customerName: 'Globex', requirement: 'Pipeline' });
  const id = created.body._id;

  const updateRes = await request(app)
    .put(`/api/opportunities/${id}`)
    .set('Authorization', `Bearer ${other.body.token}`)
    .send({ stage: 'Won' });
  assert.equal(updateRes.status, 403);

  const deleteRes = await request(app)
    .delete(`/api/opportunities/${id}`)
    .set('Authorization', `Bearer ${other.body.token}`);
  assert.equal(deleteRes.status, 403);
});

test('the owner can update and delete their opportunity', async () => {
  const owner = await registerUser({ email: 'owner3@example.com' });

  const created = await request(app)
    .post('/api/opportunities')
    .set('Authorization', `Bearer ${owner.body.token}`)
    .send({ customerName: 'Initech', requirement: 'Demo', priority: 'Low' });
  const id = created.body._id;

  const updateRes = await request(app)
    .put(`/api/opportunities/${id}`)
    .set('Authorization', `Bearer ${owner.body.token}`)
    .send({ stage: 'Won', priority: 'High' });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.stage, 'Won');
  assert.equal(updateRes.body.priority, 'High');

  const deleteRes = await request(app)
    .delete(`/api/opportunities/${id}`)
    .set('Authorization', `Bearer ${owner.body.token}`);
  assert.equal(deleteRes.status, 200);
});

test('validation rejects an opportunity missing required fields (400)', async () => {
  const reg = await registerUser({ email: 'val@example.com' });
  const res = await request(app)
    .post('/api/opportunities')
    .set('Authorization', `Bearer ${reg.body.token}`)
    .send({ contactName: 'No customer or requirement' });
  assert.equal(res.status, 400);
});
