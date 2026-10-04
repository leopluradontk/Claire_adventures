import {MODES,rules,SnakeGame} from './snake-model.js';
import {SnakeRenderer} from './snake-art.js';
import {characterSVG} from './designs.js';
import {ArcadeStore} from './store.js';
import {shell,$,saved,popParty,showLayer} from './common.js';
const store=new ArcadeStore(),renderer=new SnakeRenderer($('snakeCanvas'));
let g=null,state='menu',adventure=false,stage=-1,runKey='',last=0,acc=0,countdown=3,countClock=0,saveClock=0,ready=false;
const ui=shell('beach',pause,store),arrows={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
const team=()=>['claire','pusheen','kitty','raspberry'].map(k=>'<span>'+characterSVG(k)+'</span>').join('');$('menuFriends').innerHTML=team();
function save(){if(g&&!g.over&&['playing','paused','countdown'].includes(state))store.run('snake',runKey,{v:1,mode:g.mode.id,adventure,stage,game:g.snapshot()});saved(store);}
function envelope(id){const s=store.state().snakeRuns[id];if(!s||s.v!==1||s.adventure!==(id==='adventure')||(s.adventure&&MODES[s.stage]?.id!==s.mode))return null;const game=SnakeGame.restore(s.game);return game&&game.mode.id===s.mode?{s,game}:null;}
function menu(){
 save();state='menu';g=null;ui.stop();document.body.dataset.gameRunning='false';$('menu').hidden=false;$('play').hidden=true;$('gameLayer').hidden=true;$('difficultyCards').replaceChildren();
 const data=store.state();$('swipeOption').checked=data.prefs.swipe;
 MODES.forEach((m,i)=>{
  const card=document.createElement('article');card.className='difficulty-card snake-option';
  card.innerHTML='<div class="mode-top"><span class="difficulty-symbol">'+(i+1)+'</span><strong>'+m.name+'</strong></div><div class="rule-pictures"><span>'+(m.wrap?'&#8644; Wrap edges':'&#9633; Solid edges')+'</span><span>'+(m.tail?'&#10227; Avoid tail':'&#9825; Tail is safe')+'</span><span>'+(m.blocks?'&#10047; Flower beds':'&#10004; Clear garden')+'</span></div><small>Best: '+(data.snakeBest[m.id]||0)+' friends</small><div class="mode-actions"><button class="primary" data-mode="'+m.id+'">'+(envelope(m.id)?'Continue round':'Play')+'</button><button class="soft" data-rules="'+m.id+'" aria-label="Read '+m.name+' rules">&#9835; Rules</button></div>';
  card.querySelector('[data-mode]').onclick=()=>begin(m.id,false,-1,!!envelope(m.id));card.querySelector('[data-rules]').onclick=()=>ui.say(rules(m));$('difficultyCards').append(card);
 });
 const n=data.snakeNext===6?0:data.snakeNext;$('adventureNote').textContent=data.snakeNext===6?'All six stages complete! You can play the journey again.':'Next: '+MODES[n].name+' | Collect '+MODES[n].target+' friends';
 $('adventurePlay').textContent=envelope('adventure')?'Continue Adventure':'Start Adventure';$('adventurePlay').onclick=()=>{const s=envelope('adventure');begin(s?.game.mode.id||MODES[n].id,true,s?.s.stage??n,!!s);};saved(store);
}
function begin(id,journey=false,n=-1,resume=false){
 adventure=journey;stage=n;runKey=journey?'adventure':id;const old=resume?envelope(runKey):null;
 g=old?.game||new SnakeGame(id);if(old){adventure=old.s.adventure;stage=old.s.stage;}
 $('menu').hidden=true;$('play').hidden=false;document.body.dataset.gameRunning='true';renderer.resize();update();startCountdown();
}
function startCountdown(){
 state='countdown';countdown=3;countClock=0;acc=0;g.queue=[];ui.touch();$('gameLayer').hidden=false;
 showLayer('3',rules(g.mode),[['Pause',pause,true]],'<div class="count-portrait">'+characterSVG('claire')+'</div>');
 $('layerText').textContent=(adventure?'Stage '+(stage+1)+'/6. Collect '+g.mode.target+' friends. ':'')+rules(g.mode);last=performance.now();save();
}
function update(){
 if(!g)return;$('boardName').textContent=g.mode.name+(adventure?' | Adventure '+(stage+1)+'/6':'');
 $('collectedCount').textContent=g.score;$('bestCount').textContent=store.state().snakeBest[g.mode.id]||0;$('targetCount').textContent=adventure?g.mode.target:'Explore';
 $('speedInfo').textContent=g.mode.wrap?'Edges wrap around':'Stay inside the edges';$('tailRule').textContent=g.mode.tail?'Avoid your tail':'Your tail is safe';
 $('snakeMessage').textContent=g.food?'Follow Claire! Collect the friend on the gold tile.':'Keep moving to open a space for a friend.';
 renderer.draw(g);
}
function turn(dir){if(g&&['playing','countdown'].includes(state)){g.turn(dir);renderer.draw(g);}}
function pause(){
 if(!['playing','countdown'].includes(state))return;state='paused';g.queue=[];save();ui.stop();
 showLayer('Your friends are waiting','Your round is saved. Take a little break.',[['Keep playing',startCountdown],['Choose a mode',menu,true],['Start again',restart,true]],'<div class="party-friends">'+team()+'</div>');
}
async function restart(){if(await ui.ask('Start a fresh line?','Your best scores, Adventure progress and earned stars stay safe.','Start again','Keep this round'))begin(g.mode.id,adventure,stage,false);}
function finish(reason,stageDone=false){
 state='finished';g.over=true;g.queue=[];store.snakeScore(g.mode.id,g.score);store.run('snake',runKey,null);let bonus=0;if(stageDone)bonus=store.snakeStage(stage);saved(store);ui.stop();
 const buttons=[];if(stageDone&&stage<5)buttons.push(['Next: '+MODES[stage+1].name,()=>begin(MODES[stage+1].id,true,stage+1,false)]);
 buttons.push(['Play Again',()=>begin(g.mode.id,adventure,stage,false)],['Choose a mode',menu,true]);
 const title=g.won?'The whole garden is full!':stageDone?(stage===5?'Adventure complete!':'Stage complete!'):'A lovely line of friends!';
 const text=g.score+' friends collected. Best: '+(store.state().snakeBest[g.mode.id]||0)+'. '+(stageDone?(bonus?'+1 stage star! ':'')+'Ready for the next adventure?':reason==='bump'?'A little bump. Your stars are safe. Try again!':'What a wonderful team!');
 showLayer(title,text,buttons,'<div class="party-friends">'+team()+'</div>');if(stageDone||g.won)popParty(ui);else{ui.audio.unlock();ui.audio.fx('checkpoint');}
}
function tick(){
 const evt=g.step();if(evt==='collect'||evt==='win'){
  const gained=store.snakeScore(g.mode.id,g.score);ui.audio.fx('treat',g.score);save();update();
  if(g.score%5===0){$('collectedCount').classList.remove('milestone');void $('collectedCount').offsetWidth;$('collectedCount').classList.add('milestone');}if(g.score%5===0)ui.notify(g.score+' friends!'+(gained?' +1 friendship star.':''));
  if(adventure&&g.score>=g.mode.target){finish('stage',true);return;}
 }if(evt==='bump'||evt==='win')finish(evt);else update();
}
$('pauseButton').onclick=pause;$('restartButton').onclick=()=>{pause();restart();};$('boardMenu').onclick=menu;
$('readRules').onclick=()=>{pause();ui.say(rules(g?.mode||MODES[0]));};$('swipeOption').onchange=e=>store.pref('swipe',e.target.checked);
for(const b of document.querySelectorAll('[data-dir]')){
 b.addEventListener('pointerdown',e=>{if(e.button>0)return;e.preventDefault();turn(b.dataset.dir);b.classList.add('held');b.setPointerCapture?.(e.pointerId);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>b.classList.remove('held'));
 b.addEventListener('click',e=>{if(e.detail===0)turn(b.dataset.dir);});
}
let swipe=null;const canvas=$('snakeCanvas');
canvas.addEventListener('pointerdown',e=>{if(!store.state().prefs.swipe||swipe||e.button>0)return;e.preventDefault();swipe={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(swipe?.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));swipe.x=e.clientX;swipe.y=e.clientY;});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(swipe?.id===e.pointerId)swipe=null;});
window.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]'))return;
 if(e.code==='Escape'||e.code==='Space'){if(['playing','countdown'].includes(state)){e.preventDefault();pause();}else if(state==='paused'){e.preventDefault();startCountdown();}return;}
 if(arrows[e.code]&&['playing','countdown'].includes(state)){e.preventDefault();if(!e.repeat)turn(arrows[e.code]);}
});
window.addEventListener('pagehide',save);new ResizeObserver(()=>{renderer.resize();if(g)renderer.draw(g);}).observe(canvas);
function frame(t){const dt=Math.min(100,Math.max(0,t-last));last=t;
 if(state==='countdown'){
  countClock+=dt;if(countClock>=1000){countClock-=1000;countdown--;if(countdown<=0){state='playing';$('gameLayer').hidden=true;acc=0;canvas.focus({preventScroll:true});}else{$('layerTitle').textContent=countdown;ui.audio.fx('treat',countdown);}}
 }else if(state==='playing'){
  acc+=dt;saveClock+=dt;if(acc>=g.interval){acc-=g.interval;tick();}if(saveClock>=1000){saveClock=0;save();}
 }if(g)renderer.draw(g,t/1000);requestAnimationFrame(frame);
}
(async()=>{try{await renderer.load();ready=true;menu();requestAnimationFrame(frame);}catch(e){console.error(e);$('menu').innerHTML='<h2>Please reopen while online</h2><p>The character artwork could not load.</p><a href="./">Home</a>';}})();
if(new URLSearchParams(location.search).has('debug'))window.arcadeDebug={get game(){return g;},get state(){return state;},begin,pause,menu,turn,tick,store,renderer,finish};

$('soundToggle').addEventListener('click',()=>{if(!['playing','countdown'].includes(state))ui.stop();});
