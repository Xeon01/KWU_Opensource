import test from 'node:test';
import assert from 'node:assert/strict';
import { formatWon, getInitials } from '../src/utils/format.js';
import { DEMO_TRIP_ID, PATHS } from '../src/routes/paths.js';

test('formats KRW without fractions', () => {
  assert.equal(formatWon(1234567), '₩1,234,567');
});

test('rejects invalid amount', () => {
  assert.throws(() => formatWon(Number.NaN), TypeError);
});

test('gets first character safely', () => {
  assert.equal(getInitials(' 현규 '), '현');
  assert.equal(getInitials(''), '?');
});

test('builds encoded feature URLs', () => {
  assert.equal(PATHS.expenses('여행 1'), '/trips/%EC%97%AC%ED%96%89%201/expenses');
  assert.equal(PATHS.schedule(DEMO_TRIP_ID), '/trips/demo-jeju/schedule');
});
