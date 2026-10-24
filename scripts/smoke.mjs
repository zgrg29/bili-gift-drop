import assert from 'node:assert/strict';
const base='http://127.0.0.1:19321';
for(const file of ['/','/overlay','/src/control/control.mjs','/src/shared/i18n/ja.mjs'])assert.equal((await fetch(base+file)).status,200,file);
const events=await fetch(base+'/api/events');const reader=events.body.getReader();const decoder=new TextDecoder();let pending='';
async function event(type){for(;;){let end;while((end=pending.indexOf('\n\n'))>=0){const line=pending.slice(0,end);pending=pending.slice(end+2);if(line.startsWith('data: ')){const value=JSON.parse(line.slice(6));if(value.type===type)return value;}}const chunk=await reader.read();if(chunk.done)throw Error('SSE ended');pending+=decoder.decode(chunk.value,{stream:true});}}
await event('init');
async function post(action,data,origin=base){return fetch(base+'/api/'+action,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)});}
assert.equal((await post('test',{count:4,price:1})).status,200);
assert.equal((await event('gift')).data.count,4);
assert.equal((await post('clear',{})).status,200);
await event('clear');
assert.equal((await post('connect',{room:'not-a-room'})).status,400);
assert.equal((await post('clear',{},'https://example.com')).status,403);
await reader.cancel();console.log('HTTP, static files, SSE, simulation, clear, validation, origin checks: PASS');
