import {LEVELS, validateLevel} from './levels.js';
import {TrailGame, STEP} from './engine.js';
import {TrailRenderer, loadArt} from './renderer.js';
const $=id=>document.getElementById(id);
const controls=[...document.querySelectorAll('[data-control]')];
const level=validateLevel(LEVELS.find(l=>l.id===new URLSearchParams(location.search).get('level'))||LEVELS[0]);
const game=new TrailGame(level), render=new TrailRenderer($('gameCanvas'));
let mode='loading', toastTimer, last=0, accumulator=0, best=0, jumpPressed=false;
const keys=new Set(),pointers=new Map();
const saveKey='claire-treat-trail-best:'+level.id;
try{best=Math.max(0,Math.min(level.treats.length,Number(localStorage.getItem(saveKey))||0));}catch(_){}
const keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump'};
function down(action){return [...keys].some(code=>keyMap[code]===action)||[...pointers.values()].includes(action);}
function clearInput(){keys.clear();pointers.clear();jumpPressed=false;controls.forEach(b=>b.classList.remove('held'));}
function input(){const state={left:down('left'),right:down('right'),jump:down('jump'),jumpPressed};jumpPressed=false;return state;}
function syncButtons(){controls.forEach(b=>b.classList.toggle('held',down(b.dataset.control)));}
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
function score(){ $('treatCount').innerHTML=`${game.collected.size} <small>/ ${level.treats.length}</small>`; }
function setMode(next){mode=next;document.body.dataset.gameRunning=next==='playing'?'true':'false';clearInput();controls.forEach(b=>b.disabled=next!=='playing');$('pauseButton').disabled=next!=='playing';}
function dialog(title,text,primary,secondary='',note=''){
 $('dialogTitle').textContent=title;$('dialogText').textContent=text;
 $('primaryButton').textContent=primary;$('primaryButton').disabled=false;
 $('secondaryButton').textContent=secondary;$('secondaryButton').hidden=!secondary;
 $('dialogNote').textContent=note;$('howTo').hidden=true;
 $('overlay').hidden=false;
 $('bestNote').textContent=best?`Best on this device: ${best} of ${level.treats.length} treats`:'';
 $('primaryButton').focus({preventScroll:true});
}
function play(restart=false){if(restart){game.reset();render.camera=0;score();}$('overlay').hidden=true;setMode('playing');last=performance.now();accumulator=0;}
function pause(){if(mode!=='playing')return;setMode('paused');dialog('A little rest?','Your friends will wait right here.','Keep going','Start over','No treats are lost while paused.');}
function finish(){
 setMode('finished');best=Math.max(best,game.collected.size);try{localStorage.setItem(saveKey,String(best));}catch(_){}
 $('dialogBadge').textContent='THE PICNIC CLUB MADE IT!';
 dialog(game.collected.size===level.treats.length?'Every treat found!':'Picnic time!',`You and your friends found ${game.collected.size} of ${level.treats.length} treats in ${level.name}. Well done, Claire!`,'Play again','Back to Stories','One level for now. More adventures can be added later!');
}
$('primaryButton').addEventListener('click',()=>{
 if(mode==='ready'){play();toast('Hold a direction, then hold Jump for a big hop!');}
 else if(mode==='paused')play();
 else if(mode==='confirm-restart'||mode==='finished'){ $('dialogBadge').textContent='ONE LITTLE LEVEL. FOUR BEST FRIENDS.';play(true); }
});
$('secondaryButton').addEventListener('click',()=>{
 if(mode==='paused'){setMode('confirm-restart');dialog('Start this level again?','The treats in this run will reset. Your best score stays saved.','Yes, start again','Keep playing');}
 else if(mode==='confirm-restart')play();else if(mode==='finished')location.href='./';
});
$('pauseButton').addEventListener('click',pause);
for(const b of controls){
 b.addEventListener('pointerdown',e=>{
  if(mode!=='playing')return;e.preventDefault();
  const wasJump=down('jump');pointers.set(e.pointerId,b.dataset.control);
  if(!wasJump&&down('jump'))jumpPressed=true;
  try{b.setPointerCapture(e.pointerId);}catch(_){}syncButtons();
 });
 const release=e=>{pointers.delete(e.pointerId);syncButtons();};
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
 b.addEventListener('contextmenu',e=>e.preventDefault());
}
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'){if(mode==='playing')pause();else if(mode==='paused')play();return;}
 const action=keyMap[e.code];if(!action||mode!=='playing')return;e.preventDefault();
 if(action==='jump'&&!down('jump')&&!e.repeat)jumpPressed=true;
 keys.add(e.code);syncButtons();
});
window.addEventListener('keyup',e=>{const action=keyMap[e.code];if(action){keys.delete(e.code);if(mode==='playing')e.preventDefault();syncButtons();}});
window.addEventListener('blur',()=>{clearInput();pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause();}});
document.addEventListener('storybook:offline-ready',()=>{$('offlineStatus').textContent='Beta 1 | Saved for offline play';});
document.addEventListener('storybook:update-ready',()=>toast('An update is ready for the next time you open the game.'));
function handleEvents(){
 for(const e of game.takeEvents()){
  if(e.type==='treat'){
   score();const counter=document.querySelector('.treat-counter');counter.classList.remove('pop');void counter.offsetWidth;counter.classList.add('pop');
  }else if(e.type==='checkpoint')toast('A safe spot! Your treats stay with you.');
  else if(e.type==='rescue'){render.camera=Math.max(0,game.player.x-render.view*.5);toast('A little splash! Back to your safe spot. Treats kept!');}
  else if(e.type==='finish')finish();
 }
}
function frame(now){
 const elapsed=Math.min(.1,(now-last)/1000||0);last=now;
 if(mode==='playing'){
  accumulator+=elapsed;let steps=0;
  while(accumulator>=STEP&&steps++<7){game.step(input(),STEP);accumulator-=STEP;handleEvents();if(mode!=='playing'){accumulator=0;break;}}
  const progress=Math.max(0,Math.min(1,(game.player.x-level.start.x)/(level.goal.x-level.start.x)));
  $('progressFill').style.transform=`scaleX(${progress})`;
 }
 render.draw(game,elapsed);requestAnimationFrame(frame);
}
const resize=()=>render.resize();
new ResizeObserver(resize).observe($('gameCanvas'));window.addEventListener('resize',resize);
(async()=>{
 try{
  await loadArt();resize();score();setMode('ready');
  if(document.documentElement.dataset.offlineReady==='true')$('offlineStatus').textContent='Beta 1 | Saved for offline play';
  $('primaryButton').disabled=false;$('primaryButton').textContent="Let's go!";
  $('bestNote').textContent=best?`Best on this device: ${best} of ${level.treats.length} treats`:'Pusheen + Hello Kitty + Raspberry';
  $('dialogBadge').textContent=`LEVEL ${LEVELS.indexOf(level)+1} | ${level.name.toUpperCase()} | BETA 1`;
  document.querySelector('.route>span').textContent=level.name;
  last=performance.now();requestAnimationFrame(frame);
 }catch(error){console.error(error);setMode('error');dialog('A little hiccup','Please reload while online to finish loading this game.','Reload');$('primaryButton').onclick=()=>location.reload();}
})();
// Opt-in diagnostics for repeatable beta testing; absent from normal play.
if(new URLSearchParams(location.search).has('debug')){
 window.trailDebug={game,render,get mode(){return mode;},get keys(){return [...keys];},get pointers(){return [...pointers.values()];},play,pause};
}
