import {outfitSVG,savedLooks} from '../studios/wardrobe.js';
import {COLOURS} from '../studios/model.js';
import {THEMES,themeFor,drawBackdrop,drawDressing,drawGoal,dressSprite} from './themes.js?v=1.0.0';
/* Canvas scenery and vector characters. No image downloads or external libraries. */
const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const art={};
let chosenLooks={};
function ellipse(c,x,y,rx,ry,fill,stroke) {c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function box(c,x,y,w,h,r,fill,stroke) {c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else{r=Math.min(r,w/2,h/2);c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);}c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function line(c,pts,color,width=2) {c.beginPath();c.moveTo(...pts[0]);pts.slice(1).forEach(p=>c.lineTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function heart(c,x,y,size,color) {c.save();c.translate(x,y);c.scale(size/20,size/20);c.beginPath();c.moveTo(0,7);c.bezierCurveTo(-25,-9,-5,-22,0,-10);c.bezierCurveTo(5,-22,25,-9,0,7);c.fillStyle=color;c.fill();c.restore();}
function label(c,t,x,y,size=15,color='#466759') {c.font=`700 ${size}px ui-rounded, system-ui, sans-serif`;c.textAlign='center';c.fillStyle=color;c.fillText(t,x,y);}
function cloud(c,x,y,s) {c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,0,42,15,'#ffffffb8');ellipse(c,-17,-10,22,20,'#ffffffb8');ellipse(c,12,-17,27,24,'#ffffffb8');c.restore();}
function tree(c,x,y,s,kind=0) {
 c.save();c.translate(x,y);c.scale(s,s);
 box(c,-7,-112,14,114,6,'#af8870');line(c,[[0,-30],[-29,-62]],'#af8870',9);line(c,[[0,-62],[26,-91]],'#af8870',7);
 const color=kind?'#b3ceb1':'#85bca0';
 ellipse(c,-28,-110,37,45,color);ellipse(c,27,-123,38,43,color);ellipse(c,0,-157,44,48,kind?'#c6dab7':'#a2ceb2');
 ellipse(c,11,-158,27,28,kind?'#d6e3c6':'#b6dcc0');
 for(let i=0;i<4;i++) ellipse(c,-30+i*19,-118+(i%2)*13,4,5,'#f6d293');
 c.restore();
}
export function drawTreat(c,type,x,y,scale=1) {
 c.save();c.translate(x,y);c.scale(scale,scale);
 if(type==='cookie') {
  ellipse(c,0,0,13,13,'#edbe7f','#a8754c');ellipse(c,-4,-5,7,4,'#f8d6a1');
  for(const p of [[-5,-4],[5,-6],[6,4],[-5,5],[0,1]])ellipse(c,...p,2,2,'#8e5a49');
 } else if(type==='berry') {
  c.beginPath();c.moveTo(0,14);c.bezierCurveTo(-26,-3,-11,-20,0,-9);c.bezierCurveTo(13,-20,22,-2,0,14);c.fillStyle='#ec7a9a';c.fill();c.strokeStyle='#bc547d';c.lineWidth=1.6;c.stroke();
  line(c,[[-8,-10],[0,-6],[7,-12]],'#57976d',4);
  for(const p of [[-6,-3],[5,0],[-1,7]])ellipse(c,...p,1.1,1.8,'#ffe6bd');
 } else {
  box(c,-10,0,20,15,4,'#b4a3d4','#8f79ac');line(c,[[-4,4],[-3,12]],'#e2d7f4',2);line(c,[[4,4],[3,12]],'#e2d7f4',2);
  ellipse(c,0,-1,14,7,'#ffc9dd','#c986a5');ellipse(c,0,-9,8,8,'#ffd9e5');ellipse(c,1,-16,3,3,'#d86593');
 }
 c.restore();
}
export class TrailRenderer {
 constructor(canvas) { this.canvas=canvas;this.ctx=canvas.getContext('2d');this.camera=0;this.view=1000;this.scale=1; }
 resize() {
  const r=this.canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);
  this.cssW=r.width;this.cssH=r.height;this.dpr=dpr;
  this.view=clamp(r.width/r.height*600,720,1320);this.scale=Math.min(r.width/this.view,r.height/600);
  this.ox=(r.width-this.view*this.scale)/2;this.oy=(r.height-600*this.scale)/2;
 }
 draw(game,dt=0) {
  const c=this.ctx,p=game.player,l=game.level,t=game.time;
  this.theme=l.theme||'meadow';const palette=themeFor(this.theme);this.palette=palette;
  const wanted=clamp(p.x-this.view*.5,0,l.width-this.view);
  if(Math.abs(wanted-this.camera)>this.view*.7)this.camera=wanted;
  else this.camera+=(wanted-this.camera)*(1-Math.exp(-8*(dt||.016)));
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.cssW,this.cssH);c.fillStyle=palette.sky;c.fillRect(0,0,this.cssW,this.cssH);c.fillStyle=palette.soil;c.fillRect(0,this.oy+600*this.scale,this.cssW,this.cssH);
  c.translate(this.ox,this.oy);c.scale(this.scale,this.scale);
  c.save();c.beginPath();c.rect(0,0,this.view,600);c.clip();
  if(!drawBackdrop(c,this.theme,this.view,this.camera,t,this.gentle)){
  const sky=c.createLinearGradient(0,0,0,480);sky.addColorStop(0,'#cae8ec');sky.addColorStop(.7,'#eff6dd');sky.addColorStop(1,'#fbf3d6');c.fillStyle=sky;c.fillRect(0,0,this.view,600);
  ellipse(c,this.view-118,98,50,50,'#fff0b3');ellipse(c,this.view-118,98,37,37,'#fff7d1');
  for(let i=-1;i<8;i++)cloud(c,i*330-((this.camera*.12)%330),98+(i%3)*27,.9+(i%2)*.2);
  for(let i=-1;i<7;i++){ellipse(c,i*500-((this.camera*.18)%500),437,370,172,'#bed7c0');ellipse(c,i*560+155-((this.camera*.3)%560),473,360,150,'#a3c9ae');}
  for(let i=-1;i<11;i++)tree(c,i*255-((this.camera*.45)%255),449,.82+(i%2)*.18,i%2);
  // A few distant birds and butterflies keep the sky lively, without distracting.
  for(let i=0;i<3;i++){const bx=150+i*335-((this.camera*.2)%220),by=200+i*24;line(c,[[bx-7,by],[bx,by-4],[bx+7,by]],'#9dbeb2',2);}
  }
  c.save();c.translate(-this.camera,0);
  // Rippling water stays below the safe grassy banks.
  box(c,0,480,l.width,120,0,palette.water);
  for(let x=Math.floor(this.camera/85)*85;x<this.camera+this.view;x+=85)line(c,[[x+Math.sin(t*1.7)*4,504],[x+32,504]],'#cfeef1',3);
  for(const s of l.ground) this.surface(c,s,true);
  for(const s of l.platforms) this.surface(c,s,false);
  // Foreground flowers and leaves are placed deterministically, only on the banks.
  for(const s of l.ground)for(let x=s.x+22;x<s.x+s.w-15;x+=89){if(x<this.camera-80||x>this.camera+this.view+80)continue;this.flower(c,x,s.y-5,((x/89)|0)%3,t);}
  for(const sign of l.signs) {
    if(sign.x<this.camera-160||sign.x>this.camera+this.view+160)continue;
    box(c,sign.x-4,413,8,48,3,'#c29b75');box(c,sign.x-87,386,174,32,8,'#fff8de','#d7bd92');label(c,sign.text,sign.x,407,12,'#866c56');
  }
  l.checkpoints.forEach((f,i)=>{
    box(c,f.x-3,365,6,96,3,'#9f8e73');
    c.beginPath();c.moveTo(f.x+3,366);c.quadraticCurveTo(f.x+28,356+Math.sin(t*2)*3,f.x+57,367);c.lineTo(f.x+49,397);c.quadraticCurveTo(f.x+24,388,f.x+3,397);c.closePath();c.fillStyle=i<=game.checkpointIndex?'#de96bc':'#fff8dc';c.fill();
    heart(c,f.x+26,383,10,i<=game.checkpointIndex?'#fff6fa':'#d19aae');
  });
  this.picnic(c,l.goal.x+52,460,t);
  l.treats.forEach(([x,y,type],i)=>{
    if(game.collected.has(i)||x<this.camera-50||x>this.camera+this.view+50)return;
    ellipse(c,x,y,19,19,'#fffbe950');drawTreat(c,type,x,y+Math.sin(t*3+i)*3);
    if(i%4===0){label(c,'\u2726',x+17,y-17,12,'#fffaf0');}
  });
  for(let i=2;i>=0;i--)this.character(c,['pusheen','kitty','raspberry'][i],game.friends[i],t,Math.abs(p.vx)>15);
  this.character(c,'claire',p,t,Math.abs(p.vx)>15);
  for(const q of game.particles) {
    c.globalAlpha=Math.max(0,q.life);
    if(q.kind==='heart')heart(c,q.x,q.y,8,'#ec86ae');else{ellipse(c,q.x,q.y,3.5,3.5,'#fff7ad');label(c,'\u2726',q.x,q.y+5,16,'#e8a15f');}
  }c.globalAlpha=1;
  c.restore();
  // Soft lower-edge vignette and a trail name in the soil, not across the play area.
  const fog=c.createLinearGradient(0,535,0,600);fog.addColorStop(0,'#fff5e300');fog.addColorStop(1,'#fff5e370');c.fillStyle=fog;c.fillRect(0,535,this.view,65);
  c.restore();
 }
 surface(c,s,ground) {
  if(s.x+s.w<this.camera-50||s.x>this.camera+this.view+50)return;
  const bottom=ground?625:s.y+34, palette=this.palette||themeFor('meadow');
  box(c,s.x,s.y,s.w,bottom-s.y,ground?12:11,ground?palette.soil:(this.theme==='snow'?'#c7d9ed':this.theme==='autumn'?'#dbb778':this.theme==='beach'?'#ccac81':'#d7b789'));
  if(!ground)box(c,s.x+7,s.y+22,s.w-14,14,7,'#bf9d73');
  box(c,s.x-2,s.y-2,s.w+4,14,7,palette.edge);box(c,s.x,s.y-4,s.w,7,4,palette.top);
  c.fillStyle='#bf9f77';for(let x=Math.max(s.x+12,Math.floor(this.camera/37)*37);x<s.x+s.w-6&&x<this.camera+this.view+30;x+=37){ellipse(c,x,s.y+27,3,2,'#c6a477');if(ground){ellipse(c,x+15,s.y+64,4,2,'#c6a477');ellipse(c,x-8,s.y+111,3,2,'#c6a477');}}
 }
 flower(c,x,y,kind,t) {
  if(this.theme!=='meadow'){drawDressing(c,this.theme,x,y,kind,t);return;}
  const shift=Math.sin(t*1.4+x)*1.6;
  line(c,[[x,y],[x+shift,y-15]],'#78a27b',2);ellipse(c,x-4,y-6,5,2,'#9db987');
  for(let i=0;i<5;i++)ellipse(c,x+shift+Math.cos(i*TAU/5)*4,y-17+Math.sin(i*TAU/5)*4,3.5,3.5,['#f8d4de','#fff3c9','#dfcce8'][kind]);
  ellipse(c,x+shift,y-17,2.5,2.5,'#e7bd6c');
 }
 picnic(c,x,y,t) {
  if(drawGoal(c,this.theme,x,y,t))return;
  // The finish cottage and picnic blanket.
  box(c,x+8,y-168,182,169,14,'#fff4db','#c4a082');
  c.beginPath();c.moveTo(x-12,y-165);c.lineTo(x+99,y-246);c.lineTo(x+211,y-165);c.closePath();c.fillStyle='#d9a4ac';c.fill();c.strokeStyle='#af808c';c.lineWidth=3;c.stroke();
  box(c,x+75,y-83,48,85,21,'#a2c1b6','#719d8f');ellipse(c,x+112,y-36,3,3,'#fff1c9');
  for(const dx of [26,139]){box(c,x+dx,y-132,28,36,7,'#c3e1de','#a6bfb0');line(c,[[x+dx+14,y-130],[x+dx+14,y-99]],'#fff8e5',3);}
  box(c,x+40,y-181,120,27,8,'#fff8e6');label(c,'PICNIC CLUB',x+100,y-162,13,'#88656e');
  box(c,x-200,y-4,160,9,4,'#f0bdd1');
  for(let dx=0;dx<8;dx++)box(c,x-196+dx*19,y-4,9,9,1,'#ffecf3');
  box(c,x-163,y-31,43,28,6,'#c39668','#a17859');line(c,[[x-157,y-30],[x-153,y-43],[x-129,y-43],[x-125,y-30]],'#a17859',3);
  drawTreat(c,'cookie',x-87,y-16,.8);heart(c,x-65,y-114+Math.sin(t*2)*4,21,'#e09ebc');
  label(c,'Finish!',x-65,y-80,17,'#886375');
 }
 character(c,kind,p,t,moving) {
  c.save();c.translate(p.x,p.y);
  ellipse(c,0,2,kind==='claire'?21:26,5,'#716f5924');
  const bob=p.grounded&&moving?Math.abs(Math.sin(t*12+(kind==='claire'?0:1)))*3:Math.sin(t*2)*.6;
  c.translate(0,-bob);c.scale(p.dir<0?-1:1,1);
  if(kind==='claire') {
    const swing=p.grounded&&moving?Math.sin(t*13)*.55:(!p.grounded ? .38 : 0);
    for(const [side,a] of [[-1,swing],[1,-swing]]){
      c.save();c.translate(side*7,-20);c.rotate(a);box(c,-4,0,8,15,4,this.theme==='snow'?'#9993ba':this.theme==='autumn'?'#7797ad':'#f2c5af');box(c,-5,11,13,9,4,(chosenLooks.claire?COLOURS[chosenLooks.claire.shoes]:(this.palette||THEMES.meadow).shoe),'#6e5985');box(c,-4,12,11,3,1,'#ded0eb');c.restore();
    }
    const sprite=art['claire-'+this.theme]||art.claire;if(sprite)c.drawImage(sprite,-39,-99,78,86);
  } else {
    const s=p.grounded&&moving?1+Math.sin(t*13)*.025:1;
    c.scale(1/s,s); const sprite=art[kind+'-'+this.theme]||art[kind];if(sprite)c.drawImage(sprite,-33,-57,66,57);
  }
  c.restore();
 }
}

const SPRITES = {"pusheen":"<svg viewBox=\"0 0 260 225\" xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\"> <g stroke=\"#73616a\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"> <g class=\"tail\"><path d=\"M202 176c41 10 47-26 27-32-11-3-11 13-22 5\" fill=\"#b8afaf\"></path><path d=\"m226 144-2 16m8 6-15-3\" fill=\"none\" stroke-width=\"8\"></path></g> <path d=\"M47 99 50 48q4-17 27 6c34-13 68-14 99-1q24-23 30-6l5 54c30 43 27 91-14 102H66C24 191 22 147 47 99Z\" fill=\"#c5bebe\"></path> <g stroke=\"none\" fill=\"#928489\"><path d=\"m103 48 3 23q9 10 15-1l-1-27Z\"></path><path d=\"m133 43 1 24q8 12 15 0l-1-22Z\"></path><path d=\"M36 122h20q9 6 0 12H31Zm-5 27h20q9 6 0 12H29Z\"></path></g> <path d=\"m53 69 1-13 12 8m118-1 12-8 4 14\" stroke=\"none\" fill=\"#e5b1bd\"></path> <g class=\"eyes\" fill=\"#4d3a43\" stroke=\"none\"><ellipse cx=\"93\" cy=\"109\" rx=\"6\" ry=\"7\"></ellipse><ellipse cx=\"164\" cy=\"109\" rx=\"6\" ry=\"7\"></ellipse></g> <g class=\"cheeks\" fill=\"#eda6b7\" stroke=\"none\" opacity=\".65\"><ellipse cx=\"73\" cy=\"126\" rx=\"13\" ry=\"7\"></ellipse><ellipse cx=\"183\" cy=\"126\" rx=\"13\" ry=\"7\"></ellipse></g> <path class=\"mouth\" d=\"m121 117 7 4 7-4m-7 4v5q-10 12-18 0m18 0q10 12 18 0\" fill=\"none\" stroke=\"#614853\" stroke-width=\"3\"></path> <path d=\"m51 113-24-4m24 15-26 2m183-12 24-4m-24 15 24 2\" fill=\"none\"></path> <path d=\"M76 191q-3 17 15 14m73-14q3 17-15 14\" fill=\"#c5bebe\"></path> <path d=\"M100 155q10 10 17 1m28 0q11 9 18-1\" fill=\"none\" stroke=\"#94868b\"></path> </g> </svg> ","kitty":"<svg viewBox=\"0 0 260 225\" xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\"> <g stroke=\"#685261\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"> <path d=\"M91 158q-15 11-14 25 14 9 30-2m62-23q15 11 14 25-14 9-30-2\" fill=\"#fffdfb\"></path> <path d=\"M100 161q-7 23-17 35 39 21 89 0-13-19-16-35\" fill=\"#efa4cb\"></path> <path d=\"M98 198q-19 0-20 13 1 9 26 6l6-17m41-2q20 0 21 13-1 9-26 6l-5-17\" fill=\"#fffdfb\"></path> <g class=\"wave-arm\"><path d=\"M168 176q13 9 20-2l-1-13q-11-12-16-1Z\" fill=\"#fffdfb\"></path></g> <path d=\"M56 79 54 36q5-13 35 10 32-7 66 0 34-25 39-10l3 44c33 23 31 76-15 89-27 9-88 9-116-2-49-17-42-66-10-88Z\" fill=\"#fffdfb\"></path> <g class=\"eyes\" fill=\"#403640\" stroke=\"none\"><ellipse cx=\"93\" cy=\"116\" rx=\"5.5\" ry=\"8\"></ellipse><ellipse cx=\"158\" cy=\"116\" rx=\"5.5\" ry=\"8\"></ellipse></g> <ellipse cx=\"126\" cy=\"135\" rx=\"8\" ry=\"6\" fill=\"#f8cf62\" stroke-width=\"2\"></ellipse> <g class=\"cheeks\" fill=\"#f8c5d8\" stroke=\"none\" opacity=\".5\"><ellipse cx=\"73\" cy=\"140\" rx=\"12\" ry=\"6\"></ellipse><ellipse cx=\"178\" cy=\"140\" rx=\"12\" ry=\"6\"></ellipse></g> <path d=\"m58 112-29-7m26 24-30 1m34 15-26 8m162-41 26-7m-24 24 29 1m-31 15 25 8\" fill=\"none\"></path> <g fill=\"#ed7fad\" stroke=\"#a6507c\"><path d=\"M172 57q-33-41-40-5t33 17q14 34 30 7t-18-20Z\"></path><ellipse cx=\"170\" cy=\"60\" rx=\"11\" ry=\"12\" fill=\"#ffb4d3\"></ellipse></g> <path d=\"M123 181c-12-11-21 4 5 16 26-12 17-27 5-16Z\" fill=\"#fff2f8\" stroke=\"none\"></path> </g> </svg> ","raspberry":"<svg viewBox=\"0 0 260 225\" xmlns=\"http://www.w3.org/2000/svg\" focusable=\"false\"> <g stroke=\"#b87991\" stroke-width=\"3.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"> <path d=\"M182 185q41 16 46-7 0-18-29-20\" fill=\"#f8ccda\"></path> <g class=\"gill gill-left\" fill=\"#f3a9c2\"><path d=\"M67 107C27 98 20 64 35 61S69 82 73 95Z\"></path><path d=\"M63 131c-50-3-56-30-39-34s43 13 45 23Z\"></path><path d=\"M65 148c-43 26-60-3-43-14s36-4 43 5Z\"></path></g> <g class=\"gill gill-right\" fill=\"#f3a9c2\"><path d=\"M193 107c40-9 47-43 32-46s-34 21-38 34Z\"></path><path d=\"M197 131c50-3 56-30 39-34s-43 13-45 23Z\"></path><path d=\"M195 148c43 26 60-3 43-14s-36-4-43 5Z\"></path></g> <path d=\"M63 91q8-47 66-48 59 0 67 47c19 51 16 104-27 111H91C42 198 40 139 63 91Z\" fill=\"#ffe5e9\"></path> <path d=\"M79 188q-18 1-15 16 6 11 24 3m91-19q18 1 15 16-6 11-24 3\" fill=\"#f8cfdb\"></path> <g class=\"eyes\" fill=\"#4d3943\" stroke=\"none\"><ellipse cx=\"91\" cy=\"113\" rx=\"6\" ry=\"7\"></ellipse><ellipse cx=\"166\" cy=\"113\" rx=\"6\" ry=\"7\"></ellipse></g> <g class=\"cheeks\" fill=\"#f5b3c9\" stroke=\"none\" opacity=\".7\"><ellipse cx=\"75\" cy=\"130\" rx=\"13\" ry=\"7\"></ellipse><ellipse cx=\"182\" cy=\"130\" rx=\"13\" ry=\"7\"></ellipse></g> <path class=\"mouth\" d=\"M117 126q11 17 23 0\" fill=\"none\" stroke=\"#7f5267\" stroke-width=\"3\"></path> <path d=\"M101 162q-8 12 4 15m50-15q8 12-4 15\" fill=\"none\"></path> <ellipse cx=\"128\" cy=\"171\" rx=\"20\" ry=\"13\" fill=\"#fff1f2\" stroke=\"none\"></ellipse> </g> </svg> ","claire":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 160 176\"><g stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M26 115C2 84 15 33 50 26 75 4 130 24 139 63c18 33 5 80-17 90H35Z\" fill=\"#845339\" stroke=\"#684335\" stroke-width=\"3\"/><g fill=\"#9c6240\" stroke=\"#724837\" stroke-width=\"3\"><circle cx=\"28\" cy=\"80\" r=\"14\"/><circle cx=\"22\" cy=\"103\" r=\"14\"/><circle cx=\"32\" cy=\"126\" r=\"15\"/><circle cx=\"24\" cy=\"143\" r=\"12\"/><circle cx=\"130\" cy=\"93\" r=\"14\"/><circle cx=\"137\" cy=\"116\" r=\"13\"/><circle cx=\"130\" cy=\"139\" r=\"13\"/></g><path d=\"m59 119-22 28 12 10 17-18m36-20 22 22-10 13-20-15\" fill=\"#f6c9b0\" stroke=\"#b78272\" stroke-width=\"2\"/><path d=\"M60 116h39l15 44q-30 15-61 0Z\" fill=\"#e5a1c4\" stroke=\"#ad729f\" stroke-width=\"3\"/><path d=\"m65 122 11 10 10-10 10 10 6-12\" fill=\"#fff4e9\"/><path d=\"m72 144 7-5 7 5-7 9Z\" fill=\"#fff4e9\"/><ellipse cx=\"80\" cy=\"81\" rx=\"47\" ry=\"46\" fill=\"#f8d2b8\" stroke=\"#b38267\" stroke-width=\"2\"/><path d=\"M31 74c-5-43 43-57 61-45 33-10 41 23 39 45-17-8-28-18-36-30-13 23-36 28-64 30Z\" fill=\"#925a3b\" stroke=\"#684335\" stroke-width=\"3\"/><path d=\"M40 51Q59 27 82 34M104 36q15 6 18 21\" fill=\"none\" stroke=\"#b98251\" stroke-width=\"5\"/><ellipse cx=\"63\" cy=\"83\" rx=\"10\" ry=\"14\" fill=\"#4c342f\"/><ellipse cx=\"102\" cy=\"82\" rx=\"10\" ry=\"14\" fill=\"#4c342f\"/><ellipse cx=\"66\" cy=\"79\" rx=\"4\" ry=\"5\" fill=\"#fffaf1\"/><ellipse cx=\"105\" cy=\"78\" rx=\"4\" ry=\"5\" fill=\"#fffaf1\"/><ellipse cx=\"49\" cy=\"98\" rx=\"9\" ry=\"5\" fill=\"#edaaa7\"/><ellipse cx=\"118\" cy=\"97\" rx=\"9\" ry=\"5\" fill=\"#edaaa7\"/><path d=\"M73 103q11 17 23-1\" fill=\"#a25350\" stroke=\"#874340\" stroke-width=\"2\"/><path d=\"M79 111q7-6 13-1\" fill=\"#e28d98\"/><g fill=\"#b595d7\" stroke=\"#8262a8\" stroke-width=\"2\"><path d=\"M41 35C8 7 14 62 41 46 56 76 80 28 47 35Z\"/><ellipse cx=\"44\" cy=\"40\" rx=\"8\" ry=\"9\" fill=\"#d9c5ee\"/></g></g></svg>"};
export async function loadArt() {
 chosenLooks=savedLooks();
 const jobs=[];
 for(const [name,svg] of Object.entries(SPRITES))for(const theme of Object.keys(THEMES)){
  jobs.push(new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{art[name+'-'+theme]=image;if(theme==='meadow')art[name]=image;resolve();};image.onerror=()=>reject(new Error('Character art could not load'));image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(outfitSVG(name,svg,chosenLooks[name],theme));}));
 }
 await Promise.all(jobs);
}

// Refresh dressed sprites on a back-forward cache restore without resetting the run.
if(typeof window!=='undefined'){window.addEventListener('pageshow',e=>{if(e.persisted)loadArt().catch(console.warn);});window.addEventListener('storage',e=>{if(e.key==='claire-stuffy-studios:v1')loadArt().catch(console.warn);});}
