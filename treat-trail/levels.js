/* Level data only. Add another level object here; the engine is reusable. */
export const LEVELS = [{
  id: 'sunshine-meadow', name: 'Sunshine Meadow', version: 1, music: 'meadow',
  width: 6100, height: 600, start: {x: 300, y: 460},
  goal: {x: 5810, y: 460},
  ground: [
    {x: 0, y: 460, w: 1500}, {x: 1620, y: 460, w: 1230},
    {x: 2980, y: 460, w: 1390}, {x: 4510, y: 460, w: 1590}
  ],
  platforms: [
    {x: 650, y: 367, w: 200}, {x: 970, y: 315, w: 185},
    {x: 1240, y: 360, w: 165}, {x: 1860, y: 368, w: 180},
    {x: 2150, y: 310, w: 180}, {x: 2460, y: 359, w: 190},
    {x: 3220, y: 365, w: 185}, {x: 3520, y: 306, w: 200},
    {x: 3830, y: 360, w: 175}, {x: 4740, y: 365, w: 190},
    {x: 5050, y: 309, w: 185}, {x: 5360, y: 360, w: 180}
  ],
  checkpoints: [{x: 1830, y: 460}, {x: 3200, y: 460}, {x: 4740, y: 460}],
  signs: [
    {x: 510, text: 'Follow the treats!'}, {x: 1280, text: 'Jump the little creek'},
    {x: 2270, text: 'Your friends follow you'}, {x: 4100, text: 'Almost picnic time!'}
  ],
  /* [x, feet-relative world y, treat kind]. Extra-high treats reward exploring. */
  treats: [
    [430,423,'cookie'],[540,423,'berry'],[700,329,'cookie'],[798,329,'cupcake'],
    [1010,277,'berry'],[1100,277,'cookie'],[1280,322,'cupcake'],[1360,322,'berry'],
    [1490,362,'cookie'],[1570,334,'berry'],[1660,386,'cookie'],
    [1900,330,'cookie'],[1990,330,'berry'],[2190,272,'cupcake'],[2280,272,'cookie'],
    [2500,321,'berry'],[2600,321,'cupcake'],[2790,413,'cookie'],[2850,355,'berry'],
    [2925,333,'cookie'],[3010,395,'cupcake'],
    [3260,327,'berry'],[3360,327,'cookie'],[3560,268,'cupcake'],[3670,268,'berry'],
    [3880,322,'cookie'],[3960,322,'cupcake'],[4150,423,'berry'],[4300,413,'cookie'],
    [4380,350,'cupcake'],[4440,333,'berry'],[4530,390,'cookie'],
    [4780,327,'berry'],[4880,327,'cookie'],[5090,271,'cupcake'],[5180,271,'cookie'],
    [5400,322,'berry'],[5490,322,'cupcake'],[5590,423,'cookie'],[5680,423,'berry']
  ]
}];

export function validateLevel(level) {
  if (!level || !level.id || !Number.isFinite(level.width) || level.width < 720) throw new Error('Invalid level');
  const surfaces = [...level.ground, ...level.platforms];
  for (const p of surfaces) {
    if (![p.x,p.y,p.w].every(Number.isFinite) || p.w <= 0 || p.x < 0 || p.x+p.w > level.width) throw new Error('Invalid platform');
  }
  for (const t of level.treats) {
    if (!Number.isFinite(t[0]) || !Number.isFinite(t[1]) || !['cookie','berry','cupcake'].includes(t[2])) throw new Error('Invalid treat');
  }
  return level;
}
