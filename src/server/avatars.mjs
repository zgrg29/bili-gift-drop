// Public profile lookup only; never requires the viewer's login credentials.
export class Avatars {
  pending=new Map();results=new Map();
  constructor(catalog){this.catalog=catalog;}
  async resolve(uid,face){
    const normalize=value=>typeof value==='string'?value.replace(/^http:/,'https:').replace(/^\/\//,'https://'):null;
    const direct=await this.catalog.cacheImage(normalize(face)).catch(()=>null);
    if(direct)return direct;
    uid=String(uid??'');if(!/^[1-9]\d{0,19}$/.test(uid))return null;
    const known=this.results.get(uid);if(known&&known.until>Date.now())return known.avatar;
    if(this.pending.has(uid))return this.pending.get(uid);
    if(this.pending.size>=8)return null;
    const task=(async()=>{
      for(const url of [`https://api.live.bilibili.com/live_user/v1/Master/info?uid=${uid}`,`https://api.bilibili.com/x/web-interface/card?mid=${uid}`]){
        try{
          const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0',Referer:'https://live.bilibili.com/'},redirect:'error',signal:AbortSignal.timeout(4000)});
          if(!r.ok)continue;
          const json=await r.json();if(json.code!==0)continue;
          const avatar=await this.catalog.cacheImage(normalize(json.data?.info?.face??json.data?.card?.face));
          if(avatar)return avatar;
        }catch{}
      }
      return null;
    })().then(avatar=>{
      this.results.delete(uid);this.results.set(uid,{avatar,until:Date.now()+(avatar?3600000:30000)});
      if(this.results.size>512)this.results.delete(this.results.keys().next().value);
      return avatar;
    }).finally(()=>this.pending.delete(uid));
    this.pending.set(uid,task);return task;
  }
}
