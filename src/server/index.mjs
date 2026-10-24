import http from 'node:http';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {root,runtimeRoot} from './paths.mjs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {consoleText} from './console.mjs';
import {defaults,config,normalizeGift,Deduplicator} from '../shared/rules.mjs';
import {LiveRoom} from './bilibili.mjs';
import {Catalog} from './catalog.mjs';
import {expandGiftV2} from './gift-v2.mjs';
await mkdir(path.join(runtimeRoot,'data'),{recursive:true});
let cfg={...defaults},configured=false;try{cfg=config(JSON.parse(await readFile(path.join(runtimeRoot,'data/config.json'),'utf8')));configured=true;}catch{}
let status='disconnected',warning=null;const clients=new Set(),catalog=new Catalog(),dedup=new Deduplicator();
let configWrites=Promise.resolve();
const send=(type,data)=>{const msg=`data: ${JSON.stringify({type,data})}\n\n`;for(const r of clients){if(r.writableLength>1024*1024){r.destroy();clients.delete(r);}else r.write(msg);}};
async function receive(msg){
  try{const messages=msg.cmd?.split(':')[0]==='SEND_GIFT_V2'?expandGiftV2(msg):[msg];
    for(const message of messages){const gift=normalizeGift(message);if(!gift||!dedup.accept(gift.id))continue;
      if(!catalog.validImage(gift.image)){const metadata=await catalog.lookup(gift.giftId,cfg.room);gift.image=metadata?.image??null;}
      gift.image=await catalog.cacheImage(gift.image).catch(()=>null);send('gift',gift);
    }
  }catch{warning='protocol';send('warning',warning);}
}
const live=new LiveRoom(s=>{status=s;send('status',s);},receive);
const giftList=()=>[...catalog.gifts].map(([id,g])=>({id,name:g.name,price:g.price,coinType:g.coinType}));
catalog.refresh(0).then(()=>send('catalog',giftList())).catch(()=>{});
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192)throw Error('invalid');}return JSON.parse(raw||'{}');}
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://127.0.0.1');
    const expected=`127.0.0.1:${server.address().port}`;
    if(req.headers.host!==expected){res.writeHead(403).end();return;}
    if(req.method==='POST'&&req.headers.origin!==`http://${expected}`){res.writeHead(403).end();return;}
    res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='GET'&&/^\/cache\/[a-f0-9]{64}$/.test(url.pathname)){const asset=await readFile(path.join(runtimeRoot,url.pathname));const type=asset.subarray(0,3).toString()==='GIF'?'image/gif':asset.subarray(8,12).toString()==='WEBP'?'image/webp':asset[0]===255?'image/jpeg':'image/png';res.writeHead(200,{'Content-Type':type,'Cache-Control':'public, max-age=86400'}).end(asset);return;}
    if(req.method==='GET'&&url.pathname==='/api/events'){
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
      clients.add(res);res.write(`data: ${JSON.stringify({type:'init',data:{config:cfg,status,warning,configured,gifts:giftList()}})}\n\n`);
      req.on('close',()=>clients.delete(res));return;
    }
    if(req.method==='POST'&&url.pathname.startsWith('/api/')){
      const d=await body(req);
      switch(url.pathname){
        case '/api/config':{const task=configWrites.catch(()=>{}).then(async()=>{const next=config(d,cfg);await writeFile(path.join(runtimeRoot,'data/config.tmp'),JSON.stringify(next,null,2));await rename(path.join(runtimeRoot,'data/config.tmp'),path.join(runtimeRoot,'data/config.json'));cfg=next;configured=true;send('config',cfg);});configWrites=task;await task;break;}
        case '/api/connect':if(!/^\d{1,12}$/.test(d.room)||Number(d.room)<1)throw Error('invalid');warning=null;send('warning',null);await live.connect(d.room);catalog.refresh(d.room).catch(()=>send('warning','catalog'));break;
        case '/api/disconnect':live.stop();break;
        case '/api/clear':send('clear',null);break;
        case '/api/test':{const count=Number(d.count),price=Number(d.price);if(!Number.isInteger(count)||count<1||count>1000||!Number.isFinite(price)||price<0||price>100000)throw Error('invalid');const metadata=catalog.gifts.get(Number(d.giftId));const image=metadata?await catalog.cacheImage(metadata.image).catch(()=>null):null;send('gift',{id:randomUUID(),giftId:Number(d.giftId)||0,name:metadata?.name??null,user:null,demo:true,count,coinType:price?'gold':'silver',unitCoin:Math.round(price*1000),totalCoin:Math.round(price*1000)*count,image});break;}
        default:res.writeHead(404).end();return;
      }
      res.writeHead(200,{'Content-Type':'application/json'}).end('{"ok":true}');return;
    }
    if(req.method!=='GET'){res.writeHead(405).end();return;}
    let file=url.pathname==='/'?'/src/control/index.html':url.pathname==='/overlay'?'/src/overlay/index.html':url.pathname;
    if(!/^\/src\/(control|overlay|shared)\/[\w/.-]+$/.test(file)||file.includes('..')){res.writeHead(404).end();return;}
    const content=await readFile(path.join(root,file));res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-cache'}).end(content);
  }catch(e){res.writeHead(e.code==='ENOENT'?404:400,{'Content-Type':'application/json'}).end(JSON.stringify({error:e.message==='invalid'?'invalid':'failed'}));}
});
const keepalive=setInterval(()=>{for(const r of clients)r.write(': heartbeat\n\n');},20000);keepalive.unref();
const port=Number(process.env.PORT)||19321;
function openPanel(url){if(process.argv.includes('--open')&&process.platform==='win32')execFile('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true},error=>{if(error)console.error(consoleText('browserFailed',{url}));});}
server.on('error',async error=>{
  live.stop(false);clearInterval(keepalive);
  const url=`http://127.0.0.1:${port}`;
  if(error.code==='EADDRINUSE'){
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),2000);
    try{
      const response=await fetch(url+'/api/events',{signal:controller.signal});
      const reader=response.body.getReader();let text='';
      while(!text.includes('\n\n')&&text.length<1024*1024){const chunk=await reader.read();if(chunk.done)break;text+=new TextDecoder().decode(chunk.value);}
      await reader.cancel();const event=JSON.parse(text.split('\n')[0].slice(6));
      if(event.type==='init'&&event.data?.config&&Array.isArray(event.data.gifts)){
        console.log(consoleText('alreadyRunning',{url}));openPanel(url);process.exit(0);
      }
    }catch{}finally{clearTimeout(timeout);controller.abort();}
  }
  console.error(consoleText('startupFailed',{code:error.code||'failed'}));
  if(process.stdin.isTTY&&!process.argv.includes('--no-open')){process.stdin.resume();process.stdin.once('data',()=>process.exit(1));}
  else process.exit(1);
});
server.listen(port,'127.0.0.1',()=>{
  const url=`http://127.0.0.1:${server.address().port}`;
  process.title=consoleText('title').replaceAll('\n',' / ');
  console.log(consoleText('consoleReady'));
  console.log(consoleText('consolePanel',{url}));
  console.log(consoleText('consoleOverlay',{url:url+'/overlay'}));
  console.log(consoleText('consoleStop'));openPanel(url);
});
let stopping=false;
function shutdown(){
  if(stopping)return;stopping=true;console.log(consoleText('consoleStopping'));
  live.stop(false);clearInterval(keepalive);
  for(const r of clients)r.end();clients.clear();
  const flushed=configWrites.catch(()=>{});
  server.close(()=>flushed.finally(()=>process.exit(0)));server.closeIdleConnections();
  setTimeout(()=>{server.closeAllConnections();flushed.finally(()=>process.exit(0));},1000).unref();
}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
