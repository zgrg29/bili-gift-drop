// Position is in CSS pixels. Pause briefly at each end so edge cards can be read.
export function scrollSC(state,dt,max,speed){
  const offset=Math.max(0,Math.min(max,state.offset??0));
  if(max<=0)return {offset:0,direction:1,hold:2};
  if(speed<=0)return {...state,offset};
  if(state.hold>0)return {...state,offset,hold:Math.max(0,state.hold-dt)};
  const next=offset+(state.direction??1)*speed*dt;
  if(next>=max)return {offset:max,direction:-1,hold:2};
  if(next<=0)return {offset:0,direction:1,hold:2};
  return {offset:next,direction:state.direction??1,hold:0};
}
