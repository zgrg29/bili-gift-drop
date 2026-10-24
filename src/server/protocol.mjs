import {inflateSync,brotliDecompressSync} from 'node:zlib';
export function packet(op,data='') {
  const body=Buffer.from(typeof data==='string'?data:JSON.stringify(data));
  const h=Buffer.alloc(16);h.writeUInt32BE(body.length+16);h.writeUInt16BE(16,4);h.writeUInt16BE(1,6);h.writeUInt32BE(op,8);h.writeUInt32BE(1,12);
  return Buffer.concat([h,body]);
}
export function decode(input,depth=0) {
  if(depth>3||input.length>8*1024*1024) throw Error('protocol');
  const results=[];
  for(let p=0;p<input.length;) {
    if(input.length-p<16) throw Error('protocol');
    const len=input.readUInt32BE(p),header=input.readUInt16BE(p+4),version=input.readUInt16BE(p+6),op=input.readUInt32BE(p+8);
    if(len<header||header<16||p+len>input.length) throw Error('protocol');
    const body=input.subarray(p+header,p+len);
    if(version===2||version===3) results.push(...decode((version===2?inflateSync:brotliDecompressSync)(body,{maxOutputLength:8*1024*1024}),depth+1));
    else if(op===5||op===8) results.push({op,data:JSON.parse(body.toString())});
    p+=len;
  }
  return results;
}
