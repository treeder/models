import test from 'node:test'
import assert from 'node:assert'
import { parseModel } from './index.js'
import { validate } from './validate.js'

test('parseModel - does not inject phantom "type" or "parse" into Object/JSON fields', () => {
  const Clz = {
    properties: {
      data: { type: Object },
      meta: { type: JSON },
    },
  }

  const input = {
    data: JSON.stringify({ url: 'https://example.com', userAgent: 'Mozilla/5.0' }),
    meta: { foo: 'bar' },
  }

  const parsed = parseModel(input, Clz, { parseJSON: true })

  assert.strictEqual(parsed.data.url, 'https://example.com')
  assert.strictEqual(parsed.data.userAgent, 'Mozilla/5.0')
  assert.strictEqual('type' in parsed.data, false, 'parsed.data should not have "type" key')
  assert.strictEqual('parse' in parsed.data, false, 'parsed.data should not have "parse" key')
  assert.deepStrictEqual(Object.keys(parsed.data), ['url', 'userAgent'])

  assert.strictEqual('type' in parsed.meta, false, 'parsed.meta should not have "type" key')
  assert.deepStrictEqual(Object.keys(parsed.meta), ['foo'])
})

test('parseModel - parses nested sub-properties on Object when defined without adding undefined keys', () => {
  const Clz = {
    properties: {
      details: {
        type: Object,
        createdAt: { type: Date },
        count: { type: Number },
      },
    },
  }

  const input = {
    details: {
      createdAt: '2026-09-24T00:00:00.000Z',
    },
  }

  const parsed = parseModel(input, Clz)

  assert.ok(parsed.details.createdAt instanceof Date)
  assert.strictEqual('count' in parsed.details, false, 'should not add undefined count property')
  assert.strictEqual('type' in parsed.details, false)
})

test('parseModel - parses Array sub-properties without adding undefined keys', () => {
  const Clz = {
    properties: {
      items: {
        type: Array,
        createdAt: { type: Date },
        score: { type: Number },
      },
    },
  }

  const input = {
    items: JSON.stringify([
      { name: 'first', createdAt: '2026-09-24T00:00:00.000Z' },
      { name: 'second', score: '42' },
    ]),
  }

  const parsed = parseModel(input, Clz, { parseJSON: true })

  assert.ok(parsed.items[0].createdAt instanceof Date)
  assert.strictEqual('score' in parsed.items[0], false, 'should not add undefined score property')
  assert.strictEqual('type' in parsed.items[0], false)

  assert.strictEqual(parsed.items[1].score, 42)
  assert.strictEqual('createdAt' in parsed.items[1], false)
  assert.strictEqual('type' in parsed.items[1], false)
})

test('parseModel - handles primitives, dates, bigints, arrays of models', () => {
  const Clz = {
    properties: {
      id: { type: String },
      count: { type: Number },
      active: { type: Boolean },
      date: { type: Date },
    },
  }

  const list = [
    { id: '1', count: '10', active: true, date: '2026-01-01' },
    { id: '2', count: 20, active: false, date: new Date('2026-01-02') },
  ]

  const parsed = parseModel(list, Clz)
  assert.strictEqual(parsed[0].count, 10)
  assert.ok(parsed[0].date instanceof Date)
  assert.strictEqual(parsed[1].count, 20)
})

test('validate - validates object types against schema', () => {
  const Clz = {
    properties: {
      name: { type: String },
      count: { type: Number },
    },
  }

  assert.doesNotThrow(() => validate({ name: 'test', count: 5 }, Clz))
  assert.throws(() => validate({ name: 'test', count: 'not a number' }, Clz))
})

test('parseModel - handles primitive or null values for Object/JSON fields with sub-properties', () => {
  const Clz = {
    properties: {
      data: {
        type: Object,
        length: { type: Number },
      },
    },
  }

  assert.doesNotThrow(() => {
    const parsed = parseModel({ data: 'hello' }, Clz)
    assert.strictEqual(parsed.data, 'hello')
  })

  assert.doesNotThrow(() => {
    const parsed = parseModel({ data: 123 }, Clz)
    assert.strictEqual(parsed.data, 123)
  })

  assert.doesNotThrow(() => {
    const parsed = parseModel({ data: null }, Clz)
    assert.strictEqual(parsed.data, null)
  })
})

