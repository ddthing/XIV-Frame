import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const { outputText } = ts.transpileModule(await readFile(new URL('../src/lib/canvasImages.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}})
const { loadCanvasImages } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

function factory() {
  const created=[]
  const create=()=>{
    const image={onload:null,onerror:null}
    let url=''
    Object.defineProperty(image,'src',{get:()=>url,set:value=>{ url=value; if(value) queueMicrotask(()=>value==='broken' ? image.onerror?.() : image.onload?.()) }})
    created.push(image)
    return image
  }
  return {created,create}
}

test('reordering four decoded sources allocates no new image and preserves the requested order', async () => {
  const f=factory(),sources=['a','b','c','d']
  const first=await loadCanvasImages(sources,new Map(),f.create).promise
  const next=await loadCanvasImages(['d','b','a','c'],new Map(sources.map((s,i)=>[s,first[i]])),f.create).promise
  assert.equal(f.created.length,4)
  assert.deepEqual(next,[first[3],first[1],first[0],first[2]])
})

test('replacement allocates only the changed source and does not clear reused decoded images', async () => {
  const f=factory(),sources=['a','b','c','d']
  const first=await loadCanvasImages(sources,new Map(),f.create).promise
  const batch=loadCanvasImages(['a','new','c','d'],new Map(sources.map((s,i)=>[s,first[i]])),f.create)
  const next=await batch.promise
  batch.cancel()
  assert.equal(f.created.length,5)
  assert.equal(next[0],first[0])
  assert.equal(next[2],first[2])
  assert.deepEqual(next.map(image=>image.src),['a','new','c','d'])
})

test('cancelling pending decoding detaches callbacks and preserves previously decoded sources', () => {
  const cached={src:'cached'},pending={onload:null,onerror:null,src:''}
  const batch=loadCanvasImages(['cached','pending'],new Map([['cached',cached]]),()=>pending)
  batch.cancel()
  assert.equal(cached.src,'cached')
  assert.equal(pending.src,'')
  assert.equal(pending.onload,null)
  assert.equal(pending.onerror,null)
})

test('one failed source rejects the batch rather than exporting a partial composition', async () => {
  const f=factory()
  await assert.rejects(loadCanvasImages(['a','broken'],new Map(),f.create).promise,/decode failed/)
})
