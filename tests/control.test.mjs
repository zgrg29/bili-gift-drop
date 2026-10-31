import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {defaults} from '../src/shared/rules.mjs';
import {guardBox} from '../src/shared/guard.mjs';
import {GuardMedia} from '../src/shared/guard-media.mjs';
import {HistoryLedger} from '../src/shared/history.mjs';
import {giftDisplayName} from '../src/shared/gift-names.mjs';
import {t} from '../src/shared/i18n/index.mjs';

test('control panel executes in all locales, renders new strings and submits all safety settings',async()=>{
  const source=(await readFile(new URL('../src/control/control.mjs',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
  for(const language of ['zh-CN','ja','en']){
    const elements=[],ids=new Map();let events,listener,posted;const timers=new Map();let timerId=0;
    class Element {
      dataset={};children=[];value='';style={};contentWindow={postMessage(){}};
      constructor(){elements.push(this);}
      set id(value){ids.set(value,this);this._id=value;}get id(){return this._id;}
      checkValidity(){return this.value!==''&&Number.isFinite(Number(this.value))&&(!this.min||Number(this.value)>=Number(this.min))&&(!this.max||Number(this.value)<=Number(this.max));}
      querySelectorAll(){return elements.filter(e=>['number','range'].includes(e.type)&&e.id!=='count'&&e.id!=='price').concat(ids.get('includeFree'));}
      append(...items){this.children.push(...items);}prepend(...items){this.children.unshift(...items);}
      replaceChildren(...items){this.children=items;}after(){}before(){}getBoundingClientRect(){return {width:1000,height:500};}setPointerCapture(){}dispatchEvent(){ids.get('settings').oninput({target:this});}get options(){return this.children;}
    }
    for(const id of ['demo','fields','language','status','warning','empty','events','room','includeFree','toast','obs','connection','disconnect','settings','clear','copy','count','price','loginSection','loginStatus','loginAccount','loginAvatar','loginAvatarFallback','loginUser','loginUid','loginHint','loginButton','logoutButton','loginPanel','loginQR','loginQRStatus','loginCookie','loginCookieButton','loginClose','rememberLogin']){const e=new Element();e.id=id;}
    const preview=new Element(),iframe=new Element(),body=new Element();
    const sandbox={guardBox,GuardMedia,HistoryLedger,giftDisplayName,defaults,Event:class{},t,Intl,JSON,Number,Map,console,Translator:{async availability(){return 'available';},async create(){return {async translate(text){return `T:${text}`;},destroy(){}};}},document:{documentElement:{},body,getElementById:id=>ids.get(id),createElement:()=>new Element(),querySelector:q=>q==='iframe'?iframe:preview,querySelectorAll:()=>elements.filter(e=>e.dataset.t)},localStorage:{getItem:()=>language,setItem(){}},navigator:{language},location:{origin:'http://test'},setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;},clearTimeout:id=>timers.delete(id),EventSource:class{constructor(){events=this;}},window:{addEventListener(type,fn){listener=fn;}},fetch:async(url,options)=>{if(url==='/api/exchange-rate')return {ok:true,json:async()=>({rate:20,rateTime:Date.now(),fetchedAt:Date.now(),source:'test',error:null})};posted=JSON.parse(options.body);return {ok:true,json:async()=>({})};}};
    vm.runInNewContext(source,sandbox);
    events.onmessage({data:JSON.stringify({type:'init',data:{config:{...defaults,language},configured:true,status:'disconnected',warning:null,gifts:[]}})});
    for(const key of ['minGiftScale','maxGiftScale','maxGiftScaleAmount','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])assert.ok(ids.get(key));
    assert.ok(ids.get('guardDuration'));assert.equal(ids.get('guardDuration').min,1);assert.equal(ids.get('guardDuration').max,undefined);
    for(const el of elements.filter(e=>e.dataset.t))assert.equal(el.textContent,t(language,el.dataset.t));
    listener({origin:'http://test',source:iframe.contentWindow,data:{type:'gift-stats',count:3,coverage:4,pending:5}});
    ids.get('minGiftScale').value='75';ids.get('maxGiftScale').value='200';ids.get('maxGiftScaleAmount').value='25';
    ids.get('settings').checkValidity=()=>true;
    ids.get('includeFree').type='checkbox';
    await ids.get('settings').onsubmit({preventDefault(){}});
    for(const key of ['minGiftScale','maxGiftScale','maxGiftScaleAmount','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight'])assert.equal(posted[key],({minGiftScale:75,maxGiftScale:200,maxGiftScaleAmount:25})[key]??defaults[key]);
    assert.equal(sandbox.document.documentElement.lang,language);
    // Rapid edits produce one write containing the final valid value.
    const change=(id,value)=>{ids.get(id).value=value;ids.get('settings').oninput({target:ids.get(id)});};
    change('minGiftScale','80');change('minGiftScale','90');
    assert.equal([...timers.values()].filter(x=>x.delay===400).length,1);
    events.onmessage({data:JSON.stringify({type:'config',data:{...defaults,language}})});
    assert.equal(ids.get('minGiftScale').value,'90','SSE does not overwrite a pending edit');
    await [...timers.values()].find(x=>x.delay===400).fn();
    assert.equal(posted.minGiftScale,90);assert.equal(Object.keys(posted).length,1);
    const previous=posted;change('maxGiftScaleAmount','');
    await [...timers.values()].find(x=>x.delay===400).fn();assert.equal(posted,previous,'empty value is not saved as zero');
    change('maxGiftScaleAmount','0');await [...timers.values()].find(x=>x.delay===400).fn();assert.equal(posted,previous,'invalid amount is not saved');
    change('maxGiftScaleAmount','50');await [...timers.values()].find(x=>x.delay===400).fn();assert.equal(posted.maxGiftScaleAmount,50);
    ids.get('includeFree').checked=false;ids.get('settings').oninput({target:ids.get('includeFree')});
    await [...timers.values()].find(x=>x.delay===400).fn();assert.equal(posted.includeFree,false);
    events.onmessage({data:JSON.stringify({type:'config',data:{...defaults,language,guardAnchor:'center',guardX:50,scHeight:40}})});
    const pointer={clientX:0,clientY:0,pointerId:1,preventDefault(){},stopPropagation(){}};
    const handle=elements.find(e=>e.className==='sc-move');handle.onpointerdown(pointer);handle.onpointermove({clientX:100,clientY:50});await handle.onpointerup();assert.equal(posted.scX,15);assert.equal(posted.scY,15);
    events.onmessage({data:JSON.stringify({type:'config',data:{...defaults,language,guardAnchor:'center',guardX:50,scX:15,scY:15,scHeight:40}})});
    await handle.onkeydown({key:'ArrowRight',preventDefault(){},stopPropagation(){}});assert.equal(posted.scX,16);
    const resize=elements.find(e=>e.dataset.t==='scResize');resize.onpointerdown(pointer);handle.onpointermove({clientX:100,clientY:50});await handle.onpointerup();assert.equal(posted.scWidth,40);assert.equal(posted.scHeight,50);
    const guardHandle=elements.find(e=>e.className==='guard-move'),guardResize=elements.find(e=>e.dataset.t==='guardResize');guardResize.onpointerdown(pointer);guardHandle.onpointermove({clientX:1000,clientY:0});await guardHandle.onpointerup();assert.equal(posted.guardWidth,100);
    const guardBoxAfterResize=guardBox({...defaults,guardAnchor:'center',...posted});assert.ok(guardBoxAfterResize.x+guardBoxAfterResize.width<=100.00001);assert.ok(guardBoxAfterResize.y+guardBoxAfterResize.height<=100.00001);assert.ok(Math.abs(guardBoxAfterResize.x+guardBoxAfterResize.width/2-posted.guardX)<1e-9);
    guardHandle.onpointerdown(pointer);guardHandle.onpointermove({clientX:100,clientY:0});await guardHandle.onpointerup();
    const moved=guardBox({...defaults,guardWidth:posted.guardWidth??defaults.guardWidth,guardAnchor:'center',...posted});assert.ok(moved.x+moved.width<=100.00001);assert.ok(Math.abs(moved.x+moved.width/2-posted.guardX)<1e-9);assert.equal(posted.guardX,60);
    const giftFrame=elements.find(e=>e.className==='gift-region-editor'),giftResize=elements.find(e=>e.dataset.t==='regionResize');giftResize.onpointerdown(pointer);giftFrame.onpointermove({clientX:-200,clientY:-100});await giftFrame.onpointerup();assert.equal(posted.regionWidth,80);assert.equal(posted.regionHeight,80);
    // Restore gift defaults posts exactly the gift defaults and leaves other layers alone.
    const giftReset=elements.find(e=>e.dataset.t==='giftReset');await giftReset.onclick({preventDefault(){}});
    for(const key of ['giftOpacity','minGiftScale','maxGiftScale','maxGiftScaleAmount','gravity','bounce','lifetime','maxObjects','minGiftPrice','maxCoverage','spawnRate','regionX','regionY','regionWidth','regionHeight','includeFree'])assert.equal(posted[key],defaults[key]);
    for(const key of ['scX','scY','guardX'])assert.equal(Object.hasOwn(posted,key),false);
    // Simulate buttons exist for all three subscription tiers.
    for(const tier of [3,2,1])assert.ok(elements.some(e=>e.dataset.t==='guard'+tier&&e.type==='button'));
    // Guard layout reset and Super Chat reset post their own defaults only.
    const guardReset=elements.find(e=>e.dataset.t==='guardResetLayout');await guardReset.onclick({preventDefault(){}});
    assert.equal(posted.guardX,50);assert.equal(posted.guardY,29);assert.equal(posted.guardWidth,60);assert.equal(posted.guardAnchor,'center');assert.equal(Object.hasOwn(posted,'scX'),false);assert.equal(Object.hasOwn(posted,'guardAsset3'),false);
    const scReset=elements.find(e=>e.dataset.t==='scReset');await scReset.onclick({preventDefault(){}});
    for(const key of ['scEnabled','scOpacity','scX','scY','scWidth','scHeight','scCollapse','scScrollSpeed'])assert.equal(posted[key],defaults[key]);
    assert.equal(Object.hasOwn(posted,'guardX'),false);
    // The bottom history panel groups one viewer's guard/SC/gift and shows battery amounts.
    events.onmessage({data:JSON.stringify({type:'history',data:{room:'123',viewerCount:2,battery:4270,unknownBattery:false,viewers:[
      {uid:'1',user:'观众A',avatar:'/cache/test-avatar',totalBattery:3960,unknownBattery:false,items:[
        {kind:'guard',level:3,purchases:2,months:2,allMonths:true,unit:'月',battery:3960,unknownBattery:false,firstSeen:1},
        {kind:'sc',id:'s1',price:30,message:'完整留言',battery:300,unknownBattery:false,firstSeen:2}
      ]},
      {uid:'2',user:'观众B',totalBattery:10,unknownBattery:false,items:[
        {kind:'gift',giftId:100,name:'辣条',count:10,battery:10,unknownBattery:false,firstSeen:3}
      ]}
    ]}})});
    assert.equal(elements.find(e=>e.className==='history-sc-message').textContent,'完整留言');
    assert.ok(elements.some(e=>e.className==='history-detail'&&e.textContent===t(language,'historyGuardMonthsTimes',{times:'2',months:'2'})));
    assert.ok(elements.some(e=>e.className==='history-detail'&&e.textContent===t(language,'historyGiftDetail',{name:giftDisplayName('辣条',language,true),count:'10'})));
    assert.ok(elements.some(e=>e.className==='history-viewer-avatar'&&e.src==='/cache/test-avatar'&&!e.hidden));
    assert.ok(elements.some(e=>String(e.className??'').includes('history-viewer-avatar-fallback')&&e.textContent==='观'));
    const translateButtons=elements.filter(e=>e.className==='history-translate');
    if(language==='zh-CN')assert.equal(translateButtons.length,0,'Chinese SC in a Chinese UI needs no translate button');
    else{
      const button=translateButtons.at(-1);assert.ok(button);
      await button.onclick();
      assert.ok(elements.some(e=>e.className==='history-sc-translation'&&e.textContent===t(language,'historyScTranslation',{text:'T:完整留言'})));
    }
    const viewerTotals=()=>elements.filter(e=>e.className==='history-viewer-total').map(e=>e.textContent);
    assert.ok(viewerTotals().includes(t(language,'historyViewerTotal',{battery:t(language,'batteryAmount',{count:new Intl.NumberFormat(language,{maximumFractionDigits:2}).format(3960)})})));
    const currencySelect=ids.get('historyCurrency');assert.ok(currencySelect);assert.equal(currencySelect.value,'battery');
    currencySelect.value='cny';await currencySelect.onchange({preventDefault(){}});
    assert.ok(viewerTotals().some(value=>value.includes(new Intl.NumberFormat(language,{style:'currency',currency:'CNY',maximumFractionDigits:2}).format(396))));
    currencySelect.value='jpy';await currencySelect.onchange({preventDefault(){}});
    const rateLine=elements.find(e=>e.className==='history-rate');assert.equal(rateLine.hidden,false);assert.ok(rateLine.textContent.includes('20'));
    assert.ok(viewerTotals().some(value=>value.includes(new Intl.NumberFormat(language,{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(7920))));
    // A resolved public profile replaces the masked name and supplies the avatar.
    events.onmessage({data:JSON.stringify({type:'history-update',data:{uid:'2',user:'观众B完整名',avatar:'/cache/b-avatar'}})});
    const updateTimer=[...timers.values()].filter(timer=>timer.delay===150).at(-1);assert.ok(updateTimer);updateTimer.fn();
    assert.ok(elements.some(e=>e.className==='history-viewer-name'&&e.textContent==='观众B完整名'));
    assert.ok(elements.some(e=>e.className==='history-viewer-avatar'&&e.src==='/cache/b-avatar'&&!e.hidden));
    // Incremental SSE updates aggregate into the local ledger and render once.
    events.onmessage({data:JSON.stringify({type:'history-add',data:{kind:'gift',data:{id:'g5',giftId:100,name:'辣条',uid:'1',user:'观众A',count:5,totalCoin:500}}})});
    const historyTimer=[...timers.values()].filter(timer=>timer.delay===150).at(-1);assert.ok(historyTimer);
    historyTimer.fn();
    assert.ok(elements.some(e=>e.className==='history-detail'&&e.textContent===t(language,'historyGiftDetail',{name:giftDisplayName('辣条',language,true),count:'5'})));
    const translationToggle=ids.get('giftTranslation');assert.ok(translationToggle);assert.equal(translationToggle.checked,true);
    translationToggle.checked=false;await translationToggle.onchange({preventDefault(){}});
    assert.equal(posted.giftTranslation,false);
    assert.ok(elements.some(e=>e.className==='history-detail'&&e.textContent===t(language,'historyGiftDetail',{name:'辣条',count:'5'})));
    assert.equal(ids.get('loginStatus').textContent,t(language,'loginAnonymous'));
    events.onmessage({data:JSON.stringify({type:'login',data:{loggedIn:true,uid:'123',user:'登录主播',avatar:'/cache/login-avatar',verifiedAt:Date.now(),remembered:false}})});
    assert.equal(ids.get('loginStatus').textContent,t(language,'loginLoggedIn'));
    assert.equal(ids.get('loginAccount').hidden,false);
    assert.equal(ids.get('loginButton').hidden,true);
    assert.equal(ids.get('logoutButton').hidden,false);
    assert.equal(ids.get('loginUser').textContent,'登录主播');
    assert.equal(ids.get('loginUid').textContent,'UID 123');
    assert.equal(ids.get('loginAvatar').src,'/cache/login-avatar');
  }
});
