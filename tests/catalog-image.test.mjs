import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
// Set the data root before importing the catalog; never touch user caches.
const dir=await mkdtemp(path.join(os.tmpdir(),'bili-image-test-'));
process.env.BILI_GIFT_DATA_DIR=dir;
const {Catalog,imageType}=await import('../src/server/catalog.mjs');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
test('CDN image download accepts png MIME alias and standard MIME, rejects disguised HTML',async(t)=>{
 const original=globalThis.fetch;t.after(async()=>{globalThis.fetch=original;await rm(dir,{recursive:true,force:true});});
 const catalog=new Catalog();let calls=0;
 for(const [i,type,body,ok] of [[1,'png',png,true],[2,'image/png',png,true],[3,'image/png','<html>Error</html>',false],[4,'png','<html>Error</html>',false]]){
  globalThis.fetch=async()=>{calls++;return new Response(body,{headers:{'Content-Type':type}});};
  const url=`https://s1.hdslb.com/test-${i}.png`,result=await catalog.cacheImage(url);
  if(ok){assert.match(result,/^\/cache\//);assert.deepEqual(await readFile(path.join(dir,result)),png);assert.equal(await catalog.cacheImage(url),result);}
  else assert.equal(result,null);
 }
 assert.equal(calls,4);assert.equal(await catalog.cacheImage('https://example.com/test.png'),null);
});
test('supported image signatures exclude empty, truncated and non-image responses',()=>{
 assert.equal(imageType(png),'image/png');assert.equal(imageType(Buffer.from([255,216,255,224])),'image/jpeg');
 assert.equal(imageType(Buffer.from('GIF89a')),'image/gif');assert.equal(imageType(Buffer.from('GIF87a')),'image/gif');
 assert.equal(imageType(Buffer.from('RIFFxxxxWEBP')),'image/webp');
 for(const value of ['', 'png','<html>', 'RIFFxxxx','GIF88a'])assert.equal(imageType(Buffer.from(value)),null);
});
