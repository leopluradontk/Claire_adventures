/* Pure, deterministic rhythm engine. No chords or holds; all prompts have visual cues. */
export const RHYTHM={easy:{name:'Easy',lanes:['wave'],count:16,spacing:2,window:.30},medium:{name:'Medium',lanes:['wave','jump'],count:24,spacing:1.5,window:.25},hard:{name:'Hard',lanes:['wave','jump','clap'],count:32,spacing:1,window:.21}};
export function makeNotes(mode,bpm){
 const d=RHYTHM[mode]||RHYTHM.easy,beat=60/bpm,pattern=mode==='hard'?[0,1,2,1,0,2,0,1]:[0,1];
 return Array.from({length:d.count},(_,i)=>({id:i,lane:mode==='easy'?0:pattern[i%pattern.length]%d.lanes.length,time:(6+i*d.spacing)*beat,hit:false,miss:false}));
}
export class RhythmRound {
 constructor(mode,bpm){this.mode=mode;this.spec=RHYTHM[mode]||RHYTHM.easy;this.notes=makeNotes(mode,bpm);this.hits=0;this.combo=0;this.bestCombo=0;this.duration=this.notes.at(-1).time+2;}
 tap(lane,time){const targets=this.notes.filter(n=>n.lane===lane&&!n.hit&&!n.miss&&Math.abs(n.time-time)<=this.spec.window).sort((a,b)=>Math.abs(a.time-time)-Math.abs(b.time-time));const n=targets[0];if(!n)return null;n.hit=true;this.hits++;this.combo++;this.bestCombo=Math.max(this.bestCombo,this.combo);return n;}
 step(time){for(const n of this.notes)if(!n.hit&&!n.miss&&time>n.time+this.spec.window){n.miss=true;this.combo=0;}return time>=this.duration;}
}
