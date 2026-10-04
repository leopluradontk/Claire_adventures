/* Treat Trail 1.0: scenery, surface palettes and outfit variants. No network assets. */
export const THEMES=Object.freeze({
  meadow:{sky:'#cae8ec',soil:'#daba8f',edge:'#71ae8e',top:'#9ccc9b',water:'#94cddd',shoe:'#a786ba',label:'PICNIC CLUB'},
  autumn:{sky:'#ffe5bb',soil:'#cfa376',edge:'#bf8d42',top:'#e5be70',water:'#8dbebf',shoe:'#aa6542',label:'PUMPKIN PARTY'},
  snow:{sky:'#dcebf8',soil:'#aebed6',edge:'#c8e3f1',top:'#fffdf9',water:'#a5cfdf',shoe:'#9176b3',label:'COCOA LODGE'},
  beach:{sky:'#bdece9',soil:'#ebcc98',edge:'#d3b175',top:'#ffe5ac',water:'#68c3cc',shoe:'#dd9a69',label:'BEACH CLUB'}
});
export const themeFor=id=>THEMES[id]||THEMES.meadow;
const TAU=Math.PI*2;
function ellipse(c,x,y,rx,ry,fill,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function box(c,x,y,w,h,fill,r=5){c.fillStyle=fill;c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);c.fill();}
function line(c,pts,color,w=3){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();}
function polygon(c,pts,fill){c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=fill;c.fill();}
function text(c,s,x,y,size=13,color='#755d50'){c.font=`700 ${size}px ui-rounded,system-ui,sans-serif`;c.textAlign='center';c.fillStyle=color;c.fillText(s,x,y);}
function pumpkin(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);for(let i=-1;i<=1;i++)ellipse(c,i*8,-10,11,13,['#df8c44','#f8b04f','#eaa14b'][i+1],'#ca803d');line(c,[[0,-23],[2,-31],[7,-32]],'#6c9165',4);c.restore();}
function pine(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);box(c,-6,-75,12,75,'#9c8490');for(let i=0;i<3;i++){const top=-180+i*43,w=31+i*12;polygon(c,[[0,top],[-w,top+66],[w,top+66]],'#86aca9');polygon(c,[[0,top],[-w*.72,top+46],[w*.72,top+46]],'#f4faff');}c.restore();}
function palm(c,x,y,s=1,t=0){c.save();c.translate(x,y);c.scale(s,s);line(c,[[0,0],[-5,-55],[3,-118],[12,-165]],'#b99a6c',12);for(let i=0;i<5;i++)line(c,[[-6,-i*27],[3,-i*27-4]],'#ddbf8e',3);
 c.translate(12,-170);c.rotate(Math.sin(t*.8+x)*.015);for(const side of [-1,1])for(let i=0;i<3;i++){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(side*(30+i*12),-50+i*16,side*(73+i*9),-24+i*29);c.quadraticCurveTo(side*(29+i*10),-10+i*12,0,0);c.fillStyle=i%2?'#81b9a0':'#619e8a';c.fill();}ellipse(c,3,2,9,10,'#aa8057');ellipse(c,-9,0,8,9,'#bb9464');c.restore();}
function autumnTree(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);line(c,[[0,0],[0,-95],[-20,-130]],'#ac805f',11);line(c,[[0,-50],[30,-102]],'#ac805f',7);for(const [dx,dy,r,col] of [[-29,-121,35,'#dc9960'],[32,-120,37,'#e6ad64'],[0,-159,45,'#f3c475'],[-13,-152,29,'#f6d28c']])ellipse(c,dx,dy,r,r,col);c.restore();}
function cloud(c,x,y){for(const [dx,dy,rx,ry] of [[0,0,42,12],[-15,-9,19,18],[13,-15,25,23]])ellipse(c,x+dx,y+dy,rx,ry,'#ffffffb3');}
export function drawBackdrop(c,id,view,camera,t,gentle=false){
 if(id==='meadow')return false;
 const colors=id==='autumn'?['#ffe2b1','#fff4d6']:id==='snow'?['#cddff3','#f3f8ff']:['#b9eceb','#fff5d7'];
 const sky=c.createLinearGradient(0,0,0,480);sky.addColorStop(0,colors[0]);sky.addColorStop(1,colors[1]);c.fillStyle=sky;c.fillRect(0,0,view,600);
 ellipse(c,view-105,92,43,43,id==='snow'?'#fff9e2':'#fff2bd');
 for(let i=-1;i<7;i++)cloud(c,i*290-(camera*.11%290),80+i%3*26);
 if(id==='snow'){
  for(let i=-1;i<6;i++){const x=i*350-(camera*.18%350);polygon(c,[[x-100,415],[x+135,158+i%2*40],[x+385,415]],i%2?'#c0cfe5':'#aebfda');polygon(c,[[x+135,158+i%2*40],[x+78,222+i%2*33],[x+115,211+i%2*34],[x+145,237+i%2*28],[x+188,219+i%2*30]],'#fcfdff');}
  for(let i=-1;i<8;i++)ellipse(c,i*320-(camera*.3%320),468,280,105,i%2?'#e7f0fa':'#d8e6f4');
  for(let i=-1;i<9;i++)pine(c,i*230-(camera*.43%230),459,.7+(i%3)*.14);
  if(!gentle)for(let i=0;i<30;i++){const x=((i*101+Math.sin(t*.7+i)*13-camera*.2)%view+view)%view,y=(i*71+t*(9+i%3*3))%420;ellipse(c,x,y,1.5+i%2,1.5+i%2,'#ffffffc2');}
 }else if(id==='autumn'){
  for(let i=-1;i<7;i++)ellipse(c,i*350-(camera*.2%350),457,285,150,i%2?'#efd59c':'#e8c08b');
  const bx=850-(camera*.3%1800);box(c,bx,315,115,115,'#c77d70',3);polygon(c,[[bx-12,316],[bx+57,251],[bx+127,316]],'#a96b68');box(c,bx+42,365,35,65,'#955f58');line(c,[[bx+5,320],[bx+110,320]],'#fae3bc',5);box(c,bx+48,294,22,26,'#efd4aa');
  for(let i=-1;i<10;i++)autumnTree(c,i*230-(camera*.45%230),460,.64+(i%3)*.16);
  if(!gentle)for(let i=0;i<14;i++){const x=((i*143+Math.sin(t+i)*25-camera*.2)%view+view)%view,y=(i*79+t*18)%415;c.save();c.translate(x,y);c.rotate(t*.6+i);ellipse(c,0,0,5,2.5,i%2?'#c8844d':'#e2aa55');c.restore();}
 }else{
  const sea=c.createLinearGradient(0,302,0,485);sea.addColorStop(0,'#a2dbd8');sea.addColorStop(1,'#76c5c8');c.fillStyle=sea;c.fillRect(0,302,view,210);
  for(let row=0;row<5;row++)for(let i=-1;i<12;i++){const x=i*170-((camera*.18+t*(gentle?0:4))%170),y=324+row*28;line(c,[[x,y],[x+52,y-2],[x+85,y]],'#d5f1e6',2);}
  ellipse(c,view*.64-camera*.04,319,83,11,'#d7d6a4');palm(c,view*.64-camera*.04,315,.35,t);
  for(let i=-1;i<7;i++)palm(c,i*360-(camera*.43%360),466,.84+(i%2)*.12,t);
  for(let i=0;i<3;i++){const x=190+i*310-(camera*.12%200),y=160+i*35;line(c,[[x-9,y],[x,y-5],[x+9,y]],'#719e9b',2);}
 }
 return true;
}
export function drawDressing(c,id,x,y,kind,t){
 if(id==='autumn'){if(kind%3===0)pumpkin(c,x,y,.7);else{line(c,[[x,y],[x+1,y-31]],'#a5a765',2);for(let i=0;i<3;i++)line(c,[[x,y-8-i*7],[x+(i%2?10:-10),y-18-i*6]],'#b7b074',3);}}
 else if(id==='snow'){if(kind%3===0){ellipse(c,x,y-8,11,10,'#f9fcff');ellipse(c,x,y-21,8,7,'#ffffff');ellipse(c,x-3,y-22,1,1,'#768ba6');ellipse(c,x+3,y-22,1,1,'#768ba6');line(c,[[x-6,y-16],[x+6,y-16]],'#db9cba',3);}else ellipse(c,x,y-2,14,4,'#ffffff');}
 else if(id==='beach'){if(kind%3===0){for(let i=0;i<5;i++){const a=i*TAU/5;line(c,[[x,y-3],[x+Math.cos(a)*8,y-3+Math.sin(a)*8]],'#e9a393',3);}}else{ellipse(c,x,y-2,6,4,'#fff3dc','#d8bca2');line(c,[[x,y-6],[x-1,y]],'#e1c7a8',1);}}
}
export function drawGoal(c,id,x,y,t){
 if(id==='meadow')return false;
 const theme=themeFor(id), snow=id==='snow', beach=id==='beach';
 const wall=snow?'#c9aac0':beach?'#c7e2d3':'#d39378',roof=snow?'#eeeefa':beach?'#e1c18b':'#b87767';
 box(c,x+8,y-158,182,160,wall,10);polygon(c,[[x-12,y-156],[x+98,y-228],[x+211,y-156]],roof);
 if(snow){box(c,x+8,y-166,184,13,'#ffffff',6);line(c,[[x+27,y-151],[x+27,y-137]],'#eef8ff',4);line(c,[[x+176,y-151],[x+176,y-133]],'#eef8ff',4);box(c,x+140,y-241,22,58,'#a790ab');}
 if(beach){for(let i=0;i<8;i++)line(c,[[x+11+i*22,y-153],[x+11+i*22,y-2]],'#a4c9b8',2);for(let i=0;i<8;i++)line(c,[[x+98,y-224],[x-8+i*30,y-158]],'#cfab70',2);}
 box(c,x+76,y-78,45,79,snow?'#9b809e':beach?'#8bbcab':'#a76853',16);
 for(const dx of [25,140]){box(c,x+dx,y-118,27,34,snow?'#fff0b9':'#e2f4ed',5);line(c,[[x+dx+13,y-117],[x+dx+13,y-86]],'#fff6e5',2);}
 box(c,x+22,y-177,156,27,'#fff7e6',8);text(c,theme.label,x+100,y-158,12);
 box(c,x-201,y-4,165,9,snow?'#cbb4e0':beach?'#c2e9df':'#edba87',3);
 box(c,x-150,y-27,42,27,'#b7926c',5);
 if(id==='autumn'){pumpkin(c,x-78,y,1.3);pumpkin(c,x+204,y,.75);}
 if(snow){box(c,x-78,y-24,17,22,'#efb6cd',4);ellipse(c,x-69,y-24,8,3,'#f7e4dc');line(c,[[x-75,y-33],[x-78,y-41],[x-74,y-48]],'#ffffffb3',2);}
 if(beach){line(c,[[x-188,y],[x-188,y-110]],'#be9e73',4);polygon(c,[[x-238,y-96],[x-188,y-132],[x-135,y-96]],'#eab0bf');box(c,x+192,y-46,35,46,'#eace9b',2);box(c,x+188,y-55,10,17,'#eace9b',1);box(c,x+211,y-55,10,17,'#eace9b',1);}
 text(c,'Finish!',x-72,y-82,17,snow?'#897093':'#946856');return true;
}
/* Preserve the existing friendly faces. Only clothing and accessories vary. */
export function dressSprite(kind,svg,id){
 let extra='';const recolor=(a,b)=>{svg=svg.split(a).join(b);};
 const scarf=(color,y=146)=>`<path d="M66 ${y} Q128 ${y+16} 192 ${y} L189 ${y+15} Q128 ${y+28} 70 ${y+15} Z" fill="${color}" stroke="#93677a" stroke-width="3"/><path d="M150 ${y+12}l-4 28 18-2 3-26" fill="${color}" stroke="#93677a" stroke-width="3"/>`;
 const cap=color=>`<path d="M70 54Q73 2 132 9Q182 11 188 55Z" fill="${color}" stroke="#886f8e" stroke-width="3"/><rect x="65" y="45" width="126" height="16" rx="8" fill="#fff5ef"/><circle cx="132" cy="10" r="9" fill="#fff4ef"/>`;
 const sunhat=color=>`<path d="M77 53L88 16Q127 1 170 17L181 53Z" fill="${color}" stroke="#bb9a69" stroke-width="3"/><ellipse cx="129" cy="55" rx="79" ry="12" fill="${color}" stroke="#bb9a69" stroke-width="3"/><path d="M82 42Q129 51 177 42" fill="none" stroke="#e49ead" stroke-width="10"/>`;
 if(kind==='claire'){
  if(id==='autumn'){
   recolor('#e5a1c4','#dc9960');recolor('#ad729f','#a16f52');recolor('#b595d7','#d88858');recolor('#8262a8','#a96948');recolor('#d9c5ee','#f2b573');
   extra='<path d="M60 122l-18 23 7 8 19-16m31-15 15 21-9 10-15-18" fill="#dc9960" stroke="#a16f52" stroke-width="2"/><path d="M65 128h28l10 36q-22 8-41 0Z" fill="#6d8ea4" stroke="#526e85" stroke-width="2"/><path d="M66 121v28m27-28v28" stroke="#6d8ea4" stroke-width="7"/><rect x="72" y="143" width="14" height="10" rx="3" fill="#9ab2be"/>';
  }else if(id==='snow'){
   recolor('#e5a1c4','#ad99ca');recolor('#ad729f','#806b9e');
   extra='<path d="M60 123l-18 22 7 10 20-17m28-15 17 20-8 13-17-20" fill="#ad99ca" stroke="#806b9e" stroke-width="3"/><path d="M58 128h43l13 36q-32 14-62 0Z" fill="#ad99ca" stroke="#806b9e" stroke-width="3"/><path d="M79 134v31m-25-2q27 11 57 0" stroke="#f9f4fb" stroke-width="6"/><path d="M48 124q34 16 66-2l-3 10q-35 17-62 1Z" fill="#eeaac6"/><path d="M94 132v21h13l-2-22" fill="#eeaac6"/><path d="M23 79Q11 20 64 19Q127 2 140 75" fill="none" stroke="#e8b4cf" stroke-width="10"/><ellipse cx="25" cy="78" rx="11" ry="16" fill="#f7d9e9" stroke="#bd91ad" stroke-width="3"/><ellipse cx="136" cy="77" rx="10" ry="16" fill="#f7d9e9" stroke="#bd91ad" stroke-width="3"/>';
  }else if(id==='beach'){
   recolor('#e5a1c4','#72b7ad');recolor('#ad729f','#4c948e');recolor('#b595d7','#edc374');recolor('#8262a8','#bd925c');recolor('#d9c5ee','#fff0b5');
   extra='<path d="M36 31Q78 0 127 26l2 13q-57-15-95 4Z" fill="#f4d89d" stroke="#c6a16b" stroke-width="2"/><path d="M27 40q47-22 111-2" fill="none" stroke="#efd49c" stroke-width="12"/><path d="M46 31q37-7 69 1" fill="none" stroke="#eaa6b6" stroke-width="6"/><g fill="#fff1ca"><circle cx="72" cy="145" r="4"/><circle cx="86" cy="155" r="4"/><circle cx="94" cy="140" r="4"/></g>';
  }
 }else{
  if(id==='meadow'){
   if(kind!=='kitty')extra='<path d="M89 151q-27-17-24 7t26 2q24 22 27 1t-26-8" fill="#c5a8db" stroke="#9b7faf" stroke-width="3"/><circle cx="91" cy="156" r="7" fill="#e0caee"/>';
  }else if(id==='autumn'){
   if(kind==='kitty')recolor('#efa4cb','#bf91b7');
   extra=scarf('#e4a15f',kind==='kitty'?167:147)+'<ellipse cx="128" cy="171" rx="12" ry="10" fill="#ffb955" stroke="#b97e45" stroke-width="2"/><path d="M128 161v-5" stroke="#738957" stroke-width="4"/>';
   if(kind==='raspberry')extra+='<path d="M104 50q23-19 49 0" fill="none" stroke="#e5a357" stroke-width="7"/><ellipse cx="145" cy="48" rx="12" ry="9" fill="#f3b567"/>';
  }else if(id==='snow'){
   const col=kind==='pusheen'?'#9fb4d2':kind==='kitty'?'#e4aac5':'#c7ace0';
   if(kind==='kitty')recolor('#efa4cb','#c9aee0');
   extra=scarf(col,kind==='kitty'?168:147)+cap(col);
  }else if(id==='beach'){
   if(kind==='kitty'){recolor('#efa4cb','#79c5be');extra=sunhat('#f5dfa9');}
   else if(kind==='pusheen'){extra='<path d="M55 157q70 22 148 0l-7 35q-60 14-134 0Z" fill="#8cc6c0" stroke="#609e99" stroke-width="3"/><path d="M61 172h132m-127 14h122" stroke="#ecf8e8" stroke-width="7"/>'+sunhat('#edcf95');}
   else extra='<path d="M67 151q66 26 126 0l-1 40q-62 18-125 0Z" fill="#f0b8c8" stroke="#c987a3" stroke-width="3"/><g fill="#fff6d1"><circle cx="91" cy="176" r="6"/><circle cx="127" cy="183" r="6"/><circle cx="164" cy="172" r="6"/></g><path d="M82 50q40-20 90 0" fill="none" stroke="#c3a377" stroke-width="9"/><ellipse cx="125" cy="47" rx="38" ry="9" fill="#f9dfb0"/>';
  }
 }
 return svg.replace('</svg>','<g stroke-linecap="round" stroke-linejoin="round">'+extra+'</g></svg>');
}
