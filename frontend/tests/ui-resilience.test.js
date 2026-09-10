import assert from 'node:assert/strict'
import test from 'node:test'
import { getCollection, getDetailItems } from '../src/utils/vendorData.js'
import { validateBroadcast, validateDateRange, validatePayment, validatePackage, validateResponseText } from '../src/utils/formValidation.js'

test('numeric result counts and malformed collection fields cannot crash list rendering', () => {
  for (const payload of [{ results: 20 }, { data: { packages: {} } }, { data: { notifications: 'invalid' } }]) {
    assert.deepEqual(getCollection(payload), [])
  }
  assert.deepEqual(getCollection({ packages: {}, bookings: [{ id: 'booking' }] }), [{ id: 'booking' }])
})

test('package detail lists accept legacy text, JSON arrays, and absent data', () => {
  assert.deepEqual(getDetailItems('Walk through Petra'), ['Walk through Petra'])
  assert.deepEqual(getDetailItems('[{"title":"Day 1"},null]'), [{ title: 'Day 1' }])
  assert.deepEqual(getDetailItems([null, undefined, 'Transport']), ['Transport'])
  assert.deepEqual(getDetailItems({ invalid: true }), [])
  assert.deepEqual(getDetailItems(null), [])
})

test('broadcast rejects whitespace-only content and values over backend limits', () => {
  const form = { title: 'Trip update', message: 'Meeting time changed.', targetAudience: 'all' }
  assert.equal(validateBroadcast(form, 'admin'), '')
  assert.ok(validateBroadcast({ ...form, title: '   ' }, 'admin'))
  assert.ok(validateBroadcast({ ...form, message: ' '.repeat(10) }, 'vendor'))
  assert.ok(validateBroadcast({ ...form, message: 'a'.repeat(501) }, 'vendor'))
})

test('date ranges reject impossible dates and backwards schedules', () => {
  assert.ok(validateDateRange('2027-02-29', '2027-03-01'))
  assert.ok(validateDateRange('2028-03-02', '2028-03-01'))
  assert.equal(validateDateRange('2028-02-29', '2028-03-01'), '')
})

test('financial and package numeric inputs reject non-finite values', () => {
  const payment = { vendor_id: '742a8d92-3e87-49f4-9f4e-67d3eeda2ffc', amount: 'Infinity', payment_method: 'CliQ', payment_description: 'Test payment' }
  assert.ok(validatePayment(payment, 'admin'))
  assert.ok(validatePackage({ package_name: 'Test package', package_price: 'NaN' }, true))
})

test('review and complaint replies reject blank and oversized text', () => {
  assert.ok(validateResponseText('   ', { min: 2, max: 500 }))
  assert.ok(validateResponseText('x'.repeat(501), { min: 2, max: 500 }))
  assert.equal(validateResponseText('Thank you for your feedback.', { min: 2, max: 500 }), '')
})
