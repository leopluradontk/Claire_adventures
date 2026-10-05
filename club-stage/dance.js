import {ClubStore,clone,cleanShow,safeName,swapMove} from './model.js?v=1.3.0';
import {STAGES,MOVES,CAST_KEYS,TRACK_IDS} from './catalog.js?v=1.3.0';
import {SONGS} from './audio.js?v=1.3.0';
import {common,$,esc} from './common.js?v=1.3.0';
import {actor,animateActor} from './performers.js?v=1.3.0';
import {stageBackdrop} from './props.js?v=1.3.0';
import {moveIcon} from './move-icons.js?v=1.3.0';
import {RHYTHM,RhythmRound} from './rhythm.js?v=1.3.0';
import {CAST} from '../studios/model.js';
const store=new ClubStore();let show=store.stateClub().draft,mode='free',selectedSlot=0,actors=[],running=null,paused=false,round=null,beatLevel='easy',lastSlot=-1,ghostDrag=null;
let starting=false,startGeneration=0,uiTime=0,lastNow=0,freeMoves=new Map(),runSequence=[],outfitSnapshot=false;
const ui=common(()=>pausePerformance());document.body.dataset.gameRunning='true';
const targetShow=new URLSearchParams(location.search).get('show'),loadedShow=store.stateClub().shows.find(x=>x.id===targetShow);
if(loadedShow){show=clone(loadedShow);mode='show';outfitSnapshot=true;}
for(const k of show.performers)if(!Object.hasOwn(show.looks,k))show.looks[k]=store.state().looks[k]||null;
function saved(){store.changeClub(s=>s.draft=clone(show));$('saveStatus').textContent=store.available?'Your show draft is saved on this device':'Saving unavailable. Keep this page open.';}
function createCast(){
 $('performers').replaceChildren();actors=[];
 show.performers.forEach((kind,i)=>{const n=actor(kind,show.looks[kind]);n.style.left=((i+1)/(show.performers.length+1)*100)+'%';n.style.top='83%';n.style.width=(kind==='claire'?12:15)+'%';n.onclick=()=>doMove({move:'wave',target:kind});$('performers').append(n);actors.push({kind,node:n});});
 $('castSummary').innerHTML=actors.map(a=>a.node.querySelector('svg').outerHTML).join('');
 for(const id of ['targetSelect','tileTarget']){const old=$(id).value;$(id).innerHTML='<option value="all">Everyone</option>'+show.performers.map(k=>'<option value="'+k+'">'+CAST[k]+'</option>').join('');if(old==='all'||show.performers.includes(old))$(id).value=old;}
 $('outfitNote').textContent=outfitSnapshot?'Saved show outfits, kept with this routine.':'Wearing your saved Dress-Up looks.';
}
function renderScene(){ $('stageScene').innerHTML=stageBackdrop(show.stage);$('stageSelect').value=show.stage;$('trackSelect').value=show.track;createCast();resize(); }
function moveButtons(id,action){$(id).innerHTML=Object.entries(MOVES).map(([key,v])=>'<button data-move="'+key+'">'+moveIcon(key)+'<span>'+v.name+'</span></button>').join('');$(id).querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>action(b.dataset.move));}
function renderSequence(){
 $('routineLength').value=String(show.slots);$('showName').value=show.name;
 $('sequence').innerHTML=show.sequence.map((x,i)=>'<button type="button" data-slot="'+i+'" class="'+(i===selectedSlot?'selected':'')+'" aria-label="Slot '+(i+1)+': '+(x?MOVES[x.move].name+', '+(CAST[x.target]||'everyone'):'empty')+'"><span class="slot-number">'+(i+1)+'</span>'+(x?moveIcon(x.move)+'<small>'+(CAST[x.target]||'Everyone')+'</small>':'<span style="font-size:20px">+</span>')+'</button>').join('');
 $('slotStatus').textContent='Slot '+(selectedSlot+1)+' selected';$('tileLeft').disabled=selectedSlot===0;$('tileRight').disabled=selectedSlot===show.slots-1;$('tileRemove').disabled=!show.sequence[selectedSlot];
 $('tileTarget').value=show.sequence[selectedSlot]?.target||'all';
}
function updateTransport(){
 const playText=mode==='free'?'Play music':mode==='show'?'Play routine':'Start beat game';
 $('playMusic').textContent='\u25b6 '+playText;$('pauseShow').disabled=!running;$('pauseShow').textContent=paused?'Resume':'Pause';
 if(!running)$('transportText').textContent=mode==='show'?'Two beats per move. Empty slots are a little rest.':mode==='beat'?'Four-count start. Watch the heart target.':'Choose a move, or try an automatic dance.';
 $('chooseCast').disabled=!!running&&!paused;$('stageSelect').disabled=!!running&&!paused;$('trackSelect').disabled=!!running&&!paused;
 $('beatDifficulty').disabled=!!running;
}
function switchMode(next){stopPerformance();mode=next;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));for(const id of ['free','show','beat'])$(id+'Panel').hidden=id!==mode;renderSequence();drawBeat();updateTransport();resize();}
function doMove(tile,when=uiTime){
 for(const k of show.performers)if(tile.target==='all'||tile.target===k)freeMoves.set(k,{move:tile.move,at:when});
 $('stageBanner').textContent=MOVES[tile.move].name+'!';
}
function doFreeMove(move){if(running&&paused)return;doMove({move,target:$('targetSelect').value});if(!ui.audio.active)ui.audio.play(show.track);ui.audio.unlock().then(()=>ui.audio.fx('treat'));if(!running){running='free';paused=false;updateTransport();}}
async function begin(kind){
 if(kind==='show'&&!show.sequence.some(Boolean)){ui.notify('Add a move to your show first. Tap a slot, then a move picture.');return;}
 stopPerformance();const generation=++startGeneration;runSequence=kind==='auto'?['wave','jump','wiggle','clap','spin','pose','wiggle','wave','jump','spin','clap','pose'].map(move=>({move,target:'all'})):clone(show.sequence);
 if(kind==='beat')round=new RhythmRound(beatLevel,SONGS[show.track].bpm);
 lastSlot=-1;freeMoves.clear();running=kind;paused=false;starting=true;ui.audio.offset=0;await ui.audio.play(show.track,0);if(generation!==startGeneration||document.hidden)return;starting=false;
 $('stageBanner').textContent=kind==='beat'?'Ready for the beat?':'Let\'s dance!';$('transportText').textContent='Playing '+SONGS[show.track].name;updateTransport();drawBeat();
}
function pausePerformance(){
 if(!running||paused)return;paused=true;startGeneration++;ui.audio.pause();$('stageBanner').textContent='Paused. Your friends will wait.';$('transportText').textContent='Tap Resume when you are ready.';updateTransport();saved();
}
async function resumePerformance(){if(!running||!paused)return;const generation=++startGeneration;await ui.audio.play(show.track,ui.audio.offset);if(generation!==startGeneration||document.hidden)return;paused=false;starting=false;$('transportText').textContent='Playing '+SONGS[show.track].name;updateTransport();}
function stopPerformance(){startGeneration++;starting=false;running=null;paused=false;round=null;freeMoves.clear();if(ui)ui.audio.pause();lastSlot=-1;$('stageBanner').textContent='The stage is yours!';document.querySelectorAll('.sequence .running').forEach(n=>n.classList.remove('running'));updateTransport();}
function celebrate(text){
 running=null;paused=false;ui.audio.pause();$('stageBanner').textContent=text;$('transportText').textContent=text;updateTransport();$('transportText').textContent=text;ui.audio.applaud();
 const root=$('stageSparkles');root.replaceChildren();for(let i=0;i<(ui.settings.gentle?6:16);i++){const n=document.createElement('span');n.textContent=i%2?'\u2665':'\u2605';n.style.left=(7+i*5.4)+'%';n.style.top=(40+i%4*9)+'%';n.style.animationDelay=(i%4*.13)+'s';root.append(n);}setTimeout(()=>root.replaceChildren(),3600);doMove({move:'pose',target:'all'});$('stageBanner').textContent=text;
}
function completeShow(){celebrate('Bravo, best friends!');}
$('playMusic').onclick=()=>begin(mode==='free'?'free':mode==='show'?'show':'beat');$('autoDance').onclick=()=>begin('auto');
$('pauseShow').onclick=()=>paused?resumePerformance():pausePerformance();$('stopShow').onclick=stopPerformance;
moveButtons('freeMoves',doFreeMove);moveButtons('showMoves',move=>{stopPerformance();show.sequence[selectedSlot]={move,target:$('tileTarget').value};saved();renderSequence();});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
$('stageSelect').innerHTML=Object.entries(STAGES).map(([id,s])=>'<option value="'+id+'">'+s.name+(store.isUnlocked('stage',id)?'':' - '+s.stars+' stars')+'</option>').join('');
$('trackSelect').innerHTML=TRACK_IDS.map(id=>'<option value="'+id+'">'+esc(SONGS[id].name)+'</option>').join('');
$('stageSelect').onchange=async()=>{
 const id=$('stageSelect').value,spec=STAGES[id];if(!store.isUnlocked('stage',id)){
  $('stageSelect').value=show.stage;if(store.stars().total<spec.stars){ui.notify('Unlock '+spec.name+' with '+spec.stars+' friendship stars. Your stars are never spent.');return;}
  if(!await ui.ask('Unlock '+spec.name+'?','Requires '+spec.stars+' friendship stars. You have '+store.stars().total+'. This unlocks once and keeps all your stars.','Unlock'))return;store.unlock('stage',id);
 }
 stopPerformance();show.stage=id;saved();renderScene();
};
$('trackSelect').onchange=()=>{stopPerformance();show.track=$('trackSelect').value;saved();};
function castChooser(){
 const chosen=[...show.performers];ui.open('Who is in the show?','<p>Choose Claire and up to three stuffy friends. At least one performer stays on stage.</p><div class="cast-picker">'+CAST_KEYS.map(k=>'<button data-cast="'+k+'" aria-pressed="'+chosen.includes(k)+'">'+actor(k,store.state().looks[k]).querySelector('svg').outerHTML+'<span>'+CAST[k]+'</span></button>').join('')+'</div><button class="primary wide" id="castDone" style="margin-top:18px">Ready for the stage</button>',d=>{
  d.querySelectorAll('[data-cast]').forEach(b=>b.onclick=()=>{const k=b.dataset.cast,i=chosen.indexOf(k);if(i>=0){if(chosen.length===1){ui.notify('Keep at least one friend on stage.');return;}chosen.splice(i,1);}else chosen.push(k);b.setAttribute('aria-pressed',String(chosen.includes(k)));});
  $('castDone').onclick=()=>{stopPerformance();show.performers=CAST_KEYS.filter(k=>chosen.includes(k));for(const k of show.performers)if(!Object.hasOwn(show.looks,k))show.looks[k]=store.state().looks[k]||null;saved();createCast();ui.close();};
 });
}
$('chooseCast').onclick=castChooser;$('refreshOutfits').onclick=()=>{pausePerformance();const looks=store.state().looks;show.looks={};for(const k of show.performers)show.looks[k]=clone(looks[k]||null);outfitSnapshot=false;createCast();saved();ui.notify('Your newest saved outfits are on stage. Save this show to keep them with it.');};
$('routineLength').onchange=async()=>{const n=+$('routineLength').value;if(n<show.slots&&show.sequence.slice(n).some(Boolean)&&!await ui.ask('Shorten this show?','Moves after slot '+n+' will be removed from this draft. Saved favourite shows stay unchanged.','Shorten')){$('routineLength').value=String(show.slots);return;}stopPerformance();show.slots=n;show.sequence=Array.from({length:n},(_,i)=>show.sequence[i]||null);selectedSlot=Math.min(selectedSlot,n-1);saved();renderSequence();resize();};
$('showName').onchange=()=>{show.name=safeName($('showName').value,"Claire's Happy Show");saved();};
function reorder(delta){stopPerformance();const to=selectedSlot+delta;if(swapMove(show,selectedSlot,to)){selectedSlot=to;saved();renderSequence();}}
$('tileLeft').onclick=()=>reorder(-1);$('tileRight').onclick=()=>reorder(1);$('tileRemove').onclick=()=>{stopPerformance();show.sequence[selectedSlot]=null;saved();renderSequence();};
$('tileTarget').onchange=()=>{stopPerformance();if(show.sequence[selectedSlot]){show.sequence[selectedSlot].target=$('tileTarget').value;saved();renderSequence();}};
const seq=$('sequence');
seq.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-slot]');if(!b||ghostDrag||e.button>0)return;e.preventDefault();stopPerformance();ghostDrag={pointer:e.pointerId,from:+b.dataset.slot,x:e.clientX,y:e.clientY,moved:false,ghost:null};seq.setPointerCapture?.(e.pointerId);});
seq.addEventListener('pointermove',e=>{const d=ghostDrag;if(!d||d.pointer!==e.pointerId)return;e.preventDefault();if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>9)d.moved=true;if(d.moved){if(!d.ghost){d.ghost=document.createElement('div');d.ghost.className='drag-tile';d.ghost.innerHTML=moveIcon(show.sequence[d.from]?.move||'pose');document.body.append(d.ghost);}d.ghost.style.left=e.clientX-28+'px';d.ghost.style.top=e.clientY-28+'px';}});
function endTile(e,cancel=false){if(!ghostDrag||ghostDrag.pointer!==e.pointerId)return;const d=ghostDrag;ghostDrag=null;d.ghost?.remove();try{seq.releasePointerCapture(e.pointerId);}catch(_){}e.preventDefault();if(cancel)return;if(d.moved){const to=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]');if(to&&swapMove(show,d.from,+to.dataset.slot)){selectedSlot=+to.dataset.slot;saved();}}else selectedSlot=d.from;renderSequence();}
seq.addEventListener('pointerup',e=>endTile(e));seq.addEventListener('pointercancel',e=>endTile(e,true));seq.addEventListener('lostpointercapture',e=>{if(ghostDrag)endTile(e,true);});seq.addEventListener('click',e=>{const b=e.target.closest('[data-slot]');if(b&&e.detail===0){selectedSlot=+b.dataset.slot;renderSequence();}});
function saveFavourite(){
 show.name=safeName($('showName').value,"Claire's Happy Show");if(!show.sequence.some(Boolean)){ui.notify('Give your show at least one dance move first.');return;}
 const list=store.stateClub().shows;ui.open('Save your show','<p>Six favourite shows. Each keeps its performers, outfits, stage, song and moves.</p><div class="show-list">'+Array.from({length:6},(_,i)=>'<button data-save-slot="'+i+'" class="show-save-card"><div><h3>'+(list[i]?esc(list[i].name):'Empty favourite '+(i+1))+'</h3><p>'+(list[i]?'Replace this saved show':'Save here')+'</p></div></button>').join('')+'</div>',d=>d.querySelectorAll('[data-save-slot]').forEach(b=>b.onclick=async()=>{
  const i=+b.dataset.saveSlot;ui.close();if(list[i]&&!await ui.ask('Replace '+list[i].name+'?','This replaces only that saved show. Your other shows stay safe.','Replace'))return;
  const result=store.saveShow(show,i);if(result){show=clone(result);outfitSnapshot=true;saved();ui.notify(store.available?'Show saved, including everyone\'s outfits.':'Show kept for this session only. Device saving is unavailable.');}
 }));
}
function loadShow(s,play=false){stopPerformance();show=cleanShow(s);outfitSnapshot=true;selectedSlot=0;renderScene();switchMode('show');saved();ui.close();if(play)begin('show');else $('stageBanner').textContent='Ready to edit '+show.name;}
function showShelf(){const list=store.stateClub().shows;ui.open('Our favourite shows',list.length?'<div class="show-list">'+list.map((s,i)=>'<article class="show-save-card"><div><h3>'+esc(s.name)+'</h3><p>'+s.sequence.filter(Boolean).length+' moves - '+esc(SONGS[s.track].name)+'</p></div><button data-load="'+i+'">Edit</button><button class="primary" data-play="'+i+'">Play</button><button data-delete="'+i+'" aria-label="Delete '+esc(s.name)+'">&#215;</button></article>').join('')+'</div>':'<p>Your saved shows will appear here. In Make a Show, choose moves and tap Save show.</p>',d=>{
 d.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>loadShow(list[+b.dataset.load]));d.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>loadShow(list[+b.dataset.play],true));d.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{const s=list[+b.dataset.delete];ui.close();if(await ui.ask('Remove '+s.name+'?','The saved copy is removed. Your open draft stays here.','Remove'))store.changeClub(state=>state.shows=state.shows.filter(x=>x.id!==s.id));showShelf();});});}
$('saveShow').onclick=saveFavourite;$('openShows').onclick=$('showShelf').onclick=showShelf;
$('beatDifficulty').onchange=()=>{beatLevel=$('beatDifficulty').value;round=null;drawBeat();};
function drawBeat(){
 const spec=RHYTHM[beatLevel],len=spec.lanes.length;
 if($('beatButtons').dataset.mode!==beatLevel){$('beatButtons').dataset.mode=beatLevel;$('beatButtons').innerHTML=spec.lanes.map((m,i)=>'<button data-lane="'+i+'" aria-label="'+MOVES[m].name+'">'+moveIcon(m)+'<span>'+MOVES[m].name+'</span></button>').join('');$('beatButtons').querySelectorAll('[data-lane]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();if(e.button>0)return;hit(+b.dataset.lane);};b.onclick=e=>{if(e.detail===0)hit(+b.dataset.lane);};});}
 $('beatButtons').querySelectorAll('button').forEach(b=>b.disabled=running!=='beat'||paused);
 const time=running==='beat'?ui.audio.time:round?.duration||0;
 let svg=Array.from({length:len},(_,i)=>{const x=(i+.5)*900/len;return '<rect x="'+(i*900/len+7)+'" y="0" width="'+(900/len-14)+'" height="190" rx="18" fill="'+['#efe2f5','#f6e6ec','#e1eee8'][i]+'"/><path d="M'+x+' 12v104" stroke="#c3aecf" stroke-width="2" stroke-dasharray="5 8"/><circle cx="'+x+'" cy="100" r="25" fill="#fff9fe" stroke="#b28ebd" stroke-width="3"/><text x="'+x+'" y="109" text-anchor="middle" fill="#c894b7" font-size="25">&#9825;</text>';}).join('');
 if(round)for(const note of round.notes){if(note.hit||note.miss)continue;const delay=note.time-time;if(delay>2.5||delay<-.35)continue;const x=(note.lane+.5)*900/len,y=100-delay/2.5*90;svg+='<g transform="translate('+(x-23)+' '+(y-23)+')"><rect width="46" height="46" rx="13" fill="#fffafa" stroke="#af8cba" stroke-width="3"/>'+moveIcon(spec.lanes[note.lane]).replace('<svg ','<svg x="6" y="6" width="34" height="34" style="color:#84618e" ')+'</g>';}
 $('noteTrack').innerHTML=svg;
 if(!round){const best=store.stateClub().beatBest[beatLevel];$('beatScore').textContent=(best?'Best '+best.hits+'/'+best.total+'. ':'')+'Tap the matching picture at the heart.';}
}
let lastHit=-1000;
function hit(lane){if(running!=='beat'||paused||!round)return;const now=performance.now();if(now-lastHit<60)return;lastHit=now;const n=round.tap(lane,ui.audio.time);if(n){doMove({move:round.spec.lanes[lane],target:'all'});ui.audio.fx('treat',round.hits);$('stageBanner').textContent=['Lovely!','You found the beat!','Keep dancing!'][round.hits%3];const b=$('beatButtons').querySelector('[data-lane="'+lane+'"]');b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),200);}else $('stageBanner').textContent='Watch for the next heart!';}
$('piano').innerHTML=['C','D','E','F','G','A','B','C'].map((note,i)=>'<button data-instrument="piano" data-note="'+i+'" aria-label="Piano '+note+'">'+note+'</button>').join('');
document.querySelectorAll('[data-instrument]').forEach(b=>{const play=()=>{ui.audio.instrument(b.dataset.instrument,+b.dataset.note);b.classList.add('struck');setTimeout(()=>b.classList.remove('struck'),170);};b.onpointerdown=e=>{e.preventDefault();if(e.button>0)return;play();};b.onclick=e=>{if(e.detail===0)play();};b.oncontextmenu=e=>e.preventDefault();});
window.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||$('activityDialog').open)return;if(e.code==='Escape'){paused?resumePerformance():pausePerformance();}if(mode==='beat'&&['Digit1','Digit2','Digit3','ArrowLeft','ArrowDown','ArrowRight'].includes(e.code)){e.preventDefault();hit({Digit1:0,Digit2:1,Digit3:2,ArrowLeft:0,ArrowDown:1,ArrowRight:2}[e.code]);}});
window.addEventListener('blur',()=>{if(ghostDrag)endTile({pointerId:ghostDrag.pointer,preventDefault(){}},true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ghostDrag)endTile({pointerId:ghostDrag.pointer,preventDefault(){}},true);});
$('homeLink').onclick=e=>{e.preventDefault();saved();ui.leave('./',!!running||!store.available);};$('clubLink').onclick=e=>{e.preventDefault();saved();ui.leave('clubhouse.html',!!running||!store.available);};
function resize(){const r=$('stageViewport').getBoundingClientRect(),w=Math.min(r.width,r.height*960/540);$('stageWorld').style.width=w+'px';$('stageWorld').style.height=w*540/960+'px';}new ResizeObserver(resize).observe($('stageViewport'));
function frame(now){
 const dt=Math.min(.05,(now-lastNow)/1000||0);lastNow=now;if(!document.hidden&&!$('activityDialog').open&&!paused&&!starting){uiTime+=dt;
  const time=ui.audio.time,beat=60/SONGS[show.track].bpm;
  if(running==='show'||running==='auto'){
   const ix=Math.floor((time-4*beat)/(2*beat));if(time<4*beat)$('stageBanner').textContent=['Ready!','1','2','3','4'][Math.min(4,Math.floor(time/beat)+1)];
   else if(ix>=runSequence.length)completeShow();
   else if(ix!==lastSlot){lastSlot=ix;const tile=runSequence[ix];if(tile)doMove(tile);else $('stageBanner').textContent='A little rest';document.querySelectorAll('[data-slot]').forEach(b=>b.classList.toggle('running',+b.dataset.slot===ix));$('transportText').textContent='Move '+(ix+1)+' of '+runSequence.length;}
  }else if(running==='beat'&&round){
   if(time<4*beat)$('stageBanner').textContent='Ready... '+(4-Math.floor(time/beat));
   const done=round.step(time);$('beatScore').textContent=round.hits+' / '+round.notes.length+' moves | '+round.combo+' in a row';
   if(done){const result={hits:round.hits,total:round.notes.length};store.changeClub(s=>{const old=s.beatBest[beatLevel];if(!old||result.hits/result.total>old.hits/old.total)s.beatBest[beatLevel]=result;});saved();celebrate('Lovely show! '+result.hits+' of '+result.total+' moves.');}
   drawBeat();
  }
  for(const a of actors){const m=freeMoves.get(a.kind),age=m?uiTime-m.at:999,dur=2*beat;let move=m&&age<dur?m.move:'idle';animateActor(a.node,move,(age/dur)%1,ui.settings.gentle);}
 }requestAnimationFrame(frame);
}
renderScene();renderSequence();switchMode(mode);saved();if(loadedShow)$('stageBanner').textContent='Show loaded. Tap Play routine.';requestAnimationFrame(frame);
if(new URLSearchParams(location.search).has('debug'))window.danceDebug={store,ui,get show(){return show;},get mode(){return mode;},get running(){return running;},get paused(){return paused;},get round(){return round;},get actors(){return actors;},begin,pause:pausePerformance,resume:resumePerformance,stop:stopPerformance,switchMode,loadShow,renderSequence,hit,saveFavourite,showShelf};
