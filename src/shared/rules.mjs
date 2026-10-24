export const defaults = {language:'zh-CN',room:'',gravity:900,bounce:0.35,lifetime:30,maxObjects:120,includeFree:true,minGiftPrice:0};
export function config(input, previous=defaults) {
  const out={...previous};
  if (['zh-CN','ja','en'].includes(input.language)) out.language=input.language;
  if (typeof input.room==='string' && /^\d{0,12}$/.test(input.room)) out.room=input.room;
  for (const [k,min,max] of [['gravity',100,2400],['bounce',0,0.85],['lifetime',5,120],['maxObjects',10,200]]) {
    if (Number.isFinite(input[k])) out[k]=Math.min(max,Math.max(min,input[k]));
  }
  if (typeof input.includeFree==='boolean') out.includeFree=input.includeFree;
  if (Number.isFinite(input.minGiftPrice)) out.minGiftPrice=Math.round(Math.min(100000,Math.max(0,input.minGiftPrice))*1000)/1000;
  return out;
}
export function normalizeGift(message) {
  if (message.cmd?.split(':')[0]!=='SEND_GIFT') return null;
  const d=message.data;
  if (!d || !Number.isSafeInteger(d.num) || d.num<1 || !Number.isSafeInteger(d.giftId)) return null;
  const price=Number(d.price),total=Number(d.total_coin ?? price*d.num);
  if (![price,total].every(x=>Number.isSafeInteger(x)&&x>=0)) return null;
  return {id:d.tid ? String(d.tid) : `${d.uid}:${d.giftId}:${d.timestamp}:${d.rnd}:${d.num}:${total}`,
    giftId:d.giftId,name:String(d.giftName??d.giftId),user:String(d.uname??''),count:d.num,
    coinType:d.coin_type==='gold'?'gold':'silver',unitCoin:price,totalCoin:total,
    image:d.gift_info?.img_basic??null,
    blindBox:d.blind_gift ? {paidCoin:d.blind_gift.original_gift_price,valueCoin:total}:null};
}
export function effect(gift,cfg) {
  if (gift.coinType!=='gold'&&!cfg.includeFree) return {count:0,size:40};
  const minimumCoin=Math.round((cfg.minGiftPrice??0)*1000);
  if ((gift.coinType==='gold'?gift.unitCoin:0)<minimumCoin) return {count:0,size:40};
  return {count:Math.min(40,gift.count),size:Math.min(130,40+Math.log2(1+(gift.coinType==='gold'?gift.unitCoin:0)/1000)*12)};
}
export class Deduplicator {
  seen=new Map();
  accept(id,now=Date.now()) {
    for (const [key,time] of this.seen) if (now-time>300000) this.seen.delete(key);
    if(this.seen.has(id)) return false;
    this.seen.set(id,now);
    if(this.seen.size>10000) this.seen.delete(this.seen.keys().next().value);
    return true;
  }
}
