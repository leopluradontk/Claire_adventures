/* Original offline synthesis plus the four existing game tracks. One transport for sound and visuals. */
import {TrailAudio,TRACKS} from '../treat-trail/audio.js';
export const SONGS=Object.freeze({...TRACKS,
 rainbow:{name:'Rainbow Hop',bpm:116,root:60,wave:'triangle',gate:.2,accent:.024,melody:[12,16,19,0,24,19,21,0,16,19,24,0,21,19,16,0,14,17,21,0,26,21,19,0,17,16,14,0,12,19,24,0],chords:[[0,4,7],[-3,0,4],[-5,-1,2],[-7,-3,0]],pulse:true},
 groove:{name:'Stuffy Swing',bpm:88,root:62,wave:'sine',gate:.28,accent:.025,melody:[12,0,19,16,0,19,21,0,19,16,14,0,12,0,14,16,17,0,21,19,0,24,21,0,19,17,16,14,12,0,19,0],chords:[[0,4,7],[-3,0,4],[-5,-1,2],[-7,-3,0]],offbeat:true}
});
export class StageAudio extends TrailAudio {
 constructor(s,report){super(s,report);this.active=false;this.offset=0;this.epoch=0;this.generation=0;this.lastInstrument=-1000;}
 get time(){return this.active?Math.max(0,(performance.now()-this.epoch)/1000):this.offset;}
 async play(id='meadow',offset=0){
  this.pause();const token=++this.generation;await this.unlock();
  if(token!==this.generation||document.hidden)return false;
  this.trackId=SONGS[id]?id:'meadow';this.song=SONGS[this.trackId];this.offset=Math.max(0,offset);
  this.epoch=performance.now()+70-this.offset*1000;this.active=true;this.step=Math.ceil(this.offset/(60/this.song.bpm/2));this.schedule();return true;
 }
 schedule(){
  if(this.timer||!this.song||!this.active)return;
  const pump=()=>{
   if(!this.song||!this.active)return;const t=this.song,len=60/t.bpm/2,current=this.time;
   if(this.step*len<current-.2)this.step=Math.ceil(current/len);
   while(this.step*len<current+.12){
    const at=this.step*len,when=(this.ctx?.currentTime||0)+(this.epoch+at*1000-performance.now())/1000;
    const i=this.step%t.melody.length,n=t.melody[i],ch=t.chords[Math.floor(i/8)%t.chords.length];
    if(n){this.tone(t.root+n,when,t.gate,.15,'music',t.wave);this.tone(t.root+n+12,when,t.gate*.7,t.accent,'music');}
    if(this.step%4===0)this.tone(t.root+ch[0]-12,when,.35,.16,'music','triangle');
    if(this.step%8===0)ch.forEach((x,k)=>this.tone(t.root+x,when+k*.02,.68,.033));
    if(t.offbeat&&i%4===2)this.tone(t.root+ch[2],when,.14,.065,'music','triangle');
    if(t.pulse&&i%2===1)this.tone(t.root+ch[0]-12,when,.09,.055,'music','triangle');
    this.step++;
   }
  };
  pump();this.timer=setInterval(pump,25);
 }
 pause(){this.offset=this.time||0;this.active=false;this.generation++;super.pause();}
 async instrument(type,n=0){
  if(this.settings.muted||!this.settings.effects)return;
  const now=performance.now();if(now-this.lastInstrument<60)return;this.lastInstrument=now;
  const generation=this.generation;await this.unlock();if(generation!==this.generation||document.hidden||!this.ctx||this.voices.size>24)return;
  const t=this.ctx.currentTime;
  if(type==='drum')this.tone(45+n*5,t,.14,.13,'effects','sine',26+n*4);
  if(type==='piano'){const m=[60,62,64,65,67,69,71,72][n%8];this.tone(m,t,.36,.15,'effects');this.tone(m+12,t,.23,.025,'effects');}
  if(type==='bell'){this.tone(79+n*5,t,.46,.09,'effects');this.tone(91+n*5,t,.3,.025,'effects');}
 }
 async applaud(){
  const generation=this.generation;await this.unlock();if(generation!==this.generation||document.hidden||this.settings.muted||!this.settings.effects||!this.ctx)return;
  const t=this.ctx.currentTime;[72,76,79,84].forEach((n,i)=>this.tone(n,t+i*.12,.36,.11,'effects'));
  if(this.settings.gentle)return;
  const c=this.ctx,buf=c.createBuffer(1,Math.ceil(c.sampleRate*1.1),c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++){const a=i/c.sampleRate;d[i]=(Math.random()*2-1)*Math.sin(Math.min(1,a/.12)*Math.PI/2)*Math.max(0,1-a/1.1)*(.12+.55*Math.abs(Math.sin(a*51)));}
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buf;filter.type='lowpass';filter.frequency.value=1500;gain.gain.value=.13;
  source.connect(filter);filter.connect(gain);gain.connect(this.effects);const v={source,gain};this.voices.add(v);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();this.voices.delete(v);};source.start();
 }
}
