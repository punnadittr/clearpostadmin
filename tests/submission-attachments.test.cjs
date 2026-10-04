const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript')
const { NextRequest, NextResponse } = require('next/server')
function load(relative, imports = {}) {
    const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const module = { exports: {} }
    vm.runInNewContext(code, { module, exports: module.exports, console, URL, process, ReadableStream, Uint8Array, require: name => imports[name] || require(name) })
    return module.exports
}
const helpers = load('src/lib/submission-attachments.ts')
const documentHelpers = load('src/lib/private-document.ts', { 'next/server': { NextResponse } })
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
function subject({ user = { id: 'admin' }, allowed = true, accessError = null, record = { attachment_paths: ['private/own.pdf'], attachment_names: ['invoice.pdf'], evidence_url: null }, readError = null, fileError = null } = {}) {
    const calls=[]
    const client = {
        auth: { getUser: async () => ({ data: { user } }) },
        rpc: async name => { calls.push(['access',name]); return { data: allowed, error: accessError } },
        from: table => { calls.push(['table',table]); return { select: () => ({ eq: (column,value) => { calls.push(['record',column,value]); return { maybeSingle: async () => ({ data: record,error: readError }) } } }) } },
        storage: { from: bucket => ({ download: async (...args) => { calls.push(['file',bucket,...args]); return { data: new Blob(['TEST ONLY'], { type: 'application/pdf' }),error:fileError } } }) },
    }
    const GET = load('src/app/dashboard/submissions/[id]/attachments/[index]/route.ts', { 'next/server': { NextResponse }, '@/utils/supabase/server': { createClient: async () => client }, '@/lib/submission-attachments': helpers, '@/lib/private-document': documentHelpers }).GET
    return { GET, calls }
}
async function run(config, id='79', index='0', extra='') {
    const handler=subject(config)
    const response=await handler.GET(new NextRequest('https://admin.example/dashboard/submissions/'+id+'/attachments/'+index+extra), { params: Promise.resolve({id,index}) })
    return { ...handler,response }
}
test('only positive bigint identifiers and canonical file indices are accepted', async () => {
    for (const id of ['0','-1','00','1.0','9223372036854775808','x']) {
        const result=await run({},id); assert.equal(result.response.status,404); assert.equal(result.calls.length,0)
    }
    for (const index of ['-1','00','1.0','100','invoice.pdf']) assert.equal((await run({},'79',index)).response.status,404)
})
test('missing login, missing admin membership or membership failure never queries files', async () => {
    for (const [config,status] of [[{user:null},401],[{allowed:false},403],[{accessError:{code:'FAIL'}},503]]) {
        const result=await run(config); assert.equal(result.response.status,status); assert.equal(result.calls.some(call=>call[0]==='file'||call[0]==='table'),false)
        assert.equal(result.response.headers.get('cache-control'),'private, no-store')
    }
})
test('admin streams only the stored file through its session, ignoring URL parameters', async () => {
    const result=await run({},'79','0','?path=somebody-else.pdf&bucket=public')
    assert.equal(result.response.status,200); assert.equal(result.response.headers.get('referrer-policy'),'no-referrer')
    assert.deepEqual(result.calls.find(c=>c[0]==='record'),['record','id','79'])
    assert.deepEqual(result.calls.find(c=>c[0]==='file'),['file','evidence','private/own.pdf'])
})
test('download and Office files preserve their original names', async () => {
    for (const [config,extra,name] of [[{},'?download=1','invoice.pdf'],[{record:{attachment_paths:['private/own.docx'],attachment_names:['notice.docx']}},'','notice.docx']]) {
        const result=await run(config,'79','0',extra); assert.match(result.response.headers.get('content-disposition'), new RegExp('attachment; filename="'+name+'"'))
    }
})
test('missing records, invalid indices and failed storage never redirect', async () => {
    assert.equal((await run({record:null})).response.status,404)
    assert.equal((await run({},'79','1')).response.status,404)
    assert.equal((await run({readError:{code:'FAIL'}})).response.status,503)
    assert.equal((await run({fileError:{code:'FAIL'}})).response.status,503)
})
test('legacy single, comma-separated and JSON links convert to same-project paths', () => {
    const url='https://example.supabase.co/storage/v1/object/public/evidence/legacy/invoice.pdf'
    for (const evidence_url of [url, url+', '+url, JSON.stringify([url]), [url]]) {
        const result=helpers.submissionAttachments({evidence_url}); assert.equal(result[0].path,'legacy/invoice.pdf'); assert.equal(result[0].name,'invoice.pdf')
    }
    for (const evidence_url of ['https://other.supabase.co/storage/v1/object/public/evidence/private.pdf','javascript:alert(1)','https://example.supabase.co/storage/v1/object/public/evidence/%2e%2e%2fprivate.pdf']) assert.equal(helpers.submissionAttachments({evidence_url}).length,0)
})
test('new attachment metadata takes priority over obsolete public links', () => {
    const result=helpers.submissionAttachments({attachment_paths:['new/own.pdf'],attachment_names:['own.pdf'],evidence_url:'https://other.example/file'})
    assert.equal(result.length,1); assert.equal(result[0].path,'new/own.pdf')
})

test('file response never exposes a token or storage URL and cannot be cached or sniffed', async () => {
    const result=await run()
    assert.equal(result.response.status,200)
    assert.equal(result.response.headers.get('location'),null)
    assert.equal(result.response.headers.get('cache-control'),'private, no-store')
    assert.equal(result.response.headers.get('x-content-type-options'),'nosniff')
    assert.match(result.response.headers.get('content-disposition'),/^inline;/)
    assert.equal(await result.response.text(),'TEST ONLY')
})
test('unsafe legacy content is forced to download and Unicode filenames survive without header injection', async () => {
    const response=documentHelpers.privateDocumentResponse(new Blob(['<script>'], {type:'text/html'}), 'เอกสาร\r\n.html', false)
    assert.equal(response.headers.get('content-type'),'application/octet-stream')
    assert.match(response.headers.get('content-disposition'),/^attachment;/)
    assert.match(response.headers.get('content-disposition'),/filename\*=UTF-8''%/)
    assert.equal(/[\r\n]/.test(response.headers.get('content-disposition')),false)
    assert.match(response.headers.get('content-security-policy'),/sandbox/)
})

test('legacy documents above the new upload limit stream intact without a public URL', async () => {
    const bytes=new Uint8Array(9*1024*1024);bytes[0]=1;bytes[bytes.length-1]=2
    const response=documentHelpers.privateDocumentResponse(new Blob([bytes],{type:'application/pdf'}),'legacy.pdf',false)
    const reader=response.body.getReader();let length=0,chunks=0,last
    while(true){const item=await reader.read();if(item.done)break;length+=item.value.length;chunks++;last=item.value[item.value.length-1]}
    assert.equal(response.status,200);assert.equal(length,bytes.length);assert.equal(last,2);assert(chunks>1)
    assert.equal(response.headers.get('content-length'),String(bytes.length));assert.equal(response.headers.get('location'),null)
})
