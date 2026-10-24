import {packet,decode} from './protocol.mjs';
import {credentials,sign} from './wbi.mjs';
const base='https://api.live.bilibili.com';
export async function api(path,device='') {
  const r=await fetch(base+path,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://live.bilibili.com/',...(device?{Cookie:`buvid3=${device}`}:{})},signal:AbortSignal.timeout(10000)});
  if(!r.ok) throw Error('platform');
  const json=await r.json();if(json.code!==0) throw Error(json.code===-101?'auth':'platform');return json.data;
}
export class LiveRoom {
  generation=0; attempt=0;
  constructor(status,onMessage){this.status=status;this.onMessage=onMessage;}
  stop(emit=true) {this.generation++;clearTimeout(this.retry);clearInterval(this.heartbeat);clearTimeout(this.watchdog);this.ws?.close();this.ws=null;if(emit)this.status('disconnected');}
  async connect(room) {this.stop(false);this.room=room;this.attempt=0;await this.open(this.generation);}
  async open(generation) {
    this.status(this.attempt?'reconnecting':'connecting');
    try {
      const info=await api(`/room/v1/Room/room_init?id=${this.room}`);
      const creds=await credentials();
      const conf=await api('/xlive/web-room/v1/index/getDanmuInfo?'+sign({id:info.room_id,type:0},creds.img,creds.sub),creds.device);
      if(generation!==this.generation)return;
      const host=conf.host_list?.[0];if(!host||!conf.token)throw Error('platform');
      const ws=this.ws=new WebSocket(`wss://${host.host}:${host.wss_port||443}/sub`);ws.binaryType='arraybuffer';
      const arm=()=>{clearTimeout(this.watchdog);this.watchdog=setTimeout(()=>ws.close(),65000);};arm();
      ws.onopen=()=>{if(generation!==this.generation){ws.close();return;}ws.send(packet(7,{uid:0,roomid:info.room_id,protover:3,platform:'web',type:2,key:conf.token,buvid:creds.device}));};
      ws.onmessage=e=>{
        if(generation!==this.generation)return;arm();
        try{for(const msg of decode(Buffer.from(e.data))) {
          if(msg.op===8){if(msg.data.code!==0){this.status('auth');ws.close();return;}this.attempt=0;this.status('connected');ws.send(packet(2,'[object Object]'));clearInterval(this.heartbeat);this.heartbeat=setInterval(()=>{if(ws.readyState===1)ws.send(packet(2,'[object Object]'));},30000);}
          else this.onMessage(msg.data);
        }}catch{this.status('protocol');ws.close();}
      };
      ws.onerror=()=>ws.close();
      ws.onclose=()=>{if(generation!==this.generation)return;clearInterval(this.heartbeat);clearTimeout(this.watchdog);this.status('reconnecting');this.schedule(generation);};
    } catch(e) {if(generation===this.generation){this.status(e.message==='auth'?'auth':'network');this.schedule(generation);}}
  }
  schedule(generation){clearTimeout(this.retry);this.retry=setTimeout(()=>{if(generation===this.generation)this.open(generation);},Math.min(30000,1000*2**Math.min(this.attempt++,5)));}
}
