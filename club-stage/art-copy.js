/* Only reads Coloring Time. Frames store independent PNG copies in a separate database. */
import {PictureStore,validOps} from '../coloring/store.js';
import {PAGES,pageSvg} from '../coloring/pages.js';
import {replay,composite} from '../coloring/paint.js';
export class ArtCopies {
 constructor(){this.mem=new Map();this.db=null;this.available=false;this.ready=new Promise(resolve=>{try{const r=indexedDB.open('claire-clubhouse-art',1);let done=false;const finish=()=>{if(!done){done=true;resolve();}};const timer=setTimeout(finish,4000);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('copies'))r.result.createObjectStore('copies',{keyPath:'id'});};r.onsuccess=()=>{this.db=r.result;this.available=true;this.db.onversionchange=()=>{this.db.close();this.db=null;this.available=false;};clearTimeout(timer);finish();};r.onerror=r.onblocked=()=>{clearTimeout(timer);finish();};}catch(_){resolve();}});}
 async all(){await this.ready;if(!this.db)return [...this.mem.values()];return new Promise(resolve=>{try{const r=this.db.transaction('copies').objectStore('copies').getAll();r.onsuccess=()=>{for(const x of r.result)if(x&&typeof x.png==='string'&&/^data:image\/png;base64,/.test(x.png)&&!this.mem.has(x.id))this.mem.set(x.id,x);resolve([...this.mem.values()]);};r.onerror=()=>{this.available=false;resolve([...this.mem.values()]);};}catch(_){this.available=false;resolve([...this.mem.values()]);}});}
 async put(record){this.mem.set(record.id,record);await this.ready;if(!this.db)return false;return new Promise(resolve=>{try{const tx=this.db.transaction('copies','readwrite');tx.objectStore('copies').put(record);tx.oncomplete=()=>resolve(true);tx.onerror=tx.onabort=()=>{this.available=false;resolve(false);};}catch(_){this.available=false;resolve(false);}});}
 async originals(){const store=new PictureStore();const all=await store.all();return all.map(r=>({record:r,page:PAGES.find(p=>p.id===r.id)})).filter(({record:r,page:p})=>p&&(()=>{const ops=validOps(r,p),last=ops.map(x=>x.type).lastIndexOf('clear');return ops.slice(last+1).some(s=>s.type==='stroke'&&s.mode!=='eraser');})()).slice(0,20);}
 async copy({record,page}){
  const paint=document.createElement('canvas');paint.width=800;paint.height=1000;replay(paint.getContext('2d'),validOps(record,page));
  const blob=new Blob([pageSvg(page)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),art=new Image();
  try{art.src=url;await art.decode();const png=composite(paint,art,400,500).toDataURL('image/png');const id='art-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));const result={id,title:page.title,png};const durable=await this.put(result);return {...result,durable};}finally{URL.revokeObjectURL(url);}
 }
}
