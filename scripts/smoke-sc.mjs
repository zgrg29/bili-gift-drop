import assert from 'node:assert/strict';
const base=process.env.BILI_GIFT_TEST_URL||'http://127.0.0.1:19329';
async function post(action,data){const r=await fetch(base+'/api/'+action,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(data)});assert.equal(r.status,200);}
async function init(){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);try{const response=await fetch(base+'/api/events',{signal:controller.signal});const reader=response.body.getReader();let raw='';while(!raw.includes('\n\n')){const c=await reader.read();raw+=new TextDecoder().decode(c.value);}await reader.cancel();return JSON.parse(raw.split('\n')[0].slice(6)).data;}finally{clearTimeout(timer);controller.abort();}}
await post('clear',{});await post('config',{scEnabled:true,scX:12.5,scY:9,scWidth:35,scCollapse:2,scDisableScroll:true,scNewestPosition:'top'});await post('sc-test',{price:100,duration:300});const first=await init();assert.equal(first.sc.length,1);assert.equal(first.sc[0].end-first.sc[0].start,300000);assert.equal(first.config.scDisableScroll,true);assert.equal(first.config.scNewestPosition,'top');await post('sc-toggle',{id:first.sc[0].id,expanded:true});await post('config',{language:'ja',scEnabled:false});const second=await init();assert.equal(second.sc[0].end,first.sc[0].end);assert.equal(second.sc[0].expanded,true);assert.equal(second.config.scX,12.5);assert.equal(second.config.scEnabled,false);assert.equal(second.config.scDisableScroll,true,'stopping scroll survives language/visibility changes');assert.equal(second.config.scNewestPosition,'top','newest position survives language/visibility changes');await post('clear',{});assert.equal((await init()).sc.length,0);
await post('config',{scPersistent:true});await post('sc-test',{price:30,duration:1});
const kept=await init();assert.equal(kept.sc.length,1);assert.equal(kept.sc[0].duration,1);
await new Promise(r=>setTimeout(r,1500));
const still=await init();assert.equal(still.sc.length,1,'persistent mode keeps an expired SC');assert.ok(still.sc[0].end<Date.now(),'the platform expiry has already passed');
await post('config',{scPersistent:false});
const retimed=await init();assert.equal(retimed.sc.length,1,'switching off does not clear the list');assert.ok(retimed.sc[0].end>Date.now(),'the card is retimed from the switch');assert.equal(retimed.sc[0].start,kept.sc[0].start,'auto-collapse start is unchanged');assert.equal(retimed.sc[0].duration,1);
await new Promise(r=>setTimeout(r,1500));
assert.equal((await init()).sc.length,0,'normal mode expires the retimed card');
await post('clear',{});
console.log('SC HTTP: simulation, snapshot restore, toggle sync, language/disable preserve expiry, stop-scroll and newest position, persistent retention and retiming, layout, clear PASS');
