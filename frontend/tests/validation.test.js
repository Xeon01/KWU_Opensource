import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLogin, validateSignup } from '../src/utils/validation.js';

const validSignup = { name: '여행자', email: 'user@example.com', password: 'abc12345', confirmPassword: 'abc12345' };

test('login validates missing email', () => {
  assert.match(validateLogin({ email: '', password: 'secret' }), /이메일/);
});

test('login accepts plausible credentials as a form (not as authenticated user)', () => {
  assert.equal(validateLogin({ email: 'user@example.com', password: 'secret' }), '');
});

test('signup requires a name', () => {
  assert.match(validateSignup({ ...validSignup, name: '' }), /이름/);
});

test('signup requires at least eight password characters', () => {
  assert.match(validateSignup({ ...validSignup, password: 'short', confirmPassword: 'short' }), /8자/);
});

test('signup requires matching passwords', () => {
  assert.match(validateSignup({ ...validSignup, confirmPassword: 'different' }), /일치/);
});

test('signup validates correct demo inputs', () => {
  assert.equal(validateSignup(validSignup), '');
});
