const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { NextRequest, NextResponse } = require('next/server')

function load(relative, imports = {}) {
    const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const module = { exports: {} }
    vm.runInNewContext(compiled, { module, exports: module.exports, console, URLSearchParams, require: name => imports[name] || require(name) })
    return module.exports
}
const helpers = load('src/lib/suvarnabhumi.ts')
const id = '12345678-1234-4234-8234-123456789abc'

function handler({ user = { id: 'admin-id' }, allowed = true, accessError = null, record = { attachment_paths: ['private/notice.pdf'], attachment_names: ['invoice.pdf'] }, readError = null, fileError = null } = {}) {
    const calls = []
    const client = {
        auth: { getUser: async () => ({ data: { user } }) },
        rpc: async name => { calls.push(['access', name]); return { data: allowed, error: accessError } },
        from: table => { calls.push(['table', table]); return { select: () => ({ eq: (column, value) => { calls.push(['record', column, value]); return { maybeSingle: async () => ({ data: record, error: readError }) } } }) } },
        storage: { from: bucket => ({ createSignedUrl: async (...args) => { calls.push(['file', bucket, ...args]); return { data: { signedUrl: 'https://example.supabase.co/storage/v1/object/sign/private.pdf?token=test' }, error: fileError } } }) },
    }
    return { calls, GET: load('src/app/dashboard/suvarnabhumi/[id]/attachments/[index]/route.ts', {
        'next/server': { NextResponse }, '@/utils/supabase/server': { createClient: async () => client }, '@/lib/suvarnabhumi': helpers,
    }).GET }
}
async function run(config, index = '0', download = false, requestId = id) {
    const subject = handler(config)
    const response = await subject.GET(new NextRequest(`https://admin.example/dashboard/suvarnabhumi/${requestId}/attachments/${index}${download ? '?download=1' : ''}`), { params: Promise.resolve({ id: requestId, index }) })
    return { ...subject, response }
}

test('validates identifiers and filters without accepting PostgREST syntax', () => {
    assert.equal(helpers.validRequestId(id), true)
    assert.equal(helpers.validRequestId('not-a-uuid'), false)
    const filters = helpers.parseRequestFilters({ q: 'name,carrier.eq.dhl("x")', carrier: 'invented', page: '-1' })
    assert.equal(filters.carrier, '')
    assert.equal(filters.page, 1)
    assert.equal(/[(),"]/.test(filters.search), false)
    assert.equal(helpers.parseRequestFilters({ q: 'ปุณณดิศ', carrier: 'fedex', page: '2' }).search, 'ปุณณดิศ')
})
test('preserves filters when paginating and formats Bangkok time', () => {
    assert.equal(helpers.requestsUrl(2, 'phone', 'fedex'), '/dashboard/suvarnabhumi?q=phone&carrier=fedex&page=2')
    assert.match(helpers.formatRequestDate('2026-10-04T00:00:00Z'), /07:00/)
})
test('unauthenticated callers never query records or storage', async () => {
    const { response, calls } = await run({ user: null })
    assert.equal(response.status, 401)
    assert.equal(calls.length, 0)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
})
test('signed-in accounts without admin membership cannot access records or files', async () => {
    const { response, calls } = await run({ allowed: false })
    assert.equal(response.status, 403)
    assert.equal(calls.length, 1)
})
test('access check failure does not query files', async () => {
    const { response, calls } = await run({ accessError: { code: 'FAIL' } })
    assert.equal(response.status, 503)
    assert.equal(calls.length, 1)
})
test('invalid identifiers and file indices fail before lookup', async () => {
    for (const index of ['-1', '3', '00', '1.0', 'name.pdf']) {
        const result = await run({}, index)
        assert.equal(result.response.status, 404)
        assert.equal(result.calls.length, 0)
    }
    assert.equal((await run({}, '0', false, 'invalid')).response.status, 404)
})
test('missing requests and missing attachments are not served', async () => {
    for (const record of [null, { attachment_paths: [], attachment_names: [] }]) {
        const result = await run({ record })
        assert.equal(result.response.status, 404)
        assert.equal(result.calls.some(call => call[0] === 'file'), false)
    }
})
test('opens only a stored attachment with a five-minute URL', async () => {
    const result = await run()
    assert.equal(result.response.status, 307)
    assert.match(result.response.headers.get('location'), /^https:\/\/example.supabase.co\/storage\/v1\/object\/sign\//)
    assert.equal(result.response.headers.get('referrer-policy'), 'no-referrer')
    assert.deepEqual(result.calls.find(call => call[0] === 'record'), ['record', 'id', id])
    assert.deepEqual(result.calls.find(call => call[0] === 'file'), ['file', 'suvarnabhumi-notices', 'private/notice.pdf', 300, undefined])
})
test('download keeps the original file name', async () => {
    const result = await run({}, '0', true)
    assert.equal(result.response.status, 307)
    assert.equal(result.calls.find(call => call[0] === 'file')[4].download, 'invoice.pdf')
})
test('storage failures do not return a successful redirect', async () => {
    assert.equal((await run({ fileError: { code: 'FAIL' } })).response.status, 503)
})
