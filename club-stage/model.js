/* Additive device-local state. Existing scores, pictures and outfit keys are read, never replaced. */
import {StudioStore,cleanLook,cleanBake} from '../studios/model.js';
import {FURNITURE,ROOMS,STAGES,MOVES,WALLS,FLOORS,TRACK_IDS,CAST_KEYS,FRIEND_KEYS,START_ITEMS} from './catalog.js';
export const KEY='claire-club-stage:v1';
export const clone=v=>JSON.parse(JSON.stringify(v));
const has=(obj,key)=>typeof key==='string'&&Object.hasOwn(obj,key);
const num=(x,lo,hi,f)=>Number.isFinite(x)?Math.min(hi,Math.max(lo,x)):f;
export const safeName=(s,fallback)=>typeof s==='string'?s.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,55)||fallback:fallback;
const pick=(a,allowed,fallback)=>Array.isArray(a)?[...new Set(a.filter(k=>allowed.includes(k)))].slice(0,4):fallback;
export function fitItem(item){
 const spec=FURNITURE[item.type];if(!spec)return null;
 const rot=(((Number.isFinite(item.r)?Math.round(item.r/15)*15:0)%360)+360)%360;
 const a=rot*Math.PI/180,hw=(Math.abs(Math.cos(a))*spec.w+Math.abs(Math.sin(a))*spec.h)/2,hh=(Math.abs(Math.sin(a))*spec.w+Math.abs(Math.cos(a))*spec.h)/2;
 const low=spec.zone==='wall'?20:282,high=spec.zone==='wall'?274:588;
 return {id:item.id,type:item.type,x:num(item.x,26+hw,934-hw,480),y:num(item.y,low+hh,high-hh,(low+high)/2),r:rot};
}
export function initialRoom(id='lounge'){
 const r={wall:id==='garden'?'mint':id==='nook'?'lilac':'rose',floor:'wood',night:false,items:[],art:{},bake:null};
 const presets=[['sofa-0', 'sofa',335,360],['bed-0','bed',777,387],['rug-0','rug',454,499],['table-0','table',462,433],['lamp-0','lamp',587,364],['shelf-0','shelf',120,373],['plant-0','plant',885,465],['toybox-0','toybox',184,510],['frame-0','frame',372,147],['frame-1','frame',529,147],['music-0','music',699,519],['bunting-0','bunting',191,113]];
 r.items=presets.map(([iid,type,x,y])=>fitItem({id:iid,type,x,y,r:0}));return r;
}
export function fresh(){return {schema:1,name:"Claire's Stuffy Clubhouse",room:'lounge',rooms:{lounge:initialRoom()},owned:START_ITEMS.map(x=>x.id),unlocks:[],friends:[...FRIEND_KEYS],draft:defaultShow(),shows:[],beatBest:{}};}
export function defaultShow(){return {id:'',name:"Claire's Happy Show",stage:'rainbow',track:'meadow',performers:[...CAST_KEYS],looks:{},slots:8,sequence:Array(8).fill(null)};}
export function cleanShow(v){
 const d=defaultShow();if(!v||typeof v!=='object')return d;
 d.id=typeof v.id==='string'&&/^[a-zA-Z0-9_-]{0,90}$/.test(v.id)?v.id:'';d.name=safeName(v.name,d.name);
 if(has(STAGES,v.stage))d.stage=v.stage;if(TRACK_IDS.includes(v.track))d.track=v.track;
 d.performers=pick(v.performers,CAST_KEYS,CAST_KEYS);if(!d.performers.length)d.performers=['claire'];
 d.slots=[8,12,16,24].includes(v.slots)?v.slots:8;
 d.sequence=Array.from({length:d.slots},(_,i)=>{const t=v.sequence?.[i];return t&&has(MOVES,t.move)?{move:t.move,target:d.performers.includes(t.target)?t.target:'all'}:null;});
 for(const k of d.performers)if(v.looks&&Object.hasOwn(v.looks,k))d.looks[k]=v.looks[k]?cleanLook(v.looks[k]):null;
 return d;
}
export function cleanRoom(v,owned){
 const r=initialRoom();if(!v||!Array.isArray(v.items))return r;
 r.wall=has(WALLS,v.wall)?v.wall:'rose';r.floor=has(FLOORS,v.floor)?v.floor:'wood';r.night=v.night===true;
 const seen=new Set();r.items=v.items.filter(x=>x&&owned.includes(x.id)&&has(FURNITURE,x.type)&&x.id.startsWith(x.type+'-')&&!seen.has(x.id)&&seen.add(x.id)).slice(0,35).map(fitItem);r.art={};
 for(const [key,a] of Object.entries(v.art||{}))if(owned.includes(key)&&key.startsWith('frame-')&&a&&typeof a.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(a.id))r.art[key]={id:a.id,title:safeName(a.title,'My colouring')};
 const b=cleanBake(v.bake);r.bake=b?.stage==='served'?b:null;return r;
}
export function cleanState(raw){
 const s=fresh();if(!raw||raw.schema!==1)return s;
 s.name=safeName(raw.name,s.name);s.unlocks=pick(raw.unlocks,[...Object.keys(FURNITURE).map(k=>'item:'+k),...Object.keys(ROOMS).map(k=>'room:'+k),...Object.keys(STAGES).map(k=>'stage:'+k)],[]);
 // unlock list has more than four entries; validate without the cast helper's limit.
 s.unlocks=[...new Set((Array.isArray(raw.unlocks)?raw.unlocks:[]).filter(x=>typeof x==='string'&&/^(item|room|stage):[a-z]+$/.test(x)))].filter(x=>{const [t,k]=x.split(':');return has({item:FURNITURE,room:ROOMS,stage:STAGES}[t],k);});
 s.owned=[...START_ITEMS.map(x=>x.id),...Object.keys(FURNITURE).filter(k=>FURNITURE[k].stars&&s.unlocks.includes('item:'+k)).map(k=>k+'-0')];
 s.room=has(ROOMS,raw.room)&&(raw.room==='lounge'||s.unlocks.includes('room:'+raw.room))?raw.room:'lounge';s.rooms={};
 for(const k of Object.keys(ROOMS))if(k==='lounge'||s.unlocks.includes('room:'+k))s.rooms[k]=cleanRoom(raw.rooms?.[k],s.owned);
 s.friends=pick(raw.friends,FRIEND_KEYS,FRIEND_KEYS);
 s.draft=cleanShow(raw.draft);s.shows=(Array.isArray(raw.shows)?raw.shows:[]).slice(0,6).map(cleanShow).filter(x=>x.id);s.shows=s.shows.filter((x,i)=>s.shows.findIndex(n=>n.id===x.id)===i);
 for(const d of ['easy','medium','hard']){const b=raw.beatBest?.[d];if(b&&Number.isInteger(b.hits)&&Number.isInteger(b.total)&&b.total>0&&b.total<=64)s.beatBest[d]={hits:num(b.hits,0,b.total,0),total:b.total};}
 return s;
}
export class ClubStore extends StudioStore {
 readClub(){const r=this.json(KEY);return cleanState(r);}
 stateClub(){return this.available?this.readClub():(this.clubSession||this.readClub());}
 writeClub(v){const s=cleanState(v);this.clubSession=clone(s);const ok=this.put(KEY,JSON.stringify(s));return ok;}
 changeClub(fn){const s=this.stateClub();fn(s);this.writeClub(s);return this.stateClub();}
 unlock(kind,id){
  const spec={item:FURNITURE,room:ROOMS,stage:STAGES}[kind]?.[id];if(!spec)return {ok:false};
  const token=kind+':'+id,s=this.stateClub();if(!spec.stars||s.unlocks.includes(token))return {ok:true,already:true};
  if(this.stars().total<spec.stars)return {ok:false,need:spec.stars};
  s.unlocks.push(token);if(kind==='item')s.owned.push(id+'-0');if(kind==='room')s.rooms[id]=initialRoom(id);
  const durable=this.writeClub(s);return {ok:true,durable};
 }
 isUnlocked(kind,id){const s={item:FURNITURE,room:ROOMS,stage:STAGES}[kind]?.[id];return !!s&&(!s.stars||this.stateClub().unlocks.includes(kind+':'+id));}
 saveRoom(id,room){return this.changeClub(s=>s.rooms[id]=clone(room));}
 saveShow(show,slot=null){
  const v=cleanShow(show);if(!v.sequence.some(Boolean))return null;
  const s=this.stateClub();if(slot===null&&s.shows.length>=6)return null;
  const i=slot===null?s.shows.length:Math.max(0,Math.min(5,slot));v.id=s.shows[i]?.id||('show-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)));
  s.shows[i]=v;s.draft=clone(v);this.writeClub(s);return v;
 }
}
export class RoomHistory {
 constructor(room){this.room=clone(room);this.undo=[];}
 commit(fn){const before=clone(this.room);fn(this.room);if(JSON.stringify(before)!==JSON.stringify(this.room)){this.undo.push(before);this.undo=this.undo.slice(-30);return true;}return false;}
 back(){if(!this.undo.length)return false;this.room=this.undo.pop();return true;}
}
export function swapMove(show,a,b){if(a<0||b<0||a>=show.slots||b>=show.slots)return false;[show.sequence[a],show.sequence[b]]=[show.sequence[b],show.sequence[a]];return true;}
