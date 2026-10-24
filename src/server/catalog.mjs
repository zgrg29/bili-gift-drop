import {api} from './bilibili.mjs';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {runtimeRoot} from './paths.mjs';
export class Catalog {
  gifts=new Map();updated=0;pending=null;
  downloads=new Map();
  cached=new Map();failures=new Map();attempted=0;
  validImage(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname.endsWith('.hdslb.com')&&!u.port&&!u.username&&!u.password;}catch{return false;}}
  async cacheImage(url){
    if(!this.validImage(url))return null;
    const hash=createHash('sha256').update(url).digest('hex'),file=path.join(runtimeRoot,'cache',hash);
    if(this.cached.has(hash))return this.cached.get(hash);
    if(Date.now()-(this.failures.get(hash)??0)<30000)return null;
    try{await readFile(file);this.remember(hash);return '/cache/'+hash;}catch{}
    if(this.downloads.has(hash))return this.downloads.get(hash);
    if(this.downloads.size>=8)return null;
    const task=(async()=>{const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(8000)});if(!r.ok||!/^image\/(png|webp|gif|jpeg)/.test(r.headers.get('content-type')??''))return null;
      const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>4*1024*1024)throw Error('image');chunks.push(chunk);}
      await mkdir(path.join(runtimeRoot,'cache'),{recursive:true});await writeFile(file,Buffer.concat(chunks));return '/cache/'+hash;
    })().then(value=>{if(value)this.remember(hash);else this.failed(hash);return value;},error=>{this.failed(hash);throw error;}).finally(()=>this.downloads.delete(hash));this.downloads.set(hash,task);return task;
  }
  remember(hash){this.cached.set(hash,'/cache/'+hash);if(this.cached.size>512)this.cached.delete(this.cached.keys().next().value);}
  failed(hash){this.failures.set(hash,Date.now());if(this.failures.size>512)this.failures.delete(this.failures.keys().next().value);}
  async refresh(room){
    if(this.pending)return this.pending;
    this.attempted=Date.now();
    this.pending=(async()=>{
      const d=await api(`/xlive/web-room/v1/giftPanel/giftConfig?platform=pc&room_id=${room||0}`);
      for(const g of d.list??[]) {
        const image=g.img_basic||g.webp||g.gif;
        if(this.validImage(image))this.gifts.set(Number(g.id),{name:g.name,image,price:g.price,coinType:g.coin_type});
      }
      this.updated=Date.now();
    })().finally(()=>this.pending=null);
    return this.pending;
  }
  async lookup(id,room){if(this.pending)await this.pending.catch(()=>{});else if(Date.now()-this.attempted>60000&&(Date.now()-this.updated>86400000||!this.gifts.has(id)))await this.refresh(room).catch(()=>{});return this.gifts.get(id);}
}
