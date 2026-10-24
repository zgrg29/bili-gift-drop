import {t} from '/src/shared/i18n/index.mjs';
const $=id=>document.getElementById(id);
let cfg={},language=localStorage.getItem('language')||(['zh-CN','ja','en'].find(l=>navigator.language.startsWith(l.split('-')[0]))??'en'),state='disconnected',warning=null,history=[];
let gifts=[];
const giftLabel=document.createElement('label'),giftText=document.createElement('span'),giftSelect=document.createElement('select');giftText.dataset.t='giftType';giftSelect.id='giftType';giftLabel.append(giftText,giftSelect);$('demo').prepend(giftLabel);
function catalog(list){gifts=list;const value=giftSelect.value;const placeholder=document.createElement('option');placeholder.value='0';placeholder.textContent=t(language,'demo');giftSelect.replaceChildren(placeholder,...list.map(g=>{const o=document.createElement('option');o.value=g.id;o.textContent=g.name;return o;}));giftSelect.value=value||'0';}
giftSelect.onchange=()=>{const g=gifts.find(g=>String(g.id)===giftSelect.value);if(g)$('price').value=g.coinType==='gold'?g.price/1000:0;};
for(const [key,min,max,step]of [['minGiftPrice',0,100000,.001],['gravity',100,2400,10],['bounce',0,.85,.05],['lifetime',5,120,1],['maxObjects',10,200,1]]){
  const label=document.createElement('label');label.className='field';const text=document.createElement('span');text.dataset.t=key;const input=document.createElement('input');Object.assign(input,{id:key,type:'number',min,max,step,required:true});label.append(text,input);$('fields').append(label);
}
function render(){document.documentElement.lang=language;document.title=t(language,'title');document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(language,el.dataset.t));$('language').value=language;if(giftSelect.options[0])giftSelect.options[0].textContent=t(language,'demo');$('status').textContent=t(language,state);$('warning').textContent=warning?t(language,warning):'';$('empty').hidden=history.length>0;$('events').replaceChildren(...history.map(g=>{const li=document.createElement('li');li.textContent=t(language,'gift',{user:g.demo?t(language,'demo'):g.user,name:g.name??t(language,'demo'),count:new Intl.NumberFormat(language).format(g.count),amount:g.coinType==='gold'?new Intl.NumberFormat(language,{style:'currency',currency:'CNY'}).format(g.totalCoin/1000):t(language,'free')});return li;}));}
function populate(){for(const key of ['room','gravity','bounce','lifetime','maxObjects','minGiftPrice'])$(key).value=cfg[key]??0;$('includeFree').checked=cfg.includeFree;}
let toastTimer;function toast(key){$('toast').textContent=t(language,key);$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',3500);}
async function post(action,data={}){const res=await fetch('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!res.ok){const err=await res.json();throw Error(err.error||'failed');}}
function run(fn){return async e=>{e?.preventDefault();try{await fn();}catch(err){toast(['invalid','failed'].includes(err.message)?err.message:'failed');}};}
$('obs').value=location.origin+'/overlay';
$('connection').onsubmit=run(async()=>{await post('config',{room:$('room').value});await post('connect',{room:$('room').value});});
$('disconnect').onclick=run(()=>post('disconnect'));
$('settings').onsubmit=run(async()=>{const d={includeFree:$('includeFree').checked};for(const key of ['gravity','bounce','lifetime','maxObjects','minGiftPrice'])d[key]=Number($(key).value);await post('config',d);toast('saved');});
$('language').onchange=run(async()=>{language=$('language').value;localStorage.setItem('language',language);render();await post('config',{language});});
$('demo').onsubmit=run(()=>post('test',{count:Number($('count').value),price:Number($('price').value),giftId:Number(giftSelect.value)}));
$('clear').onclick=run(()=>post('clear'));
$('copy').onclick=run(async()=>{await navigator.clipboard.writeText($('obs').value);toast('copied');});
const events=new EventSource('/api/events');let initialized=false;
events.onmessage=e=>{const {type,data}=JSON.parse(e.data);
  if(type==='init'){cfg=data.config;catalog(data.gifts);state=data.status;warning=data.warning;if(!initialized){initialized=true;const preferred=data.configured?cfg.language:language;language=preferred;if(preferred!==cfg.language||!data.configured)post('config',{language:preferred}).catch(()=>toast('failed'));}populate();}
  if(type==='catalog')catalog(data);
  if(type==='config'){cfg=data;language=cfg.language;localStorage.setItem('language',language);populate();}
  if(type==='status')state=data;if(type==='warning')warning=data;
  if(type==='gift'){history.unshift(data);history=history.slice(0,20);}render();
};events.onerror=()=>{state='transport';render();};render();
