/* Original vector room props; unlocks use the existing lifetime-star milestones. */
export const FURNITURE = Object.freeze({
 sofa:{name:'Marshmallow couch',w:200,h:110,zone:'floor',stars:0,kind:'seat'},
 bed:{name:'Dreamy little bed',w:180,h:124,zone:'floor',stars:0,kind:'bed'},
 rug:{name:'Rainbow rug',w:250,h:100,zone:'floor',stars:0,kind:'rug'},
 table:{name:'Tea-party table',w:160,h:96,zone:'floor',stars:0,kind:'table'},
 lamp:{name:'Warm little lamp',w:66,h:154,zone:'floor',stars:0,kind:'lamp'},
 toybox:{name:'Treasure toy box',w:123,h:85,zone:'floor',stars:0,kind:'toy'},
 shelf:{name:'Storybook shelf',w:130,h:176,zone:'floor',stars:0,kind:'shelf'},
 plant:{name:'Happy leafy plant',w:84,h:118,zone:'floor',stars:0,kind:'plant'},
 chair:{name:'Cozy beanbag',w:104,h:84,zone:'floor',stars:0,kind:'seat'},
 cushion:{name:'Heart cushion',w:64,h:57,zone:'floor',stars:0,kind:'toy'},
 frame:{name:'My art frame',w:103,h:130,zone:'wall',stars:0,kind:'frame'},
 bunting:{name:'Party bunting',w:238,h:66,zone:'wall',stars:0,kind:'decor'},
 clock:{name:'Bunny-ear clock',w:77,h:97,zone:'wall',stars:0,kind:'decor'},
 cloud:{name:'Cloud wall light',w:134,h:73,zone:'wall',stars:0,kind:'lamp'},
 music:{name:'Little music player',w:106,h:83,zone:'floor',stars:0,kind:'music'},
 teacart:{name:'Tea trolley',w:104,h:99,zone:'floor',stars:0,kind:'table'},
 castle:{name:'Reading castle',w:180,h:175,zone:'floor',stars:3,kind:'toy'},
 starbed:{name:'Star-canopy bed',w:194,h:192,zone:'floor',stars:6,kind:'bed'},
 aquarium:{name:'Bubble aquarium',w:148,h:113,zone:'floor',stars:9,kind:'decor'},
 piano:{name:'Little grand piano',w:166,h:118,zone:'floor',stars:12,kind:'music'}
});
export const ROOMS = Object.freeze({
 lounge:{name:'Cozy clubhouse',stars:0},nook:{name:'Reading room',stars:5},garden:{name:'Garden room',stars:10}
});
export const STAGES = Object.freeze({
 rainbow:{name:'Rainbow stage',stars:0,sky:'#eedbff',floor:'#cbb1e7',accent:'#c181bb'},
 garden:{name:'Garden party',stars:0,sky:'#e1f1e2',floor:'#b1d4ba',accent:'#709f87'},
 winter:{name:'Winter sparkle',stars:0,sky:'#dcebf9',floor:'#bfd2e9',accent:'#889dc5'},
 beach:{name:'Beach party',stars:0,sky:'#d5efeb',floor:'#e8d1a5',accent:'#64a9ab'},
 starlight:{name:'Starlight theatre',stars:8,sky:'#deddf3',floor:'#b2a6d0',accent:'#7d6ca7'},
 candy:{name:'Candy concert',stars:12,sky:'#ffe5ed',floor:'#e6b5cd',accent:'#c780a3'}
});
export const MOVES = Object.freeze({
 spin:{name:'Spin',icon:'\u21bb'},jump:{name:'Jump',icon:'\u219f'},wave:{name:'Wave',icon:'\u270b'},
 wiggle:{name:'Wiggle',icon:'\u223f'},clap:{name:'Clap',icon:'\u266b'},pose:{name:'Pose',icon:'\u2605'}
});
export const WALLS={rose:['Rose dots','#f8e7ed'],lilac:['Lilac flowers','#eae2f5'],mint:['Mint stripes','#e0efe5'],sky:['Blue clouds','#e1eff7'],peach:['Peach hearts','#ffecd9']};
export const FLOORS={wood:['Honey boards','#d9bb9c'],pink:['Pink tiles','#e8c6cc'],mint:['Mint tiles','#bfdbcf'],lavender:['Lavender boards','#cbc4e0']};
export const TRACK_IDS=['meadow','autumn','snow','beach','rainbow','groove'];
export const CAST_KEYS=['claire','pusheen','kitty','raspberry'];
export const FRIEND_KEYS=CAST_KEYS.slice(1);
export const START_ITEMS=Object.keys(FURNITURE).filter(k=>!FURNITURE[k].stars).flatMap(k=>Array.from({length:k==='frame'||k==='chair'?2:1},(_,i)=>({id:k+'-'+i,type:k})));
