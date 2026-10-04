/* One logical tile per tick; fixed obstacle layouts; no mid-round rule changes. */
export const COLS=20,ROWS=14;
export const MODES=[
 {id:'beginner',name:'Beginner',ms:480,min:480,wrap:true,tail:false,target:5,blocks:0,rate:0},
 {id:'easy',name:'Easy',ms:350,min:350,wrap:true,tail:true,target:8,blocks:0,rate:0},
 {id:'medium',name:'Medium',ms:280,min:280,wrap:false,tail:true,target:10,blocks:0,rate:0},
 {id:'hard',name:'Hard',ms:225,min:225,wrap:false,tail:true,target:12,blocks:1,rate:0},
 {id:'very-hard',name:'Very Hard',ms:205,min:160,wrap:false,tail:true,target:15,blocks:2,rate:3},
 {id:'expert',name:'Expert',ms:180,min:135,wrap:false,tail:true,target:18,blocks:3,rate:3}
];
export const DIR={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]};
const opposite=(a,b)=>DIR[a][0]+DIR[b][0]===0&&DIR[a][1]+DIR[b][1]===0;
export const key=p=>p.x+','+p.y;
export function obstacles(mode){
 const cells=[];const rect=(x,y,w,h)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)cells.push({x:i,y:j});};
 if(mode.blocks>=1){rect(5,3,2,2);rect(13,9,2,2);}
 if(mode.blocks>=2){rect(13,3,3,1);rect(4,10,3,1);}
 if(mode.blocks>=3){rect(10,5,1,4);rect(16,6,1,3);rect(3,5,1,3);}
 return cells;
}
export function rules(m){return `${m.name}. ${m.wrap?'Go through an edge and come out on the other side.':'Stay inside the garden edges.'} ${m.tail?'Avoid your own line.':'It is okay to touch your line.'} ${m.blocks?'Go around the flower beds.':'No flower beds in your way.'} ${m.rate?'The line gets faster as you collect friends.':'The speed stays the same.'}`;}
export class SnakeGame{
 constructor(id='beginner',rng=Math.random){
  this.mode=MODES.find(m=>m.id===id);if(!this.mode)throw Error('Unknown mode');this.rng=rng;
  this.blocks=obstacles(this.mode);this.blocked=new Set(this.blocks.map(key));
  this.body=[{x:5,y:7,kind:'claire'},{x:4,y:7,kind:'pusheen'},{x:3,y:7,kind:'kitty'}];
  // Expert has a left-side flower bed: start in a completely open centre corridor.
  if(this.mode.blocks===3)this.body=this.body.map(p=>({...p,y:11}));
  this.dir='right';this.queue=[];this.score=0;this.over=false;this.won=false;this.food=null;this.spawn();
 }
 get interval(){return Math.max(this.mode.min,this.mode.ms-this.score*this.mode.rate);}
 get capacity(){return COLS*ROWS-this.blocked.size;}
 turn(dir){
  if(this.over||!DIR[dir]||this.queue.length>=2)return false;
  const previous=this.queue.at(-1)||this.dir;if(dir===previous||opposite(dir,previous))return false;
  this.queue.push(dir);return true;
 }
 neighbour(p,d){let x=p.x+DIR[d][0],y=p.y+DIR[d][1];if(this.mode.wrap){x=(x+COLS)%COLS;y=(y+ROWS)%ROWS;}return x<0||x>=COLS||y<0||y>=ROWS?null:{x,y};}
 reachable(){
  const occupied=new Set(this.body.map(key)),seen=new Set([key(this.body[0])]),q=[this.body[0]],free=[];
  for(let i=0;i<q.length;i++)for(const d of Object.keys(DIR)){
   if(i===0&&opposite(d,this.dir))continue;
   const p=this.neighbour(q[i],d);if(!p)continue;const k=key(p);if(seen.has(k)||this.blocked.has(k))continue;
   if(this.mode.tail&&occupied.has(k))continue;seen.add(k);q.push(p);if(!occupied.has(k))free.push(p);
  }return free;
 }
 spawn(){
  const occupied=new Set(this.body.map(key));if(occupied.size===this.capacity){this.won=this.over=true;this.food=null;return;}
  const free=this.reachable();if(!free.length){this.food=null;return;}
  const p=free[Math.min(free.length-1,Math.floor(this.rng()*free.length))];this.food={...p,kind:['pusheen','kitty','raspberry'][this.score%3]};
 }
 step(){
  if(this.over)return null;if(this.queue.length)this.dir=this.queue.shift();
  const next=this.neighbour(this.body[0],this.dir);if(!next||this.blocked.has(key(next))){this.over=true;return 'bump';}
  const eat=this.food&&key(next)===key(this.food);
  const collision=this.body.slice(1,eat?undefined:-1).some(p=>key(p)===key(next));
  if(this.mode.tail&&collision){this.over=true;return 'bump';}
  const old=this.body.map(p=>({...p}));this.body=this.body.map((p,i)=>({...p,...(i===0?next:{x:old[i-1].x,y:old[i-1].y})}));
  if(eat){this.body.push({...old.at(-1),kind:this.food.kind});this.score++;this.spawn();return this.won?'win':'collect';}
  if(!this.food)this.spawn();return this.won?'win':'move';
 }
 snapshot(){return {v:1,mode:this.mode.id,body:this.body,dir:this.dir,score:this.score,food:this.food};}
 static restore(s,rng=Math.random){
  const mode=MODES.find(m=>m.id===s?.mode);if(!mode||s.v!==1||!Array.isArray(s.body)||s.body.length<3||s.body.length>2000||s.score!==s.body.length-3||!DIR[s.dir])return null;
  const g=new SnakeGame(mode.id,rng),valid=p=>p&&Number.isInteger(p.x)&&p.x>=0&&p.x<COLS&&Number.isInteger(p.y)&&p.y>=0&&p.y<ROWS&&!g.blocked.has(key(p));
  if(s.body.some((p,i)=>!valid(p)||!(i===0?p.kind==='claire':['pusheen','kitty','raspberry'].includes(p.kind)))||(mode.tail&&new Set(s.body.map(key)).size!==s.body.length))return null;
  for(let i=1;i<s.body.length;i++){const a=s.body[i-1],b=s.body[i];let dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);if(mode.wrap){dx=Math.min(dx,COLS-dx);dy=Math.min(dy,ROWS-dy);}if(dx+dy!==1)return null;}
  if(s.food&&(!valid(s.food)||s.body.some(p=>key(p)===key(s.food))||!['pusheen','kitty','raspberry'].includes(s.food.kind)))return null;
  Object.assign(g,{body:JSON.parse(JSON.stringify(s.body)),dir:s.dir,score:s.score,food:s.food?{...s.food}:null});
  if(!g.food)g.spawn();return g.over?null:g;
 }
}
