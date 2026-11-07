const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript')

function load(relative) {
    const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const module = { exports: {} }
    vm.runInNewContext(code, { module, exports: module.exports, BigInt, URL, process })
    return module.exports
}

const { safeNextPath } = load('src/lib/login-redirect.ts')
const { submissionLookupColumn } = load('src/lib/submission-attachments.ts')
const REFERENCE = '3e4c2e3f-13e5-4f5c-8618-365e936b4a95'

test('returns staff to the dashboard page they opened', () => {
    for (const value of ['/dashboard', '/dashboard/submissions/119', `/dashboard/submissions/${REFERENCE}`, `/dashboard/suvarnabhumi/${REFERENCE}`]) {
        assert.equal(safeNextPath(value), value)
    }
})

test('rejects anything that could leave the dashboard', () => {
    for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', '/dashboard//evil.example', '/dashboard/../login', '/dashboard\\@evil.example', '/dashboardevil', '/login', '/dashboard/a?next=//evil.example', 'dashboard', '', null, undefined, 5]) {
        assert.equal(safeNextPath(value), null, String(value))
    }
})

test('looks up a submission by database ID or by reference', () => {
    assert.equal(submissionLookupColumn('119'), 'id')
    assert.equal(submissionLookupColumn(REFERENCE), 'request_reference')
})

test('rejects other values before querying', () => {
    for (const value of ['0', '-1', 'abc', '119;drop', REFERENCE.slice(0, 35), `${REFERENCE}x`, '9223372036854775808', REFERENCE.toUpperCase()]) {
        assert.equal(submissionLookupColumn(value), null, value)
    }
})
