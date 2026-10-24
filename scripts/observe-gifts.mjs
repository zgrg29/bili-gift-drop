// Read-only bounded live-room diagnostic. Does not send gifts or chat messages.
import {LiveRoom} from '../src/server/bilibili.mjs';
import {expandGiftV2} from '../src/server/gift-v2.mjs';
import {normalizeGift,Deduplicator} from '../src/shared/rules.mjs';
const rooms=process.argv.slice(2);
if(!rooms.length||rooms.length>4||rooms.some(x=>!/^\d{1,12}$/.test(x)))throw Error('Pass 1–4 numeric room IDs');
const rows=[],connections=[];
for(const room of rooms){
  const row={room,status:'starting',commands:{},gifts:[],parseErrors:0};rows.push(row);
  const dedup=new Deduplicator();
  const live=new LiveRoom(status=>{row.status=status;console.log(JSON.stringify({room,status}));},msg=>{
    const cmd=msg?.cmd?.split(':')[0];if(!cmd)return;
    row.commands[cmd]=(row.commands[cmd]??0)+1;
    if(!['SEND_GIFT','SEND_GIFT_V2'].includes(cmd))return;
    try{for(const m of cmd==='SEND_GIFT_V2'?expandGiftV2(msg):[msg]){
      const g=normalizeGift(m);if(!g||!dedup.accept(g.id))continue;
      const item={at:new Date().toISOString(),cmd,giftId:g.giftId,name:g.name,count:g.count,coinType:g.coinType,unitCoin:g.unitCoin,totalCoin:g.totalCoin,hasImage:!!g.image};
      row.gifts.push(item);console.log(JSON.stringify({room,gift:item}));
    }}catch{row.parseErrors++;}
  });connections.push(live);
  live.connect(room);
}
setTimeout(()=>{for(const live of connections)live.stop(false);console.log(JSON.stringify({summary:rows}));process.exit(0);},60000);
