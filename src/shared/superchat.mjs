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
  return {id:String(d.id),user:String(d.user_info?.uname??''),message:String(d.message??''),price,start,end,
    color:color(d.background_bottom_color,'#2a60b2'),background:color(d.background_color,'#edf5ff'),text:color(d.message_font_color,'#172033')};
}
export class SCStore {
  items=new Map();seen=new Map();
  prune(now=Date.now()){for(const [id,x]of this.items)if(x.end<=now)this.items.delete(id);for(const [id,end]of this.seen)if(end<=now)this.seen.delete(id);}
  add(x,now=Date.now()){this.prune(now);if(!x||x.end<=now||this.seen.has(x.id))return false;this.items.set(x.id,x);this.seen.set(x.id,x.end);if(this.items.size>100)this.items.delete(this.items.keys().next().value);if(this.seen.size>10000)this.seen.delete(this.seen.keys().next().value);return true;}
  remove(ids){for(const id of Array.isArray(ids)?ids:[]){this.items.delete(String(id));this.seen.set(String(id),Date.now()+7200000);if(this.seen.size>10000)this.seen.delete(this.seen.keys().next().value);}}
  list(){this.prune();return [...this.items.values()];}
}
