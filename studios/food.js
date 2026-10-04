/* Small reusable vector props and food; all SVG strings are built from validated choices. */
import {COLOURS} from './model.js';
const wrap=(s,box='0 0 200 200')=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+box+'" aria-hidden="true" focusable="false">'+s+'</svg>';
export function topping(kind,x=0,y=0,s=1){
 let art='';
 if(kind==='strawberry')art='<path d="M0 14C-28-5-10-21 0-10 13-23 29-3 0 14Z" fill="#e57391" stroke="#b2506c" stroke-width="1.5"/><path d="m-9-11 9 4 8-6" fill="none" stroke="#649c6f" stroke-width="4"/><g fill="#ffe3a2"><ellipse cx="-5" cy="0" rx="1" ry="2"/><ellipse cx="5" cy="1" rx="1" ry="2"/><ellipse cy="7" rx="1" ry="2"/></g>';
 if(kind==='blueberry')art='<circle r="12" fill="#8499d1" stroke="#6675a4" stroke-width="1.5"/><path d="m0-6 2 4 5 1-5 2-2 4-2-4-4-2 4-1Z" fill="#596a9b"/><circle cx="-5" cy="-5" r="3" fill="#b9caeb"/>';
 if(kind==='cherry')art='<path d="M0 0Q0-24 14-25" stroke="#738b63" stroke-width="3" fill="none"/><ellipse cy="5" rx="13" ry="12" fill="#dd7694" stroke="#b35876" stroke-width="1.5"/><ellipse cx="-5" cy="1" rx="3" ry="4" fill="#f8c5d5"/>';
 if(kind==='heart')art='<path d="M0 12C-31-5-9-23 0-9 10-23 31-5 0 12Z" fill="#f3adc9" stroke="#c984a4" stroke-width="1.5"/>';
 if(kind==='star')art='<path d="m0-15 5 10 12 2-9 9 2 12-10-6-11 6 3-12-9-9 12-2Z" fill="#f4cf76" stroke="#caaa54" stroke-width="1.5"/>';
 if(kind==='sprinkles')art=[[-11,-7,25],[-1,8,-30],[10,-6,65],[-13,7,0],[1,-8,-35],[12,9,40]].map(([a,b,r],i)=>'<rect x="-2" y="-5" width="4" height="10" rx="2" transform="translate('+a+' '+b+') rotate('+r+')" fill="'+['#e88faf','#b098d5','#f2ca70','#85bda2','#8bbada','#fff4cf'][i]+'"/>').join('');
 return '<g transform="translate('+x+' '+y+') scale('+s+')">'+art+'</g>';
}
export function food(type='cupcake',item={icing:null,toppings:[]}) {
 const icing=COLOURS[item.icing]||'#f7dfbf';let s='<ellipse cx="100" cy="178" rx="87" ry="12" fill="#d8c9d933"/><ellipse cx="100" cy="170" rx="88" ry="13" fill="#fff8f0" stroke="#e7d6cb" stroke-width="3"/>';
 if(type==='cupcake')s+='<path d="m46 102 13 64q40 16 80 0l15-64Z" fill="#c6aedf" stroke="#9878b1" stroke-width="3"/><path d="m64 117 8 39m17-37 4 41m18-41-2 41m22-43-7 39" stroke="#ead9f3" stroke-width="6"/><path d="M39 102q-9-22 21-27-5-21 20-22 12-42 31-14 27-5 29 29 28 1 24 31-28 27-65 8-28 17-60-5Z" fill="'+icing+'" stroke="#c59b8c" stroke-width="3"/>';
 if(type==='cookie')s+='<circle cx="100" cy="104" r="65" fill="#e8b77e" stroke="#ba8b62" stroke-width="3"/><circle cx="100" cy="104" r="55" fill="'+(item.icing?icing:'#f1c992')+'" stroke="'+(item.icing?'#c59b8c':'#e9b780')+'" stroke-width="2"/>'+(item.icing?'':[[64,75],[135,108],[89,141],[122,66],[61,118],[111,103]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="5" ry="4" fill="#a97558"/>').join(''));
 if(type==='cake')s+='<path d="M34 70h132v83q-60 28-132 0Z" fill="#edbf95" stroke="#bd9177" stroke-width="3"/><path d="M36 108q65 21 128 0v14q-65 20-128 0Z" fill="#fff0d8"/><path d="M34 69h132v22q-18 12-20 1-6-15-13 7-8 21-15-3-8-12-12 0-8 22-16 1-10-11-15 0-8 13-16-6-15 13-25 0Z" fill="'+icing+'" stroke="#c59b8c" stroke-width="2"/><ellipse cx="100" cy="69" rx="67" ry="25" fill="'+icing+'" stroke="#c59b8c" stroke-width="3"/>';
 s+=(item.toppings||[]).map((t,i)=>{const x=42+t.x*116,y=type==='cake'?47+t.y*46:type==='cupcake'?40+t.y*66:53+t.y*105;return topping(t.kind,x,y,.62);}).join('');return wrap(s);
}
export function prop(kind){
 if(kind in COLOURS)return wrap('<circle cx="100" cy="100" r="60" fill="'+COLOURS[kind]+'" stroke="#ab7e99" stroke-width="3"/>');
 if(['strawberry','blueberry','cherry','heart','star','sprinkles'].includes(kind))return wrap(topping(kind,40,42,1.8),'0 0 80 80');
 if(['cupcake','cookie','cake'].includes(kind))return food(kind);
 const art={
 flour:'<path d="M42 51q54 8 112 0l13 112q-65 23-137 0Z" fill="#fff0d7" stroke="#c2a084" stroke-width="4"/><path d="M43 49h112v25H42Z" fill="#d9b8d5"/><text x="98" y="125" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#8d6c70">FLOUR</text><path d="M100 139v24m0-9-13-9m13 3 12-12" stroke="#cdb16a" stroke-width="4"/>',
 milk:'<path d="m63 47 23-22h40l18 22v120H63Z" fill="#f8f9ee" stroke="#96b1c0" stroke-width="4"/><path d="M64 52h80v43H64Z" fill="#add5e3"/><path d="m86 26 1 25m0 0 26-12 28 11" fill="none" stroke="#9fbfc9" stroke-width="3"/><text x="103" y="132" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#739ba9">MILK</text>',
 egg:'<path d="M52 118C38 77 84 21 100 24c27 5 66 67 52 104-17 50-88 45-100-10Z" fill="#ffefd7" stroke="#c9a685" stroke-width="4"/><ellipse cx="83" cy="71" rx="10" ry="21" transform="rotate(22 83 71)" fill="#fffaf0"/>',
 butter:'<path d="m34 113 29-53h84l23 53Z" fill="#ffeaaa" stroke="#ceab66" stroke-width="4"/><path d="M35 113h136v43H35Z" fill="#ebc77f" stroke="#ceab66" stroke-width="4"/><path d="M51 105h104m-91-32h77" stroke="#fff2c5" stroke-width="7"/>',
 spoon:'<path d="m99 167 4-105" stroke="#b68869" stroke-width="12"/><ellipse cx="102" cy="47" rx="20" ry="33" fill="#d5af85" stroke="#b68869" stroke-width="3"/>',
 crown:'<path d="m38 143-15-71 49 29 31-65 30 65 49-28-15 70Z" fill="#f4d279" stroke="#c9a45e" stroke-width="4"/><path d="M42 152h122" stroke="#e4b166" stroke-width="9"/>'
 };return wrap(art[kind]||topping('heart',100,100,3));
}
export function bowl(ingredients,stirs){return wrap('<ellipse cx="150" cy="221" rx="111" ry="13" fill="#9e7fa626"/><path d="M32 100q4 132 118 132 114 0 118-132Z" fill="#c8b2df" stroke="#987cb2" stroke-width="4"/><ellipse cx="150" cy="100" rx="118" ry="34" fill="#fff4dc" stroke="#a98bc1" stroke-width="5"/>'+(ingredients.length?'<ellipse cx="150" cy="103" rx="98" ry="25" fill="'+(stirs?'#efd197':'#faf1dc')+'"/>':'')+ingredients.map((v,i)=>'<circle cx="'+(108+i*36)+'" cy="102" r="'+(stirs?4:15)+'" fill="'+(v==='egg'?'#efc067':v==='milk'?'#fffdfa':'#e3c894')+'"/>').join('')+'<g transform="rotate('+(stirs*48)+' 150 101)"><path d="M148 102 234 30" stroke="#b68a68" stroke-width="12" stroke-linecap="round"/><ellipse cx="151" cy="104" rx="14" ry="8" fill="#dab586"/></g><path d="M63 139q20 61 69 66" fill="none" stroke="#e8d9f0" stroke-width="12" stroke-linecap="round"/>','0 0 300 260');}
export function oven(inside='',baking=false){return wrap('<rect x="12" y="12" width="296" height="230" rx="23" fill="#d7b8c9" stroke="#997b92" stroke-width="4"/><rect x="28" y="30" width="265" height="34" rx="12" fill="#fdf0e9"/><circle cx="65" cy="46" r="9" fill="#c4a4d3"/><circle cx="257" cy="46" r="9" fill="#c4a4d3"/><text x="160" y="53" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#957085">LITTLE BAKERY</text><rect x="33" y="87" width="254" height="123" rx="15" fill="'+(baking?'#f6d39e':'#9b8b99')+'" stroke="#97798d" stroke-width="5"/><path d="M56 185h209m-203-83h196" stroke="#d9bdc9" stroke-width="5"/>'+inside+'<rect x="47" y="72" width="226" height="12" rx="6" fill="#ffecdf"/>','0 0 320 260');}
