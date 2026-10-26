export const defaults = {language:'zh-CN',guardEnabled:true,guardX:20,guardY:29,guardWidth:60,guardDuration:8,guardAnchor:'left',giftOpacity:100,scOpacity:100,guardOpacity:100,scEnabled:true,scX:5,scY:5,scWidth:30,scCollapse:15,scHeight:100,scScrollSpeed:20,room:'',gravity:900,bounce:0.35,lifetime:30,maxObjects:120,includeFree:true,minGiftPrice:0,minGiftScale:50,maxGiftScale:150,maxGiftScaleAmount:100,maxCoverage:15,spawnRate:12,regionX:0,regionY:0,regionWidth:100,regionHeight:100};
export function config(input, previous=defaults) {
  const out={...previous};
  if (['zh-CN','ja','en'].includes(input.language)) out.language=input.language;
  if (typeof input.room==='string' && /^\d{0,12}$/.test(input.room)) out.room=input.room;
  // Gift caps stay user-controlled: min/max size, object count, area and spawn rate have no upper bound.
  for (const [k,min,max] of [['giftOpacity',0,100],['scOpacity',0,100],['guardOpacity',0,100],['guardX',0,100],['guardY',0,89.5],['guardWidth',15,100],['guardDuration',1,null],['scHeight',10,100],['scScrollSpeed',0,120],['scX',0,80],['scY',0,90],['scWidth',20,80],['scCollapse',0,300],['minGiftScale',10,null],['maxGiftScale',10,null],['maxGiftScaleAmount',.001,100000],['gravity',100,2400],['bounce',0,0.85],['lifetime',5,120],['maxObjects',10,null],['maxCoverage',1,null],['spawnRate',1,null],['regionX',0,90],['regionY',0,90],['regionWidth',10,100],['regionHeight',10,100]]) {
    if (Number.isFinite(input[k])) out[k]=max===null?Math.max(min,input[k]):Math.min(max,Math.max(min,input[k]));
  }
  // Both layout bounds depend on media metadata and are resolved by guardBox.
  if(typeof input.guardEnabled==='boolean')out.guardEnabled=input.guardEnabled;
  if(input.guardAnchor==='center'||input.guardAnchor==='left')out.guardAnchor=input.guardAnchor;
  for(const level of [1,2,3]){const k='guardAsset'+level,v=input[k];if(v===null||typeof v==='string'&&/^\/media\/[a-f0-9-]+\.(png|jpg|webp|gif|mp4|webm)$/.test(v))out[k]=v;}
  out.scHeight=Math.min(out.scHeight,100-out.scY);
  out.scWidth=Math.min(out.scWidth,100-out.scX);
  if(typeof input.scEnabled==='boolean')out.scEnabled=input.scEnabled;
  out.maxGiftScale=Math.max(out.minGiftScale,out.maxGiftScale);
  out.maxObjects=Math.floor(out.maxObjects);
  out.regionWidth=Math.min(out.regionWidth,100-out.regionX);
  out.regionHeight=Math.min(out.regionHeight,100-out.regionY);
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
  const min=cfg.minGiftScale??defaults.minGiftScale,max=Math.max(min,cfg.maxGiftScale??defaults.maxGiftScale);
  // Size follows the unit price of this gift only; quantity changes the icon count, never the size.
  const unit=gift.coinType==='gold'?(gift.unitCoin??0):0;
  const ratio=Math.min(1,Math.max(0,unit/Math.max(1,Math.round((cfg.maxGiftScaleAmount??defaults.maxGiftScaleAmount)*1000))));
  return {count:gift.count,size:80*(min+(max-min)*ratio)/100};
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
