/* Treat Trail Beta 2: menus, saves, audio and celebration; original physics retained. */
import {LEVELS, validateLevel} from './levels.js?v=beta2';
import {TrailGame, STEP} from './engine.js?v=beta2';
import {TrailRenderer, loadArt} from './renderer.js?v=beta2';
import {CelebrationRenderer} from './celebration.js?v=beta2';
import {ProgressStore, starsFor} from './progress.js?v=beta2';
import {TrailAudio} from './audio.js?v=beta2';
const $=id=>document.getElementById(id), controls=[...document.querySelectorAll('[data-control]')];
const store=new ProgressStore(), settings=store.settings();
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
let level=validateLevel(LEVELS.find(l=>l.id===new URLSearchParams(location.search).get('level'))||LEVELS[0]);
let game=new TrailGame(level), mode='loading', loaded=false, activeRun=false, settingsReturn='levels', pausedFrom='playing';
const render=new CelebrationRenderer($('gameCanvas')), audio=new TrailAudio(settings,text=>toast(text));
let last=0, accumulator=0, jumpPressed=false, toastTimer, storageWarning=false, primaryAction,secondaryAction,thirdAction;
const keys=new Set(),pointers=new Map(), keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump'};
function down(action){return [...keys].some(code=>keyMap[code]===action)||[...pointers.values()].includes(action);}
function clearInput(){keys.clear();pointers.clear();jumpPressed=false;controls.forEach(b=>b.classList.remove('held'));}
function input(){const state={left:down('left'),right:down('right'),jump:down('jump'),jumpPressed};jumpPressed=false;return state;}
function syncButtons(){controls.forEach(b=>b.classList.toggle('held',down(b.dataset.control)));}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3000);}
function storageStatus(){
  if(!store.available){
    $('saveStatus').textContent='Saving unavailable on this device';$('menuSaveNote').textContent='Saving is unavailable here. You can still play.';
    if(!storageWarning){storageWarning=true;toast('This browser cannot save progress. You can still play.');}
  }
}
function saveRun(){if(activeRun&&!game.finished){store.save(game);$('saveStatus').textContent=game.checkpointIndex<0?'Saved: start of the trail':'Saved: safe spot '+(game.checkpointIndex+1);}storageStatus();}
function score(){ $('treatCount').innerHTML=`${game.collected.size} <small>/ ${level.treats.length}</small>`; }
function setMode(next){
  mode=next;clearInput();accumulator=0;last=performance.now();
  document.body.dataset.gameRunning=(activeRun||next==='celebrating'||next==='finished')?'true':'false';
  document.body.classList.toggle('modal-open',!['playing','celebrating','finished'].includes(next));
  controls.forEach(b=>b.disabled=next!=='playing');$('pauseButton').disabled=!['playing','celebrating'].includes(next);
  $('controls').hidden=next==='finished';$('resultBar').hidden=next!=='finished';
  $('hud').hidden=['celebrating','finished'].includes(next);
  $('celebrateBanner').hidden=next!=='celebrating';
  $('overlay').hidden=['playing','celebrating','finished'].includes(next);
  if(!['playing','celebrating'].includes(next))audio.pause();
}
function panel(id){for(const n of ['levelPanel','messagePanel','settingsPanel'])$(n).hidden=n!==id;}
function message(title,text,primary,secondary=null,third=null,note=''){
  panel('messagePanel');$('dialogTitle').textContent=title;$('dialogText').textContent=text;$('dialogNote').textContent=note;
  for(const [id,item] of [['primaryButton',primary],['secondaryButton',secondary],['thirdButton',third]]){
    $(id).hidden=!item;$(id).textContent=item?.[0]||'';$(id).disabled=false;
  }
  primaryAction=primary?.[1];secondaryAction=secondary?.[1];thirdAction=third?.[1];
  $('primaryButton').focus({preventScroll:true});
}
$('primaryButton').addEventListener('click',()=>primaryAction?.());
$('secondaryButton').addEventListener('click',()=>secondaryAction?.());
$('thirdButton').addEventListener('click',()=>thirdAction?.());
function stars(n){const el=document.createElement('span');el.className='stars';el.setAttribute('aria-label',n+' of 3 stars');for(let i=0;i<3;i++){const s=document.createElement('span');s.textContent='\u2605';s.setAttribute('aria-hidden','true');if(i<n)s.className='earned';el.append(s);}return el;}
function selectLevel(next){level=validateLevel(next);game=new TrailGame(level);render.clear();render.camera=0;activeRun=false;score();$('routeName').textContent=level.name;$('progressFill').style.transform='scaleX(0)';}
function showLevels(){
  saveRun();activeRun=false;setMode('levels');panel('levelPanel');render.clear();
  // The menu preview is a fresh scene; saved data remains in local storage.
  game=new TrailGame(level);render.camera=0;score();$('levelCards').replaceChildren();
  for(const l of LEVELS){
    const saved=store.load(l),best=store.best(l),card=document.createElement('article');card.className='level-card';
    const picture=document.createElement('canvas');picture.className='level-picture';picture.setAttribute('aria-hidden','true');
    const info=document.createElement('div');info.className='level-info';
    const number=document.createElement('span');number.className='level-number';number.textContent='LEVEL '+(LEVELS.indexOf(l)+1);
    const name=document.createElement('h3');name.textContent=l.name;
    const meta=document.createElement('div');meta.className='level-meta';meta.append(stars(best.stars));
    const label=document.createElement('span');label.className='best-label';label.textContent=best.complete?`Best: ${best.count} / ${l.treats.length} treats`:`${l.treats.length} treats to discover`;meta.append(label);
    const note=document.createElement('p');note.className='little-note';note.textContent=saved?`${saved.collected.length} treats saved. Continue from your last safe spot.`:'1 star: finish | 2: '+Math.ceil(l.treats.length*.75)+' treats | 3: all '+l.treats.length;
    const button=document.createElement('button');button.className='primary-button';button.textContent=saved?'Continue Adventure':"Let's go!";button.dataset.startLevel=l.id;
    button.addEventListener('click',()=>startLevel(l,Boolean(saved)));
    info.append(number,name,meta,note,button);
    if(saved){const fresh=document.createElement('button');fresh.className='text-button start-again';fresh.textContent='Start Again';fresh.addEventListener('click',()=>confirmNew(l,showLevels));info.append(fresh);}
    card.append(picture,info);$('levelCards').append(card);
    requestAnimationFrame(()=>{if(picture.isConnected){const preview=new TrailRenderer(picture);preview.resize();preview.view=900;preview.scale=preview.cssW/900;preview.ox=0;preview.oy=preview.cssH-520*preview.scale;preview.draw(new TrailGame(l),0);}});
  }
  storageStatus();$('levelCards').querySelector('button')?.focus({preventScroll:true});
}
function startLevel(l,resume=false){
  const saved=resume?store.load(l):null;selectLevel(l);
  if(saved)store.restore(game,saved);
  activeRun=true;score();saveRun();render.camera=Math.max(0,game.player.x-render.view*.5);
  audio.unlock();audio.start(level.music);setMode('playing');
  toast(saved?'Welcome back! Your treats are still here.':'Hold a direction and Jump for a big hop!');
}
function resumeMode(target){
  audio.unlock();
  if(target==='playing'){audio.start(level.music);setMode('playing');}
  else if(target==='celebrating')setMode('celebrating');
  else if(target==='finished')showResults();
  else showLevels();
}
function pause(){
  if(!['playing','celebrating'].includes(mode))return;
  pausedFrom=mode;saveRun();setMode('paused');
  message('A little rest?','Your friends will wait right here.', ['Keep going',()=>resumeMode(pausedFrom)],
    ['Level menu',showLevels],['Start over',()=>confirmNew(level,()=>resumeMode(pausedFrom))],'Your collected treats stay safe.');
}
function confirmNew(l,cancel){
  saveRun();setMode('confirm-restart');
  message('Start this level again?','The treats in this run will reset. Your stars and best score stay saved.',
    ['Yes, start again',()=>startLevel(l,false)],['Keep my adventure',cancel]);
}
function finish(){
  activeRun=false;store.finish(game);$('saveStatus').textContent='Adventure complete | Stars saved on this device';storageStatus();render.begin(game);setMode('celebrating');
  $('celebrateTitle').textContent=game.collected.size===level.treats.length?'Every treat found!':'We made it!';
  clearTimeout(toastTimer);$('toast').classList.remove('show');audio.victory(game.collected.size===level.treats.length);
  $('skipCelebration').focus({preventScroll:true});
}
function showResults(){
  setMode('finished');const n=starsFor(game.collected.size,level.treats.length),best=store.best(level);
  $('resultTitle').textContent=n===3?'Every treat found!':'Picnic time!';
  $('resultText').textContent=`${game.collected.size} of ${level.treats.length} treats. Well done, Claire!`;
  $('bestText').textContent=store.available?`Best on this device: ${best.count} treats. ${best.stars} of 3 stars.`:'This run is complete. Device saving is unavailable.';
  $('resultStars').replaceChildren(stars(n));$('replayButton').focus({preventScroll:true});
}
$('skipCelebration').addEventListener('click',()=>{render.skip();showResults();});
$('replayButton').addEventListener('click',()=>startLevel(level,false));
$('levelsButton').addEventListener('click',showLevels);
$('pauseButton').addEventListener('click',pause);
function effectiveGentle(){return settings.gentle||motion.matches;}
function applySettings(persist=true){
  const gentle=effectiveGentle();render.gentle=gentle;audio.apply({...settings,gentle});
  $('controls').classList.toggle('big-controls',settings.large);document.body.classList.toggle('gentle',gentle);
  $('musicVolume').value=settings.music;$('effectsVolume').value=settings.effects;
  $('musicValue').textContent=settings.music+'%';$('effectsValue').textContent=settings.effects+'%';
  $('muteSetting').checked=settings.muted;$('gentleSetting').checked=gentle;$('gentleSetting').disabled=motion.matches;
  $('motionNote').hidden=!motion.matches;$('largeSetting').checked=settings.large;
  $('muteButton').textContent=settings.muted?'\u266a\u00d7':'\u266b';
  $('muteButton').setAttribute('aria-pressed',String(settings.muted));
  $('muteButton').setAttribute('aria-label',settings.muted?'Unmute sound':'Mute all sound');
  $('muteButton').title=settings.muted?'Sound off - tap to unmute':'Sound on - tap to mute';
  if(persist){store.saveSettings(settings);storageStatus();}
}
function openSettings(){
  if(!loaded||mode==='settings')return;
  settingsReturn=mode;saveRun();setMode('settings');panel('settingsPanel');applySettings(false);$('musicVolume').focus({preventScroll:true});
}
function closeSettings(){
  if(settingsReturn==='paused'){setMode('paused');message('A little rest?','Your friends will wait right here.',
    ['Keep going',()=>resumeMode(pausedFrom)],['Level menu',showLevels],['Start over',()=>confirmNew(level,()=>resumeMode(pausedFrom))]);}
  else if(settingsReturn==='confirm-restart')confirmNew(level,showLevels);
  else resumeMode(settingsReturn);
}
$('settingsButton').addEventListener('click',openSettings);$('closeSettings').addEventListener('click',closeSettings);
for(const [id,key] of [['musicVolume','music'],['effectsVolume','effects']])$(id).addEventListener('input',()=>{settings[key]=Number($(id).value);applySettings();});
for(const [id,key] of [['muteSetting','muted'],['gentleSetting','gentle'],['largeSetting','large']])$(id).addEventListener('change',()=>{settings[key]=$(id).checked;applySettings();});
$('muteButton').addEventListener('click',()=>{settings.muted=!settings.muted;applySettings();if(!settings.muted&&['playing','celebrating'].includes(mode))audio.unlock();});
if(motion.addEventListener)motion.addEventListener('change',()=>applySettings(false));
else motion.addListener(()=>applySettings(false));
applySettings(false);
for(const b of controls){
  b.addEventListener('pointerdown',e=>{if(mode!=='playing')return;e.preventDefault();const was=down('jump');pointers.set(e.pointerId,b.dataset.control);
    if(!was&&down('jump'))jumpPressed=true;try{b.setPointerCapture(e.pointerId);}catch(_){}syncButtons();});
  const release=e=>{pointers.delete(e.pointerId);syncButtons();};
  for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,release);
  b.addEventListener('contextmenu',e=>e.preventDefault());
}
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'){if(['playing','celebrating'].includes(mode))pause();else if(mode==='paused')resumeMode(pausedFrom);else if(mode==='settings')closeSettings();return;}
  if(e.code==='Tab'&&!$('overlay').hidden){
    const visible=[...$('overlay').querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')].filter(el=>el.getClientRects().length);
    const first=visible[0],end=visible.at(-1);
    if(e.shiftKey&&(document.activeElement===first||!$('overlay').contains(document.activeElement))){e.preventDefault();end?.focus();}
    else if(!e.shiftKey&&(document.activeElement===end||!$('overlay').contains(document.activeElement))){e.preventDefault();first?.focus();}return;
  }
  const action=keyMap[e.code];if(!action||mode!=='playing')return;e.preventDefault();
  if(action==='jump'&&!down('jump')&&!e.repeat)jumpPressed=true;keys.add(e.code);syncButtons();
});
window.addEventListener('keyup',e=>{if(keyMap[e.code]){keys.delete(e.code);if(mode==='playing')e.preventDefault();syncButtons();}});
function background(){saveRun();clearInput();pause();audio.pause();}
window.addEventListener('blur',background);
document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});
window.addEventListener('pagehide',background);
$('storiesLink').addEventListener('click',()=>{saveRun();audio.pause();});
document.addEventListener('storybook:offline-ready',()=>{$('offlineStatus').textContent='Beta 2 | Saved for offline play';});
document.addEventListener('storybook:update-ready',()=>{saveRun();toast('Update ready for next time. Your progress is saved.');});
function handleEvents(){
  for(const e of game.takeEvents()){
    if(e.type==='jump')audio.fx('jump');
    else if(e.type==='treat'){score();saveRun();audio.fx('treat',game.collected.size);const c=document.querySelector('.treat-counter');c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');}
    else if(e.type==='checkpoint'){saveRun();audio.fx('checkpoint');toast('A safe spot! Your adventure is saved.');}
    else if(e.type==='rescue'){render.camera=Math.max(0,game.player.x-render.view*.5);audio.fx('rescue');toast('A little splash! Treats kept. Back to your safe spot.');}
    else if(e.type==='finish')finish();
  }
}
function frame(now){
  const dt=Math.min(.1,(now-last)/1000||0);last=now;
  if(mode==='playing'){
    accumulator+=dt;let steps=0;
    while(accumulator>=STEP&&steps++<7){game.step(input(),STEP);accumulator-=STEP;handleEvents();if(mode!=='playing'){accumulator=0;break;}}
    const p=Math.max(0,Math.min(1,(game.player.x-level.start.x)/(level.goal.x-level.start.x)));$('progressFill').style.transform=`scaleX(${p})`;
  }else if(mode==='celebrating'||mode==='finished'){
    const done=render.advance(dt,()=>audio.fx('pop'));if(done&&mode==='celebrating')showResults();
  }
  render.draw(game,dt);requestAnimationFrame(frame);
}
new ResizeObserver(()=>render.resize()).observe($('gameCanvas'));window.addEventListener('resize',()=>render.resize());
setMode('loading');message('Getting ready...','Your friends are putting on their walking shoes.',['Loading',()=>{}]);$('primaryButton').disabled=true;
(async()=>{
  try{await loadArt();render.resize();loaded=true;showLevels();
    if(document.documentElement.dataset.offlineReady==='true')$('offlineStatus').textContent='Beta 2 | Saved for offline play';
    last=performance.now();requestAnimationFrame(frame);
  }catch(error){console.error(error);setMode('error');message('A little hiccup','Please reload while online to finish loading the game.',['Reload',()=>location.reload()]);}
})();
// Explicit opt-in test hooks; absent during ordinary play.
if(new URLSearchParams(location.search).has('debug'))window.trailDebug={get game(){return game;},render,audio,store,settings,
  get mode(){return mode;},get keys(){return [...keys];},get pointers(){return [...pointers.values()];},
  play:()=>startLevel(level,false),pause,showLevels,finish,handleEvents,saveRun,applySettings,
  finishForTest(count=40){game.collected=new Set(Array.from({length:Math.min(count,level.treats.length)},(_,i)=>i));Object.assign(game.player,level.goal,{vx:0,vy:0,grounded:true});game.finished=true;finish();score();}};
