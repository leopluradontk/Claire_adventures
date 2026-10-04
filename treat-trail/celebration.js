/* Finish presentation only; the Beta 1 physics and level geometry stay unchanged. */
import {TrailRenderer} from './renderer.js?v=1.1.0';
const TAU=Math.PI*2;
const colors=['#e994b4','#eac36d','#ad9bd2','#79b6a7','#f2ba8d'];
function heart(c,x,y,r,color){c.save();c.translate(x,y);c.scale(r/18,r/18);c.beginPath();c.moveTo(0,10);c.bezierCurveTo(-24,-4,-12,-22,0,-9);c.bezierCurveTo(12,-22,24,-4,0,10);c.fillStyle=color;c.fill();c.restore();}
function oval(c,x,y,rx,ry,color,stroke){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
export class CelebrationRenderer extends TrailRenderer {
  constructor(canvas){super(canvas);this.party=null;this.gentle=false;}
  begin(game){
    this.party={time:0,nextBurst:.6,bursts:0,perfect:game.collected.size===game.level.treats.length,
      from:[game.player,...game.friends].map(p=>({...p})),sparks:[]};
  }
  clear(){this.party=null;}
  skip(){if(this.party){this.party.time=Math.max(5.4,this.party.time);this.party.sparks=[];}}
  advance(dt,onBurst=()=>{}){
    if(!this.party)return false;
    const p=this.party;p.time+=dt;
    if(p.time>=p.nextBurst&&p.time<5){
      const n=p.bursts++, x=(n%3-1)*155, y=155+(n%2)*65;
      const count=this.gentle?5:40;
      for(let i=0;i<count;i++){
        const a=i/count*TAU, speed=45+Math.random()*35;
        let vx=Math.cos(a)*speed,vy=Math.sin(a)*speed;
        if(p.perfect&&n===3&&!this.gentle){vx=5.3*16*Math.sin(a)**3;vy=-5.3*(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a));}
        p.sparks.push({x,y,vx:this.gentle?(Math.random()-.5)*16:vx,vy:this.gentle?-25-Math.random()*14:vy,
          age:0,life:this.gentle?2.5:1.6,color:colors[(i+n)%colors.length],heart:this.gentle||i%7===0});
      }
      p.sparks=p.sparks.slice(-180);p.nextBurst+=this.gentle?1.15:.7;onBurst();
    }
    for(const q of p.sparks){q.age+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(!this.gentle)q.vy+=26*dt;}
    p.sparks=p.sparks.filter(q=>q.age<q.life);
    return p.time>=5.4;
  }
  draw(game,dt=0){
    if(!this.party){super.draw(game,dt);return;}
    const party=this.party,t=party.time,g=game.level.goal;
    const ease=1-(1-Math.min(1,t/1.15))**3;
    const offsets=[-135,-42,53,147];
    const actors=party.from.map((p,i)=>({...p,x:p.x+(g.x+offsets[i]-p.x)*ease,
      y:p.y+(g.y-p.y)*ease,dir:1,vx:0,vy:0,grounded:true}));
    // Center the entire group rather than chasing the lead character.
    this.camera=Math.max(0,g.x-this.view*.5);
    // Extend scenery only for the celebration camera, never the playable geometry.
    const width=Math.max(game.level.width,g.x+this.view*.6);
    const ground=game.level.ground.map((s,i)=>i===game.level.ground.length-1?{...s,w:width-s.x}:{...s});
    const facade={...game,level:{...game.level,width,ground},player:actors[0],friends:actors.slice(1),time:game.time+t,particles:[]};
    super.draw(facade,0);
    const c=this.ctx;
    c.setTransform(this.dpr,0,0,this.dpr,0,0);c.translate(this.ox,this.oy);c.scale(this.scale,this.scale);
    c.save();c.beginPath();c.rect(0,0,this.view,600);c.clip();
    for(const q of party.sparks){
      const x=g.x+q.x-this.camera;c.globalAlpha=Math.min(1,q.age/.09)*Math.max(0,1-q.age/q.life);
      if(q.heart)heart(c,x,q.y,this.gentle?8:6,q.color);
      else{c.strokeStyle=q.color;c.lineWidth=2.5;c.beginPath();c.moveTo(x-q.vx*.045,q.y-q.vy*.045);c.lineTo(x,q.y);c.stroke();oval(c,x,q.y,2.3,2.3,q.color);}
    }
    c.globalAlpha=1;c.restore();
  }
  character(c,kind,p,t,moving){
    if(!this.party){super.character(c,kind,p,t,moving);return;}
    const time=this.party.time,active=Math.max(0,time-.65),soft=this.gentle?.2:1;
    const index=['claire','pusheen','kitty','raspberry'].indexOf(kind),phase=active*5+index*.9;
    const hop=Math.max(0,Math.sin(phase))*(kind==='raspberry'?17:kind==='claire'?21:11)*soft;
    c.save();c.translate(p.x,p.y-hop);
    if(kind==='claire'){
      const turn=active%4;
      if(!this.gentle&&turn>1.3&&turn<2.15){const s=Math.cos((turn-1.3)/.85*TAU);c.scale(Math.sign(s)*Math.max(.60,Math.abs(s)),1);}
      c.rotate(Math.sin(phase)*.055*soft);
    }else if(kind==='pusheen'){c.rotate(Math.sin(phase)*.12*soft);c.scale(1+Math.sin(phase)*.035*soft,1-Math.sin(phase)*.035*soft);}
    else if(kind==='raspberry'){
      // Extra petal motion at the outer tips makes Raspberry's gills wiggle.
      for(const side of [-1,1])for(let i=0;i<3;i++)oval(c,side*(29+Math.sin(phase+i)*3*soft),-42+i*10,7,4,'#f39abb','#d9789e');
    }else c.rotate(Math.sin(phase)*.065*soft);
    super.character(c,kind,{...p,x:0,y:0,dir:1,grounded:true},t,false);
    if(kind==='kitty'){
      c.save();c.translate(24,-22);c.rotate((-.55+Math.sin(phase)*.4)*soft);
      c.strokeStyle='#b889a4';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(3,-12);c.stroke();
      c.strokeStyle='#fffafc';c.lineWidth=5;c.stroke();oval(c,3,-14,5,5,'#fffafc','#b889a4');c.restore();
    }
    c.restore();
  }
}
