import {ProgressStore} from '../treat-trail/progress.js';
export const KEY='claire-arcade:v1';
const clone=x=>JSON.parse(JSON.stringify(x));
const count=(x,max=1000000)=>Number.isInteger(x)&&x>=0&&x<=max?x:0;
const fresh=()=>({schema:1,memoryRuns:{},memoryBest:{},memoryNext:0,snakeRuns:{},snakeBest:{},snakeNext:0,earned:0,rewarded:[],prefs:{timer:false,hints:true,swipe:true}});
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
export class ArcadeStore extends ProgressStore{
 read(){
  const s=this.json(KEY),r=fresh();if(!s||s.schema!==1)return r;
  for(const k of ['memoryRuns','snakeRuns'])if(object(s[k]))for(const [id,v] of Object.entries(s[k]).slice(0,20))if(/^[a-z0-9-]{1,35}$/.test(id)&&object(v))r[k][id]=v;
  if(object(s.memoryBest))for(const [id,v] of Object.entries(s.memoryBest).slice(0,40))if(/^[a-z0-9-]{1,40}$/.test(id)&&Number.isInteger(v.moves)&&v.moves>=0&&v.moves<=1000000&&Number.isFinite(v.ms)&&v.ms>=0&&v.ms<3.6e9)r.memoryBest[id]={moves:v.moves,ms:v.ms};
  for(const k of ['beginner','easy','medium','hard','very-hard','expert'])r.snakeBest[k]=count(s.snakeBest?.[k]);
  r.memoryNext=count(s.memoryNext,7);r.snakeNext=count(s.snakeNext,6);r.earned=count(s.earned);
  r.rewarded=Array.isArray(s.rewarded)?s.rewarded.filter(x=>typeof x==='string'&&x.length<100).slice(-256):[];
  for(const k of Object.keys(r.prefs))if(typeof s.prefs?.[k]==='boolean')r.prefs[k]=s.prefs[k];return r;
 }
 state(){return this.available?this.read():(this.session||this.read());}
 change(fn){const s=this.state();fn(s);this.session=clone(s);this.put(KEY,JSON.stringify(s));return s;}
 pref(k,v){if(['timer','hints','swipe'].includes(k))this.change(s=>s.prefs[k]=!!v);}
 run(type,id,value){this.change(s=>{if(value)s[type+'Runs'][id]=value;else delete s[type+'Runs'][id];});}
 reward(s,id){if(s.rewarded.includes(id))return 0;s.rewarded.push(id);s.rewarded=s.rewarded.slice(-256);s.earned++;return 1;}
 finishMemory(id,g,token,stage=-1){let gained=0;this.change(s=>{
  const k=id+(g.hints?'-helped':'-solo'),b=s.memoryBest[k];
  s.memoryBest[k]={moves:Math.min(b?.moves??Infinity,g.moves),ms:Math.min(b?.ms??Infinity,g.elapsed)};
  delete s.memoryRuns[id];if(stage>=0)s.memoryNext=Math.max(s.memoryNext,Math.min(7,stage+1));gained=this.reward(s,'memory-'+token);
 });return gained;}
 snakeScore(id,score){let gained=0;this.change(s=>{const before=s.snakeBest[id]||0;gained=Math.max(0,Math.floor(score/5)-Math.floor(before/5));s.earned+=gained;s.snakeBest[id]=Math.max(before,score);});return gained;}
 snakeStage(stage){let gained=0;this.change(s=>{const first=stage>=s.snakeNext;s.snakeNext=Math.max(s.snakeNext,Math.min(6,stage+1));if(first)gained=this.reward(s,'snake-adventure-stage-'+stage);delete s.snakeRuns.adventure;});return gained;}
}
export const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
