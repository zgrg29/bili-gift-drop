import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSC,SCStore} from '../src/shared/superchat.mjs';
import {config,defaults} from '../src/shared/rules.mjs';
import {resources,t} from '../src/shared/i18n/index.mjs';
const now=1800000000000;
const msg=(id=1,price=30)=>({cmd:'SUPER_CHAT_MESSAGE',data:{id,price,start_time:now/1000,end_time:now/1000+120,time:60,user_info:{uname:'原名'},message:'原文',background_bottom_color:'#123456'}});
const item=(id,end=now+120000,duration=120,start=now)=>({id:String(id),user:'观众',message:'留言',price:30,start,end,duration,color:'#2a60b2',background:'#edf5ff',text:'#172033'});

test('SC persistent config defaults off, survives old configs and JSON storage',()=>{
  assert.equal(defaults.scPersistent,false);
  assert.equal(config({}).scPersistent,false,'a missing field stays off');
  const old=config(JSON.parse(JSON.stringify({language:'ja',scEnabled:true,scCollapse:0})));
  assert.equal(old.scPersistent,false,'old saved configs are compatible');
  const saved=config({scPersistent:true});
  assert.equal(saved.scPersistent,true);
  assert.equal(config({},JSON.parse(JSON.stringify(saved))).scPersistent,true,'the saved switch survives a restart');
  assert.equal(config({language:'ja'},saved).scPersistent,true,'language changes preserve the switch');
  assert.equal(config({scPersistent:'yes'}).scPersistent,false,'only booleans are accepted');
  assert.equal(config({scEnabled:false}).scEnabled,false);
  assert.equal(normalizeSC(msg(),now).duration,120,'duration comes from the absolute platform timestamps, not the price map');
});

test('normal mode expires at the original platform time; persistent mode keeps cards past it',()=>{
  const normal=new SCStore();
  normal.add(item('a',now+1000),now);
  assert.equal(normal.list(now+999).length,1);
  assert.equal(normal.list(now+1000).length,0,'normal mode removes at platform expiry');

  const persistent=new SCStore(true);
  persistent.add(item('a',now+1000),now);
  assert.equal(persistent.list(now+60000).length,1,'persistent mode ignores platform expiry');
  persistent.remove(['a']);
  assert.equal(persistent.list(now+60000).length,1,'platform delete/expiry events do not remove cards in persistent mode');
  persistent.clear();
  assert.equal(persistent.list(now+60000).length,0,'clearing still clears');
});

test('switching to persistent keeps current cards and never restores already-pruned history',()=>{
  const store=new SCStore();
  store.add(item('a',now+1000),now);
  store.add(item('b',now+2000),now);
  assert.equal(store.setPersistent(true,now+1500),true);
  assert.deepEqual(store.list(now+60000).map(x=>x.id),['a','b'],'current cards stay, including the one already past expiry');
  store.setPersistent(false,now+60000);
  store.setPersistent(true,now+70000);
  assert.equal(store.items.has('a'),true);

  const pruned=new SCStore();
  pruned.add(item('old',now+1000),now);
  pruned.prune(now+2000);
  pruned.setPersistent(true,now+3000);
  assert.equal(pruned.list(now+60000).length,0,'history removed before the switch is not restored');
});

test('switching back to normal restarts one full platform duration without touching collapse state',()=>{
  const store=new SCStore(true),a=item('a',now+1000,120);
  a.expanded=true;a.interactedAt=now+5000;
  store.add(a,now);
  const switched=now+50000;
  assert.equal(store.setPersistent(false,switched),true);
  assert.equal(a.start,now,'the original start still drives auto-collapse');
  assert.equal(a.expanded,true,'manual expanded state is preserved');
  assert.equal(a.interactedAt,now+5000);
  assert.equal(a.end,switched+120000,'the card gets one complete platform duration from the switch');
  assert.equal(store.list(switched+1).length,1);
  const end=a.end;
  store.setPersistent(false,switched+9999);
  assert.equal(a.end,end,'repeating the same mode does not create another timer');
  assert.equal(store.setPersistent(true,switched+10000),true);
  const b=item('b',switched+130000,30);
  store.add(b,switched+11000);
  assert.equal(b.end,switched+130000,'new cards keep their own platform expiry');
});

test('persistent mode still keeps only the latest 100 cards',()=>{
  const store=new SCStore(true);
  for(let i=0;i<101;i++)store.add(item(i,now+300000+i),now);
  assert.equal(store.items.size,100);
  assert.equal(store.items.has('0'),false,'the oldest card is evicted');
  assert.equal(store.items.has('100'),true,'the newest card is kept');
  assert.deepEqual(store.list(now+1).map(x=>x.id).slice(0,2),['1','2'],'display order stays oldest to newest');
});

test('clear and restart lifecycle stay unchanged; persistent mode is session-only',()=>{
  const store=new SCStore(true);
  store.add(item('a'),now);
  store.clear();
  assert.equal(store.list(now).length,0);
  const restarted=new SCStore(config({scPersistent:true}).scPersistent);
  assert.equal(restarted.list(now).length,0,'no Super Chat messages are restored on restart');
  assert.equal(JSON.parse(JSON.stringify(config({scPersistent:true}))).scPersistent,true,'only the setting is persisted');
});

test('three languages expose the switch and its description',()=>{
  const keys=['scPersistent','scPersistentHint'];
  for(const key of keys)for(const language of ['zh-CN','ja','en'])assert.equal(typeof resources[language][key],'string');
  assert.equal(t('zh-CN','scPersistent'),'SC 永久显示');
  assert.equal(t('ja','scPersistent'),'SCを常時表示');
  assert.equal(t('en','scPersistent'),'Keep Super Chats Visible');
  assert.match(t('zh-CN','scPersistentHint'),/100/);
  assert.match(t('ja','scPersistentHint'),/100/);
  assert.match(t('en','scPersistentHint'),/100/);
});
