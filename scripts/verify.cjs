const assert=require('node:assert/strict');const R=require('../recipe.js'),S=require('../scene.js');
const events=[...R.steps,...R.ingredients].sort((a,b)=>a.start-b.start);assert.equal(events[0].start,0);assert.equal(events.at(-1).end,30);for(let i=1;i<events.length;i++)assert.equal(events[i-1].end,events[i].start,'Timeline must have no gaps or overlaps');
assert.deepEqual(R.ingredients.map(x=>x.measure),['1 oz','1 oz','½ oz','2 dashes','2 dashes']);assert.equal(R.duration*R.fps,900);
assert.equal(S.stateAt(0).volume,0);assert.equal(S.stateAt(3).iceP,0);assert.equal(S.stateAt(8).serveLevel,0);assert.equal(S.stateAt(22).serveLevel,0);assert.equal(S.stateAt(25).mixLevel,0);assert.equal(S.stateAt(30).serveLevel,183);
for(let n=0;n<=900;n++){const a=S.stateAt(n/30);assert.ok(a.mixLevel>=0&&a.serveLevel>=0);assert.ok(a.active);assert.equal(JSON.stringify(a),JSON.stringify(S.stateAt(n/30)));}
let canvasLib;try{canvasLib=require('@napi-rs/canvas');}catch{canvasLib=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}
const {createCanvas,GlobalFonts}=canvasLib;GlobalFonts.registerFromPath(require('node:path').join(__dirname,'../assets/SpaceGrotesk-Regular.woff2'),'Space Grotesk');GlobalFonts.registerFromPath(require('node:path').join(__dirname,'../assets/SpaceGrotesk-Bold.woff2'),'Space Grotesk');
for(const [w,h] of [[1920,1080],[1080,1440]]){const c=createCanvas(w,h),ctx=c.getContext('2d');for(const t of [0,3.7,7.5,9.4,12,15,17.5,19.5,21.8,24,28,30]){S.render(ctx,t,w,h);const one=c.toBuffer('image/png');S.render(ctx,t,w,h);assert.deepEqual(one,c.toBuffer('image/png'),'Render must be deterministic');}}
console.log('PASS: contiguous 30s / 900-frame timeline, exact measurements, order, fill/strain states, deterministic landscape and portrait rendering.');
