import {guardBox} from '/src/shared/guard.mjs';
import {GuardMedia} from '/src/shared/guard-media.mjs';
import {t} from '/src/shared/i18n/index.mjs';
const $=id=>document.getElementById(id);
let cfg={},language=localStorage.getItem('language')||(['zh-CN','ja','en'].find(l=>navigator.language.startsWith(l.split('-')[0]))??'en'),state='disconnected',warning=null,history=[];
let gifts=[],historyTimer;
const giftLabel=document.createElement('label'),giftText=document.createElement('span'),giftSelect=document.createElement('select');giftText.dataset.t='giftType';giftSelect.id='giftType';giftLabel.append(giftText,giftSelect);$('demo').prepend(giftLabel);
function catalog(list){gifts=list;const value=giftSelect.value;const placeholder=document.createElement('option');placeholder.value='0';placeholder.textContent=t(language,'demo');giftSelect.replaceChildren(placeholder,...list.map(g=>{const o=document.createElement('option');o.value=g.id;o.textContent=g.name;return o;}));giftSelect.value=value||'0';}
giftSelect.onchange=()=>{const g=gifts.find(g=>String(g.id)===giftSelect.value);if(g)$('price').value=g.coinType==='gold'?g.price/1000:0;};
const opacityOutputs={};const settingGroups={};for(const key of ['guard','sc','gift']){const group=document.createElement('div');group.className='settings-group';settingGroups[key]=group;$('fields').append(group);}
for(const prefix of ['guard','sc','gift']){const label=document.createElement('label'),text=document.createElement('span'),slider=document.createElement('input'),output=document.createElement('output');text.dataset.t=prefix+'Opacity';Object.assign(slider,{id:prefix+'Opacity',type:'range',min:0,max:100,step:1,value:100});label.className='opacity-field';label.append(text,output,slider);opacityOutputs[prefix+'Opacity']=output;settingGroups[prefix].append(label);}
function opacityLabels(){for(const [k,output]of Object.entries(opacityOutputs))output.textContent=new Intl.NumberFormat(language,{style:'percent',maximumFractionDigits:0}).format((edits.get(k)?.valid?edits.get(k).value:cfg[k]??100)/100);}
const giftHeading=document.createElement('h2');giftHeading.dataset.t='giftTitle';settingGroups.gift.append(giftHeading);
for(const [key,min,max,step]of [['guardX',0,85,.1],['guardY',0,89.5,.1],['guardWidth',15,100,.1],['scHeight',10,100,0.1],['scScrollSpeed',0,120,1],['scX',0,80,0.1],['scY',0,90,0.1],['scWidth',20,80,0.1],['scCollapse',0,300,1],['minGiftScale',10,400,1],['maxGiftScale',10,400,1],['maxGiftScaleAmount',.001,100000,.001],['minGiftPrice',0,100000,.001],['gravity',100,2400,10],['bounce',0,.85,.05],['lifetime',5,120,1],['maxObjects',10,200,1],['maxCoverage',1,30,1],['spawnRate',1,30,1],['regionX',0,90,1],['regionY',0,90,1],['regionWidth',10,100,1],['regionHeight',10,100,1]]){
  const label=document.createElement('label');label.className='field';const text=document.createElement('span');text.dataset.t=key;const input=document.createElement('input');Object.assign(input,{id:key,type:'number',min,max,step,required:true});label.append(text,input);settingGroups[key.startsWith('guard')?'guard':key.startsWith('sc')?'sc':'gift'].append(label);
}
function render(){if(typeof opacityOutputs!=='undefined')opacityLabels();document.documentElement.lang=language;document.title=t(language,'title');document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(language,el.dataset.t));$('language').value=language;if(typeof guardWaiting!=='undefined')guardQueueLabel.textContent=t(language,'guardPending',{count:new Intl.NumberFormat(language).format(guardWaiting)});if(typeof stats!=='undefined')renderStats();if(giftSelect.options[0])giftSelect.options[0].textContent=t(language,'demo');$('status').textContent=t(language,state);$('warning').textContent=warning?t(language,warning):'';$('empty').hidden=history.length>0;$('events').replaceChildren(...history.map(g=>{const li=document.createElement('li');li.textContent=t(language,'gift',{user:g.demo?t(language,'demo'):g.user,name:g.name??t(language,'demo'),count:new Intl.NumberFormat(language).format(g.count),amount:g.coinType==='gold'?new Intl.NumberFormat(language,{style:'currency',currency:'CNY'}).format(g.totalCoin/1000):t(language,'free')});return li;}));}
const edits=new Map();let autosaveTimer,saveQueue=Promise.resolve();
function populate(){for(const key of ['giftOpacity','scOpacity','guardOpacity','guardX','guardY','guardWidth','scHeight','scScrollSpeed','scX','scY','scWidth','scCollapse','room','minGiftScale','maxGiftScale','maxGiftScaleAmount','gravity','bounce','lifetime','maxObjects','minGiftPrice','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])if(!edits.has(key))$(key).value=cfg[key]??(key.endsWith('Opacity')?100:0);if(!edits.has('scEnabled'))$('scEnabled').checked=cfg.scEnabled;if(!edits.has('guardEnabled'))$('guardEnabled').checked=cfg.guardEnabled;opacityLabels();updateGuardLayout();updateLayout();if(!edits.has('includeFree'))$('includeFree').checked=cfg.includeFree;}
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
  if(input.id.endsWith('Opacity')){opacityLabels();document.querySelector('iframe').contentWindow.postMessage({type:'opacity-preview',key:input.id,value:Number(input.value)},location.origin);}
  if(input.id.startsWith('guard'))updateGuardLayout();if(input.id.startsWith('sc')||input.id.startsWith('region'))updateLayout();
  clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>flushSettings().catch(()=>toast('failed')),400);
};
$('settings').onsubmit=run(async()=>{
  if(!$('settings').checkValidity())return;
  // Keep the explicit save button as a retry and keyboard shortcut.
  for(const input of $('settings').querySelectorAll('input'))if(input.id&&input.type!=='file')edits.set(input.id,{value:input.type==='checkbox'?input.checked:Number(input.value),valid:true});
  await flushSettings();
});
$('language').onchange=run(async()=>{language=$('language').value;localStorage.setItem('language',language);render();await post('config',{language});});
$('demo').onsubmit=run(()=>post('test',{count:Number($('count').value),price:Number($('price').value),giftId:Number(giftSelect.value)}));
$('clear').onclick=run(()=>post('clear'));
$('copy').onclick=run(async()=>{await navigator.clipboard.writeText($('obs').value);toast('copied');});
const scHeading=document.createElement('h2');scHeading.dataset.t='scTitle';settingGroups.sc.prepend(scHeading);
const scCheck=document.createElement('label');scCheck.className='check';const check=document.createElement('input');check.type='checkbox';check.id='scEnabled';const label=document.createElement('span');label.dataset.t='scEnabled';scCheck.append(check,label);scHeading.after(scCheck);
const hint=document.createElement('p');hint.dataset.t='scHint';settingGroups.sc.append(hint);
const layout=document.querySelector('.preview');const handle=document.createElement('div'),scMoveLabel=document.createElement('span');handle.tabIndex=0;handle.role='group';handle.className='sc-move';scMoveLabel.dataset.t='scLayout';handle.append(scMoveLabel);layout.append(handle);
function layoutValue(key){return edits.get(key)?.valid?edits.get(key).value:cfg[key];}
function updateLayout(){Object.assign(handle.style,{left:layoutValue('scX')+'%',top:layoutValue('scY')+'%',width:layoutValue('scWidth')+'%',height:Math.min(layoutValue('scHeight')??95,100-layoutValue('scY'))+'%'});updateGiftLayout();}
const scTest=document.createElement('button');scTest.type='button';scTest.dataset.t='scTest';scTest.onclick=run(()=>post('sc-test'));$('demo').append(scTest);

const guardHeading=document.createElement('h2');guardHeading.dataset.t='guardTitle';settingGroups.guard.prepend(guardHeading);
const guardCheck=document.createElement('label'),guardToggle=document.createElement('input'),guardToggleText=document.createElement('span');guardCheck.className='check';guardToggle.type='checkbox';guardToggle.id='guardEnabled';guardToggleText.dataset.t='guardEnabled';guardCheck.append(guardToggle,guardToggleText);guardHeading.after(guardCheck);
const guardHint=document.createElement('p');guardHint.dataset.t='guardHint';settingGroups.guard.append(guardHint);
const guardFrame=layout;const guardMove=document.createElement('div'),guardResize=document.createElement('button');guardResize.type='button';guardMove.tabIndex=0;guardMove.role='group';const guardMoveLabel=document.createElement('span');guardMoveLabel.dataset.t='guardLayout';guardMove.append(guardMoveLabel);guardMove.className='guard-move';guardResize.dataset.t='guardResize';guardResize.className='guard-resize';guardMove.append(guardResize);guardFrame.append(guardMove);
const guardQueueLabel=document.createElement('p');guardFrame.after(guardQueueLabel);let guardWaiting=0,guardDrag=null,guardCurrentLevel=null;const guardMedia=new GuardMedia(()=>updateGuardLayout());
function guardValues(){return Object.fromEntries(['guardX','guardY','guardWidth'].map(k=>[k,edits.get(k)?.valid?edits.get(k).value:(cfg[k]??({guardX:20,guardY:29,guardWidth:60})[k])]));}
function guardGeometry(values=guardValues()){const c={...cfg,...values},level=guardCurrentLevel??Number(guardLevel.value||3);return guardBox(c,level,guardMedia.ratio(c,level));}
function updateGuardLayout(){const b=guardGeometry();Object.assign(guardMove.style,{left:b.x+'%',top:b.y+'%',width:b.width+'%',height:b.height+'%'});}
function guardSet(values){if(values.guardWidth!==undefined){const b=guardGeometry({...guardValues(),...values});values={...values,guardX:b.x,guardY:b.y};}for(const [key,v]of Object.entries(values)){$(key).value=Number(v.toFixed(1));edits.set(key,{value:Number($(key).value),valid:true});}updateGuardLayout();}
function beginGuard(e,resize){e.preventDefault();e.stopPropagation();const b=guardGeometry();guardDrag={resize,x:e.clientX,y:e.clientY,...guardValues(),guardX:b.x,guardY:b.y,box:guardFrame.getBoundingClientRect()};guardMove.setPointerCapture(e.pointerId);}
guardMove.onpointerdown=e=>beginGuard(e,false);guardResize.onpointerdown=e=>beginGuard(e,true);
guardMove.onpointermove=e=>{const d=guardDrag;if(!d)return;if(d.resize){const dx=(e.clientX-d.x)/d.box.width*100,dy=(e.clientY-d.y)/d.box.height*100/(guardGeometry(d).height/guardGeometry(d).width);const w=Math.max(15,Math.min(100,d.guardWidth+(Math.abs(dx)>=Math.abs(dy)?dx:dy)));guardSet({guardWidth:w});}else guardSet({guardX:Math.max(0,Math.min(100-guardGeometry(d).width,d.guardX+(e.clientX-d.x)/d.box.width*100)),guardY:Math.max(0,Math.min(100-guardGeometry(d).height,d.guardY+(e.clientY-d.y)/d.box.height*100))});};
guardMove.onpointerup=guardMove.onpointercancel=()=>{guardDrag=null;return flushSettings().catch(()=>toast('failed'));};
guardMove.onkeydown=e=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d)return;e.preventDefault();const c=guardValues();if(e.target===guardResize)guardSet({guardWidth:Math.max(15,Math.min(100,c.guardWidth+d[0]+d[1]))});else guardSet({guardX:Math.max(0,Math.min(100-guardGeometry(c).width,c.guardX+d[0])),guardY:Math.max(0,Math.min(100-guardGeometry(c).height,c.guardY+d[1]))});flushSettings().catch(()=>toast('failed'));};
const guardTestForm=document.createElement('form'),guardLevel=document.createElement('select'),guardMonths=document.createElement('input'),guardTest=document.createElement('button');guardTestForm.className='guard-tests';
guardLevel.onchange=()=>updateGuardLayout();
for(const level of [3,2,1]){const option=document.createElement('option');option.value=level;option.dataset.t='guard'+level;guardLevel.append(option);}
for(const [key,input]of [['guardLevel',guardLevel],['guardCount',guardMonths]]){const label=document.createElement('label'),text=document.createElement('span');text.dataset.t=key;label.append(text,input);guardTestForm.append(label);}Object.assign(guardMonths,{type:'number',min:1,max:1200,value:3,required:true});guardTest.dataset.t='guardTest';guardTestForm.append(guardTest);$('demo').after(guardTestForm);guardTestForm.onsubmit=run(()=>post('guard-test',{level:Number(guardLevel.value),count:Number(guardMonths.value)}));
const guardAssets=document.createElement('div');settingGroups.guard.append(guardAssets);
for(const level of [3,2,1]){const label=document.createElement('label'),text=document.createElement('span'),file=document.createElement('input'),choose=document.createElement('button'),reset=document.createElement('button');text.dataset.t='guard'+level;file.type='file';file.accept='image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm';file.hidden=true;choose.type='button';choose.dataset.t='guardChoose';choose.onclick=()=>file.click();reset.type='button';reset.dataset.t='guardReset';label.append(text,file,choose,reset);guardAssets.append(label);file.onchange=run(async()=>{const selected=file.files[0];if(!selected)return;if(selected.size>32*1024*1024)throw Error('invalid');const r=await fetch('/api/guard-upload?level='+level,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:selected});if(!r.ok)throw Error('invalid');file.value='';toast('saved');});reset.onclick=run(()=>post('config',{['guardAsset'+level]:null}));}
const assetHint=document.createElement('p');assetHint.dataset.t='guardAssetHint';guardAssets.prepend(assetHint);
if($('includeFree').parentElement){settingGroups.gift.append(...document.querySelectorAll('#settings > p[data-t=giftScaleHint], #settings > p[data-t=minGiftPriceHint]'),$('includeFree').parentElement);}

const giftFrame=document.createElement('div'),giftFrameLabel=document.createElement('span');giftFrame.className='gift-region-editor';giftFrame.tabIndex=0;giftFrame.role='group';giftFrameLabel.dataset.t='regionLayout';giftFrame.append(giftFrameLabel);layout.append(giftFrame);
function updateGiftLayout(){if(typeof giftFrame==='undefined')return;Object.assign(giftFrame.style,{left:layoutValue('regionX')+'%',top:layoutValue('regionY')+'%',width:Math.min(layoutValue('regionWidth'),100-layoutValue('regionX'))+'%',height:Math.min(layoutValue('regionHeight'),100-layoutValue('regionY'))+'%'});}
function bindBoxEditor(frame,prefix,limits,resizeKey){
 const size=document.createElement('button');size.type='button';size.className='box-resize';size.dataset.t=resizeKey;frame.append(size);let moving=null;
 const keys=[prefix+'X',prefix+'Y',prefix+'Width',prefix+'Height'];
 const values=()=>Object.fromEntries(keys.map(k=>[k,layoutValue(k)]));
 const set=next=>{for(const [k,v]of Object.entries(next)){const value=Number(v.toFixed(1));$(k).value=value;edits.set(k,{value,valid:true});}updateLayout();};
 const start=(e,resize)=>{e.preventDefault();e.stopPropagation();moving={resize,x:e.clientX,y:e.clientY,b:layout.getBoundingClientRect(),v:values()};frame.setPointerCapture(e.pointerId);};
 frame.onpointerdown=e=>start(e,false);size.onpointerdown=e=>start(e,true);
 frame.onpointermove=e=>{if(!moving)return;const d=moving,v=d.v,[kx,ky,kw,kh]=keys,dx=(e.clientX-d.x)/d.b.width*100,dy=(e.clientY-d.y)/d.b.height*100;if(d.resize)set({[kw]:Math.max(limits.minW,Math.min(limits.maxW,100-v[kx],v[kw]+dx)),[kh]:Math.max(10,Math.min(100-v[ky],v[kh]+dy))});else set({[kx]:Math.max(0,Math.min(limits.maxX,100-v[kw],v[kx]+dx)),[ky]:Math.max(0,Math.min(90,100-v[kh],v[ky]+dy))});};
 frame.onpointerup=frame.onpointercancel=()=>{moving=null;return flushSettings().catch(()=>toast('failed'));};
 frame.onkeydown=e=>{const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta)return;e.preventDefault();e.stopPropagation();const v=values(),[kx,ky,kw,kh]=keys;if(e.target===size)set({[kw]:Math.max(limits.minW,Math.min(limits.maxW,100-v[kx],v[kw]+delta[0])),[kh]:Math.max(10,Math.min(100-v[ky],v[kh]+delta[1]))});else set({[kx]:Math.max(0,Math.min(limits.maxX,100-v[kw],v[kx]+delta[0])),[ky]:Math.max(0,Math.min(90,100-v[kh],v[ky]+delta[1]))});return flushSettings().catch(()=>toast('failed'));};
}
bindBoxEditor(handle,'sc',{minW:20,maxW:80,maxX:80},'scResize');bindBoxEditor(giftFrame,'region',{minW:10,maxW:100,maxX:90},'regionResize');
const editHint=document.createElement('p');editHint.dataset.t='previewEditingHint';layout.after(editHint);
const events=new EventSource('/api/events');let initialized=false;
events.onmessage=e=>{const {type,data}=JSON.parse(e.data);
  if(type==='init'){cfg=data.config;catalog(data.gifts);state=data.status;warning=data.warning;if(!initialized){initialized=true;const preferred=data.configured?cfg.language:language;language=preferred;if(preferred!==cfg.language||!data.configured)post('config',{language:preferred}).catch(()=>toast('failed'));}populate();}
  if(type==='catalog')catalog(data);if(type==='guard-state'){guardWaiting=data.pending;guardCurrentLevel=data.current?.level??null;updateGuardLayout();}if(type==='init'){guardWaiting=data.guard?.pending??0;guardCurrentLevel=data.guard?.current?.level??null;updateGuardLayout();}
  if(type==='config'){cfg=data;language=cfg.language;localStorage.setItem('language',language);populate();}
  if(type==='status')state=data;if(type==='warning')warning=data;
  if(type==='gift'){history.unshift(data);history=history.slice(0,20);if(!historyTimer)historyTimer=setTimeout(()=>{historyTimer=null;render();},100);return;}render();
};events.onerror=()=>{state='transport';render();};

const statsLine=document.createElement('p'),safetyHint=document.createElement('p');safetyHint.dataset.t='safetyHint';settingGroups.gift.append(safetyHint);document.querySelector('.preview').after(statsLine);
let stats={count:0,coverage:0,pending:0};
function renderStats(){statsLine.textContent=t(language,'crowdStats',{count:new Intl.NumberFormat(language).format(stats.count),coverage:new Intl.NumberFormat(language,{maximumFractionDigits:1}).format(stats.coverage),pending:new Intl.NumberFormat(language).format(stats.pending)});}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===document.querySelector('iframe').contentWindow&&e.data?.type==='gift-stats'){stats=e.data;renderStats();}});
renderStats();
render();
