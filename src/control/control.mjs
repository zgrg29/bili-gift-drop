import {guardBox} from '/src/shared/guard.mjs';
import {GuardMedia} from '/src/shared/guard-media.mjs';
import {defaults} from '/src/shared/rules.mjs';
import {HistoryLedger} from '/src/shared/history.mjs';
import {giftDisplayName} from '/src/shared/gift-names.mjs';
import {t} from '/src/shared/i18n/index.mjs';
const $=id=>document.getElementById(id);
let cfg={},language=localStorage.getItem('language')||(['zh-CN','ja','en'].find(l=>navigator.language.startsWith(l.split('-')[0]))??'en'),state='disconnected',warning=null,recent=[];
let gifts=[],recentTimer;
const historyLedger=new HistoryLedger(),scTranslations=new Map();
let historyDirty=true,historyLanguage=null,historyRenderTimer=null,scTranslator=null,scTranslatorPair='';
let login={loggedIn:false,uid:'',user:'',avatar:null,verifiedAt:0,remembered:false},loginQrKey='',loginTimer=null;
let exchange={rate:null,rateTime:null,fetchedAt:null,source:null,error:null,loading:false};
const giftLabel=document.createElement('label'),giftText=document.createElement('span'),giftSelect=document.createElement('select');giftText.dataset.t='giftType';giftSelect.id='giftType';giftLabel.append(giftText,giftSelect);$('demo').prepend(giftLabel);
function catalog(list){gifts=list;const value=giftSelect.value;const placeholder=document.createElement('option');placeholder.value='0';placeholder.textContent=t(language,'demo');giftSelect.replaceChildren(placeholder,...list.map(g=>{const o=document.createElement('option');o.value=g.id;o.textContent=g.name;return o;}));giftSelect.value=value||'0';}
giftSelect.onchange=()=>{const g=gifts.find(g=>String(g.id)===giftSelect.value);if(g)$('price').value=g.coinType==='gold'?g.price/1000:0;};
const opacityOutputs={};const settingGroups={};for(const key of ['guard','sc','gift']){const group=document.createElement('div');group.className='settings-group';settingGroups[key]=group;$('fields').append(group);}
for(const prefix of ['guard','sc','gift']){const label=document.createElement('label'),text=document.createElement('span'),slider=document.createElement('input'),output=document.createElement('output');text.dataset.t=prefix+'Opacity';Object.assign(slider,{id:prefix+'Opacity',type:'range',min:0,max:100,step:1,value:100});label.className='opacity-field';label.append(text,output,slider);opacityOutputs[prefix+'Opacity']=output;settingGroups[prefix].append(label);}
function opacityLabels(){for(const [k,output]of Object.entries(opacityOutputs))output.textContent=new Intl.NumberFormat(language,{style:'percent',maximumFractionDigits:0}).format((edits.get(k)?.valid?edits.get(k).value:cfg[k]??100)/100);}
const giftHeading=document.createElement('h2');giftHeading.dataset.t='giftTitle';settingGroups.gift.append(giftHeading);
for(const [key,min,max,step]of [['guardX',0,100,.1],['guardY',0,89.5,.1],['guardWidth',15,100,.1],['guardDuration',1,null,1],['scHeight',10,100,0.1],['scScrollSpeed',0,120,1],['scX',0,80,0.1],['scY',0,90,0.1],['scWidth',20,80,0.1],['scCollapse',0,300,1],['minGiftScale',10,null,1],['maxGiftScale',10,null,1],['maxGiftScaleAmount',.001,100000,.001],['minGiftPrice',0,100000,.001],['gravity',100,2400,10],['bounce',0,.85,.05],['lifetime',5,120,1],['maxObjects',10,null,1],['maxCoverage',1,null,1],['spawnRate',1,null,1],['regionX',0,90,1],['regionY',0,90,1],['regionWidth',10,100,1],['regionHeight',10,100,1]]){
  const label=document.createElement('label');label.className='field';const text=document.createElement('span');text.dataset.t=key;const input=document.createElement('input');Object.assign(input,{id:key,type:'number',min,step,required:true});if(max!==null)input.max=max;label.append(text,input);settingGroups[key.startsWith('guard')?'guard':key.startsWith('sc')?'sc':'gift'].append(label);
}
function render(){if(typeof opacityOutputs!=='undefined')opacityLabels();document.documentElement.lang=language;document.title=t(language,'title');document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(language,el.dataset.t));$('language').value=language;if(typeof guardWaiting!=='undefined')guardQueueLabel.textContent=t(language,'guardPending',{count:new Intl.NumberFormat(language).format(guardWaiting)});if(typeof stats!=='undefined')renderStats();if(giftSelect.options[0])giftSelect.options[0].textContent=t(language,'demo');$('status').textContent=t(language,state);$('warning').textContent=warning?t(language,warning):'';$('empty').hidden=recent.length>0;$('events').replaceChildren(...recent.map(g=>{const li=document.createElement('li');li.textContent=t(language,'gift',{user:g.demo?t(language,'demo'):g.user,name:giftDisplayName(g.name??t(language,'demo'),language,cfg.giftTranslation!==false),count:new Intl.NumberFormat(language).format(g.count),amount:g.coinType==='gold'?amountText((g.totalCoin??0)/100):t(language,'free')});return li;}));renderHistory();renderLogin();}
const edits=new Map();let autosaveTimer,saveQueue=Promise.resolve();
function populate(){for(const key of ['giftOpacity','scOpacity','guardOpacity','guardX','guardY','guardWidth','guardDuration','scHeight','scScrollSpeed','scX','scY','scWidth','scCollapse','room','minGiftScale','maxGiftScale','maxGiftScaleAmount','gravity','bounce','lifetime','maxObjects','minGiftPrice','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])if(!edits.has(key))$(key).value=cfg[key]??(key.endsWith('Opacity')?100:0);if(!edits.has('scEnabled'))$('scEnabled').checked=cfg.scEnabled;if(!edits.has('guardEnabled'))$('guardEnabled').checked=cfg.guardEnabled;if($('historyCurrency'))$('historyCurrency').value=cfg.historyCurrency??'battery';if($('giftTranslation'))$('giftTranslation').checked=cfg.giftTranslation!==false;opacityLabels();updateGuardLayout();updateLayout();if(!edits.has('includeFree'))$('includeFree').checked=cfg.includeFree;}
let toastTimer;function toast(key){$('toast').textContent=t(language,key);$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',3500);}
async function post(action,data={}){const res=await fetch('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const value=await res.json().catch(()=>({}));if(!res.ok)throw Error(value.error||'failed');return value;}
function run(fn){return async e=>{e?.preventDefault();try{await fn();}catch(err){toast(['invalid','failed','auth'].includes(err.message)?err.message:'failed');}};}
function loginAvatarUrl(value){if(typeof value!=='string')return null;if(value.startsWith('/cache/'))return value;try{const u=new URL(value);return u.protocol==='https:'&&u.hostname.endsWith('.hdslb.com')?value:null;}catch{return null;}}
function renderLogin(){
  if(!$('loginStatus'))return;
  $('loginStatus').textContent=t(language,login.loggedIn?'loginLoggedIn':'loginAnonymous');
  $('loginAccount').hidden=!login.loggedIn;$('loginButton').hidden=!!login.loggedIn;$('logoutButton').hidden=!login.loggedIn;
  $('loginUser').textContent=login.user||'';$('loginUid').textContent=login.uid?`UID ${login.uid}`:'';
  const url=loginAvatarUrl(login.avatar),img=$('loginAvatar'),fallback=$('loginAvatarFallback');
  img.alt=t(language,'loginAvatar');img.hidden=!url;fallback.hidden=!!url;if(url)img.src=url;
  fallback.textContent=Array.from(login.user||'?')[0]??'?';img.onerror=()=>{img.hidden=true;fallback.hidden=false;};
}
function stopLoginPoll(){clearTimeout(loginTimer);loginTimer=null;loginQrKey='';}
function showLoginPanel(show){$('loginPanel').hidden=!show;}
function renderQR(url){
  const box=$('loginQR');box.replaceChildren();
  if(typeof qrcode==='function'){const qr=qrcode(0,'M');qr.addData(url);qr.make();box.innerHTML=qr.createSvgTag({cellSize:5,margin:8});return;}
  const text=document.createElement('code');text.className='login-qr-url';text.textContent=url;box.append(text);
}
async function pollLogin(){
  if(!loginQrKey)return;
  try{
    const result=await post('login/qr/poll',{qrcode_key:loginQrKey});
    if(result.status==='success'){stopLoginPoll();login=result.login??login;renderLogin();$('loginQRStatus').textContent=t(language,'loginSuccess');showLoginPanel(false);toast('loginSuccess');return;}
    if(result.status==='expired'){stopLoginPoll();$('loginQRStatus').textContent=t(language,'loginExpired');return;}
    $('loginQRStatus').textContent=t(language,result.status==='scanned'?'loginScanned':'loginWaiting');
    loginTimer=setTimeout(pollLogin,2000);
  }catch(error){stopLoginPoll();$('loginQRStatus').textContent=t(language,error.message==='auth'?'loginAuthFailed':'loginFailed');}
}
$('loginButton').onclick=run(async()=>{
  showLoginPanel(true);$('loginQRStatus').textContent=t(language,'loginWaiting');$('loginQR').replaceChildren();
  const qr=await post('login/qr',{remember:$('rememberLogin').checked});
  loginQrKey=qr.key;renderQR(qr.url);pollLogin();
});
$('loginClose').onclick=()=>{stopLoginPoll();showLoginPanel(false);};
$('logoutButton').onclick=run(async()=>{login=await post('login/logout',{});renderLogin();toast('logoutDone');});
$('loginCookieButton').onclick=run(async()=>{
  const cookie=$('loginCookie').value.trim();if(!cookie)throw Error('invalid');
  login=await post('login/cookie',{cookie,remember:$('rememberLogin').checked});
  $('loginCookie').value='';renderLogin();showLoginPanel(false);toast('loginSuccess');
});
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
const scDefaultKeys=['scEnabled','scOpacity','scX','scY','scWidth','scHeight','scCollapse','scScrollSpeed'];
const scReset=document.createElement('button');scReset.type='button';scReset.className='secondary';scReset.dataset.t='scReset';
scReset.onclick=run(async()=>{for(const key of scDefaultKeys)edits.delete(key);await post('config',Object.fromEntries(scDefaultKeys.map(key=>[key,defaults[key]])));toast('saved');});
settingGroups.sc.append(scReset);
const layout=document.querySelector('.preview');const handle=document.createElement('div'),scMoveLabel=document.createElement('span');handle.tabIndex=0;handle.role='group';handle.className='sc-move';scMoveLabel.dataset.t='scLayout';handle.append(scMoveLabel);layout.append(handle);
function layoutValue(key){return edits.get(key)?.valid?edits.get(key).value:cfg[key];}
function updateLayout(){Object.assign(handle.style,{left:layoutValue('scX')+'%',top:layoutValue('scY')+'%',width:layoutValue('scWidth')+'%',height:Math.min(layoutValue('scHeight')??95,100-layoutValue('scY'))+'%'});updateGiftLayout();}
const scTest=document.createElement('button');scTest.type='button';scTest.dataset.t='scTest';scTest.onclick=run(()=>post('sc-test'));$('demo').append(scTest);

const guardHeading=document.createElement('h2');guardHeading.dataset.t='guardTitle';settingGroups.guard.prepend(guardHeading);
const guardCheck=document.createElement('label'),guardToggle=document.createElement('input'),guardToggleText=document.createElement('span');guardCheck.className='check';guardToggle.type='checkbox';guardToggle.id='guardEnabled';guardToggleText.dataset.t='guardEnabled';guardCheck.append(guardToggle,guardToggleText);guardHeading.after(guardCheck);
const guardHint=document.createElement('p');guardHint.dataset.t='guardHint';settingGroups.guard.append(guardHint);
const guardFrame=layout;const guardMove=document.createElement('div'),guardResize=document.createElement('button');guardResize.type='button';guardMove.tabIndex=0;guardMove.role='group';const guardMoveLabel=document.createElement('span');guardMoveLabel.dataset.t='guardLayout';guardMove.append(guardMoveLabel);guardMove.className='guard-move';guardResize.dataset.t='guardResize';guardResize.className='guard-resize';guardMove.append(guardResize);guardFrame.append(guardMove);
const guardQueueLabel=document.createElement('p');guardFrame.after(guardQueueLabel);let guardWaiting=0,guardDrag=null,guardCurrentLevel=null,guardAnchorChecked=false;const guardMedia=new GuardMedia(()=>updateGuardLayout());
function guardValues(){return Object.fromEntries(['guardX','guardY','guardWidth'].map(k=>[k,edits.get(k)?.valid?edits.get(k).value:(cfg[k]??({guardX:20,guardY:29,guardWidth:60})[k])]));}
function guardGeometry(values=guardValues()){const c={...cfg,...values},level=guardCurrentLevel??3;return guardBox(c,level,guardMedia.ratio(c,level));}
function guardCenter(b){return b.x+b.width/2;}
// Legacy configs anchor the left edge; migrate once to the shared center axis so
// swapping a tier's media keeps the guard centered without a horizontal jump.
function anchorGuardOnce(){
  if(guardAnchorChecked)return;
  if(cfg.guardAnchor==='center'){guardAnchorChecked=true;return;}
  const level=guardCurrentLevel??3;
  if(!guardMedia.ready(cfg,level))return;
  guardAnchorChecked=true;
  const b=guardBox({...cfg,guardAnchor:'left'},level,guardMedia.ratio(cfg,level));
  const guardX=Number((b.x+b.width/2).toFixed(1));
  cfg={...cfg,guardX,guardAnchor:'center'};
  if($('guardX'))$('guardX').value=guardX;
  post('config',{guardX,guardAnchor:'center'}).catch(()=>toast('failed'));
}
function updateGuardLayout(){anchorGuardOnce();const b=guardGeometry();Object.assign(guardMove.style,{left:b.x+'%',top:b.y+'%',width:b.width+'%',height:b.height+'%'});}
function guardSet(values){if(values.guardWidth!==undefined){const b=guardGeometry({...guardValues(),...values});values={...values,guardX:guardCenter(b),guardY:b.y};}for(const [key,v]of Object.entries(values)){$(key).value=Number(v.toFixed(1));edits.set(key,{value:Number($(key).value),valid:true});}updateGuardLayout();}
function beginGuard(e,resize){e.preventDefault();e.stopPropagation();const b=guardGeometry();guardDrag={resize,x:e.clientX,y:e.clientY,width:b.width,height:b.height,aspect:b.height/b.width,centerX:guardCenter(b),top:b.y,requested:guardValues().guardWidth,box:guardFrame.getBoundingClientRect()};guardMove.setPointerCapture(e.pointerId);}
guardMove.onpointerdown=e=>beginGuard(e,false);guardResize.onpointerdown=e=>beginGuard(e,true);
guardMove.onpointermove=e=>{const d=guardDrag;if(!d)return;if(d.resize){const dx=(e.clientX-d.x)/d.box.width*100,dy=(e.clientY-d.y)/d.box.height*100/d.aspect;const w=Math.max(15,Math.min(100,d.requested+(Math.abs(dx)>=Math.abs(dy)?dx:dy)));guardSet({guardWidth:w});}else guardSet({guardX:Math.max(d.width/2,Math.min(100-d.width/2,d.centerX+(e.clientX-d.x)/d.box.width*100)),guardY:Math.max(0,Math.min(100-d.height,d.top+(e.clientY-d.y)/d.box.height*100))});};
guardMove.onpointerup=guardMove.onpointercancel=()=>{guardDrag=null;return flushSettings().catch(()=>toast('failed'));};
guardMove.onkeydown=e=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d)return;e.preventDefault();const v=guardValues(),b=guardGeometry(v);if(e.target===guardResize)guardSet({guardWidth:Math.max(15,Math.min(100,v.guardWidth+d[0]+d[1]))});else guardSet({guardX:Math.max(b.width/2,Math.min(100-b.width/2,v.guardX+d[0])),guardY:Math.max(0,Math.min(100-b.height,v.guardY+d[1]))});flushSettings().catch(()=>toast('failed'));};
const guardTestForm=document.createElement('div'),guardMonths=document.createElement('input');guardTestForm.className='guard-tests';
const guardTestLabel=document.createElement('span');guardTestLabel.dataset.t='guardTest';guardTestForm.append(guardTestLabel);
const guardCountLabel=document.createElement('label'),guardCountText=document.createElement('span');guardCountText.dataset.t='guardCount';guardCountLabel.append(guardCountText,guardMonths);Object.assign(guardMonths,{type:'number',min:1,max:1200,value:3,required:true});guardTestForm.append(guardCountLabel);
for(const level of [3,2,1]){const test=document.createElement('button');test.type='button';test.dataset.t='guard'+level;test.onclick=run(()=>post('guard-test',{level,count:Number(guardMonths.value)}));guardTestForm.append(test);}
$('demo').after(guardTestForm);
const guardAssets=document.createElement('div');settingGroups.guard.append(guardAssets);
for(const level of [3,2,1]){const label=document.createElement('label'),text=document.createElement('span'),file=document.createElement('input'),choose=document.createElement('button'),reset=document.createElement('button');text.dataset.t='guard'+level;file.type='file';file.accept='image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm';file.hidden=true;choose.type='button';choose.dataset.t='guardChoose';choose.onclick=()=>file.click();reset.type='button';reset.dataset.t='guardReset';label.append(text,file,choose,reset);guardAssets.append(label);file.onchange=run(async()=>{const selected=file.files[0];if(!selected)return;if(selected.size>32*1024*1024)throw Error('invalid');const r=await fetch('/api/guard-upload?level='+level,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:selected});if(!r.ok)throw Error('invalid');file.value='';toast('saved');});reset.onclick=run(()=>post('config',{['guardAsset'+level]:null}));}
const assetHint=document.createElement('p');assetHint.dataset.t='guardAssetHint';guardAssets.prepend(assetHint);
const guardReset=document.createElement('button');guardReset.type='button';guardReset.className='secondary';guardReset.dataset.t='guardResetLayout';
guardReset.onclick=run(async()=>{for(const key of ['guardX','guardY','guardWidth','guardAnchor'])edits.delete(key);await post('config',{guardX:50,guardY:29,guardWidth:60,guardAnchor:'center'});toast('saved');});
settingGroups.guard.append(guardReset);
if($('includeFree').parentElement){settingGroups.gift.append(...document.querySelectorAll('#settings > p[data-t=giftScaleHint], #settings > p[data-t=minGiftPriceHint]'),$('includeFree').parentElement);}
const giftDefaultKeys=['giftOpacity','minGiftScale','maxGiftScale','maxGiftScaleAmount','gravity','bounce','lifetime','maxObjects','minGiftPrice','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'];
const giftReset=document.createElement('button');giftReset.type='button';giftReset.className='secondary';giftReset.dataset.t='giftReset';
giftReset.onclick=run(async()=>{for(const key of [...giftDefaultKeys,'includeFree'])edits.delete(key);await post('config',Object.assign(Object.fromEntries(giftDefaultKeys.map(key=>[key,defaults[key]])),{includeFree:defaults.includeFree}));toast('saved');});
settingGroups.gift.append(giftReset);

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
const events=new EventSource('/api/events?history=1');let initialized=false;
events.onmessage=e=>{const {type,data}=JSON.parse(e.data);
  if(type==='init'){cfg=data.config;catalog(data.gifts);state=data.status;warning=data.warning;if(data.history){historyLedger.load(data.history);historyDirty=true;}if(data.exchange)exchange={...exchange,...data.exchange,loading:false};if(data.login)login=data.login;if(!initialized){initialized=true;const preferred=data.configured?cfg.language:language;language=preferred;if(preferred!==cfg.language||!data.configured)post('config',{language:preferred}).catch(()=>toast('failed'));}populate();if((cfg.historyCurrency??'battery')==='jpy'&&!exchange.rate)loadExchange().catch(()=>{});}
  if(type==='catalog')catalog(data);if(type==='guard-state'){guardWaiting=data.pending;guardCurrentLevel=data.current?.level??null;updateGuardLayout();}if(type==='init'){guardWaiting=data.guard?.pending??0;guardCurrentLevel=data.guard?.current?.level??null;updateGuardLayout();}
  if(type==='config'){const previous=cfg.historyCurrency;cfg=data;language=cfg.language;localStorage.setItem('language',language);if(previous!==cfg.historyCurrency)historyDirty=true;populate();}
  if(type==='status')state=data;if(type==='warning')warning=data;
  if(type==='history'){clearTimeout(historyRenderTimer);historyRenderTimer=null;historyLedger.load(data);scTranslations.clear();historyDirty=true;renderHistory();return;}
  if(type==='history-add'){const entry=data;if(entry.kind==='gift')historyLedger.addGift(entry.data);else if(entry.kind==='sc')historyLedger.addSC(entry.data);else if(entry.kind==='guard')historyLedger.addGuard(entry.data);scheduleHistoryRender();return;}
  if(type==='history-update'){const patch={};if(data.user)patch.user=data.user;if(data.avatar)patch.avatar=data.avatar;const changed=data.key?historyLedger.updateViewerByKey(data.key,patch):historyLedger.updateViewer(data.uid,patch);if(changed)scheduleHistoryRender();return;}
  if(type==='rate'){exchange={...exchange,...data,loading:false};historyDirty=true;if((cfg.historyCurrency??'battery')==='jpy')renderHistory();return;}
  if(type==='login'){login=data;renderLogin();if(login.loggedIn){stopLoginPoll();showLoginPanel(false);}return;}
  if(type==='gift'){recent.unshift(data);recent=recent.slice(0,20);if(!recentTimer)recentTimer=setTimeout(()=>{recentTimer=null;render();},100);return;}render();
};events.onerror=()=>{state='transport';render();};

const historySection=document.createElement('section');historySection.className='history-section';
const historyDetails=document.createElement('details');historyDetails.className='history';
const historySummary=document.createElement('summary');
const historyTitle=document.createElement('span');historyTitle.dataset.t='historyTitle';
const historySummaryText=document.createElement('span');historySummaryText.className='history-summary';
const historyCaret=document.createElement('span');historyCaret.className='history-caret';historyCaret.textContent='▾';
historySummary.append(historyTitle,historySummaryText,historyCaret);
const historyBody=document.createElement('div');historyBody.className='history-body';
const historyToolbar=document.createElement('div');historyToolbar.className='history-toolbar';
const historyHint=document.createElement('p');historyHint.dataset.t='historyHint';
const historyCurrencyLabel=document.createElement('label');historyCurrencyLabel.className='history-currency';
const historyCurrencyText=document.createElement('span');historyCurrencyText.dataset.t='historyCurrency';
const historyCurrencySelect=document.createElement('select');historyCurrencySelect.id='historyCurrency';
for(const [value,key]of [['battery','historyCurrencyBattery'],['cny','historyCurrencyCny'],['jpy','historyCurrencyJpy']]){const option=document.createElement('option');option.value=value;option.dataset.t=key;historyCurrencySelect.append(option);}
historyCurrencyLabel.append(historyCurrencyText,historyCurrencySelect);
const giftTranslationLabel=document.createElement('label');giftTranslationLabel.className='history-toggle';
const giftTranslationCheck=document.createElement('input');giftTranslationCheck.type='checkbox';giftTranslationCheck.id='giftTranslation';
const giftTranslationText=document.createElement('span');giftTranslationText.dataset.t='giftTranslation';
giftTranslationLabel.append(giftTranslationCheck,giftTranslationText);
giftTranslationCheck.onchange=run(async()=>{const value=giftTranslationCheck.checked;cfg={...cfg,giftTranslation:value};historyDirty=true;await post('config',{giftTranslation:value});render();});
const historyClearButton=document.createElement('button');historyClearButton.type='button';historyClearButton.className='secondary';historyClearButton.dataset.t='historyClear';
historyClearButton.onclick=run(async()=>{await post('history-clear');toast('historyCleared');});
historyToolbar.append(historyHint,historyCurrencyLabel,giftTranslationLabel,historyClearButton);
const historyRate=document.createElement('p');historyRate.className='history-rate';historyRate.hidden=true;
const historyEmpty=document.createElement('p');historyEmpty.dataset.t='historyEmpty';historyEmpty.className='history-empty';
const historyList=document.createElement('ol');historyList.className='history-list';
historyBody.append(historyToolbar,historyRate,historyEmpty,historyList);
historyDetails.append(historySummary,historyBody);historySection.append(historyDetails);document.body.append(historySection);
function amountText(battery){
  const value=Number(battery)||0,currency=cfg.historyCurrency??'battery';
  if(currency==='cny')return new Intl.NumberFormat(language,{style:'currency',currency:'CNY',maximumFractionDigits:2}).format(value/10);
  if(currency==='jpy'&&exchange.rate)return new Intl.NumberFormat(language,{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(value/10*exchange.rate);
  const count=new Intl.NumberFormat(language,{maximumFractionDigits:2}).format(value);
  return t(language,value===1?'batteryAmountOne':'batteryAmount',{count});
}
function historyItemBattery(item){if(item.unknownBattery&&!item.battery)return t(language,'batteryUnknown');return amountText(item.battery??0)+(item.unknownBattery?'*':'');}
function updateRateHint(){
  const currency=cfg.historyCurrency??'battery';historyRate.hidden=currency!=='jpy';
  if(currency!=='jpy')return;
  if(exchange.rate){
    const time=Number(exchange.rateTime)||Number(exchange.fetchedAt)||Date.now();
    historyRate.textContent=t(language,'historyRate',{rate:new Intl.NumberFormat(language,{maximumFractionDigits:4}).format(exchange.rate),date:new Intl.DateTimeFormat(language,{dateStyle:'medium'}).format(new Date(time))});
  }else historyRate.textContent=t(language,exchange.loading?'historyRateLoading':'historyRateUnavailable');
}
async function loadExchange(){
  exchange={...exchange,loading:true};historyDirty=true;renderHistory();
  try{
    const response=await fetch('/api/exchange-rate');if(!response.ok)throw Error('failed');
    exchange={...await response.json(),loading:false};
  }catch{exchange={...exchange,loading:false,error:'unavailable'};}
  historyDirty=true;renderHistory();
}
historyCurrencySelect.onchange=run(async()=>{
  const value=historyCurrencySelect.value;cfg={...cfg,historyCurrency:value};historyDirty=true;renderHistory();
  await post('config',{historyCurrency:value});
  if(value==='jpy')await loadExchange();
});
function historyGuardDetail(item){
  const times=Number(item.purchases)||1;
  if(times>1){
    if(item.allMonths)return t(language,'historyGuardMonthsTimes',{times:new Intl.NumberFormat(language).format(times),months:new Intl.NumberFormat(language).format(item.months??0)});
    if(item.unit)return t(language,'historyGuardSpecialTimes',{times:new Intl.NumberFormat(language).format(times),unit:item.unit});
    return t(language,'historyTimes',{times:new Intl.NumberFormat(language).format(times)});
  }
  if(item.allMonths){const months=item.months??0;return t(language,months===1?'historyGuardMonthOne':'historyGuardMonths',{count:new Intl.NumberFormat(language).format(months)});}
  if(item.unit)return t(language,'historyGuardSpecial',{unit:item.unit});
  return t(language,'historyDurationUnknown');
}
function detectLanguage(text){
  const value=String(text??'');
  if(/[\u3040-\u30ff]/.test(value))return 'ja';
  if(/[\u4e00-\u9fff]/.test(value))return 'zh';
  if(/[A-Za-z]/.test(value))return 'en';
  return null;
}
function targetLanguage(){return language==='zh-CN'?'zh':language;}
async function translateText(text,target){
  const Api=typeof Translator!=='undefined'?Translator:null;
  if(!Api)throw Error('unsupported');
  const source=detectLanguage(text);if(!source)throw Error('unsupported');
  if(source===target)return null;
  const pair=`${source}:${target}`;
  if(!scTranslator||scTranslatorPair!==pair){
    if(scTranslator?.destroy)scTranslator.destroy();
    scTranslator=null;scTranslatorPair='';
    const availability=await Api.availability({sourceLanguage:source,targetLanguage:target});
    if(availability==='unavailable')throw Error('unsupported');
    scTranslator=await Api.create({sourceLanguage:source,targetLanguage:target});
    scTranslatorPair=pair;
  }
  return await scTranslator.translate(text);
}
async function translateSC(item){
  const key=`${language}:${item.id}`;
  const state=scTranslations.get(key);
  if(state?.status==='done'){state.visible=!state.visible;historyDirty=true;renderHistory();return;}
  if(state?.status==='loading')return;
  scTranslations.set(key,{status:'loading',visible:true});
  historyDirty=true;renderHistory();
  try{const text=await translateText(item.message,targetLanguage());if(!text)throw Error('same');scTranslations.set(key,{status:'done',text,visible:true});}
  catch(error){scTranslations.set(key,{status:'error',code:error.message==='unsupported'?'unsupported':'failed',visible:true});}
  historyDirty=true;renderHistory();
}
function historyItemNode(item){
  const li=document.createElement('li');li.className='history-item history-'+item.kind;
  const row=document.createElement('div');row.className='history-item-row';
  const badge=document.createElement('span');badge.className='history-badge';
  const detail=document.createElement('span');detail.className='history-detail';
  const battery=document.createElement('span');battery.className='history-battery';battery.textContent=historyItemBattery(item);
  if(item.kind==='guard'){
    li.dataset.level=String(item.level);badge.textContent=t(language,'guard'+item.level);detail.textContent=historyGuardDetail(item);
  }else if(item.kind==='sc'){
    badge.textContent=t(language,'historyScBadge');detail.textContent=t(language,'historyScLabel');
  }else{
    badge.textContent=t(language,'historyGiftBadge');detail.textContent=t(language,'historyGiftDetail',{name:giftDisplayName(item.name||t(language,'historyUnknownGift'),language,cfg.giftTranslation!==false),count:new Intl.NumberFormat(language).format(item.count??0)});
  }
  row.append(badge,detail,battery);li.append(row);
  if(item.kind==='sc'){
    const message=document.createElement('p');message.className='history-sc-message';message.textContent=item.message||t(language,'historyScEmpty');li.append(message);
    const target=targetLanguage(),source=detectLanguage(item.message);
    if(source&&source!==target){
      const key=`${language}:${item.id}`,state=scTranslations.get(key);
      const actions=document.createElement('div');actions.className='history-sc-actions';
      const button=document.createElement('button');button.type='button';button.className='history-translate';
      const label=state?.status==='loading'?'historyTranslating':state?.status==='error'?'historyTranslateRetry':state?.status==='done'&&state.visible?'historyTranslateHide':'historyTranslate';
      button.textContent=t(language,label);button.disabled=state?.status==='loading';
      button.onclick=()=>translateSC(item);actions.append(button);li.append(actions);
      if(state?.status==='done'&&state.visible){const translated=document.createElement('p');translated.className='history-sc-translation';translated.textContent=t(language,'historyScTranslation',{text:state.text});li.append(translated);}
      else if(state?.status==='error'){const failed=document.createElement('p');failed.className='history-sc-translation history-sc-translation-error';failed.textContent=t(language,state.code==='unsupported'?'historyTranslateUnsupported':'historyTranslateFailed');li.append(failed);}
    }
  }
  return li;
}
function historyViewerNode(viewer){
  const li=document.createElement('li');li.className='history-viewer';
  const head=document.createElement('div');head.className='history-viewer-head';
  const person=document.createElement('div');person.className='history-viewer-person';
  const name=document.createElement('strong');name.className='history-viewer-name';name.textContent=viewer.user||t(language,'historyUnknownUser');
  const avatar=document.createElement('img'),fallback=document.createElement('span');
  avatar.className='history-viewer-avatar';avatar.alt=t(language,'historyAvatar');fallback.className='history-viewer-avatar history-viewer-avatar-fallback';fallback.textContent=Array.from(name.textContent)[0]??'✦';
  const url=viewer.avatar?.startsWith('/cache/')?viewer.avatar:null;
  avatar.hidden=!url;fallback.hidden=!!url;if(url)avatar.src=url;avatar.onerror=()=>{avatar.hidden=true;fallback.hidden=false;};
  person.append(avatar,fallback,name);
  const total=document.createElement('span');total.className='history-viewer-total';total.textContent=t(language,viewer.unknownBattery?'historyViewerTotalPartial':'historyViewerTotal',{battery:amountText(viewer.totalBattery??0)});
  head.append(person,total);
  const items=document.createElement('ul');items.className='history-items';items.append(...(viewer.items??[]).map(historyItemNode));
  li.append(head,items);return li;
}
function scheduleHistoryRender(){historyDirty=true;if(historyRenderTimer)return;historyRenderTimer=setTimeout(()=>{historyRenderTimer=null;renderHistory();},150);}
function renderHistory(){
  if(!historyDirty&&historyLanguage===language)return;
  historyDirty=false;historyLanguage=language;
  const snapshot=historyLedger.snapshot(),viewers=snapshot.viewers;
  const total=Number(snapshot.battery)||0,one=viewers.length===1;
  const summaryKey=snapshot.unknownBattery?(one?'historySummaryPartialOne':'historySummaryPartial'):(one?'historySummaryOne':'historySummary');
  historySummaryText.textContent=t(language,summaryKey,{viewers:new Intl.NumberFormat(language).format(viewers.length),battery:amountText(total)});
  updateRateHint();
  historyEmpty.hidden=viewers.length>0;historyList.hidden=viewers.length===0;
  historyList.replaceChildren(...viewers.map(historyViewerNode));
}
const statsLine=document.createElement('p'),safetyHint=document.createElement('p');safetyHint.dataset.t='safetyHint';settingGroups.gift.append(safetyHint);document.querySelector('.preview').after(statsLine);
let stats={count:0,coverage:0,pending:0};
function renderStats(){statsLine.textContent=t(language,'crowdStats',{count:new Intl.NumberFormat(language).format(stats.count),coverage:new Intl.NumberFormat(language,{maximumFractionDigits:1}).format(stats.coverage),pending:new Intl.NumberFormat(language).format(stats.pending)});}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===document.querySelector('iframe').contentWindow&&e.data?.type==='gift-stats'){stats=e.data;renderStats();}});
renderStats();
render();
