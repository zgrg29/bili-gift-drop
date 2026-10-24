import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {defaults} from '../src/shared/rules.mjs';
import {t} from '../src/shared/i18n/index.mjs';

test('control panel executes in all locales, renders new strings and submits all safety settings',async()=>{
  const source=(await readFile(new URL('../src/control/control.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
  for(const language of ['zh-CN','ja','en']){
    const elements=[],ids=new Map();let events,listener,posted;
    class Element {
      dataset={};children=[];value='';style={};contentWindow={};
      constructor(){elements.push(this);}
      set id(value){ids.set(value,this);this._id=value;}get id(){return this._id;}
      append(...items){this.children.push(...items);}prepend(...items){this.children.unshift(...items);}
      replaceChildren(...items){this.children=items;}after(){}get options(){return this.children;}
    }
    for(const id of ['demo','fields','language','status','warning','empty','events','room','includeFree','toast','obs','connection','disconnect','settings','clear','copy','count','price']){const e=new Element();e.id=id;}
    const preview=new Element(),iframe=new Element();
    const sandbox={t,Intl,JSON,Number,Map,console,document:{documentElement:{},getElementById:id=>ids.get(id),createElement:()=>new Element(),querySelector:q=>q==='iframe'?iframe:preview,querySelectorAll:()=>elements.filter(e=>e.dataset.t)},localStorage:{getItem:()=>language,setItem(){}},navigator:{language},location:{origin:'http://test'},setTimeout:()=>1,clearTimeout(){},EventSource:class{constructor(){events=this;}},window:{addEventListener(type,fn){listener=fn;}},fetch:async(url,options)=>{posted=JSON.parse(options.body);return {ok:true};}};
    vm.runInNewContext(source,sandbox);
    events.onmessage({data:JSON.stringify({type:'init',data:{config:{...defaults,language},configured:true,status:'disconnected',warning:null,gifts:[]}})});
    for(const key of ['maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])assert.ok(ids.get(key));
    for(const el of elements.filter(e=>e.dataset.t))assert.equal(el.textContent,t(language,el.dataset.t));
    listener({origin:'http://test',source:iframe.contentWindow,data:{type:'gift-stats',count:3,coverage:4,pending:5}});
    await ids.get('settings').onsubmit({preventDefault(){}});
    for(const key of ['maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])assert.equal(posted[key],defaults[key]);
    assert.equal(sandbox.document.documentElement.lang,language);
  }
});
