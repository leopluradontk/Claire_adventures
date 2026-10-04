const $ = (s) => document.querySelector(s);
const els = {
  library: $('#library'), reader: $('#reader'), grid: $('#storyGrid'), status: $('#status'),
  refresh: $('#refreshBtn'), home: $('#homeBtn'), title: $('#readerTitle'), count: $('#pageCount'),
  image: $('#pageImage'), wrap: $('#pageWrap'), stage: $('#stage'), prev: $('#prevBtn'), next: $('#nextBtn'),
  dots: $('#dots'), again: $('#againBtn'), more: $('#moreBtn'), menu: $('#readerMenu'), fit: $('#fitToggle'), closeMenu: $('#closeMenu')
};
let catalog = [];
let story = null;
let page = 0;
let fillScreen = false;
let pointerStartX = null;
let pointerStartY = null;
let dragging = false;

async function loadStories(showMessage=false){
  if(showMessage) els.status.textContent = 'Checking for new stories…';
  try{
    const res = await fetch(`stories.json?v=${Date.now()}`, {cache:'no-store'});
    if(!res.ok) throw new Error('Could not load story list');
    const data = await res.json();
    catalog = (data.stories || []).sort((a,b)=>(a.order||0)-(b.order||0));
    renderLibrary();
    if(showMessage){
      els.status.textContent = 'You’re up to date.';
      setTimeout(()=>els.status.textContent='',1800);
    }
  }catch(err){
    console.error(err);
    els.status.textContent = 'Offline — showing stories already saved on this iPad.';
  }
}
function renderLibrary(){
  els.grid.innerHTML='';
  for(const s of catalog){
    const card=document.createElement('button');
    card.className='story-card'; card.type='button';
    card.innerHTML=`<img class="story-cover" src="${s.cover}" alt=""><div class="story-meta"><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.subtitle||`${s.pages.length}-page story`)}</p></div>`;
    card.addEventListener('click',()=>openStory(s.id));
    els.grid.appendChild(card);
  }
}
function openStory(id){
  story=catalog.find(s=>s.id===id); if(!story) return;
  page=0; els.library.classList.add('hidden'); els.reader.classList.remove('hidden');
  history.pushState({story:id},'',`#${encodeURIComponent(id)}`);
  renderPage(false);
}
function closeStory(push=true){
  story=null; els.reader.classList.add('hidden'); els.library.classList.remove('hidden');
  if(push) history.pushState({},'',location.pathname+location.search);
}
function renderPage(animate=true,dir=0){
  if(!story) return;
  const src=story.pages[page];
  els.title.textContent=story.title; els.count.textContent=`Page ${page+1} of ${story.pages.length}`;
  els.prev.disabled=page===0; els.next.disabled=page===story.pages.length-1;
  els.again.classList.toggle('hidden',page!==story.pages.length-1);
  els.dots.innerHTML='';
  story.pages.forEach((_,i)=>{const d=document.createElement('span');d.className='dot'+(i===page?' active':'');els.dots.appendChild(d)});
  if(!animate){els.image.src=src; preloadNearby(); return;}
  els.wrap.style.transition='transform .16s ease, opacity .16s ease';
  els.wrap.style.transform=`translateX(${dir<0?'55':'-55'}px)`; els.wrap.style.opacity='.15';
  setTimeout(()=>{
    els.image.src=src;
    els.wrap.style.transition='none'; els.wrap.style.transform=`translateX(${dir<0?'-55':'55'}px)`;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      els.wrap.style.transition='transform .2s ease, opacity .2s ease'; els.wrap.style.transform='translateX(0)'; els.wrap.style.opacity='1';
    }));
    preloadNearby();
  },130);
}
function next(){if(story&&page<story.pages.length-1){page++;renderPage(true,1)}}
function prev(){if(story&&page>0){page--;renderPage(true,-1)}}
function preloadNearby(){
  for(const i of [page-1,page+1]) if(story&&story.pages[i]){const im=new Image();im.src=story.pages[i]}
}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

els.refresh.addEventListener('click',()=>loadStories(true));
els.home.addEventListener('click',()=>closeStory());
els.prev.addEventListener('click',prev); els.next.addEventListener('click',next);
els.again.addEventListener('click',()=>{page=0;renderPage(true,-1)});
els.more.addEventListener('click',()=>els.menu.classList.toggle('hidden'));
els.closeMenu.addEventListener('click',()=>els.menu.classList.add('hidden'));
els.fit.addEventListener('click',()=>{fillScreen=!fillScreen;els.image.classList.toggle('fill',fillScreen);els.fit.textContent=`Fill screen: ${fillScreen?'On':'Off'}`});

document.addEventListener('keydown',e=>{if(!story)return;if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')prev();if(e.key==='Escape')closeStory()});
els.stage.addEventListener('pointerdown',e=>{pointerStartX=e.clientX;pointerStartY=e.clientY;dragging=true;els.stage.setPointerCapture?.(e.pointerId)});
els.stage.addEventListener('pointermove',e=>{
  if(!dragging||pointerStartX===null)return;
  const dx=e.clientX-pointerStartX,dy=e.clientY-pointerStartY;
  if(Math.abs(dx)>Math.abs(dy)){els.wrap.style.transition='none';els.wrap.style.transform=`translateX(${Math.max(-120,Math.min(120,dx*.35))}px)`;}
});
els.stage.addEventListener('pointerup',e=>{
  if(!dragging)return; const dx=e.clientX-pointerStartX,dy=e.clientY-pointerStartY; dragging=false; pointerStartX=pointerStartY=null;
  els.wrap.style.transform='translateX(0)'; els.wrap.style.transition='transform .18s ease';
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.2){dx<0?next():prev();}
});
els.stage.addEventListener('pointercancel',()=>{dragging=false;pointerStartX=pointerStartY=null;els.wrap.style.transform='translateX(0)'});

window.addEventListener('popstate',()=>{
  const id=decodeURIComponent(location.hash.replace(/^#/,'')||'');
  if(id){const s=catalog.find(x=>x.id===id);if(s){story=s;page=0;els.library.classList.add('hidden');els.reader.classList.remove('hidden');renderPage(false)}}
  else closeStory(false);
});

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(console.warn))}
(async()=>{
  await loadStories(false);
  const id=decodeURIComponent(location.hash.replace(/^#/,'')||'');
  if(id&&catalog.some(s=>s.id===id)){story=catalog.find(s=>s.id===id);els.library.classList.add('hidden');els.reader.classList.remove('hidden');renderPage(false)}
})();
