import {avatar} from '../studios/wardrobe.js';
import {CAST} from '../studios/model.js';
export function actor(kind,look=null){
 const n=document.createElement('button');n.type='button';n.className='friend-actor';n.dataset.kind=kind;n.dataset.move='idle';n.setAttribute('aria-label',CAST[kind]);
 let svg=avatar(kind,look);
 if(kind==='claire')svg=svg.replace('<path d="m59 119', '<path class="original-arms" d="m59 119');
 const skin={claire:'#f6c9b0',pusheen:'#c5bebe',kitty:'#fffdfb',raspberry:'#ffe5e9'}[kind];
 const hands=kind==='claire'?'<g class="clap-hands" fill="'+skin+'" stroke="#b78272" stroke-width="2"><path d="M61 125Q40 140 72 148l5-8q-18-3-12-10Z"/><path d="M98 125q22 15-13 23l-5-8q21-3 15-10Z"/></g><g class="wave-hands" fill="'+skin+'" stroke="#b78272" stroke-width="2"><path d="M99 124q23 6 28-25l-8-3q-5 21-24 24Z"/><ellipse cx="124" cy="96" rx="7" ry="10"/></g>':'<g class="clap-hands" fill="'+skin+'" stroke="#98738a" stroke-width="3"><path d="M84 167q10-14 40-6l-2 17q-31 5-38-11Z"/><path d="M175 166q-12-13-42-5l3 17q29 5 39-12Z"/></g>';
 svg=svg.replace('</svg>',hands+'</svg>');
 n.innerHTML='<span class="reaction" aria-hidden="true"></span><span class="actor-shadow"></span><span class="dancer-body">'+svg+'<span class="held-prop" aria-hidden="true"></span></span><span class="actor-name">'+CAST[kind]+'</span>';
 return n;
}
export function positionActor(n,x,y,w=100){n.style.left=(x/960*100)+'%';n.style.top=(y/600*100)+'%';n.style.width=(w/960*100)+'%';}
export function pose(kind,move,phase,gentle=false){
 const f=Math.sin(phase*Math.PI*2),a=Math.abs(f),gain=gentle?.28:1;
 let y=0,r=0,sx=1,sy=1;
 if(move==='spin'){sx=Math.cos(phase*Math.PI*2);y=-4*a*gain;r=f*7*gain;if(gentle)sx=1-.04*a;}
 if(move==='jump'){y=-Math.sin(Math.min(1,phase)*Math.PI)*(kind==='claire'?33:23)*gain;sy=1+(kind==='pusheen'?-.08:.02)*a*gain;sx=1+(kind==='pusheen'?.07:0)*a*gain;}
 if(move==='wave'){r=f*(kind==='raspberry'?7:4)*gain;y=-a*3*gain;}
 if(move==='wiggle'){r=f*(kind==='pusheen'?14:kind==='raspberry'?11:7)*gain;sx=1+f*.035*gain;}
 if(move==='clap'){y=-a*6*gain;sy=1-a*.035*gain;}
 if(move==='pose'){r=(kind==='kitty'?1:-1)*8*gain;sx=1.035;}
 if(move==='walk'){y=-a*3*gain;r=f*3*gain;}
 if(move==='nap'){r=kind==='claire'?0:-7;sy=.96;}
 if(move==='sit')sy=.93;
 return {y,r,sx,sy};
}
export function animateActor(n,move='idle',phase=0,gentle=false){
 if(!n)return;n.dataset.move=move;const q=pose(n.dataset.kind,move,phase,gentle),b=n.querySelector('.dancer-body');
 b.style.transform=`translateY(${q.y}%) rotate(${q.r}deg) scale(${q.sx},${q.sy})`;
 n.style.setProperty('--wave',Math.sin(phase*Math.PI*2)*(gentle?5:23)+'deg');
 n.style.setProperty('--gill',Math.sin(phase*Math.PI*2)*(gentle?2:9)+'deg');
}
