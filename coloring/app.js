import {PAGES,pageSvg,SIZE} from './pages.js?v=1.0.0';
import {PictureStore,validOps} from './store.js?v=1.0.0';
import {segment,replay,composite} from './paint.js?v=1.0.0';
const $=id=>document.getElementById(id),store=new PictureStore(),paint=$('paint'),ctx=paint.getContext('2d');
const PALETTES={
 bright:['#ef78ad','#f14f66','#ff9a38','#ffd74f','#9cd853','#32997b','#56c9ed','#417ce6','#8959db','#d888ed','#a16c4b','#33313c'],
 pastel:['#f8bdd5','#e9c9f6','#cfc8ff','#b4dcfc','#b9efdf','#d8eeb0','#fff0ad','#ffd8b3','#dabeb0','#bbcbdc','#e9e0da','#ffffff'],
 nature:['#9ab970','#4e8b63','#255e50','#adccbe','#ccbb76','#e49a55','#966843','#65473a','#83b7c7','#578596','#8d8598','#eee8d3'],
 skin:['#fff0dc','#f5dcc5','#ebc6a3','#d9a47f','#bd805f','#965d43','#674335','#432c29','#e4c389','#b78b52','#89613e','#403332']};
let page=null,ops=[],redo=[],active=null,distance=0,mode='rainbow',color='#ef78ad',width=26,hue=0,category='All',onlyMine=false;
let records=new Map(),queue=Promise.resolve(),saveNumber=0,openNumber=0,toastTimer,modal=null,lastFocus=null,exportURL=null,exportFile=null;
const urls=new Map();
function artURL(p){if(!urls.has(p.id))urls.set(p.id,URL.createObjectURL(new Blob([pageSvg(p)],{type:'image/svg+xml'})));return urls.get(p.id);}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000);}
function hasPicture(r){return r&&r.ops&&r.ops.some((s,i)=>s.type==='stroke'&&s.mode!=='eraser'&&!r.ops.slice(i+1).some(n=>n.type==='clear'));}
function renderGallery(){
 $('categories').replaceChildren();
 for(const name of ['All','Claire','Stuffy friends','Adventures']){const b=document.createElement('button');b.textContent=name;b.setAttribute('aria-pressed',String(category===name));b.onclick=()=>{category=name;renderGallery();};$('categories').append(b);}
 $('myPictures').setAttribute('aria-pressed',String(onlyMine));$('pageGrid').replaceChildren();
 const selected=PAGES.filter(p=>(category==='All'||p.category===category)&&(!onlyMine||hasPicture(records.get(p.id))));
 $('galleryStatus').textContent=onlyMine?'Your colours, saved on this device.':'10 pages. One girl. Three best stuffy friends.';
 for(const p of selected){const record=records.get(p.id),saved=hasPicture(record),card=document.createElement('button');card.className='page-card';card.dataset.page=p.id;
  const img=new Image();img.src=saved&&record.thumbnail?record.thumbnail:artURL(p);img.alt='';img.loading='lazy';
  const title=document.createElement('h3');title.textContent=p.title;const label=document.createElement('p');label.textContent=saved?'Continue colouring':p.category;
  card.append(img,title,label);if(saved){const badge=document.createElement('span');badge.className='saved-badge';badge.textContent='My picture';card.append(badge);}
  card.onclick=()=>openPage(p);$('pageGrid').append(card);
 }
 if(!selected.length){const el=document.createElement('p');el.className='empty';el.textContent='Your masterpieces will appear here. Choose All pages and start colouring!';$('pageGrid').append(el);}
}
function sizePaper(){if($('editor').hidden)return;const r=$('paperArea').getBoundingClientRect(),w=Math.max(1,Math.min(r.width-18,(r.height-18)*.8));$('paper').style.width=w+'px';$('paper').style.height=w*1.25+'px';}
function syncTools(){
 $('rainbow').classList.toggle('selected',mode==='rainbow');$('rainbow').setAttribute('aria-pressed',String(mode==='rainbow'));
 $('eraser').classList.toggle('selected',mode==='eraser');$('eraser').setAttribute('aria-pressed',String(mode==='eraser'));
 $('toolStatus').textContent=(mode==='rainbow'?'Rainbow brush':mode==='eraser'?'Eraser':'Your chosen colour')+' | '+({10:'Small',26:'Medium',52:'Large'}[width]);
 for(const b of document.querySelectorAll('[data-size]')){const selected=Number(b.dataset.size)===width;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));}
 for(const b of $('swatches').children)b.setAttribute('aria-pressed',String(mode==='color'&&color===b.dataset.color));
 $('undo').disabled=!ops.length;$('redo').disabled=!redo.length;
}
function renderPalette(){
 $('swatches').replaceChildren();for(const c of PALETTES[$('palette').value]){const b=document.createElement('button');b.className='swatch';b.dataset.color=c;b.style.background=c;b.setAttribute('aria-label','Colour '+c);b.title=c;b.onclick=()=>{mode='color';color=c;syncTools();};$('swatches').append(b);}syncTools();
}
async function openPage(p,push=true){
 if(active)endStroke();await queue;const seq=++openNumber;
 page=p;$('gallery').hidden=true;$('editor').hidden=false;document.body.dataset.gameRunning='true';$('pageTitle').textContent=p.title;$('loadingPage').hidden=false;paint.style.pointerEvents='none';sizePaper();
 if(push)history.pushState({},'',location.pathname+'#'+encodeURIComponent(p.id));
 try{
  const image=$('lineArt');image.src=artURL(p);await image.decode();const record=await store.get(p.id);if(seq!==openNumber)return;
  ops=validOps(record,p);redo=[];active=null;replay(ctx,ops);syncTools();$('loadingPage').hidden=true;paint.style.pointerEvents='auto';
  $('saveStatus').textContent=store.available?(ops.length?'Saved on this device':'Your colours save on this device'):'Saving unavailable. Use Save picture before leaving.';
 }catch(error){console.error(error);$('loadingPage').textContent='This picture could not open. Return to Gallery and try again.';}
}
function save(){
 if(!page)return queue;
 const record={id:page.id,version:page.version,ops:structuredClone(ops),updatedAt:Date.now(),thumbnail:composite(paint,$('lineArt'),160,200).toDataURL('image/jpeg',.8)};
 records.set(record.id,record);const n=++saveNumber;$('saveStatus').textContent='Saving your colours...';
 queue=queue.catch(()=>{}).then(()=>store.put(record)).then(ok=>{if(n===saveNumber&&page?.id===record.id)$('saveStatus').textContent=ok?'Saved on this device':'Not saved to device. Use Save picture before leaving.';});return queue;
}
function point(e){const r=paint.getBoundingClientRect();return [Math.round(Math.max(0,Math.min(800,(e.clientX-r.left)*800/r.width))*10)/10,Math.round(Math.max(0,Math.min(1000,(e.clientY-r.top)*1000/r.height))*10)/10];}
paint.addEventListener('pointerdown',e=>{
 if(active||modal||!page||!$('loadingPage').hidden||e.button!==0)return;e.preventDefault();
 const p=point(e);active={pointerId:e.pointerId,type:'stroke',mode,color,width,hue,points:[p]};distance=0;redo=[];segment(ctx,active,p,p);
 try{paint.setPointerCapture(e.pointerId);}catch(_){}
});
paint.addEventListener('pointermove',e=>{
 if(!active||e.pointerId!==active.pointerId)return;e.preventDefault();
 for(const ev of (e.getCoalescedEvents?.().length?e.getCoalescedEvents():[e])){const p=point(ev),a=active.points.at(-1);if(Math.hypot(p[0]-a[0],p[1]-a[1])<.5)continue;distance+=segment(ctx,active,a,p,distance);active.points.push(p);}
});
function endStroke(e){
 if(!active||(e&&e.pointerId!==active.pointerId))return;
 const stroke=active;active=null;try{if(paint.hasPointerCapture(stroke.pointerId))paint.releasePointerCapture(stroke.pointerId);}catch(_){}
 delete stroke.pointerId;ops.push(stroke);if(stroke.mode==='rainbow')hue=(stroke.hue+distance*.8+25)%360;syncTools();save();
}
for(const type of ['pointerup','pointercancel','lostpointercapture'])paint.addEventListener(type,endStroke);
paint.addEventListener('contextmenu',e=>e.preventDefault());
$('rainbow').onclick=()=>{mode='rainbow';syncTools();};$('eraser').onclick=()=>{mode='eraser';syncTools();};
$('palette').onchange=renderPalette;document.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{width=Number(b.dataset.size);syncTools();});
$('undo').onclick=()=>{endStroke();if(!ops.length)return;redo.push(ops.pop());replay(ctx,ops);syncTools();save();};
$('redo').onclick=()=>{endStroke();if(!redo.length)return;ops.push(redo.pop());replay(ctx,ops);syncTools();save();};
function openModal(id){endStroke();lastFocus=document.activeElement;modal=id;$(id).hidden=false;document.querySelector('main').inert=true;$(id).querySelector('button')?.focus();}
function closeModal(){if(!modal)return;$(modal).hidden=true;modal=null;document.querySelector('main').inert=false;lastFocus?.focus();}
$('clear').onclick=()=>openModal('clearDialog');$('cancelClear').onclick=closeModal;
$('confirmClear').onclick=()=>{ops.push({type:'clear'});redo=[];ctx.clearRect(0,0,800,1000);closeModal();syncTools();save();toast('A fresh page! Undo brings your colours back.');};
async function gallery(push=true){endStroke();await queue;page=null;openNumber++;document.body.dataset.gameRunning='false';$('editor').hidden=true;$('gallery').hidden=false;if(push)history.pushState({},'',location.pathname);renderGallery();window.scrollTo(0,0);}
$('backGallery').onclick=()=>gallery();$('myPictures').onclick=()=>{onlyMine=!onlyMine;renderGallery();};
$('savePicture').onclick=async()=>{
 openModal('exportDialog');$('exportStatus').textContent='Getting your picture ready...';$('sharePicture').hidden=true;$('downloadPicture').hidden=true;$('exportPreview').removeAttribute('src');
 try{
  const c=composite(paint,$('lineArt'));const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Export failed')),'image/png'));
  if(exportURL)URL.revokeObjectURL(exportURL);exportURL=URL.createObjectURL(blob);exportFile=new File([blob],'Claire-'+page.id+'.png',{type:'image/png'});
  $('exportPreview').src=exportURL;$('downloadPicture').href=exportURL;$('downloadPicture').download=exportFile.name;$('downloadPicture').hidden=false;
  $('sharePicture').hidden=!(navigator.canShare&&navigator.canShare({files:[exportFile]}));
  $('exportStatus').textContent='Your picture is ready. Save a copy to keep or share.';
 }catch(e){console.error(e);$('exportStatus').textContent='Could not prepare a copy. Your drawing is still here. Please try again.';}
};
$('closeExport').onclick=closeModal;
$('sharePicture').onclick=async()=>{try{await navigator.share({files:[exportFile],title:'Made by Claire'});}catch(e){if(e.name!=='AbortError')toast('Sharing was unavailable. Use Download PNG instead.');}};
window.addEventListener('popstate',()=>{closeModal();const id=decodeURIComponent(location.hash.slice(1)),p=PAGES.find(x=>x.id===id);p?openPage(p,false):gallery(false);});
window.addEventListener('keydown',e=>{
 if(modal){if(e.key==='Escape'){e.preventDefault();closeModal();}if(e.key==='Tab'){
  const items=[...$(modal).querySelectorAll('button:not(:disabled),a[href]')].filter(x=>!x.hidden&&x.getClientRects().length),first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }return;}
 if(page&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();}
});
window.addEventListener('blur',()=>endStroke());document.addEventListener('visibilitychange',()=>{if(document.hidden)endStroke();});window.addEventListener('pagehide',()=>endStroke());
new ResizeObserver(sizePaper).observe($('paperArea'));window.addEventListener('resize',()=>{endStroke();sizePaper();});
document.addEventListener('storybook:offline-ready',()=>{$('offlineStatus').textContent='Coloring Time 1.0 | Saved for offline play';});
document.addEventListener('storybook:update-ready',()=>{endStroke();toast('Update ready. Return Home after your colours are saved.');});
(async()=>{renderPalette();for(const r of await store.all())records.set(r.id,r);renderGallery();if(document.documentElement.dataset.offlineReady==='true')$('offlineStatus').textContent='Coloring Time 1.0 | Saved for offline play';const p=PAGES.find(x=>x.id===decodeURIComponent(location.hash.slice(1)));if(p)openPage(p,false);})();
if(new URLSearchParams(location.search).has('debug'))window.coloringDebug={store,get page(){return page;},get ops(){return ops;},get mode(){return mode;},get records(){return records;},get saved(){return queue;},ctx,paint,PAGES,pageSvg,composite};
