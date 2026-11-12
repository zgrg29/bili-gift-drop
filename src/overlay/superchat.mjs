import {scrollSC} from '/src/shared/sc-scroll.mjs';
import {t} from '/src/shared/i18n/index.mjs';
export function superchat(events,getConfig){
let items=[],signature='',displayedIds=[],previousDisable=false,previousPosition='bottom';
let motion={offset:0,direction:1,hold:2},previous,lastApplied=0,hover=false,focused=false;
const root=document.createElement('div');root.className='superchat';document.body.append(root);
root.addEventListener('pointerenter',()=>{hover=true;});root.addEventListener('pointerleave',()=>{hover=false;});
root.addEventListener('focusin',()=>{focused=true;});root.addEventListener('focusout',e=>{focused=root.contains(e.relatedTarget);});
// The newest card is the anchor in both orders: first child at the top, last child at the bottom.
function anchorNewest(c){
  const cards=root.children;
  if(!cards.length){root.scrollTop=0;lastApplied=0;motion={...motion,offset:0};return;}
  const max=Math.max(0,root.scrollHeight-root.clientHeight);
  let top=0;
  if(c.scNewestPosition==='bottom'){
    const card=cards[cards.length-1],height=card.offsetHeight||0,viewport=root.clientHeight||0;
    // A single card taller than the region stays readable from its heading instead of
    // being aligned by its clipped bottom edge.
    top=viewport>0&&height>viewport?Math.max(0,Math.min(max,card.offsetTop||0)):max;
  }
  root.scrollTop=top;lastApplied=root.scrollTop;motion={...motion,offset:root.scrollTop};
}
function animate(now){const c=getConfig(),dt=previous===undefined?0:Math.min(.1,(now-previous)/1000);previous=now;
  if(c.scEnabled&&!c.scDisableScroll&&!hover&&!focused){if(root.scrollTop!==lastApplied)motion={...motion,offset:root.scrollTop};motion=scrollSC(motion,dt,Math.max(0,root.scrollHeight-root.clientHeight),(c.scScrollSpeed??20)*document.documentElement.clientWidth/1920);root.scrollTop=motion.offset;lastApplied=root.scrollTop;}
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
function render(){const c=getConfig(),l=c.language,now=Date.now();if(!c.scPersistent)items=items.filter(x=>x.end>now);
  root.style.opacity=(c.scOpacity??100)/100;root.hidden=!c.scEnabled;Object.assign(root.style,{left:c.scX+'%',top:c.scY+'%',width:c.scWidth+'%',maxHeight:Math.min(c.scHeight??100,100-c.scY)+'%',overflow:c.scDisableScroll?'hidden':'auto'});
  const visible=items.filter(x=>x.start<=now);
  // Older cards stay in SCStore; this array only controls the on-screen order.
  const ordered=c.scNewestPosition==='top'?[...visible].reverse():visible;
  const nextSignature=JSON.stringify([l,c.scCollapse,c.scEnabled,c.scDisableScroll,c.scNewestPosition,c.scX,c.scY,c.scWidth,c.scHeight,ordered.map(x=>[x,x.expanded!==undefined&&(!c.scCollapse||now-(x.interactedAt??x.start)<c.scCollapse*1000)?x.expanded:(!c.scCollapse||now-x.start<c.scCollapse*1000)])]);
  if(nextSignature===signature)return;signature=nextSignature;
  const buttons=[...root.querySelectorAll('button')],focusedId=buttons.indexOf(document.activeElement)>=0?displayedIds[buttons.indexOf(document.activeElement)]:null;
  const cards=ordered.map(x=>{const card=document.createElement('div');card.className='sc-card';card.dataset.id=x.id;card.style.background=x.background;card.style.color=x.text;
    const expanded=x.expanded!==undefined&&(!c.scCollapse||now-(x.interactedAt??x.start)<c.scCollapse*1000)?x.expanded:(!c.scCollapse||now-x.start<c.scCollapse*1000);
    const button=document.createElement('button');button.style.background=x.color;const label=document.createElement('span');label.className='sc-label';label.textContent=t(l,'scToggle',{user:x.demo?t(l,'scDemoUser'):x.user,amount:new Intl.NumberFormat(l,{style:'currency',currency:'CNY'}).format(x.price),action:t(l,expanded?'scFold':'scExpand')});const face=document.createElement('img'),fallback=document.createElement('span');face.className='sc-avatar';fallback.className='sc-avatar sc-avatar-fallback';fallback.textContent=Array.from(x.demo?t(l,'scDemoUser'):x.user)[0]??'✦';fallback.setAttribute('aria-hidden','true');face.alt=t(l,'scAvatar');
    const url=x.avatar?.startsWith('/cache/')?x.avatar:x.demo?'/src/overlay/assets/demo-avatar.svg':null;
    face.hidden=!url;fallback.hidden=!!url;face.onerror=()=>{face.hidden=true;fallback.hidden=false;};if(url)face.src=url;button.append(face,fallback,label);
    button.setAttribute('aria-expanded',String(expanded));button.onclick=async()=>{try{const r=await fetch('/api/sc-toggle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:x.id,expanded:!expanded})});if(!r.ok)throw Error();}catch{button.textContent=t(l,'failed');}};card.append(button);
    if(expanded){const p=document.createElement('p');p.textContent=x.demo?t(l,'scDemoMessage'):x.message;card.append(p);}return card;});
  const previousOffset=root.scrollTop,positionChanged=c.scNewestPosition!==previousPosition;
  root.replaceChildren(...cards);displayedIds=ordered.map(x=>x.id);
  if(focusedId){const index=displayedIds.indexOf(focusedId);if(index>=0)root.querySelectorAll('button')[index]?.focus({preventScroll:true});}
  if(c.scDisableScroll)anchorNewest(c);
  else{
    // Turning scrolling back on or switching the edge starts from that edge; ordinary
    // updates keep the current offset so the round-trip animation does not jump.
    const max=Math.max(0,root.scrollHeight-root.clientHeight),edge=previousDisable||positionChanged;
    root.scrollTop=edge?(c.scNewestPosition==='top'?0:max):previousOffset;
    lastApplied=root.scrollTop;motion={...motion,offset:root.scrollTop};
  }
  previousDisable=c.scDisableScroll;previousPosition=c.scNewestPosition;
}
if(typeof ResizeObserver==='function')new ResizeObserver(()=>{const c=getConfig();if(c.scDisableScroll)anchorNewest(c);}).observe(root);
if(document.fonts?.ready)document.fonts.ready.then(()=>{const c=getConfig();if(c.scDisableScroll)anchorNewest(c);}).catch(()=>{});
events.addEventListener('message',e=>{const {type,data}=JSON.parse(e.data);if(type==='init')items=data.sc??[];if(type==='sc'&&!items.some(x=>x.id===data.id)){items.push(data);items=items.slice(-100);}if(type==='sc-list')items=data;if(type==='clear')items=[];render();});setInterval(render,1000);
}
