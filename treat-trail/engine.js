/* Fixed-step simulation, independent of DOM and artwork. Feet are the y coordinate. */
export const STEP = 1 / 60;
const approach = (v, target, amount) => v < target ? Math.min(target, v+amount) : Math.max(target, v-amount);
export class TrailGame {
  constructor(level) { this.level=level; this.reset(); }
  reset() {
    this.player={...this.level.start, vx:0, vy:0, dir:1, grounded:true};
    this.checkpoint={...this.level.start}; this.checkpointIndex=-1;
    this.collected=new Set(); this.time=0; this.distance=0; this.idle=0;
    this.coyote=.12; this.buffer=0; this.finished=false; this.rescues=0;
    this.events=[]; this.particles=[]; this.seedTrail();
  }
  seedTrail() {
    const p=this.player; this.distance=260; this.parking=false;
    this.trail=[];
    for(let d=0;d<=260;d+=2) this.trail.push({d,x:p.x-260+d,y:p.y,dir:1,grounded:true});
    this.friends=[1,2,3].map(i=>({x:p.x-i*65,y:p.y,dir:1,grounded:true}));
  }
  takeEvents() { return this.events.splice(0); }
  burst(x,y,kind='heart') {
    for(let i=0;i<8;i++) this.particles.push({x,y,vx:(Math.random()-.5)*120,vy:-60-Math.random()*110,life:1,max:1,kind});
  }
  rescue() {
    this.rescues++;
    Object.assign(this.player,{...this.checkpoint,vx:0,vy:0,grounded:true,dir:1});
    this.buffer=0; this.coyote=.12; this.seedTrail();
    this.burst(this.player.x,this.player.y-40); this.events.push({type:'rescue'});
  }
  step(input,dt=STEP) {
    if(this.finished) return;
    this.time+=dt;
    const p=this.player, oldX=p.x, oldY=p.y;
    const axis=(input.right?1:0)-(input.left?1:0);
    p.vx=approach(p.vx,axis*230,(axis?1650:2050)*dt);
    if(axis) p.dir=axis;
    this.coyote=p.grounded ? .12 : Math.max(0,this.coyote-dt);
    this.buffer=input.jumpPressed ? .14 : Math.max(0,this.buffer-dt);
    if(this.buffer>0 && this.coyote>0) {
      p.vy=-620; p.grounded=false; this.coyote=0; this.buffer=0;
      this.events.push({type:'jump'});
    }
    // Releasing jump early makes a shorter hop; hold for the full jump.
    if(!input.jump && p.vy < -210) p.vy=approach(p.vy,-210,2400*dt);
    p.vy=Math.min(760,p.vy+1400*dt);
    p.x=Math.max(22,Math.min(this.level.width-22,p.x+p.vx*dt));
    p.y+=p.vy*dt; p.grounded=false;
    if(p.vy>=0) {
      let floor=Infinity;
      for(const s of [...this.level.ground,...this.level.platforms]) {
        if(p.x+13>s.x && p.x-13<s.x+s.w && oldY<=s.y+1 && p.y>=s.y) floor=Math.min(floor,s.y);
      }
      if(Number.isFinite(floor)) { p.y=floor; p.vy=0; p.grounded=true; }
    }
    if(p.y>650) { this.rescue(); return; }
    for(let i=0;i<this.level.treats.length;i++) {
      if(this.collected.has(i)) continue;
      const [x,y]=this.level.treats[i];
      if(Math.abs(x-p.x)<30 && y>p.y-85 && y<p.y+14) {
        this.collected.add(i); this.burst(x,y,'spark'); this.events.push({type:'treat',index:i});
      }
    }
    this.level.checkpoints.forEach((c,i)=>{
      if(i>this.checkpointIndex && p.x>=c.x && p.x<c.x+160) {
        this.checkpoint={...c}; this.checkpointIndex=i;
        this.burst(c.x,c.y-65); this.events.push({type:'checkpoint',index:i});
      }
    });
    // Distance-indexed breadcrumbs preserve spacing even when Claire stops or turns.
    const travel=Math.hypot(p.x-oldX,(p.y-oldY)*.75);
    this.idle=travel>.15?0:this.idle+dt;
    if(travel>.01) {
      if(this.parking) {
        this.trail=[...this.friends].reverse().map((f,i)=>({...f,d:i*65}));
        this.trail.push({x:oldX,y:oldY,dir:p.dir,grounded:true,d:195});
        this.distance=195;this.parking=false;
      }
      this.distance+=travel;
      this.trail.push({d:this.distance,x:p.x,y:p.y,dir:p.dir,grounded:p.grounded});
      while(this.trail.length>2 && this.trail[1].d<this.distance-430) this.trail.shift();
    }
    let parkX=p.x;
    this.friends.forEach((f,i)=>{
      if(this.idle>.15 && p.grounded) {
        this.parking=true;
        let x=parkX-p.dir*65;
        let available=[...this.level.ground,...this.level.platforms].filter(s=>x>s.x+12&&x<s.x+s.w-12);
        if(!available.length) {
          const bank=p.dir>0?[...this.level.ground].reverse().find(s=>s.x+s.w<x):this.level.ground.find(s=>s.x>x);
          if(bank)x=p.dir>0?bank.x+bank.w-18:bank.x+18;
          available=this.level.ground.filter(s=>x>=s.x&&x<=s.x+s.w);
        }
        const y=available.sort((a,b)=>Math.abs(a.y-p.y)-Math.abs(b.y-p.y))[0]?.y ?? p.y;
        const ease=1-Math.exp(-12*dt);
        f.x+=(x-f.x)*ease;f.y+=(y-f.y)*ease;f.dir=p.dir;f.grounded=Math.abs(f.y-y)<2;parkX=x;
        return;
      }
      const target=this.distance-(i+1)*65;
      let a=this.trail[0],b=a;
      for(let j=1;j<this.trail.length;j++) { b=this.trail[j]; if(b.d>=target) break; a=b; }
      const k=Math.max(0,Math.min(1,(target-a.d)/(b.d-a.d||1)));
      Object.assign(f,{x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k,dir:b.dir,grounded:a.grounded&&b.grounded});
    });
    for(const s of this.particles) {s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;}
    this.particles=this.particles.filter(s=>s.life>0).slice(-120);
    if(p.x>=this.level.goal.x && p.grounded) {
      this.finished=true; this.events.push({type:'finish'});
    }
  }
}
