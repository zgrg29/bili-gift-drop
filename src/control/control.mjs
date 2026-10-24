import {t} from '/src/shared/i18n/index.mjs';
const $=id=>document.getElementById(id);
let cfg={},language=localStorage.getItem('language')||(['zh-CN','ja','en'].find(l=>navigator.language.startsWith(l.split('-')[0]))??'en'),state='disconnected',warning=null,history=[];
let gifts=[],historyTimer;
const giftLabel=document.createElement('label'),giftText=document.createElement('span'),giftSelect=document.createElement('select');giftText.dataset.t='giftType';giftSelect.id='giftType';giftLabel.append(giftText,giftSelect);$('demo').prepend(giftLabel);
function catalog(list){gifts=list;const value=giftSelect.value;const placeholder=document.createElement('option');placeholder.value='0';placeholder.textContent=t(language,'demo');giftSelect.replaceChildren(placeholder,...list.map(g=>{const o=document.createElement('option');o.value=g.id;o.textContent=g.name;return o;}));giftSelect.value=value||'0';}
giftSelect.onchange=()=>{const g=gifts.find(g=>String(g.id)===giftSelect.value);if(g)$('price').value=g.coinType==='gold'?g.price/1000:0;};
for(const [key,min,max,step]of [['scX',0,80,0.1],['scY',0,90,0.1],['scWidth',20,80,0.1],['scCollapse',0,300,1],['minGiftScale',10,400,1],['maxGiftScale',10,400,1],['maxGiftScaleAmount',.001,100000,.001],['minGiftPrice',0,100000,.001],['gravity',100,2400,10],['bounce',0,.85,.05],['lifetime',5,120,1],['maxObjects',10,200,1],['maxCoverage',1,30,1],['spawnRate',1,30,1],['regionX',0,90,1],['regionY',0,90,1],['regionWidth',10,100,1],['regionHeight',10,100,1]]){
  const label=document.createElement('label');label.className='field';const text=document.createElement('span');text.dataset.t=key;const input=document.createElement('input');Object.assign(input,{id:key,type:'number',min,max,step,required:true});label.append(text,input);$('fields').append(label);
}
function render(){document.documentElement.lang=language;document.title=t(language,'title');document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(language,el.dataset.t));$('language').value=language;if(typeof stats!=='undefined')renderStats();if(giftSelect.options[0])giftSelect.options[0].textContent=t(language,'demo');$('status').textContent=t(language,state);$('warning').textContent=warning?t(language,warning):'';$('empty').hidden=history.length>0;$('events').replaceChildren(...history.map(g=>{const li=document.createElement('li');li.textContent=t(language,'gift',{user:g.demo?t(language,'demo'):g.user,name:g.name??t(language,'demo'),count:new Intl.NumberFormat(language).format(g.count),amount:g.coinType==='gold'?new Intl.NumberFormat(language,{style:'currency',currency:'CNY'}).format(g.totalCoin/1000):t(language,'free')});return li;}));}
const edits=new Map();let autosaveTimer,saveQueue=Promise.resolve();
function populate(){for(const key of ['scX','scY','scWidth','scCollapse','room','minGiftScale','maxGiftScale','maxGiftScaleAmount','gravity','bounce','lifetime','maxObjects','minGiftPrice','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])if(!edits.has(key))$(key).value=cfg[key]??0;if(!edits.has('scEnabled'))$('scEnabled').checked=cfg.scEnabled;updateLayout();if(!edits.has('includeFree'))$('includeFree').checked=cfg.includeFree;}
let toastTimer;function toast(key){$('toast').textContent=t(language,key);$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',3500);}
async function post(action,data={}){const res=await fetch('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!res.ok){const err=await res.json();throw Error(err.error||'failed');}}
function run(fn){return async e=>{e?.preventDefault();try{await fn();}catch(err){toast(['invalid','failed'].includes(err.message)?err.message:'failed');}};}
$('obs').value=location.origin+'/overlay';
$('connection').onsubmit=run(async()=>{await post('config',{room:$('room').value});await post('connect',{room:$('room').value});});
$('disconnect').onclick=run(()=>post('disconnect'));
function flushSettings(){
  clearTimeout(autosaveTimer);
  const batch=[...edits].filter(([,edit])=>edit.valid);
  if(!batch.length)return saveQueue;
  const task=saveQueue.catch(()=>{}).then(async()=>{
    await post('config',Object.fromEntries(batch.map(([key,edit])=>[key,edit.value])));
    for(const [key,edit]of batch)if(edits.get(key)===edit)edits.delete(key);
    populate();toast('saved');
  });
  saveQueue=task;return task;
}
$('settings').oninput=e=>{
  const input=e.target;if(!input.id||input.id==='room')return;
  edits.set(input.id,{value:input.type==='checkbox'?input.checked:Number(input.value),valid:input.type==='checkbox'||(input.value!==''&&input.checkValidity())});
  clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>flushSettings().catch(()=>toast('failed')),400);
};
$('settings').onsubmit=run(async()=>{
  if(!$('settings').checkValidity())return;
  // Keep the explicit save button as a retry and keyboard shortcut.
  for(const input of $('settings').querySelectorAll('input'))edits.set(input.id,{value:input.type==='checkbox'?input.checked:Number(input.value),valid:true});
  await flushSettings();
});
$('language').onchange=run(async()=>{language=$('language').value;localStorage.setItem('language',language);render();await post('config',{language});});
$('demo').onsubmit=run(()=>post('test',{count:Number($('count').value),price:Number($('price').value),giftId:Number(giftSelect.value)}));
$('clear').onclick=run(()=>post('clear'));
$('copy').onclick=run(async()=>{await navigator.clipboard.writeText($('obs').value);toast('copied');});
const scHeading=document.createElement('h2');scHeading.dataset.t='scTitle';$('fields').prepend(scHeading);
const scCheck=document.createElement('label');scCheck.className='check';const check=document.createElement('input');check.type='checkbox';check.id='scEnabled';const label=document.createElement('span');label.dataset.t='scEnabled';scCheck.append(check,label);$('fields').prepend(scCheck);
const hint=document.createElement('p');hint.dataset.t='scHint';$('fields').append(hint);
const layout=document.createElement('div');layout.className='sc-layout';const handle=document.createElement('button');handle.type='button';handle.dataset.t='scLayout';layout.append(handle);document.querySelector('.preview').before(layout);
function updateLayout(){handle.style.left=(cfg.scX??5)+'%';handle.style.top=(cfg.scY??5)+'%';handle.style.width=(cfg.scWidth??30)+'%';}
let drag;
handle.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,left:cfg.scX??5,top:cfg.scY??5,b:layout.getBoundingClientRect()};handle.setPointerCapture(e.pointerId);};
handle.onpointermove=e=>{if(!drag)return;const x=Math.min(100-(cfg.scWidth??30),Math.max(0,drag.left+(e.clientX-drag.x)/drag.b.width*100)),y=Math.min(90,Math.max(0,drag.top+(e.clientY-drag.y)/drag.b.height*100));for(const [k,v]of [['scX',x],['scY',y]]){$(k).value=v.toFixed(1);$(k).dispatchEvent(new Event('input',{bubbles:true}));cfg[k]=Number($(k).value);}updateLayout();};
handle.onpointerup=handle.onpointercancel=()=>{drag=null;return flushSettings().catch(()=>toast('failed'));};
handle.onkeydown=e=>{const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta)return;e.preventDefault();for(const [key,value]of [['scX',Math.min(80,100-(cfg.scWidth??30),Math.max(0,(cfg.scX??5)+delta[0]))],['scY',Math.min(90,Math.max(0,(cfg.scY??5)+delta[1]))]]){$(key).value=String(value);$(key).dispatchEvent(new Event('input',{bubbles:true}));cfg[key]=value;}updateLayout();};
const scTest=document.createElement('button');scTest.type='button';scTest.dataset.t='scTest';scTest.onclick=run(()=>post('sc-test'));$('demo').append(scTest);
const events=new EventSource('/api/events');let initialized=false;
events.onmessage=e=>{const {type,data}=JSON.parse(e.data);
  if(type==='init'){cfg=data.config;catalog(data.gifts);state=data.status;warning=data.warning;if(!initialized){initialized=true;const preferred=data.configured?cfg.language:language;language=preferred;if(preferred!==cfg.language||!data.configured)post('config',{language:preferred}).catch(()=>toast('failed'));}populate();}
  if(type==='catalog')catalog(data);
  if(type==='config'){cfg=data;language=cfg.language;localStorage.setItem('language',language);populate();}
  if(type==='status')state=data;if(type==='warning')warning=data;
  if(type==='gift'){history.unshift(data);history=history.slice(0,20);if(!historyTimer)historyTimer=setTimeout(()=>{historyTimer=null;render();},100);return;}render();
};events.onerror=()=>{state='transport';render();};

const statsLine=document.createElement('p'),safetyHint=document.createElement('p');safetyHint.dataset.t='safetyHint';$('fields').append(safetyHint);document.querySelector('.preview').after(statsLine);
let stats={count:0,coverage:0,pending:0};
function renderStats(){statsLine.textContent=t(language,'crowdStats',{count:new Intl.NumberFormat(language).format(stats.count),coverage:new Intl.NumberFormat(language,{maximumFractionDigits:1}).format(stats.coverage),pending:new Intl.NumberFormat(language).format(stats.pending)});}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===document.querySelector('iframe').contentWindow&&e.data?.type==='gift-stats'){stats=e.data;renderStats();}});
renderStats();
render();
