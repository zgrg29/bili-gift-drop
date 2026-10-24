import {api} from './bilibili.mjs';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
export class Catalog {
  gifts=new Map();updated=0;pending=null;
  downloads=new Map();
  validImage(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname.endsWith('.hdslb.com')&&!u.port&&!u.username&&!u.password;}catch{return false;}}
  async cacheImage(url){
    if(!this.validImage(url))return null;
    const hash=createHash('sha256').update(url).digest('hex'),file=fileURLToPath(new URL('../../cache/'+hash,import.meta.url));
    try{await readFile(file);return '/cache/'+hash;}catch{}
    if(this.downloads.has(hash))return this.downloads.get(hash);
    if(this.downloads.size>=8)return null;
    const task=(async()=>{const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(8000)});if(!r.ok||!/^image\/(png|webp|gif|jpeg)/.test(r.headers.get('content-type')??''))return null;
      const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>4*1024*1024)throw Error('image');chunks.push(chunk);}
      await mkdir(fileURLToPath(new URL('../../cache/',import.meta.url)),{recursive:true});await writeFile(file,Buffer.concat(chunks));return '/cache/'+hash;
    })().finally(()=>this.downloads.delete(hash));this.downloads.set(hash,task);return task;
  }
  async refresh(room){
    if(this.pending)return this.pending;
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
  async lookup(id,room){if(Date.now()-this.updated>86400000||(!this.gifts.has(id)&&Date.now()-this.updated>60000)){this.updated=Date.now();await this.refresh(room).catch(()=>{});}return this.gifts.get(id);}
}
