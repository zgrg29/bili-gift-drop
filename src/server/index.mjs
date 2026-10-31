import {Avatars} from './avatars.mjs';
import {Profiles} from './profiles.mjs';
import {normalizeGuard,GuardQueue} from '../shared/guard.mjs';
import {normalizeSC,SCStore,scDuration} from '../shared/superchat.mjs';
import {HistoryLedger} from '../shared/history.mjs';
import {ExchangeRates} from './exchange.mjs';
import {LoginStore,parseCookieString} from './login.mjs';
import http from 'node:http';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {root,runtimeRoot} from './paths.mjs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {consoleText} from './console.mjs';
import {defaults,config,normalizeGift,effect,Deduplicator} from '../shared/rules.mjs';
import {LiveRoom} from './bilibili.mjs';
import {Catalog} from './catalog.mjs';
import {expandGiftV2} from './gift-v2.mjs';
await mkdir(path.join(runtimeRoot,'data'),{recursive:true});
let cfg={...defaults},configured=false;try{cfg=config(JSON.parse(await readFile(path.join(runtimeRoot,'data/config.json'),'utf8')));configured=true;}catch{}
const scStore=new SCStore(),guardQueue=new GuardQueue((cfg.guardDuration??8)*1000),historyLedger=new HistoryLedger(),exchange=new ExchangeRates();
let status='disconnected',warning=null;const clients=new Set(),catalog=new Catalog(),avatars=new Avatars(catalog),profiles=new Profiles(catalog),dedup=new Deduplicator();
const login=new LoginStore({cacheImage:url=>catalog.cacheImage(url)});await login.load();
let configWrites=Promise.resolve();
const hasHistoryClients=()=>[...clients].some(r=>r.history);
const send=(type,data,historyOnly=false)=>{if(historyOnly&&!hasHistoryClients())return;const msg=`data: ${JSON.stringify({type,data})}\n\n`;for(const r of clients){if(historyOnly&&!r.history)continue;if(r.writableLength>1024*1024){r.destroy();clients.delete(r);}else r.write(msg);}};
const sendHistoryAdd=(kind,data)=>{if(hasHistoryClients())send('history-add',{kind,data},true);};
const sendHistoryReset=()=>send('history',historyLedger.snapshot(),true);
const needsName=name=>!String(name??'').trim()||/\*{3,}\s*$/.test(String(name));
const viewerKey=(uid,user)=>uid?`uid:${uid}`:`name:${user??''}`;
function updateHistoryViewer(key,patch,generation){
  if(generation!==live.generation)return;
  if(historyLedger.updateViewerByKey(key,patch))send('history-update',{key,...patch},true);
}
async function receive(msg){
  try{
    const command=msg.cmd?.split(':')[0];
    if(['GUARD_BUY','USER_TOAST_MSG','USER_TOAST_MSG_V2'].includes(command)){
      const item=normalizeGuard(msg);if(!item)return;
      // Purchases remain in the thank-you ledger even when the effect is off or
      // the animation queue is full; the queue only controls playback.
      if(historyLedger.addGuard(item))sendHistoryAdd('guard',item);
      // Fetch only permitted CDN images; capture the connection generation across async work.
      const generation=live.generation,avatarUrl=item.avatar,itemMasked=needsName(item.user),guardKey=viewerKey(item.uid,item.user);item.avatar=null;
      const profileTask=itemMasked?profiles.resolve(item.uid,avatarUrl):avatars.resolve(item.uid,avatarUrl).then(avatar=>({avatar,name:null}));
      profileTask.then(profile=>{
        if(generation!==live.generation)return;
        const patch={};if(itemMasked&&profile.name)patch.user=profile.name;if(profile.avatar)patch.avatar=profile.avatar;
        if(Object.keys(patch).length)updateHistoryViewer(guardKey,patch,generation);
        if(cfg.guardEnabled){const existing=[guardQueue.current,...guardQueue.pending].find(x=>x?.key===item.key);if(existing){if(profile.avatar)existing.avatar=profile.avatar;if(itemMasked&&profile.name)existing.user=profile.name;send('guard-state',guardQueue.snapshot());}}
      }).catch(()=>{});
      if(!cfg.guardEnabled)return;
      const result=guardQueue.add(item);if(result==='full'){warning='guardFull';send('warning',warning);}send('guard-state',guardQueue.snapshot());
      return;
    }
    if(command==='SUPER_CHAT_MESSAGE_DELETE'){scStore.remove(msg.data?.ids??[]);send('sc-list',scStore.list());return;}
    if(['SUPER_CHAT_MESSAGE','SUPER_CHAT_MESSAGE_JPN'].includes(command)){
      const sc=normalizeSC(msg);if(sc){
        const generation=live.generation,face=sc.avatar,scMasked=needsName(sc.user),scKey=viewerKey(sc.uid,sc.user);sc.avatar=null;
        if(scStore.add(sc)){
          if(historyLedger.addSC(sc))sendHistoryAdd('sc',sc);
          send('sc',sc);
          const profile=await (scMasked?profiles.resolve(sc.uid,face):avatars.resolve(sc.uid,face).then(avatar=>({avatar,name:null}))).catch(()=>null);
          const avatar=profile?.avatar??null;
          if(avatar&&generation===live.generation&&scStore.items.get(sc.id)===sc&&sc.end>Date.now()){
            sc.avatar=avatar;if(scMasked&&profile.name)sc.user=profile.name;send('sc-list',scStore.list());
          }
          if(generation===live.generation){
            const patch={};if(scMasked&&profile?.name)patch.user=profile.name;if(avatar)patch.avatar=avatar;
            if(Object.keys(patch).length)updateHistoryViewer(scKey,patch,generation);
          }
        }
      }
      else if(!sc&&(!(Number(msg.data?.start_time)>0)||(!msg.data?.end_time&&!(Number(msg.data?.time)>0)&&!scDuration(Number(msg.data?.price))))){warning='scTiming';send('warning',warning);}return;
    }
    const messages=msg.cmd?.split(':')[0]==='SEND_GIFT_V2'?expandGiftV2(msg):[msg];
    for(const message of messages){const gift=normalizeGift(message);if(!gift||!dedup.accept(gift.id))continue;
      // The ledger records every accepted gift, including gifts below the
      // trigger threshold or free gifts that do not produce an effect.
      if(historyLedger.addGift(gift)){
        sendHistoryAdd('gift',gift);
        const generation=live.generation,giftMasked=needsName(gift.user),giftKey=viewerKey(gift.uid,gift.user);
        const profileTask=giftMasked?profiles.resolve(gift.uid,gift.face):avatars.resolve(gift.uid,gift.face).then(avatar=>({avatar,name:null}));
        profileTask.then(profile=>{
          if(generation!==live.generation)return;
          if(giftMasked&&profile.name)gift.user=profile.name;
          const patch={};if(giftMasked&&profile.name)patch.user=profile.name;if(profile.avatar)patch.avatar=profile.avatar;
          if(Object.keys(patch).length)updateHistoryViewer(giftKey,patch,generation);
        }).catch(()=>{});
      }
      if(!effect(gift,cfg).count){gift.image=null;send('gift',gift);continue;}
      if(!catalog.validImage(gift.image)){const metadata=await catalog.lookup(gift.giftId,cfg.room);gift.image=metadata?.image??null;}
      gift.image=await catalog.cacheImage(gift.image).catch(()=>null);send('gift',gift);
    }
  }catch{warning='protocol';send('warning',warning);}
}
const live=new LiveRoom(s=>{status=s;send('status',s);},receive,()=>login.auth());
function applyLogin(){send('login',login.status());if(live.room&&status!=='disconnected')live.connect(live.room).catch(()=>{});}
const giftList=()=>[...catalog.gifts].map(([id,g])=>({id,name:g.name,price:g.price,coinType:g.coinType}));
catalog.refresh(0).then(()=>send('catalog',giftList())).catch(()=>{});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm'};
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192)throw Error('invalid');}return JSON.parse(raw||'{}');}
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://127.0.0.1');
    const expected=`127.0.0.1:${server.address().port}`;
    if(req.headers.host!==expected){res.writeHead(403).end();return;}
    if(req.method==='POST'&&req.headers.origin!==`http://${expected}`){res.writeHead(403).end();return;}
    res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='GET'&&/^\/media\/[a-f0-9-]+\.(png|jpg|webp|gif|mp4|webm)$/.test(url.pathname)){const asset=await readFile(path.join(runtimeRoot,url.pathname));res.writeHead(200,{'Content-Type':mime[path.extname(url.pathname)],'Cache-Control':'public, max-age=86400'}).end(asset);return;}
    if(req.method==='POST'&&url.pathname==='/api/guard-upload'){
      const level=Number(url.searchParams.get('level'));if(![1,2,3].includes(level))throw Error('invalid');
      const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>32*1024*1024)throw Error('invalid');chunks.push(chunk);}const data=Buffer.concat(chunks);
      const ext=data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':data[0]===255&&data[1]===216&&data[2]===255?'jpg':/^GIF8[79]a$/.test(data.subarray(0,6).toString())?'gif':data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP'?'webp':data.subarray(4,8).toString()==='ftyp'?'mp4':data.subarray(0,4).equals(Buffer.from([26,69,223,163]))?'webm':null;
      if(!ext)throw Error('invalid');const file='/media/'+randomUUID()+'.'+ext;await mkdir(path.join(runtimeRoot,'media'),{recursive:true});await writeFile(path.join(runtimeRoot,file),data);
      const task=configWrites.catch(()=>{}).then(async()=>{const next=config({['guardAsset'+level]:file},cfg);await writeFile(path.join(runtimeRoot,'data/config.tmp'),JSON.stringify(next,null,2));await rename(path.join(runtimeRoot,'data/config.tmp'),path.join(runtimeRoot,'data/config.json'));cfg=next;configured=true;send('config',cfg);});configWrites=task;await task;res.writeHead(200,{'Content-Type':'application/json'}).end('{"ok":true}');return;
    }
    if(req.method==='GET'&&/^\/cache\/[a-f0-9]{64}$/.test(url.pathname)){const asset=await readFile(path.join(runtimeRoot,url.pathname));const type=asset.subarray(0,3).toString()==='GIF'?'image/gif':asset.subarray(8,12).toString()==='WEBP'?'image/webp':asset[0]===255?'image/jpeg':'image/png';res.writeHead(200,{'Content-Type':type,'Cache-Control':'public, max-age=86400'}).end(asset);return;}
    if(req.method==='GET'&&url.pathname==='/api/events'){
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
      if(url.searchParams.get('history')==='1')res.history=true;
      clients.add(res);
      const init={config:cfg,status,warning,configured,sc:scStore.list(),guard:guardQueue.snapshot(),gifts:giftList(),exchange:exchange.state,login:login.status()};
      if(res.history)init.history=historyLedger.snapshot();
      res.write(`data: ${JSON.stringify({type:'init',data:init})}\n\n`);
      req.on('close',()=>clients.delete(res));return;
    }
    if(req.method==='GET'&&url.pathname==='/api/exchange-rate'){
      const previous=exchange.state.rate,state=await exchange.get();
      if(state.rate!==previous)send('rate',state);
      res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(state));return;
    }
    if(req.method==='GET'&&url.pathname==='/api/login/status'){
      res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(login.status()));return;
    }
    if(req.method==='POST'&&url.pathname.startsWith('/api/')){
      const d=await body(req);
      switch(url.pathname){
        case '/api/login/qr':{const qr=await login.startQR(!!d.remember);res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(qr));return;}
        case '/api/login/qr/poll':{const result=await login.pollQR(d.qrcode_key);if(result.status==='success')applyLogin();res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(result));return;}
        case '/api/login/cookie':{const cookies=parseCookieString(d.cookie);if(!cookies.SESSDATA)throw Error('auth');const status=await login.setCookies(cookies,{remember:!!d.remember});applyLogin();res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(status));return;}
        case '/api/login/logout':{const status=await login.logout();applyLogin();res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(status));return;}
        case '/api/config':{const task=configWrites.catch(()=>{}).then(async()=>{const next=config(d,cfg);await writeFile(path.join(runtimeRoot,'data/config.tmp'),JSON.stringify(next,null,2));await rename(path.join(runtimeRoot,'data/config.tmp'),path.join(runtimeRoot,'data/config.json'));cfg=next;guardQueue.duration=(cfg.guardDuration??8)*1000;if(!cfg.guardEnabled){guardQueue.clear();send('guard-state',guardQueue.snapshot());}configured=true;send('config',cfg);});configWrites=task;await task;break;}
        case '/api/connect':if(!/^\d{1,12}$/.test(d.room)||Number(d.room)<1)throw Error('invalid');warning=null;send('warning',null);if(live.room!==d.room){guardQueue.clear();send('guard-state',guardQueue.snapshot());scStore.items.clear();send('sc-list',[]);}if(historyLedger.room!==d.room){historyLedger.reset(d.room);sendHistoryReset();}await live.connect(d.room);catalog.refresh(d.room).catch(()=>send('warning','catalog'));break;
        case '/api/guard-test':{const level=Number(d.level??3),count=Number(d.count??1);if(![1,2,3].includes(level)||!Number.isSafeInteger(count)||count<1||count>1200)throw Error('invalid');const id=randomUUID();if(!cfg.guardEnabled)throw Error('invalid');if(guardQueue.add({id,key:id,demo:true,user:'',avatar:null,level,count,unit:'月'})==='full')throw Error('invalid');send('guard-state',guardQueue.snapshot());break;}
        case '/api/disconnect':live.stop();break;
        case '/api/sc-toggle':{const x=scStore.items.get(String(d.id));if(x){x.expanded=!!d.expanded;x.interactedAt=Date.now();send('sc-list',scStore.list());}break;}
        case '/api/sc-test':{const now=Date.now();const price=Number(d.price??30),duration=Number(d.duration??60);if(!Number.isFinite(price)||price<0||!Number.isFinite(duration)||duration<1||duration>7200)throw Error('invalid');const x={id:randomUUID(),demo:true,user:'',message:'',price,start:now,end:now+duration*1000,color:'#2a60b2',background:'#edf5ff',text:'#172033'};scStore.add(x);send('sc',x);break;}
        case '/api/clear':guardQueue.clear();send('guard-state',guardQueue.snapshot());scStore.items.clear();send('sc-list',[]);send('clear',null);break;
        case '/api/history-clear':historyLedger.clear();sendHistoryReset();break;
        case '/api/test':{const count=Number(d.count),price=Number(d.price);if(!Number.isInteger(count)||count<1||count>1000||!Number.isFinite(price)||price<0||price>100000)throw Error('invalid');const metadata=catalog.gifts.get(Number(d.giftId));const image=metadata?await catalog.cacheImage(metadata.image).catch(()=>null):null;send('gift',{id:randomUUID(),giftId:Number(d.giftId)||0,name:metadata?.name??null,user:null,demo:true,count,coinType:price?'gold':'silver',unitCoin:Math.round(price*1000),totalCoin:Math.round(price*1000)*count,image});break;}
        default:res.writeHead(404).end();return;
      }
      res.writeHead(200,{'Content-Type':'application/json'}).end('{"ok":true}');return;
    }
    if(req.method!=='GET'){res.writeHead(405).end();return;}
    let file=url.pathname==='/'?'/src/control/index.html':url.pathname==='/overlay'?'/src/overlay/index.html':url.pathname;
    if(!/^\/src\/(control|overlay|shared)\/[\w/.-]+$/.test(file)||file.includes('..')){res.writeHead(404).end();return;}
    const content=await readFile(path.join(root,file));res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-cache'}).end(content);
  }catch(e){res.writeHead(e.code==='ENOENT'?404:400,{'Content-Type':'application/json'}).end(JSON.stringify({error:['invalid','auth'].includes(e.message)?e.message:'failed'}));}
});
let guardSignature='';const guardTick=setInterval(()=>{const state=guardQueue.snapshot(),signature=JSON.stringify(state);if(signature!==guardSignature){guardSignature=signature;send('guard-state',state);}},100);guardTick.unref();
const keepalive=setInterval(()=>{for(const r of clients)r.write(': heartbeat\n\n');},20000);keepalive.unref();
exchange.get().then(state=>send('rate',state)).catch(()=>{});
const rateTick=setInterval(()=>{exchange.get(Date.now(),true).then(state=>send('rate',state)).catch(()=>{});},24*60*60*1000);rateTick.unref();
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
