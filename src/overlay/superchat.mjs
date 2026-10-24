import {t} from '/src/shared/i18n/index.mjs';
export function superchat(events,getConfig){
let items=[];const root=document.createElement('div');root.className='superchat';document.body.append(root);
function render(){const c=getConfig(),l=c.language,now=Date.now();items=items.filter(x=>x.end>now);root.hidden=!c.scEnabled;Object.assign(root.style,{left:c.scX+'%',top:c.scY+'%',width:c.scWidth+'%'});
const nodes=items.filter(x=>x.start<=now).slice(0,3).map(x=>{const card=document.createElement('div');card.className='sc-card';card.style.background=x.background;card.style.color=x.text;
const expanded=x.expanded!==undefined&&(!c.scCollapse||now-(x.interactedAt??x.start)<c.scCollapse*1000)?x.expanded:(!c.scCollapse||now-x.start<c.scCollapse*1000);
const button=document.createElement('button');button.style.background=x.color;button.textContent=t(l,'scToggle',{user:x.demo?t(l,'scDemoUser'):x.user,amount:new Intl.NumberFormat(l,{style:'currency',currency:'CNY'}).format(x.price),action:t(l,expanded?'scFold':'scExpand')});button.setAttribute('aria-expanded',String(expanded));button.onclick=async()=>{try{const r=await fetch('/api/sc-toggle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:x.id,expanded:!expanded})});if(!r.ok)throw Error();}catch{button.textContent=t(l,'failed');}};card.append(button);
if(expanded){const p=document.createElement('p');p.textContent=x.demo?t(l,'scDemoMessage'):x.message;card.append(p);}return card;});const i=[...root.querySelectorAll('button')].indexOf(document.activeElement);root.replaceChildren(...nodes);if(i>=0)root.querySelectorAll('button')[i]?.focus({preventScroll:true});}
events.addEventListener('message',e=>{const {type,data}=JSON.parse(e.data);if(type==='init')items=data.sc??[];if(type==='sc'&&!items.some(x=>x.id===data.id)){items.push(data);items=items.slice(-100);}if(type==='sc-list')items=data;if(type==='clear')items=[];render();});setInterval(render,1000);
}
