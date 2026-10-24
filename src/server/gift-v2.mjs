// Wire field numbers documented by blivedm/models/pb.py; independent decoder.
function fields(buffer){
  let offset=0;const result=new Map();
  function varint(){let value=0n;for(let shift=0n;shift<70n;shift+=7n){if(offset>=buffer.length)throw Error('protocol');const b=buffer[offset++];value|=BigInt(b&127)<<shift;if(!(b&128))return value;}throw Error('protocol');}
  while(offset<buffer.length){const tag=Number(varint()),field=tag>>>3,type=tag&7;let value;
    if(!field)throw Error('protocol');
    if(type===0)value=varint().toString();
    else if(type===2){const length=Number(varint());if(!Number.isSafeInteger(length)||length<0||offset+length>buffer.length)throw Error('protocol');value=buffer.subarray(offset,offset+length);offset+=length;}
    else if(type===1||type===5){offset+=type===1?8:4;if(offset>buffer.length)throw Error('protocol');continue;}
    else throw Error('protocol');
    if(!result.has(field))result.set(field,[]);result.get(field).push(value);
  }return result;
}
const str=(f,n)=>f.get(n)?.[0]?.toString()??'';
const num=(f,n)=>Number(str(f,n)||0);
export function expandGiftV2(message){
  const encoded=message.data?.pb;if(typeof encoded!=='string'||encoded.length>1024*1024)throw Error('protocol');
  const root=fields(Buffer.from(encoded,'base64')),blind=root.get(9)?.[0],blindFields=blind?fields(blind):null;
  return (root.get(10)??[]).map(raw=>{const f=fields(raw),info=f.get(35)?.[0];return {cmd:'SEND_GIFT',data:{
    uid:str(root,1),uname:str(root,2),giftId:num(f,1),giftName:str(f,2),num:num(f,3),price:num(f,5),total_coin:num(f,7),coin_type:str(f,8),tid:str(f,9),timestamp:num(f,10),rnd:str(f,12),gift_info:{img_basic:info?str(fields(info),1):''},blind_gift:blindFields?{original_gift_price:num(blindFields,6)}:null
  }};});
}
