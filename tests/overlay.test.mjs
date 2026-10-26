import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {Crowd,region,collisionPairs} from '../src/shared/crowd.mjs';
import {defaults} from '../src/shared/rules.mjs';
import {t} from '../src/shared/i18n/index.mjs';
test('overlay event/render integration: storm, region clipping, language change, clear',async()=>{
 const source=(await readFile(new URL('../src/overlay/overlay.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
 let next,events,clock=0,latest,clips=0,draws=0;
 const context=new Proxy({},{get(target,key){return target[key]??(()=>{if(key==='clip')clips++;if(key==='fillText')draws++;});},set(target,key,value){target[key]=value;return true;}});
 const canvas={style:{},getContext:()=>context};
 const sandbox={superchat(){},guardOverlay(){},window:{addEventListener(){}},Crowd,region,collisionPairs,defaults,t,console,Math,Map,JSON,Image:class{},ResizeObserver:class{observe(){}},document:{querySelector:()=>canvas,documentElement:{}},location:{origin:'http://test'},parent:{postMessage(s){latest=s;}},performance:{now:()=>clock},EventSource:class{constructor(){events=this;}},requestAnimationFrame(fn){next=fn;}};
 vm.runInNewContext(source,sandbox);
 const send=(type,data)=>events.onmessage({data:JSON.stringify({type,data})});
 send('init',{config:{...defaults,regionY:70,regionHeight:30,maxCoverage:5}});
 const gift={giftId:1,name:'原名',user:'名前',count:1000,coinType:'gold',unitCoin:10000};
 const started=performance.now();
 for(let frame=0;frame<3600;frame++){clock=frame*1000/60;if(frame<1800&&frame%3===0)send('gift',gift);next(clock);assert.ok(latest?.count<=120||!latest);assert.ok(latest?.coverage<=5.00001||!latest);}
 assert.ok(draws>0&&clips===3600);assert.ok(latest.pending>=0);
 send('gift',gift);for(let i=0;i<30;i++){clock+=1000/60;next(clock);}const before=latest.count;assert.ok(before>0);
 send('config',{...defaults,language:'ja',regionY:70,regionHeight:30,maxCoverage:5});clock+=600;next(clock);assert.ok(latest.count>=before);assert.equal(sandbox.document.documentElement.lang,'ja');
 send('clear');clock+=600;next(clock);assert.equal(latest.count,0);assert.equal(latest.pending,0);
 console.log(`Overlay 3600 simulated frames / 60 seconds + 600 burst events: ${(performance.now()-started).toFixed(0)} ms CPU wall time (VM, not OBS FPS).`);
});


test('overlay draws sizes from unit price and saved settings without resizing existing gifts',async()=>{
 const source=(await readFile(new URL('../src/overlay/overlay.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
 let events,next,clock=0;const sizes=[];
 const ctx=new Proxy({roundRect(x,y,w){sizes.push(w);}},{get:(o,k)=>o[k]??(()=>{})});
 const canvas={style:{},getContext:()=>ctx};
 const sandbox={superchat(){},guardOverlay(){},window:{addEventListener(){}},Crowd,region,collisionPairs,defaults,t,Math,Map,JSON,Image:class{},ResizeObserver:class{observe(){}},document:{querySelector:()=>canvas,documentElement:{}},location:{origin:'http://test'},parent:{postMessage(){}},performance:{now:()=>clock},EventSource:class{constructor(){events=this;}},requestAnimationFrame(fn){next=fn;}};
 vm.runInNewContext(source,sandbox);
 const send=(type,data)=>events.onmessage({data:JSON.stringify({type,data})});
 const cfg={...defaults,minGiftScale:50,maxGiftScale:150,maxGiftScaleAmount:100};
 send('init',{config:cfg});
 send('gift',{giftId:1,count:1,coinType:'gold',unitCoin:50000,totalCoin:50000});clock=100;next(clock);assert.deepEqual(sizes,[80]);
 send('gift',{giftId:9,count:100,coinType:'gold',unitCoin:50000,totalCoin:5000000});clock=1000;next(clock);
 assert.ok(sizes.length>1&&sizes.slice(1).every(w=>w===80),'quantity does not change the icon size');
 send('clear');sizes.length=0;
 send('config',{...cfg,language:'ja',minGiftScale:100,maxGiftScale:200});
 send('gift',{giftId:2,count:1,coinType:'gold',unitCoin:100000,totalCoin:100000});clock=2000;next(clock);
 assert.deepEqual(sizes,[160]);assert.equal(sandbox.document.documentElement.lang,'ja');
});
