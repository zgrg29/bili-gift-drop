import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {defaults} from '../src/shared/rules.mjs';
import {t} from '../src/shared/i18n/index.mjs';

test('control panel executes in all locales, renders new strings and submits all safety settings',async()=>{
  const source=(await readFile(new URL('../src/control/control.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
  for(const language of ['zh-CN','ja','en']){
    const elements=[],ids=new Map();let events,listener,posted;const timers=new Map();let timerId=0;
    class Element {
      dataset={};children=[];value='';style={};contentWindow={};
      constructor(){elements.push(this);}
      set id(value){ids.set(value,this);this._id=value;}get id(){return this._id;}
      checkValidity(){return this.value!==''&&Number.isFinite(Number(this.value))&&(!this.min||Number(this.value)>=Number(this.min))&&(!this.max||Number(this.value)<=Number(this.max));}
      querySelectorAll(){return elements.filter(e=>e.type==='number'&&e.id!=='count'&&e.id!=='price').concat(ids.get('includeFree'));}
      append(...items){this.children.push(...items);}prepend(...items){this.children.unshift(...items);}
      replaceChildren(...items){this.children=items;}after(){}get options(){return this.children;}
    }
    for(const id of ['demo','fields','language','status','warning','empty','events','room','includeFree','toast','obs','connection','disconnect','settings','clear','copy','count','price']){const e=new Element();e.id=id;}
    const preview=new Element(),iframe=new Element();
    const sandbox={t,Intl,JSON,Number,Map,console,document:{documentElement:{},getElementById:id=>ids.get(id),createElement:()=>new Element(),querySelector:q=>q==='iframe'?iframe:preview,querySelectorAll:()=>elements.filter(e=>e.dataset.t)},localStorage:{getItem:()=>language,setItem(){}},navigator:{language},location:{origin:'http://test'},setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;},clearTimeout:id=>timers.delete(id),EventSource:class{constructor(){events=this;}},window:{addEventListener(type,fn){listener=fn;}},fetch:async(url,options)=>{posted=JSON.parse(options.body);return {ok:true};}};
    vm.runInNewContext(source,sandbox);
    events.onmessage({data:JSON.stringify({type:'init',data:{config:{...defaults,language},configured:true,status:'disconnected',warning:null,gifts:[]}})});
    for(const key of ['minGiftScale','maxGiftScale','maxGiftScaleAmount','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])assert.ok(ids.get(key));
    for(const el of elements.filter(e=>e.dataset.t))assert.equal(el.textContent,t(language,el.dataset.t));
    listener({origin:'http://test',source:iframe.contentWindow,data:{type:'gift-stats',count:3,coverage:4,pending:5}});
    ids.get('minGiftScale').value='75';ids.get('maxGiftScale').value='200';ids.get('maxGiftScaleAmount').value='25';
    ids.get('settings').checkValidity=()=>true;
    ids.get('includeFree').type='checkbox';
    await ids.get('settings').onsubmit({preventDefault(){}});
    for(const key of ['minGiftScale','maxGiftScale','maxGiftScaleAmount','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])assert.equal(posted[key],({minGiftScale:75,maxGiftScale:200,maxGiftScaleAmount:25})[key]??defaults[key]);
    assert.equal(sandbox.document.documentElement.lang,language);
    // Rapid edits produce one write containing the final valid value.
    const change=(id,value)=>{ids.get(id).value=value;ids.get('settings').oninput({target:ids.get(id)});};
    change('minGiftScale','80');change('minGiftScale','90');
    assert.equal([...timers.values()].filter(x=>x.delay===400).length,1);
    events.onmessage({data:JSON.stringify({type:'config',data:{...defaults,language}})});
    assert.equal(ids.get('minGiftScale').value,'90','SSE does not overwrite a pending edit');
    await [...timers.values()].find(x=>x.delay===400).fn();
    assert.equal(posted.minGiftScale,90);assert.equal(Object.keys(posted).length,1);
    const previous=posted;change('maxGiftScaleAmount','');
    await [...timers.values()].find(x=>x.delay===400).fn();assert.equal(posted,previous,'empty value is not saved as zero');
    change('maxGiftScaleAmount','0');await [...timers.values()].find(x=>x.delay===400).fn();assert.equal(posted,previous,'invalid amount is not saved');
    change('maxGiftScaleAmount','50');await [...timers.values()].find(x=>x.delay===400).fn();assert.equal(posted.maxGiftScaleAmount,50);
    ids.get('includeFree').checked=false;ids.get('settings').oninput({target:ids.get('includeFree')});
    await [...timers.values()].find(x=>x.delay===400).fn();assert.equal(posted.includeFree,false);

  }
});
