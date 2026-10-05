import {ClubStore,RoomHistory,fitItem,clone,safeName} from './model.js?v=1.3.0';
import {FURNITURE,ROOMS,WALLS,FLOORS,FRIEND_KEYS,TRACK_IDS} from './catalog.js?v=1.3.0';
import {prop,roomBackdrop} from './props.js?v=1.3.0';
import {ArtCopies} from './art-copy.js?v=1.3.0';
import {actor,positionActor,animateActor} from './performers.js?v=1.3.0';
import {SONGS} from './audio.js?v=1.3.0';
import {common,$,esc} from './common.js?v=1.3.0';
import {CAST} from '../studios/model.js';
import {food} from '../studios/food.js';
const store=new ClubStore(),copies=new ArtCopies(),ui=common();let state=store.stateClub(),roomId=state.room,hist=new RoomHistory(state.rooms[roomId]);
let selected=null,placing=null,drag=null,edit=false,tab='furniture',activity='wander',actors=[],artMap=new Map(),last=0,t=0,photoSeq=0,track='meadow',pendingMusic=0;
const world=$('roomWorld'),scene=$('roomScene');document.body.dataset.gameRunning='true';
function saved(){state=store.stateClub();$('saveStatus').textContent=store.available?'Saved on this device':'Saving unavailable. Keep this page open.';$('starTotal').textContent='\u2605 '+store.stars().total+' friendship stars';}
function saveRoom(){store.saveRoom(roomId,hist.room);saved();}
function change(fn){if(hist.commit(fn)){saveRoom();renderRoom();renderTools();}}
function svgAt(svg,x,y,w,h){return svg.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" `);}
function itemArt(item,preview=false){
 const s=FURNITURE[item.type],art=hist.room.art[item.id],photo=art&&artMap.get(art.id);let content=svgAt(prop(item.type,hist.room.night),-s.w/2,-s.h/2,s.w,s.h);
 if(item.type==='frame'&&photo)content+=`<image x="${-s.w*.335}" y="${-s.h*.36}" width="${s.w*.67}" height="${s.h*.72}" href="${photo.png}" preserveAspectRatio="xMidYMid meet"/>`;
 if(s.kind==='table'&&hist.room.bake){const b=hist.room.bake;content+=b.items.slice(0,3).map((n,i)=>svgAt(food(b.type,n),-b.items.length*22+i*44,-s.h*.73,46,46)).join('');}
 if(preview||selected===item.id&&edit)content+=`<rect x="${-s.w/2-4}" y="${-s.h/2-4}" width="${s.w+8}" height="${s.h+8}" rx="12" fill="none" stroke="${preview?'#548d73':'#9b72b3'}" stroke-width="3" stroke-dasharray="7 5"/>`;
 return `<g ${preview?'':'data-item="'+item.id+'"'} transform="translate(${item.x} ${item.y}) rotate(${item.r})" ${preview?'opacity=".68" pointer-events="none"':''}>${content}</g>`;
}
function renderPreview(){ $('roomPreview').innerHTML=placing?itemArt(placing,true):''; }
function renderRoom(){
 world.classList.toggle('night',hist.room.night);$('roomBackground').innerHTML=roomBackdrop(hist.room,roomId);
 const ordered=[...hist.room.items].sort((a,b)=>(FURNITURE[a.type].kind==='rug'?-1000:a.y+FURNITURE[a.type].h/2)-(FURNITURE[b.type].kind==='rug'?-1000:b.y+FURNITURE[b.type].h/2));
 $('roomItems').innerHTML=ordered.map(x=>itemArt(x)).join('');$('roomName').textContent=state.name;$('nightButton').textContent=hist.room.night?'\u2600 Day':'\u263e Night';$('roomsButton').textContent=ROOMS[roomId].name+' \u2304';
 $('playMode').classList.toggle('selected',!edit);$('decorateMode').classList.toggle('selected',edit);
 $('roomFriends').style.pointerEvents=edit?'none':'';actors.forEach(a=>a.node.style.pointerEvents=edit?'none':'auto');
 $('undoRoom').disabled=!hist.undo.length;
 const item=hist.room.items.find(x=>x.id===selected);
 $('selectedLabel').textContent=placing?'Tap inside the room to place '+FURNITURE[placing.type].name.toLowerCase()+'.':edit?(item?FURNITURE[item.type].name:'Pick an item, or choose something from storage.'):'Everyone is welcome here.';
 for(const id of ['moveItem','rotateItem','storeItem'])$(id).disabled=!edit||!item||!!placing;
 $('cancelPlace').hidden=!placing;
 $('roomHint').textContent=edit?'Drag furniture, or select it and tap a new spot.':'Tap a friend for a happy hello.';
 renderPreview();
}
function makeActors(){
 actors=[];$('roomFriends').replaceChildren();const looks=store.state().looks;
 ['claire',...state.friends].forEach((kind,i)=>{const n=actor(kind,looks[kind]||null);const a={kind,node:n,x:355+i*132,y:538,move:'idle',until:0,index:i};n.onclick=()=>{if(edit)return;a.move={claire:'spin',pusheen:'wiggle',kitty:'wave',raspberry:'jump'}[kind];a.until=t+2.3;n.querySelector('.reaction').textContent={claire:'Best friends!',pusheen:'Purr-fect!',kitty:'Hello, friend!',raspberry:'Wiggle hugs!'}[kind];n.querySelector('.reaction').classList.add('show');ui.audio.unlock().then(()=>ui.audio.fx('treat',i));};actors.push(a);$('roomFriends').append(n);});
}
function selectMode(value){edit=value;selected=null;placing=null;activity='wander';renderRoom();}
$('playMode').onclick=()=>selectMode(false);$('decorateMode').onclick=()=>selectMode(true);
$('nightButton').onclick=()=>change(r=>r.night=!r.night);
$('undoRoom').onclick=()=>{placing=null;selected=null;if(hist.back()){saveRoom();renderRoom();renderTools();ui.notify('Your last decorating change is undone.');}};
$('cancelPlace').onclick=()=>{placing=null;renderRoom();};
$('rotateItem').onclick=()=>change(r=>{const i=r.items.findIndex(x=>x.id===selected);if(i>=0)r.items[i]=fitItem({...r.items[i],r:r.items[i].r+15});});
$('storeItem').onclick=()=>{const id=selected;selected=null;change(r=>r.items=r.items.filter(x=>x.id!==id));ui.notify('Put away safely. It is still in your furniture storage.');};
$('moveItem').onclick=()=>{placing={...hist.room.items.find(x=>x.id===selected)};renderRoom();};
function point(e){const m=scene.getScreenCTM();if(!m)return null;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());return {x:p.x,y:p.y};}
scene.addEventListener('pointerdown',e=>{
 if(!edit||drag||e.button>0)return;const p=point(e);if(!p)return;e.preventDefault();const id=e.target.closest('[data-item]')?.dataset.item;
 drag={id:e.pointerId,start:p,at:p,item:id?hist.room.items.find(x=>x.id===id):null,moved:false};scene.setPointerCapture?.(e.pointerId);
});
scene.addEventListener('pointermove',e=>{
 const p=point(e);if(!p)return;if(drag&&drag.id===e.pointerId){e.preventDefault();drag.at=p;if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>7)drag.moved=true;if(drag.item&&drag.moved){selected=drag.item.id;placing=fitItem({...drag.item,x:drag.item.x+p.x-drag.start.x,y:drag.item.y+p.y-drag.start.y});renderPreview();}}
 else if(edit&&placing&&e.pointerType==='mouse'){placing=fitItem({...placing,...p});renderPreview();}
});
function endDrag(e,cancel=false){
 if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;try{scene.releasePointerCapture(e.pointerId);}catch(_){}e.preventDefault();
 if(cancel){placing=null;renderRoom();return;}
 const p=point(e)||d.at;
 if(placing&&(d.moved||!d.item||!d.moved&&placing.id===d.item.id)){
  const placed=fitItem({...placing,...(d.moved?{}:p)});placing=null;selected=placed.id;change(r=>{const i=r.items.findIndex(x=>x.id===placed.id);if(i>=0)r.items[i]=placed;else r.items.push(placed);});renderRoom();return;
 }
 if(d.item){selected=d.item.id;renderRoom();}
 else if(selected){const item=hist.room.items.find(x=>x.id===selected);if(item)change(r=>r.items[r.items.findIndex(x=>x.id===selected)]=fitItem({...item,...p}));}
}
scene.addEventListener('pointerup',e=>endDrag(e));scene.addEventListener('pointercancel',e=>endDrag(e,true));scene.addEventListener('lostpointercapture',e=>{if(drag)endDrag(e,true);});scene.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{if(!edit||!selected||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||$('activityDialog').open)return;const d={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.code];if(d){e.preventDefault();change(r=>{const i=r.items.findIndex(x=>x.id===selected);if(i>=0)r.items[i]=fitItem({...r.items[i],x:r.items[i].x+d[0],y:r.items[i].y+d[1]});});}});
function putFromStorage(id){const type=id.replace(/-\d+$/,'');if(!FURNITURE[type])return;if(hist.room.items.some(x=>x.id===id)){edit=true;selected=id;placing=null;renderRoom();return;}edit=true;selected=null;placing=fitItem({id,type,x:480,y:FURNITURE[type].zone==='wall'?150:445,r:0});renderRoom();}
async function unlock(kind,id){
 const spec={item:FURNITURE,room:ROOMS}[kind][id];const stars=store.stars().total;
 if(stars<spec.stars){ui.notify('Needs '+spec.stars+' friendship stars. You have '+stars+'. Earn more in Bakery, Memory, Snake or Treat Trail.');return false;}
 if(!await ui.ask('Unlock '+spec.name+'?','Requires '+spec.stars+' friendship stars. You have '+stars+'. Your stars are kept, and this stays unlocked.','Unlock'))return false;
 const result=store.unlock(kind,id);saved();if(result.ok){ui.notify('Unlocked! Your stars are still yours.');renderTools();return true;}return false;
}
$('roomsButton').onclick=()=>ui.open('Our little rooms','<p>Every room has its own saved decorations. Stars unlock extra rooms; they are never spent.</p><div class="room-picker">'+Object.entries(ROOMS).map(([id,s])=>'<button class="room-choice" data-room="'+id+'"><strong>'+esc(s.name)+'</strong><small>'+(store.isUnlocked('room',id)?(id===roomId?'You are here':'Open this room'):'Unlock: '+s.stars+' friendship stars')+'</small></button>').join('')+'</div>',d=>d.querySelectorAll('[data-room]').forEach(b=>b.onclick=async()=>{const id=b.dataset.room;if(!store.isUnlocked('room',id)){ui.close();if(!await unlock('room',id))return;}ui.close();roomId=id;store.changeClub(s=>s.room=id);state=store.stateClub();hist=new RoomHistory(state.rooms[id]);placing=null;selected=null;makeActors();renderRoom();renderTools();saved();}));
function setTab(v){tab=v;$('clubTools').scrollTop=0;$('roomTabs').querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.tab===v));renderTools();}
$('roomTabs').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
function renderTools(){
 const root=$('clubTools'),scroll=root.scrollTop;photoSeq++;const seq=photoSeq;
 if(tab==='furniture'){
  const ids=state.owned;
  root.innerHTML='<h3>A room to make your own</h3><p>Choose an item, then tap where it belongs. Put away keeps it in storage.</p><div class="furniture-grid">'+ids.map(id=>{const type=id.replace(/-\d+$/,''),s=FURNITURE[type],used=hist.room.items.some(x=>x.id===id);return '<button class="furniture-card '+(used?'placed':'')+'" data-stock="'+id+'">'+prop(type)+'<span>'+esc(s.name)+'</span><small>'+(used?'In this room':'Free / owned')+'</small></button>';}).join('')+Object.entries(FURNITURE).filter(([id,s])=>s.stars&&!store.isUnlocked('item',id)).map(([id,s])=>'<button class="furniture-card locked" data-unlock="'+id+'">'+prop(id)+'<span>'+s.name+'</span><small>Unlock: '+s.stars+' stars</small></button>').join('')+'</div><p class="small" style="margin-top:12px">Unlocks use your earned friendship stars as milestones. Stars are kept. Each item unlocks only once.</p>';
  root.querySelectorAll('[data-stock]').forEach(b=>b.onclick=()=>putFromStorage(b.dataset.stock));root.querySelectorAll('[data-unlock]').forEach(b=>b.onclick=()=>unlock('item',b.dataset.unlock));
 }else if(tab==='room'){
  root.innerHTML='<h3>Your clubhouse</h3><label class="small" for="clubName">Clubhouse name</label><input class="name-field" id="clubName" maxlength="55" value="'+esc(state.name)+'"><button class="quiet wide" id="saveName">Save name</button><h3>Wallpaper</h3><div class="color-choices">'+Object.entries(WALLS).map(([k,v])=>'<button class="color-choice '+(hist.room.wall===k?'selected':'')+'" data-wall="'+k+'" style="background:'+v[1]+'" aria-label="'+v[0]+'" title="'+v[0]+'"></button>').join('')+'</div><h3>Floor</h3><div class="color-choices">'+Object.entries(FLOORS).map(([k,v])=>'<button class="color-choice '+(hist.room.floor===k?'selected':'')+'" data-floor="'+k+'" style="background:'+v[1]+'" aria-label="'+v[0]+'" title="'+v[0]+'"></button>').join('')+'</div><p>Try Night for a moonlit window and warm lamps. Your friends stay happy, even when you are away.</p><button class="quiet wide" data-read="Choose furniture and tap a spot in the room. Tap Rotate to turn it. Put away returns it to storage. Undo brings your last change back.">&#128266; Read decorating help</button>';
  $('saveName').onclick=()=>{store.changeClub(s=>s.name=safeName($('clubName').value,"Claire's Stuffy Clubhouse"));saved();renderRoom();};$('clubName').onchange=$('saveName').onclick;
  root.querySelectorAll('[data-wall]').forEach(b=>b.onclick=()=>change(r=>r.wall=b.dataset.wall));root.querySelectorAll('[data-floor]').forEach(b=>b.onclick=()=>change(r=>r.floor=b.dataset.floor));
 }else if(tab==='pictures'){
  root.innerHTML='<h3>Art made by Claire</h3><p>Hang an independent copy of your colouring in a frame. Originals are never changed.</p><div id="artChoices"><p>Finding your pictures...</p></div><button class="quiet wide" id="chooseBake">Choose bakery display</button><p>The selected bake is shown on your tables. It stays on the bakery shelf too.</p>';
  $('chooseBake').onclick=chooseBake;
  copies.originals().then(list=>{if(seq!==photoSeq||tab!=='pictures')return;const area=$('artChoices');if(!list.length){area.innerHTML='<p class="empty-state">Colour a picture in Coloring Time first, then come back to hang it here.</p>';return;}
   area.innerHTML='<div class="art-grid">'+list.map((x,i)=>'<button data-picture="'+i+'">'+(/^data:image\/(jpeg|png);base64,/.test(x.record.thumbnail||'')?'<img src="'+x.record.thumbnail+'" alt="Saved colouring">':'')+esc(x.page.title)+'</button>').join('')+'</div>';
   area.querySelectorAll('[data-picture]').forEach(b=>b.onclick=async()=>{const frames=hist.room.items.filter(x=>x.type==='frame');if(!frames.length){ui.notify('Place a My art frame from furniture storage first.');return;}const item=frames.find(x=>x.id===selected)||frames.find(x=>!hist.room.art[x.id])||frames[0];b.disabled=true;try{const result=await copies.copy(list[+b.dataset.picture]);artMap.set(result.id,result);change(r=>r.art[item.id]={id:result.id,title:result.title});ui.notify(result.durable?'A copy is hanging in your frame. The original is safe.':'Picture copy is only in this session: device storage is unavailable.');}catch(_){ui.notify('Could not make an art copy. Your original is safe. Please try again.');}finally{b.disabled=false;}});
  });
 }else if(tab==='friends'){
  root.innerHTML='<h3>Who is visiting?</h3><p>Claire is always here. Invite any of her three stuffy friends.</p>'+FRIEND_KEYS.map(k=>'<label class="friend-toggle" id="friend-label-'+k+'"><span>'+CAST[k]+'</span><input type="checkbox" data-friend="'+k+'" '+(state.friends.includes(k)?'checked':'')+'></label>').join('')+'<button class="quiet wide" id="refreshLooks">Use latest Dress-Up looks</button><p>No needs to fill, no sadness and no penalties. Everyone is happy to see you.</p>';
  const looks=store.state().looks;FRIEND_KEYS.forEach(k=>{const n=actor(k,looks[k]);$('friend-label-'+k).insertAdjacentHTML('afterbegin',n.querySelector('svg').outerHTML);});root.querySelectorAll('[data-friend]').forEach(b=>b.onchange=()=>{store.changeClub(s=>s.friends=FRIEND_KEYS.filter(k=>root.querySelector('[data-friend="'+k+'"]').checked));saved();makeActors();renderRoom();});$('refreshLooks').onclick=()=>{makeActors();renderRoom();ui.notify('Everyone is wearing their latest saved look.');};
 }else if(tab==='music'){
  root.innerHTML='<h3>Our music corner</h3><p>All six original tracks work offline.</p><div class="radio-list">'+TRACK_IDS.map(id=>'<button class="track-name '+(id===track?'selected':'')+'" data-track="'+id+'">&#9835; '+esc(SONGS[id].name)+'<small>'+SONGS[id].bpm+' beats per minute</small></button>').join('')+'</div><div class="dialog-actions"><button class="primary" id="roomMusicPlay">Play music</button><button class="quiet" id="roomMusicStop">Stop</button></div><h3 style="margin-top:20px">Our saved shows</h3><div id="savedShows"></div>';
  root.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{track=b.dataset.track;if(ui.audio.active)ui.audio.play(track);renderTools();});$('roomMusicPlay').onclick=()=>{ui.audio.play(track);ui.notify('Music for your clubhouse.');};$('roomMusicStop').onclick=()=>ui.audio.pause();
  const shows=store.stateClub().shows;$('savedShows').innerHTML=shows.length?shows.map(x=>'<button class="quiet wide" data-show="'+x.id+'">&#9654; '+esc(x.name)+'</button>').join(''):'<p>Save a routine in Music &amp; Dance, then launch it from here.</p>';
  root.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>{saveRoom();ui.leave('music-dance.html?show='+encodeURIComponent(b.dataset.show),!!placing);});
 }
 root.scrollTop=scroll;
}
function chooseBake(){
 const bakes=store.state().album;if(!bakes.length){ui.notify('Make and serve something in Stuffy Bakery first. It will appear here.');return;}
 ui.open('Treats for our table','<p>Display a copy of a served creation. Your bakery shelf stays unchanged.</p><div class="art-grid">'+bakes.map((b,i)=>'<button data-bake="'+i+'">'+food(b.type,b.items[0])+'<span>'+b.qty+' '+(b.type==='cake'?'little cake':b.type+(b.qty>1?'s':''))+'</span></button>').join('')+'</div><button class="quiet wide" id="removeBake">Clear table display</button>',d=>{
  d.querySelectorAll('[data-bake]').forEach(b=>b.onclick=()=>{change(r=>r.bake=clone(bakes[+b.dataset.bake]));ui.close();ui.notify('A copy is ready on the tea table.');});$('removeBake').onclick=()=>{change(r=>r.bake=null);ui.close();};
 });
}
function roomAction(a){
 selectMode(false);
 if(a==='snack'&&!hist.room.bake){chooseBake();return;}
 if(a==='nap'&&!hist.room.items.some(x=>FURNITURE[x.type].kind==='bed')){ui.notify('Bring a bed out of furniture storage for a cozy nap.');return;}
 if(a==='tea'&&!hist.room.items.some(x=>FURNITURE[x.type].kind==='table')){ui.notify('Place a tea-party table or trolley first.');return;}
 activity=a;ui.audio.unlock().then(()=>ui.audio.fx(a==='nap'?'treat':'checkpoint'));
 for(const x of actors){x.until=0;x.node.querySelector('.reaction').textContent=a==='nap'?'Z z z':a==='tea'?'Tea for friends!':a==='snack'?'Yum! Thank you!':'Hooray!';x.node.querySelector('.reaction').classList.add('show');}
 ui.notify({tea:'A tea party with your best friends.',snack:'Sharing a copy of your bakery treat. The original stays safe.',nap:'Tucked in and cozy. Tap Play together to wake up.',play:'Everyone is ready to play!'}[a]);
}
document.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>roomAction(b.dataset.activity));
window.addEventListener('blur',()=>{if(drag)endDrag({pointerId:drag.id,preventDefault(){}},true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&drag)endDrag({pointerId:drag.id,preventDefault(){}},true);});
$('homeLink').onclick=e=>{e.preventDefault();saveRoom();ui.leave('./',!!placing||!store.available);};$('stageLink').onclick=e=>{e.preventDefault();saveRoom();ui.leave('music-dance.html',!!placing||!store.available);};
function resize(){const r=$('roomViewport').getBoundingClientRect(),w=Math.min(r.width,r.height*1.6);world.style.width=w+'px';world.style.height=w/1.6+'px';}new ResizeObserver(resize).observe($('roomViewport'));
function frame(now){
 const dt=Math.min(.04,(now-last)/1000||0);last=now;if(!document.hidden&&!$('activityDialog').open){t+=dt;
 const table=hist.room.items.find(x=>FURNITURE[x.type].kind==='table')||{x:460,y:440},bed=hist.room.items.find(x=>FURNITURE[x.type].kind==='bed')||{x:740,y:410};
 actors.forEach((a,i)=>{let x=350+i*132,y=548,move='idle';
  if(activity==='tea'||activity==='snack'){x=Math.max(110,Math.min(850,table.x-145+i*100));y=Math.min(568,table.y+95);move='sit';}
  else if(activity==='nap'){x=Math.max(95,Math.min(857,bed.x-60+i*38));y=Math.min(560,bed.y+43+i*8);move=i===0?'wave':'nap';}
  else if(activity==='play'){x=325+i*139;y=534+Math.sin(t*.4+i)*10;move=['spin','wiggle','wave','jump'][i%4];}
  else {x=255+i*145+Math.sin(t*.16+i*1.5)*60;y=527+Math.sin(t*.24+i)*15;move=Math.floor(t/5+i)%4===0?'sit':'walk';}
  const ease=1-Math.exp(-dt*3);a.x+=(x-a.x)*ease;a.y+=(y-a.y)*ease;positionActor(a.node,a.x,a.y,a.kind==='claire'?94:activity==='nap'?79:109);
  if(a.until>t)move=a.move;else if(activity==='wander')a.node.querySelector('.reaction').classList.remove('show');
  animateActor(a.node,move,(t/(a.kind==='pusheen'?1.4:1.2)+i*.13)%1,ui.settings.gentle);
  const held=a.node.querySelector('.held-prop');if(held.dataset.activity!==activity){held.dataset.activity=activity;if(activity==='snack'&&hist.room.bake)held.innerHTML=food(hist.room.bake.type,hist.room.bake.items[0]);else held.textContent=activity==='tea'?'\u2615':activity==='nap'&&i>0?'\u263e':'';}
 });}requestAnimationFrame(frame);
}
(async()=>{for(const a of await copies.all())artMap.set(a.id,a);saved();makeActors();renderRoom();renderTools();resize();requestAnimationFrame(frame);})();
if(new URLSearchParams(location.search).has('debug'))window.clubDebug={store,copies,get state(){return store.stateClub();},get room(){return hist.room;},get history(){return hist;},get selected(){return selected;},get placing(){return placing;},get actors(){return actors;},ui,putFromStorage,change,renderRoom,setTab,selectMode,roomAction};
