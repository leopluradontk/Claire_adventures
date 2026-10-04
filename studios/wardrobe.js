/* Clothing is drawn inside each character's SVG, never as floating overlay images. */
import {CHARACTERS} from './characters.js';
import {COLOURS,cleanLook,StudioStore} from './model.js';
import {dressSprite} from '../treat-trail/themes.js?v=1.0.0';
const stroke='#87677d';
const g=body=>'<g stroke="'+stroke+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">'+body+'</g>';
function hat(type,c,a){
 if(type==='none')return '';
 if(type==='chef')return g('<path d="M76 54V26C45 20 54-12 85-7c10-29 59-31 74-3 36-9 59 26 27 37v27Z" transform="translate(0 28) scale(1 .62)" fill="#fffaf2"/><rect x="73" y="48" width="115" height="19" rx="6" fill="'+a+'"/>');
 if(type==='crown')return g('<path d="M75 59 64 19 105 38 130 6 157 38 195 18 183 60Z" fill="#f8d279"/><path d="M79 61h102" stroke="#dca84a" stroke-width="8"/><g fill="'+a+'"><circle cx="96" cy="48" r="5"/><circle cx="130" cy="39" r="7"/><circle cx="163" cy="48" r="5"/></g>');
 if(type==='sunhat')return g('<path d="M80 49 91 13Q128 0 169 14l12 35" fill="#f7dda3"/><ellipse cx="130" cy="52" rx="83" ry="13" fill="#f7dda3"/><path d="M86 38q42 15 91 0" fill="none" stroke="'+a+'" stroke-width="10"/>');
 if(type==='beanie')return g('<path d="M72 52Q75 1 130 7q57 0 61 45Z" fill="'+c+'"/><rect x="65" y="47" width="130" height="19" rx="7" fill="'+a+'"/><circle cx="130" cy="9" r="12" fill="#fff5ef"/>');
 if(type==='witch')return g('<path d="M72 58 134 0 180 60Z" fill="'+a+'"/><ellipse cx="129" cy="62" rx="83" ry="13" fill="'+a+'"/><path d="m91 42 76 5" stroke="'+c+'" stroke-width="12"/><rect x="121" y="39" width="19" height="13" rx="2" fill="#f6d17b"/>');
 return g('<path d="M158 50c-34-30-42 14-13 12 20 28 50-5 19-14Z" fill="'+a+'"/><circle cx="157" cy="53" r="8" fill="'+c+'"/>');
}
function apron(kind,c,a){
 if(kind==='claire')return g('<path d="M68 132h23l7 31q-17 10-34 0Z" fill="#fff6e6" stroke-width="2"/><path d="M66 142h31" stroke="'+a+'"/><path d="M74 149h15v10H74Z" fill="'+c+'" stroke-width="1"/>');
 const y=kind==='kitty'?176:149;
 return g('<path d="M100 '+y+'h55l19 '+(kind==='kitty'?21:44)+'q-44 13-88 0Z" fill="#fff7e8"/><path d="M105 '+(y+10)+'h48v19h-48Z" fill="'+c+'"/><path d="M97 '+(y+3)+'h64" stroke="'+a+'" stroke-width="5"/>');
}
function garment(kind,l){
 const c=COLOURS[l.colour],a=COLOURS[l.accent],style=l.style;let body='';
 if(kind==='claire'){
  if(['everyday','autumn'].includes(style))body='<path d="M60 127h41l7 39H56Z" fill="'+c+'"/><path d="M64 135h31l6 33H60Z" fill="#819eb7"/><path d="M69 128v12m22-12v12" stroke="#fce6b3" stroke-width="3"/>';
  if(['princess','royal','rainbow'].includes(style))body='<path d="M67 128h29l21 36q-32 17-66 0Z" fill="'+c+'"/><path d="M65 137 57 157l25-15 30 15-15-20" fill="'+a+'" stroke-width="1.5"/><path d="M66 135h31" stroke="#fff0d7" stroke-width="4"/>';
  if(style==='winter')body='<path d="M62 127h38l13 39q-30 13-59 0Z" fill="'+c+'"/><path d="M69 129h27m-14 0v40" stroke="#fff9ed" stroke-width="4"/><path d="M62 132 48 155m52-23 16 17" stroke="'+c+'" stroke-width="10"/>';
  if(style==='halloween')body='<path d="M65 128h31l18 39q-32-3-57 0Z" fill="'+a+'"/><path d="M66 133h31" stroke="'+c+'" stroke-width="4"/><path d="m82 145 3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" fill="#ffd575" stroke="none"/>';
  if(style==='beach')body='<path d="M67 128h29l17 36q-28 12-55 0Z" fill="'+c+'"/><g fill="#fff5d8" stroke="none"><circle cx="73" cy="146" r="4"/><circle cx="94" cy="158" r="4"/></g>';
 }else{
  const y=kind==='kitty'?175:149,bot=kind==='kitty'?200:195,wide=kind==='kitty'?38:68;
  if(style!=='default')body='<path d="M'+(130-wide)+' '+y+'q'+wide+' 17 '+(wide*2)+' 0l-5 '+(bot-y)+'q-'+(wide-5)+' 18 -'+(wide*2-10)+' 0Z" fill="'+c+'"/>';
  if(['princess','royal','rainbow'].includes(style))body+='<path d="M'+(130-wide)+' '+(bot-7)+'q'+wide+' 17 '+(wide*2)+' 0" fill="none" stroke="'+a+'" stroke-width="9"/><path d="M113 '+(y+6)+'q17 12 34 0" fill="none" stroke="#fff2d5" stroke-width="5"/>';
  if(['everyday','autumn'].includes(style))body+='<path d="M103 '+(y+8)+'h54v'+(bot-y-5)+'h-54Z" fill="#7f9fb9"/><path d="M104 '+y+'v18m52-18V'+y+'" stroke="#faf0da" stroke-width="5"/>';
  if(style==='winter')body+='<path d="M'+(130-wide)+' '+(y+8)+'h'+(wide*2)+'m-'+wide+' 0v'+(bot-y-8)+'" stroke="#fff5eb" stroke-width="8"/><path d="M165 '+(y+8)+'v30" stroke="'+a+'" stroke-width="14"/>';
  if(style==='beach')body+='<path d="M'+(137-wide)+' '+(y+14)+'h'+(wide*2-14)+'m-'+(wide*2-14)+' 13h'+(wide*2-14)+'" stroke="#fff9e6" stroke-width="7"/>';
  if(style==='halloween')body+='<path d="M113 '+(y+10)+'l14 5 16-5 4 13-20-4-16 4Z" fill="'+a+'"/><ellipse cx="128" cy="'+(y+26)+'" rx="10" ry="8" fill="#f5b363" stroke-width="1"/>';
 }
 if(style==='royal'||style==='rainbow'){
  const cx=kind==='claire'?82:129,yy=kind==='claire'?155:182,sz=kind==='claire'?4:7;
  body+='<path d="m'+cx+' '+(yy-sz)+' '+sz*.5+' '+sz*.7+' '+sz+' 0 -'+sz*.7+' '+sz*.6+' '+sz*.2+' '+sz+' -'+sz+' -'+sz*.5+' -'+sz*.7+' '+sz*.5+' '+sz*.2+' -'+sz+' -'+sz*.7+' -'+sz*.6+' '+sz+' 0Z" fill="#fff0ad" stroke="none"/>';
 }
 if(style==='rainbow'){
  const x=kind==='claire'?63:88,y=kind==='claire'?161:190,w=kind==='claire'?38:82;
  ['#eea1c0','#efd27a','#8ecaa8','#93b9dc'].forEach((col,i)=>body+='<path d="M'+x+' '+(y+i*2)+'q'+w/2+' 7 '+w+' 0" fill="none" stroke="'+col+'" stroke-width="2.5"/>');
 }
 return g(body);
}
export function outfitSVG(kind,raw,look,theme='meadow',context='',full=false){
 let svg=raw,extras='',behind='';let active=look?cleanLook(look):null;
 if(active&&theme==='snow'&&active.style!=='winter')active={...active,style:'winter',head:'beanie'};
 if(!active)svg=dressSprite(kind,svg,theme);
 else {
  const l=active,c=COLOURS[l.colour],a=COLOURS[l.accent];
  for(const [old,col] of [['#e5a1c4',c],['#efa4cb',c],['#b595d7',a],['#ed7fad',a],['#d9c5ee','#f1def4'],['#ffb4d3','#ffe0ef']])svg=svg.split(old).join(col);
  if(l.style==='halloween')behind=kind==='claire'?g('<path d="M62 119 29 164l34-8 20 13 30-8 16 5-28-47Z" fill="'+a+'"/>'):g('<path d="M67 139 29 207l56-15 53 13 58-13 36 11-41-64Z" fill="'+a+'"/>');
  extras+=garment(kind,l);
  if(l.style==='bakery')extras+=apron(kind,c,a);
  let head=l.head==='outfit'?({princess:'crown',royal:'crown',bakery:'chef',beach:'sunhat',winter:'beanie',halloween:'witch',rainbow:'bow'}[l.style]||'none'):l.head;
  if(context==='bakery')head='chef';
  const headSVG=hat(head,c,a);extras+=kind==='claire'?'<g transform="translate(4 0) scale(.59)">'+headSVG+'</g>':headSVG;
  if(kind==='kitty')extras+=g('<path d="M98 202q-17 0-18 10 1 7 22 4l5-13m45-1q18 0 19 10-1 7-22 4l-5-13" fill="'+COLOURS[l.shoes]+'" stroke-width="2"/>');
  if(l.glasses){const scale=kind==='claire'?'.56':'.99',x=kind==='claire'?9:0,y=kind==='claire'?20:0;extras+='<g transform="translate('+x+' '+y+') scale('+scale+')" fill="none" stroke="'+a+'" stroke-width="5"><ellipse cx="92" cy="111" rx="21" ry="16"/><ellipse cx="166" cy="111" rx="21" ry="16"/><path d="M113 110h32m-74 0H54m133 0h20"/></g>';}
  if(theme==='snow'&&l.style!=='winter')extras+=kind==='claire'?'<path d="M58 124q22 9 43 0" stroke="#b8c8e3" stroke-width="6" fill="none"/>':g('<path d="M69 '+(kind==='kitty'?170:144)+'q60 17 122 0" stroke="#b8c8e3" stroke-width="10" fill="none"/>');
 }
 if(context==='bakery'){
  extras+=apron(kind,COLOURS[active?.colour||'pink'],COLOURS[active?.accent||'purple']);
  if(!active){const h=hat('chef','#fff6ec','#d5bddf');extras+=kind==='claire'?'<g transform="translate(4 0) scale(.59)">'+h+'</g>':h;}
 }
 svg=svg.replace(/(<svg[^>]*>)/,'$1'+behind);
 svg=svg.replace('</svg>',extras+'</svg>');
 if(full&&kind==='claire'){
  const col=COLOURS[active?.shoes||'purple'];svg=svg.replace('viewBox="0 0 160 176"','viewBox="0 0 160 210"');
  const legs=g('<path d="M64 162v34h15v-34m9 0v34h15v-34" fill="#f6c9b0" stroke-width="2"/><path d="M61 189h20v13H58q-1-7 3-13Zm25 0h20l3 13H85Z" fill="'+col+'" stroke-width="2"/><path d="M62 194h15m12 0h14" stroke="#fff5e7" stroke-width="3"/>');
  svg=svg.replace(/(<svg[^>]*>)/,'$1'+legs);
 }
 return svg;
}
export function avatar(kind,look=null,{theme='meadow',context='',full=true}={}) {return outfitSVG(kind,CHARACTERS[kind],look,theme,context,full);}
export function savedLooks(){return new StudioStore().state().looks;}
