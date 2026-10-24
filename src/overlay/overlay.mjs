import {guardOverlay} from '/src/overlay/guard.mjs';
import {superchat} from '/src/overlay/superchat.mjs';
import {Crowd,region,collisionPairs} from '/src/shared/crowd.mjs';
import {defaults} from '/src/shared/rules.mjs';
import {t} from '/src/shared/i18n/index.mjs';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
let cfg={...defaults},objects=[],width=1920,height=1080;
function resize(){canvas.width=1920;canvas.height=1080;width=1920;height=1080;}
new ResizeObserver(resize).observe(canvas);
const images=new Map();
function image(url){if(!url)return null;if(!images.has(url)){if(images.size>=256)images.delete(images.keys().next().value);const im=new Image();im.src=url;images.set(url,im);}return images.get(url);}
const crowd=new Crowd();
function spawn(g,r,box,now){objects.push({x:box.x+r+Math.random()*Math.max(0,box.w-2*r),y:box.y+r,vx:(Math.random()-.5)*180,vy:0,r,angle:Math.random()*6,spin:(Math.random()-.5)*3,born:now,expires:now+cfg.lifetime*1000,im:image(g.image),name:g.name,demo:g.demo});}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='opacity-preview'&&['giftOpacity','scOpacity','guardOpacity'].includes(e.data.key)&&Number.isFinite(e.data.value))cfg={...cfg,[e.data.key]:Math.max(0,Math.min(100,e.data.value))};});
const events=new EventSource('/api/events');events.onmessage=e=>{const {type,data}=JSON.parse(e.data);if(type==='init')cfg={...defaults,...data.config};if(type==='config')cfg={...defaults,...data};if(type==='clear'){objects=[];crowd.clear();}if(type==='gift')crowd.enqueue(data,cfg,performance.now());document.documentElement.lang=cfg.language;document.title=t(cfg.language,'title');};
function step(dt){canvas.style.opacity=(cfg.giftOpacity??100)/100;
  const box=region(cfg);
  for(const o of objects){o.vy+=cfg.gravity*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.angle+=o.spin*dt;
    if(o.x<box.x+o.r){o.x=box.x+o.r;o.vx=Math.abs(o.vx)*cfg.bounce;}if(o.x>box.x+box.w-o.r){o.x=box.x+box.w-o.r;o.vx=-Math.abs(o.vx)*cfg.bounce;}
    if(o.y>box.y+box.h-o.r){o.y=box.y+box.h-o.r;o.vy=-Math.abs(o.vy)*cfg.bounce;o.vx*=.97;o.spin*=.95;}
  }
  for(let pass=0;pass<3;pass++)for(const [i,j] of collisionPairs(objects)){
    const a=objects[i],b=objects[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),sum=a.r+b.r;
    if(d>=sum)continue;const nx=d?dx/d:1,ny=d?dy/d:0,overlap=(sum-d)/2;
    a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
    const v=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(v<0){const impulse=-(1+cfg.bounce)*v/2;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
  }
}
let previous=performance.now(),accumulator=0;
let stats={},lastStats=0;
function frame(now){
  objects=objects.filter(o=>now<Math.min(o.expires,o.born+cfg.lifetime*1000));
  stats=crowd.update(objects,cfg,now,spawn);
  if(now-lastStats>500){parent.postMessage({type:'gift-stats',...stats},location.origin);lastStats=now;}
  accumulator+=Math.min(.05,(now-previous)/1000);previous=now;while(accumulator>=1/120){step(1/120);accumulator-=1/120;}

  ctx.clearRect(0,0,width,height);
  const box=region(cfg);ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();
  for(const o of objects){ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,(Math.min(o.expires,o.born+cfg.lifetime*1000)-now)/750));ctx.translate(o.x,o.y);ctx.rotate(o.angle);
    if(o.im?.complete&&o.im.naturalWidth)ctx.drawImage(o.im,-o.r,-o.r,o.r*2,o.r*2);
    else{ctx.fillStyle=o.demo?'#b6a2ff':'#9ce7da';ctx.beginPath();ctx.roundRect(-o.r,-o.r,o.r*2,o.r*2,12);ctx.fill();ctx.fillStyle='#22213b';ctx.font=`${Math.max(10,o.r*.42)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.demo?'✦':o.name??'?',0,0,o.r*1.7);}
    ctx.restore();
  }ctx.restore();requestAnimationFrame(frame);
}requestAnimationFrame(frame);

superchat(events,()=>cfg);

guardOverlay(events,()=>cfg);
