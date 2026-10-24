import {scrollSC} from '/src/shared/sc-scroll.mjs';
import {t} from '/src/shared/i18n/index.mjs';
export function superchat(events,getConfig){
let items=[],signature='';let motion={offset:0,direction:1,hold:2},previous,lastApplied=0,hover=false,focused=false;const root=document.createElement('div');root.className='superchat';document.body.append(root);
root.addEventListener('pointerenter',()=>{hover=true;});root.addEventListener('pointerleave',()=>{hover=false;});
root.addEventListener('focusin',()=>{focused=true;});root.addEventListener('focusout',e=>{focused=root.contains(e.relatedTarget);});
function animate(now){const c=getConfig(),dt=previous===undefined?0:Math.min(.1,(now-previous)/1000);previous=now;
  if(c.scEnabled&&!hover&&!focused){if(root.scrollTop!==lastApplied)motion={...motion,offset:root.scrollTop};motion=scrollSC(motion,dt,Math.max(0,root.scrollHeight-root.clientHeight),(c.scScrollSpeed??20)*document.documentElement.clientWidth/1920);root.scrollTop=motion.offset;lastApplied=root.scrollTop;}
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
function render(){const c=getConfig(),l=c.language,now=Date.now();items=items.filter(x=>x.end>now);root.hidden=!c.scEnabled;Object.assign(root.style,{left:c.scX+'%',top:c.scY+'%',width:c.scWidth+'%',maxHeight:Math.min(c.scHeight??100,100-c.scY)+'%'});
const visible=items.filter(x=>x.start<=now);
const nextSignature=JSON.stringify([l,c.scCollapse,visible.map(x=>[x,x.expanded!==undefined&&(!c.scCollapse||now-(x.interactedAt??x.start)<c.scCollapse*1000)?x.expanded:(!c.scCollapse||now-x.start<c.scCollapse*1000)])]);
if(nextSignature===signature)return;signature=nextSignature;
const nodes=visible.map(x=>{const card=document.createElement('div');card.className='sc-card';card.style.background=x.background;card.style.color=x.text;
const expanded=x.expanded!==undefined&&(!c.scCollapse||now-(x.interactedAt??x.start)<c.scCollapse*1000)?x.expanded:(!c.scCollapse||now-x.start<c.scCollapse*1000);
const button=document.createElement('button');button.style.background=x.color;button.textContent=t(l,'scToggle',{user:x.demo?t(l,'scDemoUser'):x.user,amount:new Intl.NumberFormat(l,{style:'currency',currency:'CNY'}).format(x.price),action:t(l,expanded?'scFold':'scExpand')});button.setAttribute('aria-expanded',String(expanded));button.onclick=async()=>{try{const r=await fetch('/api/sc-toggle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:x.id,expanded:!expanded})});if(!r.ok)throw Error();}catch{button.textContent=t(l,'failed');}};card.append(button);
if(expanded){const p=document.createElement('p');p.textContent=x.demo?t(l,'scDemoMessage'):x.message;card.append(p);}return card;});const offset=root.scrollTop;const i=[...root.querySelectorAll('button')].indexOf(document.activeElement);root.replaceChildren(...nodes);root.scrollTop=offset;if(i>=0)root.querySelectorAll('button')[i]?.focus({preventScroll:true});}
events.addEventListener('message',e=>{const {type,data}=JSON.parse(e.data);if(type==='init')items=data.sc??[];if(type==='sc'&&!items.some(x=>x.id===data.id)){items.push(data);items=items.slice(-100);}if(type==='sc-list')items=data;if(type==='clear')items=[];render();});setInterval(render,1000);
}
