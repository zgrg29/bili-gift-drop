import assert from 'node:assert/strict';
const base=process.env.BILI_GIFT_TEST_URL||'http://127.0.0.1:19321';
for(const file of ['/','/overlay','/src/control/control.mjs','/src/control/vendor/qrcode.js','/src/shared/history.mjs','/src/shared/gift-names.mjs','/src/shared/i18n/ja.mjs'])assert.equal((await fetch(base+file)).status,200,file);
const qrScript=await fetch(base+'/src/control/vendor/qrcode.js');assert.match(qrScript.headers.get('content-type')??'',/javascript/,'qrcode.js is served as JavaScript');
const events=await fetch(base+'/api/events?history=1');const reader=events.body.getReader();const decoder=new TextDecoder();let pending='';
async function event(type){for(;;){let end;while((end=pending.indexOf('\n\n'))>=0){const line=pending.slice(0,end);pending=pending.slice(end+2);if(line.startsWith('data: ')){const value=JSON.parse(line.slice(6));if(value.type===type)return value;}}const chunk=await reader.read();if(chunk.done)throw Error('SSE ended');pending+=decoder.decode(chunk.value,{stream:true});}}
const boot=await event('init');assert.equal(boot.data.login?.loggedIn,false,'fresh install is anonymous');
const loginStatus=await (await fetch(base+'/api/login/status')).json();assert.equal(loginStatus.loggedIn,false);assert.equal(Object.hasOwn(loginStatus,'cookies'),false,'login status never exposes cookies');
async function snapshot(){const r=await fetch(base+'/api/events?history=1');const reader=r.body.getReader();let text='';const decoder=new TextDecoder();while(!text.includes('\n\n')){const chunk=await reader.read();if(chunk.done)throw Error('SSE ended');text+=decoder.decode(chunk.value,{stream:true});}await reader.cancel();return JSON.parse(text.split('\n')[0].slice(6)).data;}
async function post(action,data,origin=base){return fetch(base+'/api/'+action,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(data)});}
assert.equal((await snapshot()).config.historyCurrency,'battery');
assert.equal((await post('test',{count:4,price:1})).status,200);
assert.equal((await event('gift')).data.count,4);
assert.equal((await snapshot()).history.viewerCount,0,'simulated gifts are not written to history');
assert.equal((await post('config',{historyCurrency:'jpy'})).status,200);
assert.equal((await snapshot()).config.historyCurrency,'jpy');
assert.equal((await post('history-clear',{})).status,200);
assert.equal((await post('clear',{})).status,200);
await event('clear');
assert.equal((await post('connect',{room:'not-a-room'})).status,400);
assert.equal((await post('clear',{},'https://example.com')).status,403);
await reader.cancel();console.log('HTTP, static files, SSE, simulation, clear, validation, origin checks: PASS');
