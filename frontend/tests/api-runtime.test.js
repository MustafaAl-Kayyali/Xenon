import assert from 'node:assert/strict'
import test from 'node:test'

const values = new Map()
globalThis.sessionStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
}
globalThis.localStorage = { getItem: () => null, removeItem: () => {} }
globalThis.BroadcastChannel = undefined
globalThis.window = { setTimeout, clearTimeout, dispatchEvent: () => {} }
const { request } = await import('../src/services/api.js')
const { storage, TOKEN_KEY } = await import('../src/services/storage.js')
const reply = (status, body = {}) => ({ status, ok: status >= 200 && status < 300, json: async () => body })

test('request sends valid JSON and preserves successful API responses', async () => {
  values.clear()
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/v1/notifications')
    assert.equal(options.headers['Content-Type'], 'application/json')
    return reply(200, { data: [] })
  }
  assert.deepEqual(await request('/notifications'), { data: [] })
})

test('request presents bounded user messages for common API failure statuses', async () => {
  values.clear()
  for (const status of [400, 401, 403, 404, 409, 413, 422, 429, 500, 503]) {
    globalThis.fetch = async () => reply(status)
    await assert.rejects(request('/notifications'), (error) => error.status === status && error.message.length > 10)
  }
})

test('HTML returned by a misconfigured proxy is not treated as successful data', async () => {
  values.clear()
  globalThis.fetch = async () => ({ ...reply(200), json: async () => { throw new SyntaxError('HTML') } })
  await assert.rejects(request('/notifications'), /unreadable response/)
  globalThis.fetch = async () => ({ ...reply(204), json: async () => { throw new SyntaxError('Empty') } })
  assert.deepEqual(await request('/notifications'), {})
})

test('temporary refresh failure does not log out an otherwise stored session', async () => {
  storage.setAuthSession({ token: 'test-access', refreshToken: 'test-refresh', role: 'vendor' })
  globalThis.fetch = async (url) => url.endsWith('/auth/refresh-token') ? reply(503) : reply(401)
  await assert.rejects(request('/notifications'), (error) => error.status === 503)
  assert.equal(storage.get(TOKEN_KEY), 'test-access')
})

test('rejected refresh credentials do clear the invalid local session', async () => {
  storage.setAuthSession({ token: 'test-access', refreshToken: 'test-refresh', role: 'vendor' })
  globalThis.fetch = async () => reply(401)
  await assert.rejects(request('/notifications'), (error) => error.status === 401)
  assert.equal(storage.get(TOKEN_KEY), null)
})

test('network and timeout failures give readable messages without leaking raw errors', async () => {
  values.clear()
  globalThis.fetch = async () => { throw new TypeError('fetch failed') }
  await assert.rejects(request('/notifications'), /Cannot connect/)
  globalThis.fetch = async () => { throw Object.assign(new Error('aborted'), { name: 'AbortError' }) }
  await assert.rejects(request('/notifications'), /too long/)
})
