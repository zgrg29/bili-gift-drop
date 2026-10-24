import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import path from 'node:path';
import {mkdtemp,readFile} from 'node:fs/promises';
import {effect} from '../src/shared/rules.mjs';
import {t} from '../src/shared/i18n/index.mjs';
const languages=['zh-CN','ja','en'];
const data=await mkdtemp(path.resolve('build/exe-test-'));
const base='http://127.0.0.1:19329';
const env={...process.env,PORT:'19329',BILI_GIFT_DATA_DIR:data,BILI_GIFT_TEST_URL:base};
const binary=await readFile('dist/BiliGiftDrop-windows-x64.exe');
assert.equal(binary.readUInt16LE(binary.readUInt32LE(0x3c)+24+68),3,'EXE uses a visible Windows console');
let child;
async function start(){
  child=spawn(path.resolve('dist/BiliGiftDrop-windows-x64.exe'),['--no-open'],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='';child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
  for(let i=0;i<100;i++){
    if(child.exitCode!==null)throw Error(output);
    if(languages.every(language=>output.includes(t(language,'consoleStop')))){
      for(const language of languages){
        assert.ok(output.includes(t(language,'consoleReady')));
        assert.ok(output.includes(t(language,'consolePanel',{url:base})));
        assert.ok(output.includes(t(language,'consoleOverlay',{url:base+'/overlay'})));
      }return;
    }
    await new Promise(r=>setTimeout(r,100));
  }throw Error('Startup timeout: '+output);
}
async function stop(){if(child&&child.exitCode===null&&child.signalCode===null){const exited=once(child,'exit');child.kill();await exited;}}
async function initial(){const r=await fetch(base+'/api/events');const reader=r.body.getReader();let text='';const decoder=new TextDecoder();while(!text.includes('\n\n')){const chunk=await reader.read();if(chunk.done)throw Error('SSE ended');text+=decoder.decode(chunk.value,{stream:true});}await reader.cancel();return JSON.parse(text.split('\n')[0].slice(6)).data;}
try{
  await start();
  assert.equal((await initial()).config.scEnabled,true,'fresh installation enables SC by default');
  const duplicate=spawn(path.resolve('dist/BiliGiftDrop-windows-x64.exe'),['--no-open'],{env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let duplicateOutput='';duplicate.stdout.setEncoding('utf8');duplicate.stdout.on('data',b=>duplicateOutput+=b);duplicate.stderr.setEncoding('utf8');duplicate.stderr.on('data',b=>duplicateOutput+=b);
  assert.equal((await once(duplicate,'exit'))[0],0,duplicateOutput);
  assert.ok(duplicateOutput.includes(base),'duplicate launch reports existing panel');
  for(const language of languages)assert.ok(duplicateOutput.includes(t(language,'alreadyRunning',{url:base})));
  assert.equal((await fetch(base+'/')).status,200,'original service remains available');
  const smoke=spawn(process.execPath,['scripts/smoke.mjs'],{env,stdio:'inherit'});
  assert.equal((await once(smoke,'exit'))[0],0);
  const scSmoke=spawn(process.execPath,['scripts/smoke-sc.mjs'],{env,stdio:'inherit'});
  assert.equal((await once(scSmoke,'exit'))[0],0);
  for(const language of ['zh-CN','ja','en']){
    assert.equal((await fetch(base+'/api/config',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({language,minGiftScale:75,maxGiftScale:200,maxGiftScaleAmount:25,lifetime:45,maxCoverage:10,spawnRate:8,regionY:70,regionHeight:30,scEnabled:true,scX:12.5,scY:9,scWidth:35,scCollapse:15})})).status,200);
    assert.equal((await initial()).config.language,language);
    assert.equal((await fetch(base+`/src/shared/i18n/${language}.mjs`)).status,200);
  }
  assert.equal(effect({coinType:'gold',unitCoin:1000,totalCoin:12500,count:1},(await initial()).config).size,110);
  await stop();await start();
  const state=await initial();assert.equal(state.config.language,'en');assert.equal(state.config.lifetime,45);
  for(const [key,value] of Object.entries({minGiftScale:75,maxGiftScale:200,maxGiftScaleAmount:25,maxCoverage:10,spawnRate:8,regionY:70,regionHeight:30,scEnabled:true,scX:12.5,scY:9,scWidth:35,scCollapse:15}))assert.equal(state.config[key],value);
  for(const file of ['/src/shared/superchat.mjs','/src/overlay/superchat.mjs','/src/shared/rules.mjs','/src/shared/i18n/zh-CN.mjs','/src/shared/i18n/ja.mjs','/src/shared/i18n/en.mjs','/src/shared/crowd.mjs','/src/overlay/overlay.mjs','/src/control/control.mjs']){
    const response=await fetch(base+file);assert.equal(response.status,200);
    assert.equal(await response.text(),await readFile('.'+file,'utf8'),'embedded source matches current working tree');
  }
  assert.equal(JSON.parse(await readFile(path.join(data,'data/config.json'),'utf8')).language,'en');
  assert.equal((await fetch(base+'/api/config',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({scEnabled:false})})).status,200);
  await stop();await start();assert.equal((await initial()).config.scEnabled,false,'saved off survives restart despite default on');
  await stop();
  await assert.rejects(fetch(base,{signal:AbortSignal.timeout(1500)}),'port is released after process exits');
  console.log('EXE startup, duplicate launch, embedded assets, three locales, simulation, clear and restart persistence: PASS');
}finally{await stop();}
