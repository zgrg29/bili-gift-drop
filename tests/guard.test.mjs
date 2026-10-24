import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeGuard,GuardQueue,guardBox,guardCrops,guardDefaultRatio} from '../src/shared/guard.mjs';
import {defaults,config} from '../src/shared/rules.mjs';
test('guard fields, special duration, freshness and supplementary notifications',()=>{
 const now=1800000000000,stamp=now/1000;
 const buy={cmd:'GUARD_BUY',data:{uid:4,username:'原名',guard_level:3,num:6,start_time:stamp}};
 const a=normalizeGuard(buy,now);assert.equal(a.unit,null);assert.equal(a.count,6);assert.equal(a.user,'原名');
 const toast={cmd:'USER_TOAST_MSG_V2',data:{sender_uinfo:{uid:4,base:{name:'原名',face:'https://i0.hdslb.com/a.png'}},guard_info:{guard_level:3,start_time:stamp},pay_info:{num:6,unit:'月'},option:{source:0}}};
 const b=normalizeGuard(toast,now);assert.equal(b.key,a.key);assert.equal(b.unit,'月');
 toast.data.pay_info.unit='*3天';assert.equal(normalizeGuard(toast,now).unit,'*3天');
 toast.data.option.source=2;assert.equal(normalizeGuard(toast,now),null);assert.equal(normalizeGuard(buy,now+121000),null);
});
test('guard FIFO starts each viewer after preceding animation, enriches without restart, bounds queue',()=>{
 const q=new GuardQueue(8000,2),a={id:'a',key:'a',level:3,count:6};
 q.add(a,1000);q.add({id:'b',key:'b'},1100);q.add({id:'c',key:'c'},1200);assert.equal(q.add({id:'d'},1300),'full');
 q.add({...a,unit:'月',avatar:'/cache/a'},1400);assert.equal(q.current.start,1000);assert.equal(q.current.unit,'月');assert.equal(q.snapshot(8999).current.id,'a');
 assert.equal(q.snapshot(9000).current.id,'b');assert.equal(q.current.end,17000);assert.equal(q.snapshot(17000).current.id,'c');assert.equal(q.snapshot(25000).current,null);
 q.clear();assert.equal(q.snapshot(26000).pending,0);assert.equal(q.add(a,27000),'duplicate');
});
test('guard config defaults, media persistence and bounded proportional geometry',()=>{
 assert.equal(defaults.guardEnabled,true);assert.equal(defaults.guardX+defaults.guardWidth/2,50);assert.equal(defaults.guardY+defaults.guardWidth*.7/2,50);assert.equal(defaults.giftOpacity,100);assert.equal(config({guardOpacity:-1,scOpacity:110,giftOpacity:45}).guardOpacity,0);assert.equal(config({scOpacity:110}).scOpacity,100);const c=config({guardWidth:70,guardX:90,guardY:99,guardAsset3:'/media/abc-123.gif'});
 assert.equal(c.guardX,85);assert.equal(c.guardY,89.5);assert.equal(c.guardAsset3,'/media/abc-123.gif');
 const full=config({guardWidth:150,guardX:80,guardY:80});assert.equal(full.guardWidth,100);assert.equal(guardBox(full).height,100);assert.equal(guardBox(full).y,0);assert.ok(guardBox(full).x+guardBox(full).width<=100);assert.equal(config({language:'en'},full).guardWidth,100);
 const next=config({language:'ja'},JSON.parse(JSON.stringify(c)));assert.ok(guardBox(next).height<=100);assert.equal(guardBox(next).ratio,630/430);assert.equal(next.guardAsset3,c.guardAsset3);
 assert.equal(config({guardAsset3:'https://example.com/a.mp4'},c).guardAsset3,c.guardAsset3);
});
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {GuardMedia} from '../src/shared/guard-media.mjs';
import {t} from '../src/shared/i18n/index.mjs';
test('guard renderer preserves animation on language/opacity, swaps custom media and restores default',async()=>{
 const elements=[],listeners=[];let tick,animations=0,c={...defaults,guardAsset3:'/media/abc.mp4'};
 class Element{
  style={};dataset={};children=[];hidden=false;attrs={};
  constructor(tag){this.tagName=tag.toUpperCase();elements.push(this);}
  append(...nodes){for(const n of nodes)n.parent=this;this.children.push(...nodes);}
  remove(){this.removed=true;this.parent.children=this.parent.children.filter(x=>x!==this);}
  get src(){return this.attrs.src;}set src(v){this.attrs.src=v;}
  getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];}
  getAnimations(){return [];}animate(){animations++;}pause(){this.paused=true;}
  getContext(){return {drawImage(){}};}
 }
 const body=new Element('body');
 const sandbox={t,guardBox,guardCrops,guardDefaultRatio,Intl,Date,Image:class{complete=true;naturalWidth=2172;},document:{createElement:t=>new Element(t),body},setInterval:fn=>{tick=fn;}};
 const source=(await readFile(new URL('../src/overlay/guard.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('export function','function');
 const mediaSource=(await readFile(new URL('../src/shared/guard-media.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('export class','class');
 vm.runInNewContext(mediaSource+'\n'+source,sandbox);sandbox.guardOverlay({addEventListener:(_,fn)=>listeners.push(fn)},()=>c);
 const now=Date.now();const send=x=>listeners[0]({data:JSON.stringify({type:'guard-state',data:{current:x,pending:0}})});
 const a={id:'a',level:3,count:1,unit:'月',user:'原名',start:now,end:now+8000};send(a);
 const video=elements.find(e=>e.tagName==='VIDEO'&&e.className==='guard-custom');assert.ok(video.muted&&video.loop&&video.autoplay);assert.equal(animations,1);
 c={...c,language:'en',guardOpacity:35};tick();assert.equal(animations,1);assert.equal(elements.find(e=>e.className==='guard-effect').style.filter,'opacity(35%)');assert.ok(elements.some(e=>e.textContent==='1 month · Captain'));
 send({...a,id:'b',level:2});assert.ok(video.removed);assert.equal(elements.find(e=>e.className==='guard-sprite').hidden,false);assert.equal(animations,2);
 c={...c,guardAsset2:'/media/def.gif'};tick();assert.ok(elements.some(e=>e.tagName==='IMG'&&e.src==='/media/def.gif'));
 c={...c,guardEnabled:false};tick();assert.equal(elements.find(e=>e.className==='guard-effect').hidden,true);
});

test('media aspect layout handles landscape, square and portrait without distortion or clipping',()=>{
 for(const ratio of [4,16/9,1,9/16,.1])for(const aspect of [16/9,4/3,9/16]){
  const b=guardBox({guardWidth:100,guardX:85,guardY:89.5},3,ratio,aspect);
  assert.ok(b.width>0&&b.width<=100);assert.ok(b.height<=100.00001);assert.ok(b.x+b.width<=100.00001);assert.ok(b.y+b.height<=100.00001);
  const mediaHeight=b.height*b.mediaHeight/100;assert.ok(Math.abs(b.width*aspect/mediaHeight-ratio)<1e-9);
 }
 const wide=guardBox({guardWidth:100},3,4),portrait=guardBox({guardWidth:100},3,.5);assert.equal(wide.width,100);assert.ok(portrait.width<wide.width);assert.ok(wide.mediaHeight<portrait.mediaHeight);
 assert.notEqual(guardBox(defaults,1).ratio,guardBox(defaults,3).ratio);
});

test('browser metadata uses image/GIF and video dimensions and falls back on failure',async()=>{
 const probes=[];let changes=0;
 class Node{constructor(){probes.push(this);}removeAttribute(){}load(){this.released=true;}}
 const sandbox={guardDefaultRatio,Image:Node,document:{createElement:()=>new Node()}};
 const source=(await readFile(new URL('../src/shared/guard-media.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('export class','class');
 vm.runInNewContext(source+'\nthis.Media=GuardMedia;',sandbox);
 const media=new sandbox.Media(()=>changes++),imageConfig={guardAsset3:'/media/a.gif'};
 assert.equal(media.ratio(imageConfig,3),guardDefaultRatio(3));const image=probes[0];image.naturalWidth=400;image.naturalHeight=800;image.onload();assert.equal(media.ratio(imageConfig,3),.5);assert.equal(probes.length,1);
 const videoConfig={guardAsset2:'/media/b.mp4'};media.ratio(videoConfig,2);const video=probes[1];video.videoWidth=1920;video.videoHeight=1080;video.onloadedmetadata();assert.equal(media.ratio(videoConfig,2),16/9);assert.ok(video.released);
 const bad={guardAsset1:'/media/c.png'};media.ratio(bad,1);probes[2].onerror();assert.equal(media.ratio(bad,1),guardDefaultRatio(1));assert.equal(changes,3);
});
