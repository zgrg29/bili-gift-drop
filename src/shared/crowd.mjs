import {effect} from './rules.mjs';

// Sum of rotated icon bounding squares: a conservative area budget, not pixel occlusion.
export const footprint=o=>8*o.r*o.r;
export function region(cfg){return {x:1920*cfg.regionX/100,y:1080*cfg.regionY/100,w:1920*cfg.regionWidth/100,h:1080*cfg.regionHeight/100};}
export class Crowd {
  queue=[];credit=0;last=0;
  clear(){this.queue=[];this.credit=0;}
  enqueue(g,cfg,now){
    const e=effect(g,cfg);if(!e.count)return;
    // Merge only visual copies; original gift events and quantities remain untouched.
    const key=JSON.stringify([g.giftId,g.image,e.size,g.demo]);
    let item=this.queue.find(i=>i.key===key);
    if(item){item.count=Math.min(40,item.count+e.count);item.until=now+1500;}
    else {if(this.queue.length>=32)this.queue.shift();this.queue.push({key,g,size:e.size,count:e.count,until:now+1500});}
  }
  update(objects,cfg,now,spawn){
    const box=region(cfg),budget=box.w*box.h*cfg.maxCoverage/100;
    let area=objects.reduce((sum,o)=>sum+footprint(o),0);
    // Hard constraints also apply immediately after settings changes.
    while(objects.length&&(objects.length>cfg.maxObjects||area>budget)){area-=footprint(objects.shift());}
    if(area>budget*.8||objects.length>=cfg.maxObjects*.8){
      for(const o of objects.slice(0,Math.max(1,Math.ceil(objects.length*.25))))o.expires=Math.min(o.expires,now+750);
    }
    this.queue=this.queue.filter(i=>i.until>now&&effect(i.g,cfg).count>0);
    this.credit=Math.min(2,this.credit+Math.max(0,Math.min(100,now-this.last))*cfg.spawnRate/1000);this.last=now;
    while(this.credit>=1&&this.queue.length){
      const item=this.queue[0],r=Math.min(item.size/2,box.w/3,box.h/3,Math.sqrt(budget/8)),cost=8*r*r;
      if(objects.length>=cfg.maxObjects||area+cost>budget){
        if(objects[0])objects[0].expires=Math.min(objects[0].expires,now+500);
        break;
      }
      spawn(item.g,r,box,now);area+=cost;this.credit--;if(--item.count<=0)this.queue.shift();
    }
    return {count:objects.length,coverage:area/(box.w*box.h)*100,pending:this.queue.reduce((n,i)=>n+i.count,0)};
  }
}

// Rebuilt each solver pass. A pair is returned once, only from neighboring cells.
export function collisionPairs(objects){
  const cell=Math.max(1,...objects.map(o=>2*o.r)),grid=new Map(),pairs=[];
  for(let i=0;i<objects.length;i++){
    const o=objects[i],x=Math.floor(o.x/cell),y=Math.floor(o.y/cell);
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const j of grid.get(`${x+dx}:${y+dy}`)??[])pairs.push([j,i]);
    const key=`${x}:${y}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(i);
  }
  return pairs;
}
