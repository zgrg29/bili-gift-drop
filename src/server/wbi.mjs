import {createHash} from 'node:crypto';
// Public Bilibili WBI permutation; this is protocol data, not application code.
const order=[46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52];
export function sign(params,img,sub,time=Math.floor(Date.now()/1000)){
  const key=order.map(i=>(img+sub)[i]).join('').slice(0,32);
  const values={...params,wts:time};const query=Object.keys(values).sort().map(k=>`${encodeURIComponent(k)}=${encodeURIComponent(String(values[k]).replace(/[!'()*]/g,''))}`).join('&');
  return query+'&w_rid='+createHash('md5').update(query+key).digest('hex');
}
let device='',keys=null;
export async function credentials(){
  const get=async url=>{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://www.bilibili.com/'},signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('platform');return r.json();};
  if(!device){const d=await get('https://api.bilibili.com/x/frontend/finger/spi');device=d.data?.b_3??'';}
  if(!keys||Date.now()-keys.time>1800000){const d=await get('https://api.bilibili.com/x/web-interface/nav');const images=d.data?.wbi_img;const extract=url=>new URL(url).pathname.split('/').pop().split('.')[0];keys={img:extract(images.img_url),sub:extract(images.sub_url),time:Date.now()};}
  return {device,...keys};
}
