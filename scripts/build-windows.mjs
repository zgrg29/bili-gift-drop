import {mkdir,readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resources} from '../src/shared/i18n/index.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
if(process.platform!=='win32'||process.arch!=='x64')throw Error('Build requires Windows x64 Node.js');
await mkdir('build',{recursive:true});await mkdir('dist',{recursive:true});
// Fixed build-only dependency; verify even when reusing a cached download.
const archive='build/postject.tgz';
let tarball;try{tarball=await readFile(archive);}catch{
  const response=await fetch('https://registry.npmjs.org/postject/-/postject-1.0.0-alpha.6.tgz');
  if(!response.ok)throw Error(`postject download: ${response.status}`);
  tarball=Buffer.from(await response.arrayBuffer());
}
if(createHash('sha256').update(tarball).digest('hex')!=='d1447b53e87d49ddaf7fb3350c870afafa72760eca47f6d5cce4cefd537e7d92')throw Error('postject checksum mismatch');
await writeFile(archive,tarball);execFileSync('tar',['-xf',archive,'-C','build']);
const files=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())await walk(file);else files.push(file);}}
await walk('src');files.sort();
const hash=createHash('sha256');const assets={};
for(const file of files){hash.update(file).update(await readFile(file));assets[file]=path.resolve(file);}
const manifest={hash:hash.digest('hex').slice(0,20),files,failure:Object.values(resources).map(r=>r.startupFailed)};
await writeFile('build/manifest.json',JSON.stringify(manifest));
assets.manifest=path.resolve('build/manifest.json');
await writeFile('build/sea-config.json',JSON.stringify({main:'scripts/sea-bootstrap.cjs',output:'build/sea.blob',disableExperimentalSEAWarning:true,useSnapshot:false,useCodeCache:false,assets}));
execFileSync(process.execPath,['--experimental-sea-config','build/sea-config.json'],{stdio:'inherit'});
const exe='dist/BiliGiftDrop-windows-x64.exe';
const binary=await readFile(process.execPath);
// Remove the runtime's Authenticode certificate before changing its contents.
const pe=binary.readUInt32LE(0x3c),optional=pe+24;
// Keep the service attached to a visible console when launched from Explorer.
binary.writeUInt16LE(3,optional+68); // IMAGE_SUBSYSTEM_WINDOWS_CUI
const security=optional+(binary.readUInt16LE(optional)===0x20b?112:96)+4*8;
const certificate=binary.readUInt32LE(security),certificateSize=binary.readUInt32LE(security+4);
binary.fill(0,security,security+8);
await writeFile(exe,certificate&&certificate+certificateSize===binary.length?binary.subarray(0,certificate):binary);
const {inject}=createRequire(import.meta.url)('../build/package/dist/api.js');
await inject(exe,'NODE_SEA_BLOB',await readFile('build/sea.blob'),{sentinelFuse:'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'});
await copyFile('docs/WINDOWS.md','dist/README.md');
// Node distributes its runtime and bundled dependencies under these notices.
let license;try{license=await readFile('build/NODE-LICENSE.txt');}catch{
  const response=await fetch(`https://raw.githubusercontent.com/nodejs/node/${process.version}/LICENSE`);
  if(!response.ok)throw Error('Node license download failed');license=Buffer.from(await response.arrayBuffer());
  await writeFile('build/NODE-LICENSE.txt',license);
}
await writeFile('dist/NODE-LICENSE.txt',license);
execFileSync('tar',['-a','-cf','dist/BiliGiftDrop-windows-x64.zip','-C','dist','BiliGiftDrop-windows-x64.exe','README.md','NODE-LICENSE.txt']);
const digest=createHash('sha256').update(await readFile('dist/BiliGiftDrop-windows-x64.zip')).digest('hex');
await writeFile('dist/SHA256SUMS.txt',`${digest}  BiliGiftDrop-windows-x64.zip\n`);
console.log(exe);
