import {characterSVG} from './designs.js';
import {savedLooks} from '../studios/wardrobe.js';
import {COLS,ROWS} from './snake-model.js';
export class SnakeRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.art={};}
 async load(){const looks=savedLooks();await Promise.all(['claire','pusheen','kitty','raspberry'].map(k=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{this.art[k]=img;resolve();};img.onerror=reject;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(characterSVG(k,looks[k]));})));}
 resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.dpr=dpr;this.w=r.width;this.h=r.height;this.cell=Math.min(r.width/COLS,r.height/ROWS);this.x=(r.width-this.cell*COLS)/2;this.y=(r.height-this.cell*ROWS)/2;}
 draw(game,t=0){
 const c=this.ctx,s=this.cell;if(!s)return;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);c.fillStyle='#f5f2e9';c.fillRect(0,0,this.w,this.h);c.translate(this.x,this.y);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){c.fillStyle=(x+y)%2?'#e5f1de':'#f0f6e9';c.fillRect(x*s,y*s,s,s);}
 c.strokeStyle=game.mode.wrap?'#75bfa5':'#bd8f83';c.lineWidth=4;c.strokeRect(2,2,COLS*s-4,ROWS*s-4);
 for(const p of game.blocks){const x=p.x*s,y=p.y*s;c.fillStyle='#c6a1c2';c.beginPath();c.roundRect(x+2,y+2,s-4,s-4,s*.13);c.fill();c.fillStyle='#795779';c.font=`bold ${s*.55}px sans-serif`;c.textAlign='center';c.fillText('\u273f',x+s/2,y+s*.72);}
 for(let i=game.body.length-1;i>=0;i--){const p=game.body[i];this.portrait(p.kind,p.x*s,p.y*s,s,i===0);}
 if(game.food){const p=game.food,x=p.x*s,y=p.y*s;c.fillStyle='#fff5cb';c.beginPath();c.roundRect(x+1,y+1,s-2,s-2,s*.22);c.fill();c.strokeStyle='#d0a457';c.lineWidth=2;c.stroke();this.portrait(p.kind,x,y,s,false);c.fillStyle='#b78635';c.font=`bold ${Math.max(9,s*.25)}px sans-serif`;c.fillText('+',x+s*.83,y+s*.26);}
 const head=game.body[0],dx={up:0,right:1,down:0,left:-1}[game.queue[0]||game.dir],dy={up:-1,right:0,down:1,left:0}[game.queue[0]||game.dir];
 c.fillStyle='#806594';c.beginPath();const hx=(head.x+.5)*s+dx*s*.46,hy=(head.y+.5)*s+dy*s*.46;c.moveTo(hx+dx*s*.14,hy+dy*s*.14);c.lineTo(hx-dy*s*.09,hy+dx*s*.09);c.lineTo(hx+dy*s*.09,hy-dx*s*.09);c.closePath();c.fill();
 }
 portrait(kind,x,y,s,head){const c=this.ctx,img=this.art[kind];c.fillStyle=head?'#f6d7e7':'#ffffff80';c.beginPath();c.roundRect(x+1,y+1,s-2,s-2,s*.25);c.fill();if(img){const r=Math.min((s-3)/img.width,(s-3)/img.height);c.drawImage(img,x+(s-img.width*r)/2,y+(s-img.height*r)/2,img.width*r,img.height*r);}}
}
