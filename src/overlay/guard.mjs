import {t} from '/src/shared/i18n/index.mjs';
import {GuardMedia} from '/src/shared/guard-media.mjs';
import {guardBox,guardCrops} from '/src/shared/guard.mjs';
export function guardOverlay(events,getConfig){
  const media=new GuardMedia(()=>render());let state={current:null,pending:0},id=null;const sprite=document.createElement('canvas'),sheet=new Image();sprite.className='guard-sprite';sheet.src='/src/overlay/assets/guard-ships-v1.png';sheet.onload=()=>render();
  const root=document.createElement('div');root.className='guard-effect';
  let customUrl=null,customNode=null;
  const avatar=document.createElement('img'),fallback=document.createElement('span'),user=document.createElement('div'),term=document.createElement('div'),ship=document.createElement('div'),info=document.createElement('div');
  avatar.hidden=true;avatar.className='guard-avatar';fallback.className='guard-avatar guard-fallback';info.className='guard-info';ship.className='guard-ship';info.append(avatar,fallback,user,term);ship.append(sprite);root.append(ship,info);document.body.append(root);
  function render(){const c=getConfig();root.style.filter='opacity('+(c.guardOpacity??100)+'%)';const x=state.current,l=c.language,b=guardBox(c,x?.level??3,media.ratio(c,x?.level??3),(document.documentElement?.clientWidth/document.documentElement?.clientHeight)||16/9);root.hidden=!c.guardEnabled||!x||Date.now()>=x.end;if(root.hidden){if(customNode?.tagName==='VIDEO')customNode.pause();return;}
    Object.assign(root.style,{left:b.x+'%',top:b.y+'%',width:b.width+'%',height:b.height+'%',fontSize:'clamp(8px,'+(b.width*.042)+'vw,42px)'});
    if(id!==x.id){id=x.id;customUrl=undefined;root.getAnimations().forEach(a=>a.cancel());root.animate([{opacity:0,transform:'translateX(-12%)',offset:0},{opacity:1,transform:'translateX(0)',offset:.12},{opacity:1,transform:'translateX(0)',offset:.85},{opacity:0,transform:'translateX(12%)',offset:1}],{duration:x.end-x.start,delay:x.start-Date.now(),fill:'both'});}
    ship.style.height=b.mediaHeight+'%';info.style.height=(100-b.mediaHeight)+'%';root.dataset.level=x.level;user.textContent=x.demo?t(l,'guardDemoUser'):x.user;fallback.textContent=Array.from(user.textContent)[0]??'✦';avatar.alt=t(l,'guardAvatar');
    const url=x.avatar?.startsWith('/cache/')?x.avatar:x.demo?'/src/overlay/assets/demo-avatar.svg':null;
    if(avatar.getAttribute('src')!==url){avatar.hidden=!url;fallback.hidden=!!url;if(url)avatar.src=url;else avatar.removeAttribute('src');}
    avatar.onerror=()=>{avatar.hidden=true;fallback.hidden=false;};
    term.textContent=t(l,x.unit==='月'?(x.count===1?'guardMonth':'guardMonths'):x.unit?'guardSpecial':'guardUnknown',{count:new Intl.NumberFormat(l).format(x.count),level:t(l,'guard'+x.level),unit:x.unit??''});
    const asset=c['guardAsset'+x.level]??null;if(customUrl!==asset){customUrl=asset;customNode?.remove();customNode=null;if(asset){customNode=document.createElement(/\.(mp4|webm)$/.test(asset)?'video':'img');customNode.src=asset;customNode.className='guard-custom';if(customNode.tagName==='VIDEO'){customNode.muted=true;customNode.loop=true;customNode.autoplay=true;customNode.playsInline=true;}customNode.onerror=()=>{customNode.hidden=true;sprite.hidden=false;};ship.append(customNode);}}sprite.hidden=!!(asset&&customNode&&!customNode.hidden);
    const crop=guardCrops[x.level];if(sheet.complete&&sheet.naturalWidth){sprite.width=crop[2];sprite.height=crop[3];sprite.getContext('2d').drawImage(sheet,...crop,0,0,crop[2],crop[3]);}
  }
  events.addEventListener('message',e=>{const {type,data}=JSON.parse(e.data);if(type==='init')state=data.guard??{current:null,pending:0};if(type==='guard-state')state=data;if(type==='clear')state={current:null,pending:0};render();});setInterval(render,200);
}
