export function normalizeGuard(msg,now=Date.now()) {
  const cmd=msg.cmd?.split(':')[0],d=msg.data;if(!d||!['GUARD_BUY','USER_TOAST_MSG','USER_TOAST_MSG_V2'].includes(cmd))return null;
  const v2=cmd==='USER_TOAST_MSG_V2',g=v2?d.guard_info:d,p=v2?d.pay_info:d,u=v2?d.sender_uinfo:null;
  if(!g||!p||!([1,2,3].includes(g.guard_level)))return null;
  // Supplementary/gift notifications must not replay a paid celebration.
  if(cmd!=='GUARD_BUY'&&Number((v2?d.option?.source:d.source)??0)!==0)return null;
  const count=Number(p.num);if(!Number.isSafeInteger(count)||count<1)return null;
  const stamp=Number(g.start_time??d.timestamp);if(!Number.isFinite(stamp)||stamp<=0||Math.abs(now-stamp*1000)>120000)return null;
  const uid=String(u?.uid??d.uid??'');if(!uid)return null;
  return {id:String(d.payflow_id??d.msg_id??`${uid}:${g.guard_level}:${stamp}:${count}`),key:`${uid}:${g.guard_level}:${stamp}:${count}`,user:String(u?.base?.name??d.username??''),avatar:u?.base?.face??d.face??null,level:g.guard_level,count,unit:typeof p.unit==='string'?p.unit:null,stamp};
}

export class GuardQueue {
  current=null;pending=[];seen=new Map();
  constructor(duration=8000,limit=100){this.duration=duration;this.limit=limit;}
  advance(now=Date.now()){
    if(this.current&&now>=this.current.end)this.current=null;
    if(!this.current&&this.pending.length)this.current={...this.pending.shift(),start:now,end:now+this.duration};
    return this.current;
  }
  add(item,now=Date.now()){
    this.advance(now);for(const [k,v]of this.seen)if(now-v>300000)this.seen.delete(k);
    const key=item.key??item.id;if(this.seen.has(key)){
      // Rich toast may arrive after GUARD_BUY: enrich without restarting.
      const existing=[this.current,...this.pending].find(x=>x?.key===key);
      if(existing){if(item.avatar)existing.avatar=item.avatar;if(item.unit)existing.unit=item.unit;}
      return 'duplicate';
    }
    if(this.current&&this.pending.length>=this.limit)return 'full';
    this.seen.set(key,now);if(this.seen.size>10000)this.seen.delete(this.seen.keys().next().value);
    this.pending.push({...item});this.advance(now);return 'added';
  }
  snapshot(now=Date.now()){this.advance(now);return {current:this.current,pending:this.pending.length};}
  clear(){this.current=null;this.pending=[];}
}

export const guardCrops={3:[0,170,630,430],2:[630,70,760,550],1:[1390,0,782,724]};
export function guardDefaultRatio(level=3){const crop=guardCrops[level]??guardCrops[3];return crop[2]/crop[3];}
export function guardBox(c,level=3,ratio=guardDefaultRatio(level),canvasAspect=16/9){
  if(!Number.isFinite(ratio)||ratio<=0)ratio=guardDefaultRatio(level);
  // The media keeps its native ratio; a separate footer is 22% of its width.
  const factor=canvasAspect*(1/ratio+.22),requested=Math.max(15,Math.min(100,c.guardWidth??60));
  const width=Math.min(requested,100/factor),height=width*factor;
  // The three tiers share one vertical center axis: guardX is that center once a
  // configuration has been migrated, and the left edge for legacy configurations.
  const center=c.guardAnchor==='center'?(c.guardX??50):(c.guardX??20)+width/2;
  return {x:Math.max(0,Math.min(100-width,center-width/2)),y:Math.max(0,Math.min(100-height,c.guardY??29)),width,height,mediaHeight:100/(1+.22*ratio),ratio};
}
