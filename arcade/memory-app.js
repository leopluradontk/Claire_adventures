import {COUNTS,STAGES,cardSVG,cardName,characterSVG} from './designs.js';
import {MemoryGame,memoryPairs} from './memory-model.js';
import {ArcadeStore,uid} from './store.js';
import {shell,$,saved,timeText,popParty,showLayer} from './common.js';
const store=new ArcadeStore();let g=null,state='menu',difficulty='easy',stage=-1,token='',runKey='',last=0,saveClock=0,cols=6;
const ui=shell('snow',pause,store);
const names={easy:'Easy',medium:'Medium',hard:'Hard',expert:'Expert',adventure:'Adventure'};
const team=()=>['claire','pusheen','kitty','raspberry'].map(k=>'<span>'+characterSVG(k)+'</span>').join('');
$('menuFriends').innerHTML=team();
function save(){if(g&&!g.finished)store.run('memory',runKey,{v:1,mode:difficulty,stage,token,game:g.snapshot()});saved(store);}
function envelope(id){const s=store.state().memoryRuns[id];if(!s||s.v!==1||typeof s.token!=='string'||s.token.length>80||!(s.mode in names)||s.stage!==(s.mode==='adventure'?Number(id.split('-').at(-1)):-1))return null;const game=MemoryGame.restore(s.game);return game&&game.pairs===memoryPairs(s.mode,s.stage)?{s,game}:null;}
function keyFor(mode,n){return mode==='adventure'?'adventure-'+n:mode;}
function menu(){
 save();state='menu';g=null;ui.stop();document.body.dataset.gameRunning='false';$('menu').hidden=false;$('play').hidden=true;$('gameLayer').hidden=true;
 $('difficultyCards').replaceChildren();const data=store.state();$('timerOption').checked=data.prefs.timer;$('hintOption').checked=data.prefs.hints;
 for(const mode of Object.keys(names)){
  const n=mode==='adventure'?(data.memoryNext===7?0:data.memoryNext):-1,pairs=memoryPairs(mode,n),id=keyFor(mode,n),s=envelope(id);
  const b=document.createElement('button');b.className='difficulty-card';b.dataset.mode=mode;
  const solo=data.memoryBest[id+'-solo'],best=solo||data.memoryBest[id+'-helped'];
  b.innerHTML='<span class="difficulty-symbol">'+({easy:'&#9825;',medium:'&#9829;',hard:'&#9733;',expert:'&#10022;',adventure:'&#127752;'}[mode])+'</span><strong>'+names[mode]+'</strong><span>'+(mode==='adventure'?'7 boards: 12 to 30 pairs':pairs+' pairs / '+pairs*2+' cards')+'</span><small>'+(s?'Continue saved board':mode==='adventure'?(data.memoryNext===7?'Adventure complete! Play again':'Next: board '+(n+1)+' of 7'):best?'Best'+(solo?'':' with hints')+': '+best.moves+' moves'+(data.prefs.timer?' | '+timeText(best.ms):''):'Solo, duo &amp; group pictures')+'</small>';
  b.onclick=()=>start(mode,n,!!s);$('difficultyCards').append(b);
 }
 saved(store);
}
function start(mode,n=-1,resume=false){
 difficulty=mode;stage=n;runKey=keyFor(mode,n);const old=resume?envelope(runKey):null;
 g=old?.game||new MemoryGame(memoryPairs(mode,n));token=old?.s.token||uid();state='playing';
 document.body.dataset.gameRunning='true';$('menu').hidden=true;$('play').hidden=false;$('gameLayer').hidden=true;
 $('boardName').textContent=names[mode]+(mode==='adventure'?' '+(stage+1)+'/7':'')+' | '+g.pairs+' pairs';
 buildBoard();ui.touch();save();last=performance.now();
}
function buildBoard(){
 $('memoryGrid').replaceChildren();g.deck.forEach((id,i)=>{const b=document.createElement('button');b.className='memory-card';b.dataset.card=i;b.setAttribute('aria-label','Hidden card '+(i+1));
 b.innerHTML='<span class="flip-inner"><span class="card-side card-back"><span class="back-star">&#10022;</span><span class="back-heart">&#9825;</span><span class="back-star">&#10022;</span></span><span class="card-side card-front">'+cardSVG(id)+'<span class="matched-tick">&#10003;</span></span></span>';
 b.onclick=()=>{if(state!=='playing')return;const event=g.flip(i);if(!event)return;ui.touch();ui.audio.fx('treat',g.open.length);update();save();};$('memoryGrid').append(b);
 });layout();update();
}
function update(){
 const prefs=store.state().prefs;$('pairsFound').textContent=g.found+' / '+g.pairs;$('moveCount').textContent=g.moves;$('timerStat').hidden=!prefs.timer;$('clock').textContent=timeText(g.elapsed);
 $('hintButton').hidden=!prefs.hints;$('hintButton').disabled=state!=='playing'||!!g.wait||!!g.preview;$('inspectButton').disabled=!g.open.length||!!g.preview||state!=='playing';
 $('memoryMessage').textContent=g.preview?'A little peek! This is a helped game.':g.wait?'Take a look at your two pictures.':g.open.length?'Find the exact same picture.':'Turn two cards. Same friends, same places!';
 for(const b of $('memoryGrid').children){const i=Number(b.dataset.card),matched=g.matched.includes(i),shown=matched||g.open.includes(i)||g.preview>0;b.classList.toggle('revealed',shown);b.classList.toggle('matched',matched);b.disabled=matched;b.setAttribute('aria-label',shown?cardName(g.deck[i])+(matched?', matched':''):'Hidden card '+(i+1));}
}
function layout(){
 if(!g||$('play').hidden)return;const r=$('memoryGrid').getBoundingClientRect(),land=r.width>r.height*.85;
 const n=g.deck.length;cols=land?({24:6,30:6,36:6,42:7,48:8,54:9,60:10}[n]):({24:4,30:5,36:6,42:6,48:6,54:6,60:6}[n]);
 $('memoryGrid').style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;$('memoryGrid').style.gridTemplateRows=`repeat(${Math.ceil(n/cols)},minmax(0,1fr))`;
}
function pause(){
 if(state!=='playing')return;state='paused';save();ui.stop();update();
 showLayer('A little rest?','Your board and moves are saved. The clock is paused.',[['Keep playing',resume],['Choose a board',menu,true],['Start again',restart,true]]);
}
function resume(){state='playing';$('gameLayer').hidden=true;ui.touch();last=performance.now();update();}
async function restart(){if(await ui.ask('Start this board again?','Keep your stars and records, but shuffle a fresh board.','Start again','Keep my board'))start(difficulty,stage);}
function finish(){
 state='finished';const gained=store.finishMemory(runKey,g,token,stage);saved(store);ui.stop();popParty(ui);update();
 const record=store.state().memoryBest[runKey+(g.hints?'-helped':'-solo')];const recordText=' Best '+(g.hints?'with hints':'without hints')+': '+record.moves+' moves'+(store.state().prefs.timer?', '+timeText(record.ms):'')+'.';
 const buttons=[];if(difficulty==='adventure'&&stage<6)buttons.push(['Next board: '+STAGES[stage+1]+' pairs',()=>start('adventure',stage+1,!!envelope(keyFor('adventure',stage+1)))]);
 buttons.push(['Play again',()=>start(difficulty,stage)],['Choose a board',menu,true]);
 showLayer(difficulty==='adventure'&&stage===6?'Adventure complete!':'Perfect pairs!',g.moves+' moves'+(store.state().prefs.timer?' | '+timeText(g.elapsed):'')+' | '+(g.hints?'Helped game. ':'')+(gained?'+1 friendship star. ':'')+'All '+g.pairs+' pairs found!'+recordText,buttons,'<div class="party-friends">'+team()+'</div>');
}
$('pauseButton').onclick=pause;$('boardMenu').onclick=()=>{pause();menu();};$('restartButton').onclick=()=>{pause();restart();};
$('hintButton').onclick=()=>{if(state==='playing'&&g.hint()){ui.audio.fx('checkpoint');update();save();}};
$('inspectButton').onclick=()=>{
 if(state!=='playing'||!g.open.length)return;state='looking';ui.stop();save();showLayer('Look closely','Compare the friends and their places. The clock is paused.',[['Back to my board',resume]],'<div class="inspect-cards">'+g.open.map(i=>'<div>'+cardSVG(g.deck[i])+'</div>').join('')+'</div>');
};
$('readRules').onclick=()=>{pause();ui.say('Turn over two cards. Look for exactly the same friends in the same places. If they match, they stay face up. Find every pair. Take as long as you like.');};
$('timerOption').onchange=e=>{store.pref('timer',e.target.checked);menu();};$('hintOption').onchange=e=>store.pref('hints',e.target.checked);
window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
window.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]'))return;
 if(e.code==='Escape'){if(state==='playing')pause();else if(state==='paused'||state==='looking')resume();return;}
 if(e.target.matches('[data-card]')&&['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();const i=Number(e.target.dataset.card),d={ArrowRight:1,ArrowLeft:-1,ArrowUp:-cols,ArrowDown:cols}[e.code];$('memoryGrid').children[Math.max(0,Math.min(g.deck.length-1,i+d))]?.focus();}
});
new ResizeObserver(layout).observe($('memoryGrid'));
function frame(t){const dt=Math.max(0,t-last);last=t;if(state==='playing'){
 const hint=g.preview>0,evt=g.tick(dt);saveClock+=dt;if(evt||hint!==(g.preview>0)){update();save();}else if(store.state().prefs.timer)$('clock').textContent=timeText(g.elapsed);
 if(evt==='finish')finish();else if(evt==='match')ui.audio.fx('checkpoint');if(saveClock>5000){saveClock=0;save();}
 }requestAnimationFrame(frame);}
menu();requestAnimationFrame(frame);
if(new URLSearchParams(location.search).has('debug'))window.arcadeDebug={get game(){return g;},get state(){return state;},start,pause,resume,menu,store,frame,update};

$('soundToggle').addEventListener('click',()=>{if(!['playing','countdown'].includes(state))ui.stop();});
