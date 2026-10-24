import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.BILI_GIFT_TEST_URL||'http://127.0.0.1:19329';
async function post(action,data){return fetch(base+'/api/'+action,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(data)});}
async function snapshot(){const r=await fetch(base+'/api/events'),reader=r.body.getReader();let text='';while(!text.includes('\n\n')){const x=await reader.read();text+=new TextDecoder().decode(x.value);}await reader.cancel();return JSON.parse(text.split('\n')[0].slice(6)).data;}
await post('config',{guardEnabled:true});await post('clear',{});
for(const [level,count]of [[3,3],[2,6],[1,12]])assert.equal((await post('guard-test',{level,count})).status,200);
let state=await snapshot();assert.equal(state.guard.current.level,3);assert.equal(state.guard.current.count,3);assert.equal(state.guard.pending,2);const start=state.guard.current.start;
await post('config',{language:'ja',guardX:20,guardY:15,guardWidth:40,giftOpacity:70,scOpacity:60,guardOpacity:50});state=await snapshot();assert.equal(state.guard.current.start,start);assert.equal(state.guard.pending,2);assert.equal(state.config.guardOpacity,50);assert.equal(state.config.scOpacity,60);assert.equal(state.config.giftOpacity,70);
const png=await readFile('src/overlay/assets/guard-ships-v1.png');
assert.equal((await fetch(base+'/api/guard-upload?level=3',{method:'POST',headers:{Origin:'https://example.com'},body:png})).status,403);
assert.equal((await fetch(base+'/api/guard-upload?level=3',{method:'POST',headers:{Origin:base},body:'invalid media'})).status,400);
assert.equal((await fetch(base+'/api/guard-upload?level=3',{method:'POST',headers:{Origin:base},body:png})).status,200);
state=await snapshot();const url=state.config.guardAsset3;assert.ok(url.startsWith('/media/'));assert.deepEqual(Buffer.from(await (await fetch(base+url)).arrayBuffer()),png);
for(const asset of ['/src/overlay/guard.mjs','/src/shared/guard.mjs','/src/shared/guard-media.mjs','/src/overlay/assets/guard-ships-v1.png','/src/overlay/assets/demo-avatar.svg'])assert.equal((await fetch(base+asset)).status,200);
await new Promise(r=>setTimeout(r,Math.max(0,start+8100-Date.now())));state=await snapshot();assert.equal(state.guard.current.level,2);assert.equal(state.guard.current.count,6);assert.equal(state.guard.pending,1);
await post('config',{guardEnabled:false});state=await snapshot();assert.equal(state.guard.current,null);assert.equal(state.guard.pending,0);assert.equal((await post('guard-test',{level:3,count:1})).status,400);
await post('config',{guardEnabled:true,guardWidth:100,guardX:85,guardY:89.5});state=await snapshot();assert.equal(state.config.guardWidth,100);assert.equal(state.config.guardX,85);assert.equal(state.config.guardY,89.5);await post('clear',{});
console.log('Guard EXE: default assets, FIFO, locale/layout continuity, upload validation, media bytes, disable and clear: PASS');
