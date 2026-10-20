/* Pure Canvas renderer. Every property is derived from absolute time.
   No random calls, accumulated simulation, timers, or CSS animation. */
(function(root){
'use strict';
const R=typeof module==='object'?require('./recipe.js'):root.COCKTAIL_RECIPE;
const M=R.motion;
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const p=(t,a,b)=>clamp((t-a)/(b-a));
const smooth=x=>x*x*(3-2*x);
const ease=x=>1-Math.pow(1-x,3);
const lerp=(a,b,x)=>a+(b-a)*x;
const rgb=h=>h.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16));
function blend(a,b,u){const aa=rgb(a),bb=rgb(b);return '#'+aa.map((v,i)=>Math.round(lerp(v,bb[i],u)).toString(16).padStart(2,'0')).join('');}
function tone(h,f){return '#'+rgb(h).map(v=>Math.round(clamp(v*f,0,255)).toString(16).padStart(2,'0')).join('');}
const C={ink:'#090c0d',paper:'#f4f1e8',gold:'#c9a77a',muted:'#9baba5',green:'#47794c'};
let heroImage=null;
function setAssets(assets){heroImage=assets.hero||null;}
function path(c,points){c.beginPath();points(c);}
function line(c,x1,y1,x2,y2,col,w=1){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=w;c.stroke();}
function ellipse(c,x,y,rx,ry,fill,stroke,w=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function round(c,x,y,w,h,r,fill,stroke,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function txt(c,str,x,y,size=30,color=C.paper,weight=400,align='left'){c.font=`${weight} ${size}px "Space Grotesk"`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);}
function glassPath(c,mix){
 c.beginPath(); if(mix){c.moveTo(-119,-395);c.lineTo(-108,-22);c.quadraticCurveTo(-106,12,-73,15);c.lineTo(74,15);c.quadraticCurveTo(106,12,109,-22);c.lineTo(124,-374);c.lineTo(154,-403);c.lineTo(119,-407);c.closePath();}
 else{c.moveTo(-163,-301);c.lineTo(-145,-18);c.quadraticCurveTo(-145,18,-110,20);c.lineTo(110,20);c.quadraticCurveTo(145,18,145,-18);c.lineTo(163,-301);c.closePath();}
}
function leaf(c,progress){
 if(progress<=0)return;c.save();c.translate(0,lerp(-470,0,ease(progress)));c.globalAlpha*=clamp(progress*4);
 const g=c.createLinearGradient(-110,-100,125,-360);g.addColorStop(0,'#132e1c');g.addColorStop(.22,'#284f2b');g.addColorStop(.45,'#749350');g.addColorStop(.58,'#94aa63');g.addColorStop(.66,'#33522c');g.addColorStop(1,'#668942');
 c.beginPath();c.moveTo(-110,-9);c.bezierCurveTo(-134,-137,-126,-271,-90,-358);c.bezierCurveTo(-29,-388,48,-381,116,-340);c.bezierCurveTo(95,-258,130,-107,102,-12);c.closePath();c.fillStyle=g;c.fill();c.clip();
 for(let i=0;i<150;i++){let y=-8-i*2.5;line(c,-125,y,124,y-34,`rgba(${i%3?'199,214,141':'8,31,17'},${i%4?.065:.2})`,i%3?1:2);}
 c.beginPath();c.moveTo(-12,-7);c.bezierCurveTo(-8,-113,17,-251,18,-374);c.strokeStyle='rgba(201,217,149,.5)';c.lineWidth=2;c.stroke();
 for(let i=0;i<27;i++){let y=-20-i*13;let x=lerp(-12,18,i/28);line(c,x,y,-121,y-35,'rgba(199,214,141,.2)',.8);line(c,x,y,128,y-26,'rgba(5,35,19,.38)',1.2);}
 c.restore();
}
function cube(c,x,y,size,rot=0,alpha=1){
 c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha*=alpha;const h=size*.44,dx=size*.17,dy=-size*.13;
 const front=c.createLinearGradient(-h,-h,h,h);front.addColorStop(0,'rgba(210,238,234,.48)');front.addColorStop(.19,'rgba(86,130,137,.13)');front.addColorStop(.42,'rgba(226,242,236,.10)');front.addColorStop(.72,'rgba(55,92,102,.22)');front.addColorStop(1,'rgba(219,242,237,.38)');
 const poly=(pts,fill,stroke)=>{c.beginPath();pts.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.1;c.stroke();}};
 poly([[-h,-h],[-h+dx,-h+dy],[h+dx,-h+dy],[h,-h]],'rgba(223,247,240,.43)','rgba(230,250,242,.65)');
 poly([[h,-h],[h+dx,-h+dy],[h+dx,h+dy],[h,h]],'rgba(96,148,151,.23)','rgba(226,245,238,.4)');
 round(c,-h,-h,h*2,h*2,9,front,'rgba(234,248,242,.58)',1.4);
 round(c,-h+9,-h+9,h*2-18,h*2-18,5,null,'rgba(237,249,239,.10)',2);
 for(let j=0;j<4;j++){c.beginPath();c.moveTo(-h*.6+j*size*.12,-h*.8);c.bezierCurveTo(-h*.1+j*5,-h*.2,-h*.3+j*size*.09,h*.4,h*.5-j*size*.07,h*.8);c.strokeStyle=`rgba(213,241,236,${.045+j*.015})`;c.lineWidth=2;c.stroke();}
 c.beginPath();c.moveTo(-h*.45,-h*.63);c.lineTo(-h*.12,-h*.21);c.lineTo(h*.16,h*.09);c.lineTo(h*.06,h*.55);c.strokeStyle='rgba(241,255,251,.21)';c.lineWidth=.8;c.stroke();
 for(let i=0;i<18;i++)ellipse(c,Math.sin(i*43.2)*h*.7,Math.cos(i*17.1)*h*.7,.4+i%3*.2,.7+i%3*.3,'rgba(229,249,242,.3)');
 line(c,-h+2,-h+7,-h+2,h-11,'rgba(245,255,250,.72)',2);line(c,-h+dx,-h+dy+1,h+dx-6,-h+dy+1,'rgba(248,255,251,.7)',1.8);c.restore();
}
function liquid(c,mix,level,t,color,swirl=0){
 if(level<=0)return;const bottom=mix?-9:-8, top=bottom-level, width=mix?119:160;
 c.save();glassPath(c,mix);c.clip();
 const g=c.createLinearGradient(0,top,0,bottom+25);g.addColorStop(0,color);g.addColorStop(.18,tone(color,.96));g.addColorStop(.68,tone(color,.66));g.addColorStop(1,tone(color,1.18));
 c.globalAlpha*=.89;c.fillStyle=g;
 c.beginPath();c.moveTo(-width,top);for(let x=-width;x<=width;x+=8)c.lineTo(x,top+Math.sin(x*.026+t*5)*2.5*(1+swirl));c.lineTo(width,25);c.lineTo(-width,25);c.closePath();c.fill();
 ellipse(c,0,top,width,12,'rgba(250,193,91,.26)','rgba(255,218,136,.6)',1.4);
 if(swirl){for(let i=0;i<4;i++) {c.beginPath();c.ellipse(0,top+16+i*24,80-i*6,10+i*2,Math.sin(t*3+i)*.07,0,Math.PI*1.6);c.strokeStyle=`rgba(255,222,151,${.18*swirl})`;c.lineWidth=2;c.stroke();}}
 c.restore();
}
function drawGlass(c,{x,y,scale=1,mix=false,level=0,t=0,leafP=0,iceP=0,angle=0,color='#b77b28',swirl=0,alpha=1}){
 c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(scale,scale);c.rotate(angle);
 const rim=mix?-400:-301,w=mix?119:163;
 // Rear optical surface and shaded double-wall rim.
 const body=c.createLinearGradient(-w,0,w,0);body.addColorStop(0,'rgba(210,225,221,.05)');body.addColorStop(.03,'rgba(245,252,240,.26)');body.addColorStop(.08,'rgba(11,24,27,.37)');body.addColorStop(.24,'rgba(209,228,220,.05)');body.addColorStop(.5,'rgba(9,19,21,.13)');body.addColorStop(.82,'rgba(237,246,227,.07)');body.addColorStop(.94,'rgba(227,244,233,.25)');body.addColorStop(1,'rgba(5,15,18,.3)');
 glassPath(c,mix);c.fillStyle=body;c.fill();
 ellipse(c,0,rim,w,32,'rgba(4,10,13,.2)','rgba(227,237,224,.19)',1.2);
 ellipse(c,0,rim+2,w-7,27,null,'rgba(147,185,180,.16)',2);
 if(!mix)leaf(c,leafP);
 liquid(c,mix,level,t,color,swirl);
 if(iceP>0){c.save();glassPath(c,mix);c.clip();if(mix){for(let i=0;i<6;i++){const ip=ease(p(iceP,i*.08,.5+i*.07));if(ip>0)cube(c,(i%2?34:-43)+Math.sin(t*4+i)*swirl*11,-51-Math.floor(i/2)*88-lerp(500,0,ip),86,(i%2?.17:-.24)+Math.sin(t*5+i)*swirl*.14);}}
 else cube(c,-10,-136-lerp(460,0,ease(iceP)),205,-.10);c.restore();}
 // The amber tint sits in front of the submerged ice; glass remains transparent.
 c.save();glassPath(c,mix);c.clip();if(level>0){const g=c.createLinearGradient(0,-level,0,12);g.addColorStop(0,'rgba(234,170,64,.10)');g.addColorStop(1,'rgba(142,73,14,.22)');c.fillStyle=g;c.fillRect(-w,-level,w*2,level+30);}
 // Continuous narrow studio softbox reflections, with no cartoon outline.
 const spec=c.createLinearGradient(-w,0,w,0);for(const [at,col] of [[0,'rgba(255,255,255,0)'],[.028,'rgba(233,246,237,.06)'],[.045,'rgba(247,254,243,.72)'],[.057,'rgba(210,236,225,.12)'],[.11,'rgba(225,242,232,.0)'],[.19,'rgba(255,244,211,.08)'],[.26,'rgba(255,255,255,0)'],[.68,'rgba(255,255,255,0)'],[.79,'rgba(233,248,237,.035)'],[.88,'rgba(233,248,237,.06)'],[.927,'rgba(233,248,237,.38)'],[.943,'rgba(246,254,242,.61)'],[.959,'rgba(233,248,237,.12)'],[1,'rgba(255,255,255,0)']])spec.addColorStop(at,col);
 c.fillStyle=spec;c.fillRect(-w,rim-25,w*2,460);
 // Heavy clear base and refracted amber caustic bands.
 const base=c.createLinearGradient(0,-16,0,24);base.addColorStop(0,'rgba(225,231,206,.04)');base.addColorStop(.3,'rgba(229,238,218,.34)');base.addColorStop(.49,'rgba(36,54,47,.5)');base.addColorStop(.7,'rgba(209,226,206,.4)');base.addColorStop(1,'rgba(243,249,226,.05)');c.fillStyle=base;c.fillRect(-w,-16,w*2,45);
 for(let i=0;i<6;i++){ellipse(c,0,-7+i*4,w*.85,11-i*.8,null,`rgba(244,237,201,${.1-i*.009})`,1);}
 c.restore();
 // Rim is a delicate highlight, strongest towards the key light.
 const rg=c.createLinearGradient(-w,0,w,0);rg.addColorStop(0,'rgba(238,249,238,.8)');rg.addColorStop(.24,'rgba(220,235,222,.3)');rg.addColorStop(.65,'rgba(238,249,238,.13)');rg.addColorStop(1,'rgba(246,249,236,.7)');ellipse(c,0,rim,w,32,null,rg,1.8);
 ellipse(c,0,rim+1,w-6,27,null,'rgba(235,246,231,.13)',.8);
 if(iceP>.7){for(let i=0;i<31;i++){const xx=Math.sin(i*12.3)*(w-13),yy=rim+46+(i*43.7%(Math.abs(rim)-65)),rr=.6+i%4*.3;ellipse(c,xx,yy,rr,rr*1.4,'rgba(236,252,240,.13)');ellipse(c,xx-.4,yy-.5,rr*.35,rr*.3,'rgba(253,255,241,.35)');}}
 c.restore();
}
function stream(c,x1,y1,x2,y2,t,color,width=8,alpha=1){c.save();c.globalAlpha=alpha;c.lineCap='round';let bend=Math.sin(t*17)*3;
 c.beginPath();c.moveTo(x1,y1);c.bezierCurveTo(x1+8,y1+50,x2+bend,y2-60,x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();
 c.beginPath();c.moveTo(x1-1,y1);c.bezierCurveTo(x1+7,y1+50,x2+bend-2,y2-60,x2-2,y2);c.strokeStyle='rgba(255,242,192,.7)';c.lineWidth=1.8;c.stroke();
 ellipse(c,x2,y2,22+Math.sin(t*22)*7,5,null,'rgba(255,224,160,.6)',1.7);c.restore();}
function jigger(c,x,y,t,progress,color){
 const show=smooth(p(progress,0,.13))*(1-smooth(p(progress,.87,1)));if(show<=0)return;
 c.save();c.translate(x,y-25*(1-show));c.globalAlpha=show; c.rotate(lerp(-.13,.93,smooth(p(progress,.15,.35)))*(1-smooth(p(progress,.72,.92))));
 const g=c.createLinearGradient(-70,0,70,0);g.addColorStop(0,'#624234');g.addColorStop(.24,'#cd9870');g.addColorStop(.4,'#f4c598');g.addColorStop(.55,'#8f6044');g.addColorStop(1,'#c28c63');
 c.beginPath();c.moveTo(-67,-77);c.lineTo(-17,0);c.lineTo(-43,64);c.quadraticCurveTo(0,83,43,64);c.lineTo(17,0);c.lineTo(67,-77);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='#f4ce9f';c.lineWidth=2;c.stroke();
 ellipse(c,0,-77,67,12,'#53362b','#f0c397',2);ellipse(c,0,-76,58,7,color);line(c,-17,0,17,0,'#e3b18b',3);c.restore();
}
function bittersBottle(c,x,y,progress,color){
 let show=smooth(p(progress,0,.14))*(1-smooth(p(progress,.84,1)));if(!show)return;
 c.save();c.globalAlpha=show;c.translate(x,y);c.rotate(2.7);
 round(c,-34,-60,68,114,14,'#47231b','#bb9972',2);round(c,-11,-92,22,34,4,'#b89860');round(c,-7,-104,14,16,3,'#d5c5a0');round(c,-33,-20,66,49,1,'#efe4c7');line(c,-20,-9,20,-9,color,4);line(c,-14,4,14,4,'#78613f',2);line(c,-20,15,20,15,'#78613f',2);c.restore();
}
function spoon(c,x,y,t,amount){if(!amount)return;c.save();c.globalAlpha=amount;const cycle=(t-R.steps.find(s=>s.id==='stir').start)*Math.PI*3,px=x+Math.sin(cycle)*54,py=y+Math.cos(cycle)*8;
 line(c,px+32,py-434,px,py-105,'#d3e2d9',5);line(c,px+32,py-434,px,py-105,'#6f9691',1);
 for(let i=0;i<26;i++){let u=i/26;line(c,px+32*(1-u)-3,py-434+u*285,px+32*(1-u)+3,py-431+u*285,'rgba(255,255,231,.8)',1);}
 ellipse(c,px,py-96,13,27,'#b7c9bc','#e8f7e5',1);ellipse(c,px+32,py-439,7,12,'#c8d5c6');c.restore();}
function activeAt(t){return R.ingredients.find(s=>t>=s.start&&t<s.end)||R.steps.find(s=>t>=s.start&&t<s.end)||R.steps[R.steps.length-1];}
function stateAt(t){t=clamp(t,0,R.duration);const active=activeAt(t);let volume=0;for(const i of R.ingredients)volume+=(i.oz||.025 /* illustrative dash displacement, not a recipe measure */)*smooth(p(t,i.start+.45,i.end-.5));let mixColor='#c57b20';const targets=['#c57b20','#c8a458','#c18c39','#b57b2f','#ad7329'];R.ingredients.forEach((i,j)=>{mixColor=blend(mixColor,targets[j],smooth(p(t,i.start+.45,i.end-.5)));});const strain=smooth(p(t,...M.strainFill));return {t,active,volume,mixColor,mixLevel:volume/2.55*207*(1-strain),serveLevel:strain*183,leafP:ease(p(t,...M.leaf)),iceP:ease(p(t,...M.cube)),mixIceP:p(t,...M.mixingIce),strain};}
function render(c,time,width=1920,height=1080){
 const s=stateAt(time),t=s.t,mobile=width/height<1.05,W=mobile?1080:1920,H=mobile?1440:1080;
 const hero=smooth(p(t,...M.heroTransition)),switching=smooth(p(t,...M.setupTransition));
 c.save();c.scale(width/W,height/H);c.fillStyle=C.ink;c.fillRect(0,0,W,H);
 const halo=c.createRadialGradient(W*.74,H*.47,10,W*.74,H*.47,H*.64);halo.addColorStop(0,'#26302b');halo.addColorStop(.34,'#151e1c');halo.addColorStop(.73,'#0a1011');halo.addColorStop(1,'#080b0d');c.fillStyle=halo;c.fillRect(0,0,W,H);
 // Three-dimensional black stone stage and a gentle pool of amber light.
 const ground=mobile?1230:894,stageX=mobile?650:1385;
 const pool=c.createRadialGradient(stageX,ground,12,stageX,ground,390);pool.addColorStop(0,'rgba(170,123,52,.15)');pool.addColorStop(.46,'rgba(99,106,77,.07)');pool.addColorStop(1,'rgba(0,0,0,0)');c.save();c.translate(0,ground);c.scale(1,.18);c.fillStyle=pool;c.fillRect(0,-H,W,H*2);c.restore();
 const plinth=c.createLinearGradient(0,ground-40,0,ground+25);plinth.addColorStop(0,'#161d1c');plinth.addColorStop(.2,'#171c1b');plinth.addColorStop(.24,'#30352f');plinth.addColorStop(.26,'#0c1111');plinth.addColorStop(1,'#06090a');round(c,mobile?196:933,ground-6,mobile?850:864,55,3,plinth);line(c,mobile?196:933,ground-6,W-114,ground-6,'rgba(190,204,184,.18)',1);
 for(let i=0;i<12;i++){const xx=(mobile?190:940)+i*69;line(c,xx,ground-3,xx+80,ground+30,'rgba(179,191,172,.015)',.5);}
 const rockX=mobile?lerp(620,866,switching)*(1-hero)+650*hero:lerp(1390,1645,switching)*(1-hero)+1375*hero;
 const rockScale=mobile?lerp(1.18,.69,switching)*(1-hero)+1.42*hero:lerp(1.49,.78,switching)*(1-hero)+1.52*hero;
 const rockY=mobile?1188:846;
 ellipse(c,rockX,rockY+38,210*rockScale,19*rockScale,'rgba(0,0,0,.55)');
 // Blurred reflection, rebuilt from the exact current glass state.
 c.save();c.translate(0,2*(rockY+30));c.scale(1,-1);c.globalAlpha=.08;c.filter='blur(3px)';drawGlass(c,{x:rockX,y:rockY,scale:rockScale,level:s.serveLevel,t:Math.min(t,M.heroFreeze),color:s.mixColor,leafP:s.leafP,iceP:s.iceP,alpha:.14});c.restore();
 drawGlass(c,{x:rockX,y:rockY,scale:rockScale,level:s.serveLevel,t:Math.min(t,M.heroFreeze),color:s.mixColor,leafP:s.leafP,iceP:s.iceP,alpha:1});
 const mixAlpha=smooth(p(t,...M.mixingFadeIn))*(1-smooth(p(t,...M.mixingFadeOut)));
 const mixX=mobile?420:1200,mixY=mobile?1200:851,mixScale=mobile?.98:1.05;
 const strainPose=smooth(p(t,...M.strainPoseIn))*(1-smooth(p(t,...M.strainPoseOut))),mx=mixX-118*strainPose,my=mixY-126*strainPose,ma=.84*strainPose;
 const stirring=smooth(p(t,...M.stirIn))*(1-smooth(p(t,...M.stirOut)));
 if(mixAlpha>0){ellipse(c,mixX,mixY+31,150,16,'rgba(0,0,0,.55)');drawGlass(c,{x:mx,y:my,scale:mixScale,mix:true,level:s.mixLevel,t,color:s.mixColor,iceP:s.mixIceP,swirl:stirring,angle:ma,alpha:mixAlpha});spoon(c,mixX,mixY,t,stirring);}
 const active=R.ingredients.find(i=>t>=i.start&&t<i.end);
 if(active){const u=p(t,active.start,active.end),pourAlpha=smooth(p(u,.16,.23))*(1-smooth(p(u,.72,.83))),surface=mixY-s.mixLevel*mixScale-10;
 if(active.dashes){bittersBottle(c,mixX-22,mixY-557,u,active.color);for(let d=0;d<2;d++){const dp=p(u,.24+d*.24,.39+d*.24);if(dp>0&&dp<1){const dy=lerp(mixY-477,surface,ease(dp));stream(c,mixX+6,dy-17,mixX+6,dy,t,active.color,8,Math.sin(dp*Math.PI));}}}
 else{jigger(c,mixX-86,mixY-555,t,u,active.color);if(pourAlpha>0)stream(c,mixX-30,mixY-542,mixX+5,surface,t,active.color,active.id==='plantain'?11:7,pourAlpha);}}
 if(strainPose>0){c.save();c.globalAlpha=strainPose;c.translate(mx,my);c.rotate(ma);c.scale(mixScale,mixScale);ellipse(c,0,-400,119,22,'rgba(191,206,188,.2)','#b5bcb2',2);for(let i=-7;i<=7;i++)line(c,i*13,-416,i*13+8,-386,'rgba(237,243,219,.45)',1);line(c,-119,-400,-184,-398,'#aab6ac',7);c.restore();const flow=smooth(p(t,...M.strainFlowIn))*(1-smooth(p(t,...M.strainFlowOut)));const lipX=mx+mixScale*(140*Math.cos(ma)+400*Math.sin(ma)),lipY=my+mixScale*(140*Math.sin(ma)-400*Math.cos(ma));if(flow>0)stream(c,lipX,lipY,rockX-12,rockY-s.serveLevel*rockScale-12,t,'#bf8d47',7,flow);}
 // A commissioned photoreal hero asset resolves the animation into a studio shot.
 if(heroImage&&t>=25){const photo=smooth(p(t,25.1,26.15));c.save();c.globalAlpha=photo;const ar=heroImage.width/heroImage.height;let dw=W,dh=W/ar;if(mobile){dh=850;dw=dh*ar;}else if(dh<H){dh=H;dw=H*ar;}const off=mobile?-(dw-W)*.84:-(dw-W)/2;c.drawImage(heroImage,off,mobile?H-dh:(H-dh)/2,dw,dh);if(mobile){const edge=H-dh,fade=c.createLinearGradient(0,edge-100,0,edge+120);fade.addColorStop(0,'rgba(8,11,13,0)');fade.addColorStop(.44,'#080b0d');fade.addColorStop(.55,'#080b0d');fade.addColorStop(1,'rgba(8,11,13,0)');c.fillStyle=fade;c.fillRect(0,edge-100,W,220);}c.restore();}
 // Darken only the copy zone; the product stays optically clear.
 const shade=c.createLinearGradient(0,0,mobile?W:W*.59,0);shade.addColorStop(0,'rgba(5,8,10,.65)');shade.addColorStop(.78,'rgba(5,8,10,.18)');shade.addColorStop(1,'rgba(5,8,10,0)');c.fillStyle=shade;c.fillRect(0,0,mobile?W:W*.59,H);
 const tx=mobile?80:112,top=mobile?96:91;
 txt(c,'MIZ / STUDIO',tx,top,19,'#c9d0c8',700);txt(c,'NI DE AQUÍ NI DE ALLÁ',W-tx,top,18,C.muted,400,'right');
 const a=s.active,isIngredient=!!a.measure;let alpha=a.id==='intro'?1:a.id==='hero'?smooth(p(t,25,25.7)):smooth(p(t,a.start,a.start+.16))*(1-smooth(p(t,a.end-.16,a.end)));
 c.save();c.globalAlpha=alpha;const dy=12*(1-alpha),y=mobile?225:309;
 if(isIngredient){
 txt(c,a.name,tx,y+dy,mobile?48:47,C.paper,400);
 const [num,...unit]=a.measure.split(' ');txt(c,num,tx-6,y+208+dy,mobile?168:205,C.paper,400);const nw=c.measureText(num).width;
 txt(c,unit.join(' '),tx+nw+18,y+200+dy,mobile?56:62,C.gold,400);
 line(c,tx,y+256,tx+(mobile?530:530),y+256,'rgba(207,179,138,.48)',1);
 const note={bourbon:'Into the iced mixing glass.',mezcal:'A second spirit. Equal measure.',plantain:'Prepared plantain syrup.',angostura:'Dash once. Then once more.',banana:'Two dashes. Last addition.'}[a.id];txt(c,note,tx,y+310+dy,26,C.muted);
 }else{
 let title=a.title,size=(a.id==='intro'||a.id==='hero')?(mobile?85:99):(mobile?80:86);title.split('\n').forEach((l,i)=>txt(c,l,tx,y+i*(size+3)+dy,size,C.paper,400));const end=y+(title.split('\n').length-1)*(size+3);
 txt(c,a.detail,tx,end+85+dy,(a.id==='intro'||a.id==='hero')?43:34,C.gold,400);
 if(a.id==='intro'||a.id==='hero'){txt(c,a.id==='intro'?'Neither from here nor from there.':'Bourbon · Mezcal · Plantain',tx,end+151+dy,26,C.muted);}
 else txt(c,a.note,tx,end+146+dy,mobile?23:24,C.muted);
 }
 c.restore();
 // Restrained single-column ingredient recap; no cards or competing ornament.
 if(!mobile&&t>=8&&t<25){c.save();c.globalAlpha=smooth(p(t,7.8,8.2))*(1-smooth(p(t,24.6,25)));R.ingredients.forEach((i,j)=>{const done=t>=i.end,now=i.id===a.id,col=now?C.gold:done?'#b8c1b9':'#76847e';line(c,tx,738+j*31,tx+(now?21:6),738+j*31,col,1);txt(c,i.name,tx+36,745+j*31,19,col);txt(c,i.measure,tx+505,745+j*31,19,col,400,'right');});c.restore();}
 // Measured, quiet film progression and source attribution.
 const fy=H-63;line(c,tx,fy-40,W-tx,fy-40,'rgba(194,208,189,.13)',1);line(c,tx,fy-40,tx+(W-2*tx)*t/R.duration,fy-40,'rgba(204,170,117,.7)',1.5);
 txt(c,'DANNY GONZÁLEZ + PEDRO TOBAR / BAR PROVIDENCIA',tx,fy,15,C.muted);txt(c,'with Codex',W-tx,fy,17,C.gold,400,'right');
 c.restore();return s;
}
const api={render,stateAt,activeAt,setAssets,recipe:R};if(typeof module==='object')module.exports=api;else root.CocktailScene=api;
})(typeof window==='object'?window:this);
