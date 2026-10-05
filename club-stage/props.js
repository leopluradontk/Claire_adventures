/* Cozy original furniture and stage scenery. All content is local inert SVG. */
import {FURNITURE,WALLS,FLOORS,STAGES} from './catalog.js';
const wrap=s=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" aria-hidden="true">'+s+'</svg>';
const r=(x,y,w,h,fill,rad=12)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${fill}" stroke="#947889" stroke-width="3"/>`;
const e=(x,y,rx,ry,fill)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const p=(d,fill,stroke='#947889',sw=3)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
export const heart=(x,y,size,col='#e5a2bd')=>`<path transform="translate(${x} ${y}) scale(${size/20})" d="M0 10C-28-7-10-25 0-11 11-25 28-7 0 10Z" fill="${col}"/>`;
export function prop(type,night=false){
 let s=e(100,161,85,10,'#76657520');
 if(type==='sofa')s+=r(21,52,158,87,'#dcb7cf',21)+r(36,59,60,58,'#f3d7e5',15)+r(103,59,60,58,'#f3d7e5',15)+r(18,117,164,38,'#ba9bc4')+r(6,90,30,66,'#cfafd8')+r(165,90,30,66,'#cfafd8')+r(30,154,16,14,'#a57f68',3)+r(153,154,16,14,'#a57f68',3)+heart(69,83,20);
 else if(type==='bed'||type==='starbed'){
  if(type==='starbed')s+=p('M11 151V17H190v134','none','#b492b6',7)+p('M13 18Q57 73 100 18Q145 71 188 18','#e5d5f5')+heart(100,24,13,'#efc76d');
  s+=r(21,52,158,91,'#d0b0bf')+r(28,59,144,77,'#fff6e4')+r(34,64,58,34,'#fffdf6')+r(30,100,142,55,'#b7cfe0')+p('M32 115h137','none','#e3eef5',5)+r(16,140,166,18,'#d5a9be',5)+r(22,153,13,19,'#b19078',3)+r(164,153,13,19,'#b19078',3)+heart(117,125,22,'#eac0d7');
 }else if(type==='rug')s=e(100,90,98,74,'#c2afd9')+e(100,90,85,62,'#f8d3df')+e(100,90,65,45,'#fff1c9')+e(100,90,42,27,'#bfe1d4')+heart(100,88,28,'#b5a6ce');
 else if(type==='table'||type==='teacart')s+=r(35,83,13,78,'#bda18a',4)+r(151,83,13,78,'#bda18a',4)+r(10,45,180,48,'#f5d8b0',18)+p('M14 63h172','none','#fff2d9',5)+(type==='teacart'?r(28,118,145,13,'#d7bc99',3)+e(42,162,12,12,'#927c92')+e(158,162,12,12,'#927c92'):'');
 else if(type==='lamp')s=(night?e(100,62,94,90,'#ffeab765'):'')+e(100,160,53,9,'#b6969c')+r(92,55,16,109,'#bb9788',7)+p('M62 18h76l34 61H28Z','#ffe9b9')+p('M39 76h122','none','#dab784',4)+e(100,85,8,7,'#fff0b3');
 else if(type==='toybox')s+=r(18,58,164,100,'#bedbd5')+r(10,41,180,27,'#9fc6bc')+heart(100,105,39,'#edb0c9')+r(58,28,85,15,'#f1d0a0',6);
 else if(type==='shelf')s+=r(18,12,164,151,'#dcc1a9',8)+r(28,24,144,43,'#fcf0d6',2)+r(28,78,144,36,'#fcf0d6',2)+r(28,125,144,29,'#fcf0d6',2)+[36,56,78,111,131].map((x,i)=>r(x,34+i%2*4,15,30-i%2*4,['#afcddd','#d6b1ca','#c6d2a4'][i%3],2)).join('')+e(64,97,22,16,'#d8b8cc')+heart(133,94,18)+r(82,132,68,19,'#b2c5cf',3);
 else if(type==='plant')s+=p('M99 126V43m0 46L61 71m38 8 39-26','none','#729775',7)+p('M98 48C49 40 50 4 96 17q24 12 2 31','#9fc5a1')+p('M65 74C18 81 25 34 54 46q22 4 11 28','#b3d3a8')+p('M104 82C131 25 189 43 148 82q-23 17-44 0','#81b18f')+p('M57 116h87l-11 47H69Z','#f0c0bc')+p('M53 116h98','none','#db9dab',10);
 else if(type==='chair')s+=p('M20 116C10 38 173 14 183 110q12 56-81 57Q9 164 20 116Z','#bbccd9')+p('M42 105q49 37 110-5','none','#a1afc6',4)+heart(105,97,28,'#ead3dc');
 else if(type==='cushion')s=p('M99 164C-47 77 16-19 99 47 183-16 247 78 99 164Z','#f1b6cf')+p('M89 61Q44 21 26 67','none','#ffe0ec',6);
 else if(type==='frame')s=r(20,8,160,163,'#dcb27e',10)+r(32,20,136,139,'#fffaf0',2)+heart(100,84,46,'#e6cee0')+p('m79 144 15-26 15 26','none','#c8dfcd',7);
 else if(type==='bunting')s=p('M3 28Q100 106 197 28','none','#9c8799',4)+[[16,41],[51,59],[89,65],[128,59],[161,40]].map(([x,y],i)=>p(`M${x} ${y}l25 7-17 40Z`,['#f2bdd4','#d3c1ea','#eed795','#b7d8c8','#b4d5e7'][i])).join('');
 else if(type==='clock')s=e(68,43,16,36,'#ead3dd')+e(132,43,16,36,'#ead3dd')+r(24,42,152,122,'#f5dfeb',51)+e(100,102,49,44,'#fffaf0')+p('M100 72v33l25 9','none','#8e7691',5)+heart(100,105,8);
 else if(type==='cloud')s=(night?e(100,84,98,84,'#ffeeb366'):'')+p('M40 132C-17 111 9 55 51 71c9-67 86-65 100-1 59-9 64 64 8 64Z','#fff5db')+e(76,101,4,5,'#8a7286')+e(127,101,4,5,'#8a7286')+p('M91 111q10 10 21 0','none');
 else if(type==='music')s=r(9,45,183,117,'#afc4d7',16)+r(45,20,110,27,'#bfcce0',8)+e(52,106,28,28,'#f5e8ee')+e(148,106,28,28,'#f5e8ee')+e(52,106,16,16,'#b195be')+e(148,106,16,16,'#b195be')+r(91,66,17,45,'#f3d784',4)+p('m105 39 30-23','none','#958397',5);
 else if(type==='castle')s=r(28,53,144,110,'#dccae7',5)+r(16,23,42,142,'#ecd6e7',6)+r(142,23,42,142,'#ecd6e7',6)+p('M9 24 38 0 64 24M136 24 164 0 194 24','#c5addb')+p('M73 163v-47q26-42 54 0v47','#fff0d8')+heart(101,76,19,'#e9b2cb');
 else if(type==='aquarium')s=r(16,42,169,119,'#c0e6eb',13)+r(10,26,180,21,'#c9b5d5',5)+r(18,153,165,15,'#c9b5d5',5)+p('M24 150q63-27 151 0','#eddbb6')+[45,86,143].map((x,i)=>e(x,92+i%2*20,15,10,['#f2c97b','#eaa3bd','#acb2dd'][i])+p(`M${x+12} ${87+i%2*20}l12-5v20l-12-7Z`,'#f0bcce')).join('')+e(52,66,5,5,'#f9ffff')+e(120,59,7,7,'#f9ffff');
 else if(type==='piano')s=p('M19 35Q129-13 180 61v75H19Z','#baa6cf')+r(16,116,168,32,'#faf4e8',3)+[35,55,75,95,115,135,155].map(x=>p(`M${x} 119v28`,'none','#978e9e',2)).join('')+[47,68,107,128,149].map(x=>r(x,117,8,18,'#7e758e',1)).join('')+r(29,146,13,22,'#9279aa',3)+r(158,146,13,22,'#9279aa',3);
 return wrap(s);
}
export function roomBackdrop(room,id='lounge'){
 const wall=WALLS[room.wall][1],floor=FLOORS[room.floor][1];
 let s=`<defs><pattern id="wallPattern" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="${wall}"/>`;
 if(room.wall==='mint')s+='<path d="M24 0v48" stroke="#ffffff55" stroke-width="12"/>';
 else if(room.wall==='peach')s+=heart(24,27,6,'#e4bbbd55');
 else s+='<circle cx="24" cy="24" r="3" fill="#ffffff8f"/>';
 s+=`</pattern></defs><rect x="0" y="0" width="960" height="600" fill="url(#wallPattern)"/><path d="M0 275h960v325H0Z" fill="${floor}"/>`;
 for(let y=309;y<600;y+=48)s+=`<path d="M0 ${y}h960" stroke="#95775a27" stroke-width="2"/>`;
 for(let x=-100;x<1100;x+=116)s+=`<path d="m${x} 275 65 325" stroke="#95775a18" stroke-width="2"/>`;
 s+='<rect x="0" y="263" width="960" height="17" fill="#fff7ea"/><rect x="0" y="280" width="960" height="6" fill="#c6a58e44"/>';
 s+='<rect x="680" y="41" width="185" height="172" rx="59" fill="#fff7e6" stroke="#d8bac5" stroke-width="8"/>';
 s+=`<rect x="690" y="50" width="164" height="149" rx="52" fill="${room.night?'#6d6c9b':'#b8dce7'}"/>`;
 if(room.night)s+=e(802,83,18,18,'#fff2bf')+e(795,76,16,16,'#6d6c9b')+[716,756,824,738].map((x,i)=>e(x,74+i*26,2,2,'#fff4da')).join('');
 else s+=e(815,83,20,20,'#fff2b7')+e(710,159,70,25,'#9fceab')+e(796,179,94,30,'#8ec3a7');
 s+='<path d="M773 46v156m-82-79h161" stroke="#fff8ec" stroke-width="9"/><path d="M670 38q-15 98 18 147l22-15q-27-58-1-131M863 38q18 98-16 147l-22-15q27-58 0-131" fill="#e3b5cb" stroke="#c99aaf" stroke-width="2"/>';
 s+='<path d="M30 590h900" stroke="#a5886c33" stroke-width="5"/>';
 if(id==='garden')s+='<path d="M24 30q-5 120 27 178M911 23q41 123 12 179" stroke="#9bbda3" stroke-width="5" fill="none"/>';
 return s;
}
export function stageBackdrop(id){
 const a=STAGES[id]||STAGES.rainbow;
 let s=`<rect width="960" height="540" rx="20" fill="${a.sky}"/><ellipse cx="480" cy="480" rx="475" ry="105" fill="${a.floor}"/><path d="M42 419h876" stroke="${a.accent}" stroke-width="6"/>`;
 if(id==='rainbow'||id==='candy')for(let i=0;i<5;i++)s+=`<path d="M${181+i*28} 313a${299-i*28} ${220-i*20} 0 0 1 ${598-i*56} 0" fill="none" stroke="${['#eab2cf','#f4c591','#efe4a8','#b8d9c6','#b7cce2'][i]}" stroke-width="24"/>`;
 if(id==='garden')for(let i=0;i<9;i++)s+=`<g transform="translate(${60+i*105} ${354+(i%2)*25})">${p('M0 22V-50','none','#81a98b',5)}${[[-16,-50],[14,-50],[0,-69],[0,-31]].map(([x,y])=>e(x,y,18,18,'#edc4d8')).join('')}${e(0,-50,10,10,'#f5dca1')}</g>`;
 if(id==='winter')for(let i=0;i<17;i++){const x=40+i*53,y=70+i%3*70;s+=`<path d="M${x-11} ${y}h22m-11-11v22m-8-19 16 16m0-16-16 16" stroke="#ffffffc0" stroke-width="3"/>`;}
 if(id==='beach')s+=`<path d="M0 279q240-29 480 0t480 0v144H0Z" fill="#b1dbdc"/>`+e(790,120,48,48,'#fff2b5')+p('M130 421q0-124 15-197m679 190q-10-110-34-174','none','#c09d7c',15)+p('M145 227Q52 185 35 256q80-13 110-29 78-66 130-14-76 22-130 14m646 13q-87-39-120 11 96 2 120-11 68-45 113-2-66 12-113 2','#96bfa4');
 if(id==='starlight')for(let i=0;i<22;i++)s+=`<text x="${48+(i*109)%865}" y="${65+(i*37)%241}" fill="#fff0b8" font-size="${16+i%3*8}">&#9733;</text>`;
 s+=`<path d="M0 0H960v22Q718 83 480 23 244 83 0 22Z" fill="${a.accent}" opacity=".63"/><path d="M0 0h58q-20 198 2 326H0M960 0h-58q20 198-2 326h60" fill="${a.accent}" opacity=".55"/>`;
 s+='<g fill="#fffaf022"><path d="M170 30 38 417h275ZM785 30 658 417h254Z"/></g>';
 for(let i=0;i<8;i++)s+=e(30+i*129,526,36,22,'#92809935');
 return s;
}
