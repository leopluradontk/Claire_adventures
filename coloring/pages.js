/* Page recipes compose only Claire, Pusheen, Hello Kitty and Raspberry.
   Add a new stable id and recipe; do not change an existing template under saved paint. */
import {ART} from './art.js?v=1.0.0';
export const SIZE={w:800,h:1000};
export const PAGES=[
 {id:'claire-bows',title:'Claire and her bows',category:'Claire',scene:'claire',version:1},
 {id:'pusheen-cupcake',title:'Pusheen and a cupcake',category:'Stuffy friends',scene:'pusheen',version:1},
 {id:'hello-kitty-heart',title:'Hello Kitty loves hearts',category:'Stuffy friends',scene:'kitty',version:1},
 {id:'raspberry-bow',title:'Raspberry the axolotl',category:'Stuffy friends',scene:'raspberry',version:1},
 {id:'best-friends',title:'Best friends together',category:'Claire',scene:'together',version:1},
 {id:'pumpkin-patch',title:'At the pumpkin patch',category:'Adventures',scene:'pumpkins',version:1},
 {id:'snow-day',title:'A snowy day',category:'Adventures',scene:'snow',version:1},
 {id:'beach-day',title:'A day at the beach',category:'Adventures',scene:'beach',version:1},
 {id:'halloween',title:'Trick or treat!',category:'Adventures',scene:'halloween',version:1},
 {id:'stuffy-party',title:'A stuffy friends party',category:'Stuffy friends',scene:'party',version:1}
];
const path=d=>`<path d="${d}"/>`;
const ellipse=(x,y,rx,ry)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
const rect=(x,y,w,h,r=12)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const at=(x,y,s,body)=>`<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
const heart=(x,y,s=1)=>at(x,y,s,path('M0 16C-55-17-26-52 0-23C26-52 55-17 0 16Z'));
const star=(x,y,s=1)=>at(x,y,s,path('M0-24L7-7 25-7 11 5 16 23 0 13-16 23-11 5-25-7-7-7Z'));
const cloud=(x,y,s=1)=>at(x,y,s,path('M-60 20C-90 15-82-25-53-22C-53-59-1-63 8-29C37-58 69-29 56-8C91-4 83 27 57 27H-52Z'));
const pumpkin=(x,y,s=1)=>at(x,y,s,path('M-7-52Q-12-80 8-84L17-76Q0-70 4-52')+ellipse(0,0,62,54)+ellipse(0,0,36,54)+path('M0-52Q-15 0 0 54'));
const snowflake=(x,y,s=1)=>at(x,y,s,[0,60,120].map(a=>`<g transform="rotate(${a})">${path('M0-28V28M-8-20L0-12 8-20M-8 20L0 12 8 20')}</g>`).join(''));
function sprite(key,x,y,w,h){const a=ART[key];const s=Math.min(w/a.w,h/a.h);return `<g transform="translate(${x+(w-a.w*s)/2} ${y+(h-a.h*s)/2}) scale(${s})" stroke="none"><path fill="white" d="${a.mask}"/><path fill="#19151e" stroke="#19151e" stroke-width=".4" stroke-linejoin="round" fill-rule="evenodd" d="${a.ink}"/></g>`;}
const trio=(y=535)=>sprite('pusheen',48,y,215,290)+sprite('kitty',294,y-70,212,350)+sprite('raspberry',537,y+25,222,258);
const confetti=()=>[[78,170],[706,150],[110,815],[682,838]].map(([x,y],i)=>i%2?heart(x,y,.65):star(x,y,.85)).join('');
function fence(){return Array.from({length:9},(_,i)=>path(`M${60+i*85} 560V373L${75+i*85} 352 ${90+i*85} 373V560`)).join('')+rect(43,398,714,24,2)+rect(43,471,714,24,2);}
function snowman(){return at(505,610,1,ellipse(0,60,116,137)+ellipse(0,-77,83,77)+rect(-83,-159,166,20,6)+rect(-62,-241,124,83,8)+path('M-62-185H62')+rect(-82,-4,164,32,8)+rect(34,16,30,92,4)+ellipse(-28,-91,6,7)+ellipse(28,-91,6,7)+path('M-3-75L48-58-4-48Z')+path('M-39-39Q0-12 39-39')+ellipse(-10,68,8,8)+ellipse(-10,118,8,8)+path('M-105 0L-172-68M-168-65L-190-61M-168-65L-174-87M105 0L171-56M167-54L190-51M167-54L177-78'));}
function umbrella(x,y,s=1){return at(x,y,s,path('M0 0V330M-155 0Q0-219 155 0Q103-24 52 0Q0-24-52 0Q-103-24-155 0ZM0-109Q-45-74-52 0M0-109Q45-74 52 0'));}
export function pageSvg(page){
 let body='';const k=page.scene;
 if(['claire','pusheen','kitty','raspberry'].includes(k)){
  body=cloud(155,128,.7)+cloud(655,116,.65)+confetti()+sprite(k,100,148,600,739)+heart(399,921,.8);
 }else if(k==='together'){
  body=path('M110 281A290 230 0 0 1 690 281M148 281A252 192 0 0 1 652 281M186 281A214 154 0 0 1 614 281')+cloud(124,296,.7)+cloud(677,296,.7)+sprite('together',48,370,704,515)+star(180,917,.8)+heart(400,922,.9)+star(621,917,.8);
 }else if(k==='pumpkins'){
  body=cloud(190,170,.9)+cloud(637,196,.7)+fence()+sprite('claire',285,222,237,473)+trio(594)+pumpkin(191,887,.82)+pumpkin(406,904,1)+pumpkin(637,900,.75)+star(392,127,.85);
 }else if(k==='snow'){
  body=[[110,150],[358,155],[681,159],[693,327],[85,395]].map(([x,y])=>snowflake(x,y,1.1)).join('')+path('M43 805Q180 770 325 807T757 808')+snowman()+sprite('claire',65,299,255,495)+sprite('pusheen',48,730,203,225)+sprite('kitty',289,735,163,220)+sprite('raspberry',526,764,217,185);
 }else if(k==='beach'){
  body=ellipse(635,156,54,54)+path('M570 156H550M700 156H720M635 90V69M635 222V244M589 108L574 93M681 108L696 93')+umbrella(220,317,.85)+path('M42 558Q165 531 288 558T534 558T758 558M43 880Q207 849 371 880T758 879')+sprite('claire',360,273,227,458)+trio(607)+ellipse(417,902,66,60)+path('M355 887Q417 932 479 887M399 845Q449 902 410 961');
 }else if(k==='halloween'){
  body=path('M586 115A88 88 0 1 0 702 231A90 90 0 0 1 586 115Z')+star(420,157,.8)+star(247,198,.7)+path('M65 595V324H247V595M46 324L155 221 265 324Z')+rect(111,447,78,150,30)+rect(107,350,49,49,2)+path('M132 350V399M107 375H156')+sprite('claire',300,270,219,436)+trio(604)+pumpkin(403,897,.9)+path('M381 875L372 891H390ZM427 875L418 891H436ZM376 912Q403 941 438 912Z');
 }else{
  body=path('M62 200Q400 301 738 200')+Array.from({length:7},(_,i)=>path(`M${86+i*96} ${221+(3-Math.abs(i-3))*10}l28 56 35-44Z`)).join('')+heart(400,379,1.7)+trio(532)+rect(90,880,620,39,16)+star(155,357,1)+star(668,382,1.1)+heart(676,739,.65)+heart(112,731,.5);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="white"/><g fill="white" stroke="#19151e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${rect(23,23,754,954,25)}${body}</g></svg>`;
}
