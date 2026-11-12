import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {scrollSC} from '../src/shared/sc-scroll.mjs';
import {SCStore} from '../src/shared/superchat.mjs';
import {config,defaults} from '../src/shared/rules.mjs';
import {resources,t} from '../src/shared/i18n/index.mjs';
const now=1800000000000;
const item=(id,end=now+300000)=>({id:String(id),user:'观众',message:`留言${id}`,price:Number(id),start:now,end,duration:300,color:'#2a60b2',background:'#edf5ff',text:'#172033'});

test('SC scroll and newest-position settings default safely and persist across old configs',()=>{
  assert.equal(defaults.scDisableScroll,false);
  assert.equal(defaults.scNewestPosition,'bottom');
  assert.equal(config({}).scDisableScroll,false);
  assert.equal(config({}).scNewestPosition,'bottom');
  const old=config(JSON.parse(JSON.stringify({language:'ja',scEnabled:true,scPersistent:true,scCollapse:0})));
  assert.equal(old.scDisableScroll,false,'old configs keep scrolling enabled');
  assert.equal(old.scNewestPosition,'bottom','old configs keep the newest card at the bottom');
  const saved=config({scDisableScroll:true,scNewestPosition:'top'});
  assert.equal(saved.scDisableScroll,true);
  assert.equal(saved.scNewestPosition,'top');
  assert.equal(config({},JSON.parse(JSON.stringify(saved))).scDisableScroll,true,'the stop-scroll switch survives a restart');
  assert.equal(config({},JSON.parse(JSON.stringify(saved))).scNewestPosition,'top','the position survives a restart');
  assert.equal(config({language:'en'},saved).scDisableScroll,true,'language changes preserve the switch');
  assert.equal(config({language:'en'},saved).scNewestPosition,'top','language changes preserve the position');
  assert.equal(config({scDisableScroll:'yes'},saved).scDisableScroll,true,'only booleans are accepted');
  assert.equal(config({scNewestPosition:'left'},saved).scNewestPosition,'top','invalid positions keep the previous value');
  assert.equal(config({scNewestPosition:'bottom'},saved).scNewestPosition,'bottom');
  assert.equal(config({scPersistent:true},saved).scDisableScroll,true,'permanent display and the new settings are independent');
  assert.equal(new SCStore().add(item(1)),true,'the data store still accepts cards independently of layout');
});

test('SC renderer: top/bottom order, no auto-scroll when stopped, newest priority and resize',async()=>{
  const source=(await readFile(new URL('../src/overlay/superchat.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'').replace('export function','function');
  class E{
    children=[];style={};dataset={};_top=0;scrollHeight=0;clientHeight=0;handlers={};
    get scrollTop(){return this._top;}set scrollTop(v){this._top=Math.floor(v);}
    addEventListener(k,fn){this.handlers[k]=fn;}contains(){return false;}
    append(...x){this.children.push(...x);}replaceChildren(...x){this.children=x;}
    setAttribute(k,v){this[k]=v;}querySelectorAll(){return this.children.flatMap(x=>x.children.filter(y=>y.tag==='button'));}
    focus(){}
  }
  let listener,tick,frame,resize,clock=now;const body=new E();
  let c={...defaults,scEnabled:true,scCollapse:0,scDisableScroll:true,scNewestPosition:'bottom'};
  const sandbox={scrollSC,requestAnimationFrame:fn=>{frame=fn;},t,Intl,Date:{now:()=>clock},document:{documentElement:{clientWidth:1920},body,createElement:tag=>Object.assign(new E(),{tag})},setInterval:fn=>{tick=fn;},fetch:async()=>({ok:true}),ResizeObserver:class{constructor(fn){resize=fn;}observe(){}},events:{addEventListener:(type,fn)=>{listener=fn;}},getConfig:()=>c};
  vm.runInNewContext(source+';superchat(events,getConfig);',sandbox);
  const send=(type,data)=>listener({data:JSON.stringify({type,data})});
  const root=body.children[0];
  const add=id=>send('sc',item(id));

  add(1);add(2);add(3);add(4);add(5);
  root.scrollHeight=1000;root.clientHeight=300;c={...c,scWidth:31};tick();
  assert.equal(root.scrollTop,700,'bottom mode anchors the newest card at the bottom edge');
  assert.deepEqual(root.children.map(card=>card.dataset.id),['1','2','3','4','5'],'bottom mode keeps arrival order');
  const stopped=root.scrollTop;
  for(let i=0;i<120;i++)frame(i*1000/60);
  assert.equal(root.scrollTop,stopped,'stopped scrolling never animates the container');

  root.scrollHeight=1200;add(6);
  assert.equal(root.scrollTop,900,'a new card moves the bottom anchor instead of being hidden below it');
  assert.equal(root.children.length,6,'older cards stay in the DOM while out of view');

  const replace=root.replaceChildren.bind(root);
  root.replaceChildren=(...cards)=>{replace(...cards);const last=cards.at(-1);if(last?.dataset.id==='7'){last.offsetHeight=500;last.offsetTop=1100;}};
  root.scrollHeight=1600;root.clientHeight=300;add(7);
  assert.equal(root.scrollTop,1100,'a single card taller than the region shows its heading, not its clipped bottom');
  c={...c,scNewestPosition:'top',scWidth:33};tick();
  assert.equal(root.scrollTop,0,'top mode anchors the newest card at the top edge');
  assert.deepEqual(root.children.map(card=>card.dataset.id),['7','6','5','4','3','2','1'],'top mode shows newest first with older cards below');
  for(let i=0;i<120;i++)frame(2000+i*1000/60);
  assert.equal(root.scrollTop,0,'top mode also stays still while scrolling is disabled');

  root.scrollHeight=2000;root.clientHeight=600;resize();
  assert.equal(root.scrollTop,0,'resize keeps the newest card visible in top mode');
  c={...c,scNewestPosition:'bottom',scWidth:34};tick();
  assert.equal(root.scrollTop,1400,'resize and direction changes re-anchor the visible edge');

  c={...c,scDisableScroll:false,scWidth:35};tick();
  assert.equal(root.scrollTop,1400,'re-enabling scrolling starts from the chosen bottom edge');
  root.scrollTop=120;
  add(8);
  assert.equal(root.scrollTop,120,'ordinary new cards preserve the existing manual/auto scroll offset');
  for(let i=0;i<240;i++)frame(4000+i*1000/60);
  assert.notEqual(root.scrollTop,120,'scrolling still runs when the stop switch is off');
});

test('three languages expose the stop-scroll and newest-position controls',()=>{
  const keys=['scDisableScroll','scNewestPosition','scNewestTop','scNewestBottom','scNewestHint'];
  for(const key of keys)for(const language of ['zh-CN','ja','en'])assert.equal(typeof resources[language][key],'string');
  assert.equal(t('zh-CN','scDisableScroll'),'停止滚动');
  assert.equal(t('ja','scDisableScroll'),'スクロールを停止');
  assert.equal(t('en','scDisableScroll'),'Disable Scrolling');
  assert.equal(t('zh-CN','scNewestBottom'),'最新 SC 显示在底部');
  assert.equal(t('ja','scNewestBottom'),'新しいSCを下に表示');
  assert.equal(t('en','scNewestBottom'),'Show Newest SC at Bottom');
  for(const language of ['zh-CN','ja','en'])assert.match(t(language,'scNewestHint'),/100/);
});

test('SC layout keeps the 100-item store cap independent from the visible region',()=>{
  const store=new SCStore(true);
  for(let i=0;i<101;i++)store.add(item(i),now);
  assert.equal(store.items.size,100);
  assert.equal(store.items.has('0'),false,'the 101st card evicts only the store oldest entry');
  assert.equal(store.items.has('100'),true);
  const cfg=config({scDisableScroll:true,scNewestPosition:'top',scHeight:10,scY:85});
  assert.equal(cfg.scDisableScroll,true);
  assert.equal(cfg.scNewestPosition,'top');
  assert.equal(cfg.scHeight,10,'the existing region clamp still applies');
});
