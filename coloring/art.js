/* Compact traced contours reconstructed as smooth closed curves. Inert numbers only. */
import {PACKED} from './art-data.js?v=1.0.0';
function unpack(item){
 const bytes=Uint8Array.from(atob(item.data),c=>c.charCodeAt(0));let cursor=0;
 function uint(){let n=0,shift=0;while(cursor<bytes.length){const b=bytes[cursor++];n|=(b&127)<<shift;if(!(b&128))return n;shift+=7;if(shift>28)throw Error('Bad artwork data');}throw Error('Incomplete artwork');}
 const sint=()=>{const n=uint();return n&1?-(n+1)/2:n/2;},ink=[],mask=[];
 while(cursor<bytes.length){
  const header=uint(),count=header>>1;if(count<3||count>10000)throw Error('Bad contour');
  let x=sint(),y=sint();const pts=[[x,y]];for(let i=1;i<count;i++){x+=sint();y+=sint();pts.push([x,y]);}
  const first=pts[0],last=pts.at(-1);let d='M'+(first[0]+last[0])/2+' '+(first[1]+last[1])/2;
  for(let i=0;i<count;i++){const p=pts[i],next=pts[(i+1)%count];d+='Q'+p[0]+' '+p[1]+' '+(p[0]+next[0])/2+' '+(p[1]+next[1])/2;}
  d+='z';ink.push(d);if(header&1)mask.push(d);
 }
 return {w:item.w,h:item.h,ink:ink.join(''),mask:mask.join('')};
}
export const ART=Object.fromEntries(Object.entries(PACKED).map(([key,item])=>[key,unpack(item)]));
