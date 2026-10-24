const {getAsset}=require('node:sea');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {pathToFileURL}=require('node:url');
(async()=>{
  const manifest=JSON.parse(getAsset('manifest','utf8'));
  const home=process.env.BILI_GIFT_DATA_DIR||path.join(process.env.LOCALAPPDATA||os.homedir(),'BiliGiftDrop');
  const app=path.join(home,'app',manifest.hash);
  for(const file of manifest.files){
    const target=path.join(app,file);
    await fs.mkdir(path.dirname(target),{recursive:true});
    await fs.writeFile(target,Buffer.from(getAsset(file)));
  }
  process.env.BILI_GIFT_DATA_DIR=home;
  if(!process.argv.includes('--no-open'))process.argv.push('--open');
  await import(pathToFileURL(path.join(app,'src/server/index.mjs')).href);
})().catch(error=>{
  const manifest=JSON.parse(getAsset('manifest','utf8'));
  console.error(manifest.failure.map(s=>s.replace('{code}',error.code||'failed')).join('\n'));
  if(process.stdin.isTTY&&!process.argv.includes('--no-open')){process.stdin.resume();process.stdin.once('data',()=>process.exit(1));}
  else process.exitCode=1;
});
