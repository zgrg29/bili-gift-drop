import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSC,SCStore,scDuration} from '../src/shared/superchat.mjs';
import {config,defaults} from '../src/shared/rules.mjs';
const now=1800000000000;
const msg=(price=30)=>({cmd:'SUPER_CHAT_MESSAGE',data:{id:1,price,start_time:now/1000,end_time:now/1000+123,time:60,user_info:{uname:'原名'},message:'原文<script>',background_bottom_color:'#123456'}});
test('SC uses event expiry and colors for every amount; preserves original text',()=>{for(const price of [30,100,500,2000]){const x=normalizeSC(msg(price),now);assert.equal(x.end,now+123000);assert.equal(x.price,price);assert.equal(x.color,'#123456');assert.equal(x.message,'原文<script>');assert.equal(x.user,'原名');}const m=msg();delete m.data.end_time;assert.equal(normalizeSC(m,now).end,now+60000);delete m.data.time;assert.equal(normalizeSC(m,now).end,now+60000);delete m.data.start_time;assert.equal(normalizeSC(m,now),null);m.data.start_time=now/1000;assert.equal(normalizeSC(msg(),now+124000),null);m.data.end_time=now/1000+60;m.data.background_bottom_color='url(bad)';assert.equal(normalizeSC(m,now).color,'#2a60b2');});
test('SC store bounds, duplicate suppression, independent expiry and deletion',()=>{const store=new SCStore();for(let i=0;i<110;i++){const x={...normalizeSC(msg(),now),id:String(i),end:now+1000+i};store.add(x,now);}assert.equal(store.items.size,100);assert.equal(store.add({...normalizeSC(msg(),now),id:'109'},now),false);store.remove(['109']);assert.equal(store.items.has('109'),false);store.prune(now+2000);assert.equal(store.items.size,0);});
test('SC config persists, clamps geometry and language changes preserve timers/settings',()=>{const c=config({scEnabled:true,scX:80,scWidth:80,scY:500,scCollapse:0});assert.equal(c.scWidth,20);assert.equal(c.scY,90);assert.equal(c.scCollapse,0);assert.equal(config({language:'ja'},JSON.parse(JSON.stringify(c))).scEnabled,true);assert.equal(defaults.scEnabled,true);assert.equal(config({}).scEnabled,true);assert.equal(config({scEnabled:false}).scEnabled,false);assert.equal(config({language:'ja'},config({scEnabled:false})).scEnabled,false);});

test('official duration boundaries',()=>{for(const [p,s]of [[29,null],[30,60],[49,60],[50,120],[99,120],[100,300],[499,300],[500,1800],[999,1800],[1000,3600],[1999,3600],[2000,7200]])assert.equal(scDuration(p),s);});

import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {t} from '../src/shared/i18n/index.mjs';
test('SC renderer: no countdown, auto collapse, click sync, language, expiry and enable',async()=>{
 const source=(await readFile(new URL('../src/overlay/superchat.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('export function','function');
 class E{children=[];style={};append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}setAttribute(k,v){this[k]=v;}querySelectorAll(){return this.children.flatMap(x=>x.children.filter(y=>y.tag==='button'));}focus(){}}
 let listener,tick,clock=now,posted;const body=new E();let c={...defaults,scEnabled:true,scCollapse:15};
 const sandbox={t,Intl,Date:{now:()=>clock},document:{body,createElement:tag=>Object.assign(new E(),{tag})},setInterval:fn=>{tick=fn;},fetch:async(url,opts)=>{posted=JSON.parse(opts.body);return {ok:true};},events:{addEventListener:(type,fn)=>{listener=fn;}},getConfig:()=>c};
 vm.runInNewContext(source+';superchat(events,getConfig);',sandbox);const send=(type,data)=>listener({data:JSON.stringify({type,data})});const x=normalizeSC(msg(),now);send('sc',x);const root=body.children[0];assert.equal(root.children[0].children.length,2);assert.equal(root.children[0].children[0].textContent,t('zh-CN','scToggle',{user:'原名',amount:new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY'}).format(30),action:t('zh-CN','scFold')}));
 clock+=16000;tick();assert.equal(root.children[0].children.length,1);await root.children[0].children[0].onclick();assert.deepEqual(posted,{id:'1',expanded:true});send('sc-list',[{...x,expanded:true,interactedAt:clock}]);assert.equal(root.children[0].children.length,2);
 for(const language of ['ja','en','zh-CN']){c={...c,language};tick();assert.equal(root.children[0].children.length,2);assert.ok(!root.children[0].children[0].textContent.includes('seconds'));}
 c.scEnabled=false;tick();assert.equal(root.hidden,true);clock=x.end;tick();assert.equal(root.children.length,0);
});
