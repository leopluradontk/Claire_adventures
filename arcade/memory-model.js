import {byId,COUNTS,STAGES,selectDesigns,shuffled} from './designs.js';
export class MemoryGame{
 constructor(pairs=12,rng=Math.random){
  this.deck=shuffled(selectDesigns(pairs,rng).flatMap(id=>[id,id]),rng);this.pairs=pairs;
  this.matched=[];this.open=[];this.moves=0;this.elapsed=0;this.hints=0;this.wait=0;this.preview=0;this.finished=false;
 }
 flip(index){
  if(this.finished||this.wait>0||this.preview>0||!Number.isInteger(index)||index<0||index>=this.deck.length||this.matched.includes(index)||this.open.includes(index))return null;
  this.open.push(index);if(this.open.length===1)return 'flip';
  this.moves++;this.wait=this.deck[this.open[0]]===this.deck[this.open[1]]?450:1250;
  return 'two';
 }
 tick(ms){
  if(this.finished)return null;this.elapsed+=Math.max(0,ms);
  if(this.preview>0)this.preview=Math.max(0,this.preview-ms);
  if(this.wait<=0)return null;this.wait=Math.max(0,this.wait-ms);if(this.wait)return null;
  const match=this.deck[this.open[0]]===this.deck[this.open[1]];
  if(match)this.matched.push(...this.open);this.open=[];
  if(this.matched.length===this.deck.length){this.finished=true;return 'finish';}return match?'match':'miss';
 }
 hint(){if(this.finished||this.wait||this.preview)return false;this.preview=2600;this.hints++;return true;}
 get found(){return this.matched.length/2;}
 snapshot(){return {v:1,pairs:this.pairs,deck:this.deck,matched:this.matched,open:this.open,moves:this.moves,elapsed:this.elapsed,hints:this.hints,wait:this.wait,preview:this.preview};}
 static restore(s){
  if(!s||s.v!==1||!STAGES.includes(s.pairs)||!Array.isArray(s.deck)||s.deck.length!==s.pairs*2||s.deck.some(x=>!Object.hasOwn(byId,x)))return null;
  const counts={};s.deck.forEach(id=>counts[id]=(counts[id]||0)+1);if(Object.keys(counts).length!==s.pairs||Object.values(counts).some(n=>n!==2))return null;
  const indices=a=>Array.isArray(a)&&a.every(i=>Number.isInteger(i)&&i>=0&&i<s.deck.length)&&new Set(a).size===a.length;
  if(!indices(s.matched)||!indices(s.open)||s.open.length>2||s.open.some(i=>s.matched.includes(i))||s.matched.length===s.deck.length)return null;
  for(const id of new Set(s.matched.map(i=>s.deck[i])))if(s.matched.filter(i=>s.deck[i]===id).length!==2)return null;
  if(!Number.isInteger(s.moves)||s.moves<0||s.moves>1000000||!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>3.6e9||!Number.isInteger(s.hints)||s.hints<0||s.hints>100000)return null;
  const g=Object.create(MemoryGame.prototype);Object.assign(g,JSON.parse(JSON.stringify(s)),{finished:false});g.wait=s.open.length===2?Math.max(1,Math.min(1250,Number(s.wait)||1250)):0;g.preview=0;return g;
 }
}
export const memoryPairs=(mode,stage=0)=>mode==='adventure'?STAGES[stage]:COUNTS[mode];
