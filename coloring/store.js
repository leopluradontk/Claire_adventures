/* Drawings stay on this device. No cloud, accounts or telemetry. */
export class PictureStore {
 constructor(){this.memory=new Map();this.available=false;this.db=null;this.ready=this.open();}
 open(){return new Promise(resolve=>{
  try{
   const request=indexedDB.open('claire-coloring-time',1);let settled=false;
   const finish=()=>{if(!settled){settled=true;resolve();}};
   const timer=setTimeout(finish,4000);
   request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('pictures'))db.createObjectStore('pictures',{keyPath:'id'});};
   request.onsuccess=()=>{this.db=request.result;this.available=true;this.db.onversionchange=()=>{this.db.close();this.available=false;};clearTimeout(timer);finish();};
   request.onerror=request.onblocked=()=>{clearTimeout(timer);finish();};
  }catch(_){resolve();}
 });}
 async all(){await this.ready;if(!this.db)return [...this.memory.values()];return new Promise(resolve=>{
  try{const r=this.db.transaction('pictures').objectStore('pictures').getAll();r.onsuccess=()=>{r.result.forEach(p=>{if(!this.memory.has(p.id))this.memory.set(p.id,p);});resolve([...this.memory.values()]);};r.onerror=()=>{this.available=false;resolve([...this.memory.values()]);};}catch(_){this.available=false;resolve([...this.memory.values()]);}
 });}
 async get(id){const all=await this.all();return all.find(p=>p.id===id)||null;}
 async put(record){this.memory.set(record.id,record);await this.ready;if(!this.db)return false;return new Promise(resolve=>{
  try{const tx=this.db.transaction('pictures','readwrite');tx.objectStore('pictures').put(record);tx.oncomplete=()=>{this.available=true;resolve(true);};tx.onerror=tx.onabort=()=>{this.available=false;resolve(false);};}catch(_){this.available=false;resolve(false);}
 });}
}
export function validOps(record,page){
 if(!record||record.version!==page.version||!Array.isArray(record.ops))return [];
 return record.ops.filter(s=>s&&((s.type==='clear')||(s.type==='stroke'&&['rainbow','color','eraser'].includes(s.mode)&&/^#[\da-f]{6}$/i.test(s.color)&&Number.isFinite(s.width)&&s.width>=1&&s.width<=100&&Number.isFinite(s.hue)&&Array.isArray(s.points)&&s.points.length>0&&s.points.length<=20000&&s.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=-100&&p[0]<=900&&p[1]>=-100&&p[1]<=1100)))).slice(0,10000);
}
