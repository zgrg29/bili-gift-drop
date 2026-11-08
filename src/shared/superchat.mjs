// Official fallback table: https://live.bilibili.com/blackboard/live-superchat-intro-web.html
export function scDuration(price){return price>=2000?7200:price>=1000?3600:price>=500?1800:price>=100?300:price>=50?120:price>=30?60:null;}
// Platform timestamps are Unix seconds. Event expiry/time always takes priority.
export function normalizeSC(msg,now=Date.now()) {
  if(!['SUPER_CHAT_MESSAGE','SUPER_CHAT_MESSAGE_JPN'].includes(msg.cmd?.split(':')[0]))return null;
  const d=msg.data;if(!d||d.id==null)return null;
  const start=Number(d.start_time)*1000;
  const duration=Number(d.time)>0?Number(d.time):scDuration(Number(d.price));
  const end=Number(d.end_time)*1000 || (Number.isFinite(start)&&start>0&&duration?start+duration*1000:0);
  if(!Number.isFinite(end)||end<=now||!Number.isFinite(start)||start<=0||end<=start)return null;
  const price=Number(d.price);if(!Number.isFinite(price)||price<0)return null;
  const color=(v,f)=>/^#[0-9a-f]{6}$/i.test(v)?v:f;
  // Keep the platform-derived window so leaving persistent mode restarts one full duration.
  return {id:String(d.id),uid:String(d.uid??d.user_info?.uid??''),avatar:d.user_info?.face??null,user:String(d.user_info?.uname??''),message:String(d.message??''),price,start,end,duration:(end-start)/1000,
    color:color(d.background_bottom_color,'#2a60b2'),background:color(d.background_color,'#edf5ff'),text:color(d.message_font_color,'#172033')};
}
export class SCStore {
  items=new Map();seen=new Map();persistent=false;
  constructor(persistent=false){this.persistent=!!persistent;}
  // Permanent mode only changes expiry; the 100-item cap and explicit clears still apply.
  setPersistent(enabled,now=Date.now()){
    const persistent=!!enabled;
    if(persistent===this.persistent)return false;
    this.persistent=persistent;
    if(persistent)return true;
    for(const x of this.items.values()){
      const duration=Number(x.duration)>0?Number(x.duration):Math.max(0,(Number(x.end)-Number(x.start))/1000);
      if(!Number.isFinite(duration)||duration<=0)continue;
      x.end=now+duration*1000;
      this.seen.set(x.id,x.end);
    }
    return true;
  }
  prune(now=Date.now()){
    if(this.persistent)return;
    for(const [id,x]of this.items)if(x.end<=now)this.items.delete(id);
    for(const [id,end]of this.seen)if(end<=now)this.seen.delete(id);
  }
  add(x,now=Date.now()){
    this.prune(now);
    if(!x||this.seen.has(x.id)||(!this.persistent&&x.end<=now))return false;
    this.items.set(x.id,x);this.seen.set(x.id,x.end);
    if(this.items.size>100)this.items.delete(this.items.keys().next().value);
    if(this.seen.size>10000)this.seen.delete(this.seen.keys().next().value);
    return true;
  }
  remove(ids){
    // While permanent mode is on, platform delete/expiry events must not remove cards.
    if(this.persistent)return;
    for(const id of Array.isArray(ids)?ids:[]){this.items.delete(String(id));this.seen.set(String(id),Date.now()+7200000);if(this.seen.size>10000)this.seen.delete(this.seen.keys().next().value);}
  }
  clear(){this.items.clear();}
  list(now=Date.now()){this.prune(now);return [...this.items.values()];}
}
