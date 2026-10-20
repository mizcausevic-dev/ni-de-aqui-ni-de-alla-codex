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
const C={ink:'#092a2a',paper:'#f7eed9',gold:'#e8b866',muted:'#aac0b5',green:'#69a34b'};
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
 if(progress<=0)return; c.save();c.translate(0,lerp(-450,0,ease(progress)));c.globalAlpha*=clamp(progress*3);
 const g=c.createLinearGradient(-90,0,130,-340);g.addColorStop(0,'#285130');g.addColorStop(.35,'#6b9c42');g.addColorStop(.65,'#4b823a');g.addColorStop(1,'#bdd37c');
 c.beginPath();c.moveTo(-111,-15);c.bezierCurveTo(-130,-150,-116,-290,-70,-369);c.quadraticCurveTo(15,-431,125,-367);c.bezierCurveTo(102,-246,125,-115,101,-20);c.closePath();c.fillStyle=g;c.fill();c.clip();
 line(c,-12,-18,22,-387,'rgba(220,234,154,.6)',2);
 for(let i=0;i<18;i++){let y=-30-i*19;line(c,lerp(-12,22,i/19),y,-107+Math.max(0,i-13)*5,y-33,'rgba(211,225,148,.22)',1);line(c,lerp(-12,22,i/19),y,108,y-25,'rgba(20,64,31,.4)',1.4);}
 c.restore();
}
function cube(c,x,y,s,rot=0,alpha=1){c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha*=alpha;
 let g=c.createLinearGradient(-s/2,-s/2,s/2,s/2);g.addColorStop(0,'rgba(227,255,249,.65)');g.addColorStop(.3,'rgba(195,233,226,.22)');g.addColorStop(.8,'rgba(206,246,239,.1)');g.addColorStop(1,'rgba(237,255,250,.48)');
 round(c,-s/2,-s/2,s,s,13,g,'rgba(230,255,248,.7)',2);
 c.beginPath();c.moveTo(-s/2+12,-s/2+14);c.lineTo(s/2-20,-s/2+20);c.lineTo(s/2-11,s/2-13);c.strokeStyle='rgba(245,255,255,.45)';c.lineWidth=3;c.stroke();
 c.beginPath();c.moveTo(-s*.2,-s*.36);c.lineTo(-s*.12,-s*.05);c.lineTo(s*.13,s*.11);c.lineTo(s*.24,s*.36);c.strokeStyle='rgba(242,255,255,.25)';c.lineWidth=1.5;c.stroke();
 for(let i=0;i<7;i++)ellipse(c,(Math.sin(i*5.3)*.34)*s,(Math.cos(i*2.7)*.35)*s,1.5,2,'rgba(235,255,255,.4)');
 c.restore();}
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
function drawGlass(c,{x,y,scale=1,mix=false,level=0,t=0,leafP=0,iceP=0,angle=0,color='#d29946',swirl=0,alpha=1}){
 c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(scale,scale);c.rotate(angle);
 const rim=mix?-400:-301, w=mix?119:163;
 // Transparent body and back rim, then garnish, liquid and ice, then front highlights.
 let g=c.createLinearGradient(-w,0,w,0);g.addColorStop(0,'rgba(222,250,244,.15)');g.addColorStop(.13,'rgba(241,255,249,.025)');g.addColorStop(.7,'rgba(248,255,242,.02)');g.addColorStop(1,'rgba(199,244,234,.21)');
 glassPath(c,mix);c.fillStyle=g;c.fill();
 ellipse(c,0,rim,w,22,'rgba(8,31,30,.12)','rgba(217,249,232,.32)',2);
 if(!mix)leaf(c,leafP);
 liquid(c,mix,level,t,color,swirl);
 if(iceP>0){
  c.save();glassPath(c,mix);c.clip();
  if(mix){for(let i=0;i<6;i++){const ip=ease(p(iceP, i*.09, .5+i*.08));if(ip>0)cube(c,(i%2?43:-43)+Math.sin(t*5+i)*swirl*14,-54-Math.floor(i/2)*84-lerp(500,0,ip),79,(i%2?.13:-.19)+Math.sin(t*5+i)*swirl*.2);}}
  else cube(c,5,-131-lerp(440,0,ease(iceP)),190,-.105);
  c.restore();
 }
 // Optical tint in front of the submerged ice, preserving the clear top.
 if(level>0){c.save();glassPath(c,mix);c.clip();c.fillStyle='rgba(209,128,26,.10)';c.fillRect(-w,-level,w*2,level+15);c.restore();}
 glassPath(c,mix);c.strokeStyle='rgba(223,253,240,.51)';c.lineWidth=2.5;c.stroke();
 ellipse(c,0,rim,w,22,null,'rgba(232,255,245,.7)',2.4);
 c.save();glassPath(c,mix);c.clip();
 let g2=c.createLinearGradient(-w,0,w,0);g2.addColorStop(0,'rgba(255,255,236,.01)');g2.addColorStop(.08,'rgba(255,255,236,.34)');g2.addColorStop(.1,'rgba(255,255,236,.02)');g2.addColorStop(.85,'rgba(255,255,236,0)');g2.addColorStop(.95,'rgba(255,255,236,.22)');g2.addColorStop(1,'rgba(255,255,236,0)');c.fillStyle=g2;c.fillRect(-w,rim,w*2,430);
 for(let i=0;i<7;i++){const xx=(i-3)*(mix?28:37);line(c,xx,rim+40,xx*.88,0,'rgba(228,250,227,.055)',7);}
 ellipse(c,0,0,w*.82,12,'rgba(211,246,227,.1)','rgba(228,255,243,.35)',2);
 c.restore();
 // Tiny deterministic condensation only on chilled glass.
 if(iceP>.7){for(let i=0;i<22;i++){let xx=Math.sin(i*12.3)*(w-20),yy=rim+48+(i*43.7%(Math.abs(rim)-70));ellipse(c,xx,yy,1.5+i%3*.5,2.5+i%2,'rgba(232,255,245,.18)');}}
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
 const s=stateAt(time),t=s.t;const mobile=width/height<1.05,W=mobile?1080:1920,H=mobile?1440:1080;
 c.save();c.scale(width/W,height/H);
 c.fillStyle=C.ink;c.fillRect(0,0,W,H);
 let bg=c.createRadialGradient(W*.72,H*.47,30,W*.72,H*.5,H*.82);bg.addColorStop(0,'#21483b');bg.addColorStop(.45,'#103734');bg.addColorStop(1,'#062224');c.fillStyle=bg;c.fillRect(0,0,W,H);
 // Soft studio halo and architectural linework, away from the labels.
 c.save();c.globalAlpha=.22; c.strokeStyle='#8f9a69';c.lineWidth=1; c.beginPath();c.arc(mobile?650:1350,mobile?990:600,mobile?380:380,0,Math.PI*2);c.stroke();c.beginPath();c.arc(mobile?650:1350,mobile?990:600,400,0,Math.PI*2);c.stroke();c.restore();
 const ground=mobile?1232:873;let floor=c.createLinearGradient(0,ground-25,0,H);floor.addColorStop(0,'rgba(2,19,21,0)');floor.addColorStop(.3,'rgba(2,19,21,.55)');floor.addColorStop(1,'rgba(2,19,21,.9)');c.fillStyle=floor;c.fillRect(0,ground-25,W,H-ground+25);
 line(c,90,ground+26,W-90,ground+26,'rgba(182,206,167,.13)',1);
 const intro=smooth(p(t,...M.intro));const switching=smooth(p(t,...M.setupTransition));const hero=smooth(p(t,...M.heroTransition));const strainPose=smooth(p(t,...M.strainPoseIn))*(1-smooth(p(t,...M.strainPoseOut)));
 const rockX=mobile?lerp(620,858,switching)*(1-hero)+620*hero:lerp(1295,1605,switching)*(1-hero)+1350*hero;
 const rockScale=mobile?lerp(1.1,.68,switching)*(1-hero)+1.38*hero:lerp(1.33,.74,switching)*(1-hero)+1.38*hero;
 const rockY=mobile?1190:828;
 ellipse(c,rockX,rockY+34,220*rockScale,24*rockScale,'rgba(0,6,8,.42)');ellipse(c,rockX,rockY+39,178*rockScale,8*rockScale,'rgba(141,182,137,.055)');
 drawGlass(c,{x:rockX,y:rockY+lerp(35,0,intro),scale:rockScale,level:s.serveLevel,t:Math.min(t,M.heroFreeze),color:s.mixColor,leafP:s.leafP,iceP:s.iceP,alpha:intro});
 const mixAlpha=smooth(p(t,...M.mixingFadeIn))*(1-smooth(p(t,...M.mixingFadeOut)));
 const mixX=mobile?430:1160, mixY=mobile?1200:831, mixScale=mobile?.98:1.02;
 const mx=mixX-120*strainPose,my=mixY-125*strainPose,ma=.83*strainPose;
 const stirring=smooth(p(t,...M.stirIn))*(1-smooth(p(t,...M.stirOut)));
 if(mixAlpha>0){ellipse(c,mixX,mixY+33,150*mixScale,19,'rgba(0,6,8,.4)');drawGlass(c,{x:mx,y:my,scale:mixScale,mix:true,level:s.mixLevel,t,color:s.mixColor,iceP:s.mixIceP,swirl:stirring,angle:ma,alpha:mixAlpha});spoon(c,mixX,mixY,t,stirring);}
 // Ingredients visibly enter the mixing vessel; stream and fill share the timeline.
 const active=R.ingredients.find(i=>t>=i.start&&t<i.end);
 if(active){const u=p(t,active.start,active.end);const pourAlpha=smooth(p(u,.16,.23))*(1-smooth(p(u,.72,.83)));
  const surface=mixY-s.mixLevel*mixScale-10;
  if(active.dashes){bittersBottle(c,mixX-25,mixY-548,u,active.color);
   // Exactly two dash pulses (a dash is illustrated as a small falling slug).
   for(let d=0;d<2;d++){let dp=p(u,.24+d*.24,.39+d*.24);if(dp>0&&dp<1){const dy=lerp(mixY-477,surface,ease(dp));stream(c,mixX+6,dy-17,mixX+6,dy,t,active.color,8,Math.sin(dp*Math.PI));}}
  }else {jigger(c,mixX-89,mixY-548,t,u,active.color);if(pourAlpha>0)stream(c,mixX-33,mixY-535,mixX+5,surface,t,active.color,active.id==='plantain'?12:8,pourAlpha);}
 }
 // Strainer retains the mixing cubes while liquid follows a continuous arc.
 if(strainPose>0){c.save();c.globalAlpha=strainPose;c.translate(mx,my);c.rotate(ma);c.scale(mixScale,mixScale);ellipse(c,0,-400,119,19,'rgba(191,206,188,.36)','#e8ead1',3);for(let i=-7;i<=7;i++)line(c,i*13,-411,i*13+8,-389,'rgba(237,243,219,.7)',1.5);line(c,-119,-400,-184,-398,'#d7e0cf',9);c.restore();
  const flow=smooth(p(t,...M.strainFlowIn))*(1-smooth(p(t,...M.strainFlowOut)));
  const lipX=mx+mixScale*(140*Math.cos(ma)+400*Math.sin(ma)),lipY=my+mixScale*(140*Math.sin(ma)-400*Math.cos(ma));
  if(flow>0)stream(c,lipX,lipY,rockX-14,rockY-s.serveLevel*rockScale-12,t,'#deb05e',9,flow);
 }
 // Small caption identifies the second glass without competing with the ingredient.
 if(mixAlpha>.1&&t<R.steps.find(s=>s.id==='strain').start){c.save();c.globalAlpha=mixAlpha;txt(c,'MIX',mixX,ground+83,18,C.muted,700,'center');txt(c,'PREPARED GLASS',rockX,ground+83,17,C.muted,400,'center');c.restore();}
 // Final leaf detail is highlighted; it is the same lining, not another garnish.
 if(t>=R.steps.find(s=>s.id==='hero').start){const glow=smooth(p(t,...M.garnishIn))*(1-smooth(p(t,...M.garnishOut)));c.save();c.globalAlpha=glow*.6;ellipse(c,rockX+15,rockY-468,66,20,null,'#e0cc83',2);c.restore();}
 const tx=mobile?80:134,top=mobile?130:150;
 txt(c,'NI DE AQUÍ NI DE ALLÁ',tx,top,22,C.muted,700);txt(c,'A COCKTAIL IN 30 SECONDS',mobile?W-80:W-134,top,18,C.muted,400,'right');
 line(c,tx,top+31,W-tx,top+31,'rgba(200,218,187,.25)');
 // Type transitions use only translation and opacity; labels stay still while read.
 const a=s.active, isIngredient=!!a.measure;let alpha=1;
 if(a.id!=='hero'&&a.id!=='intro')alpha=smooth(p(t,a.start,a.start+.2))*(1-smooth(p(t,a.end-.15,a.end)));
 else alpha=smooth(p(t,a.start,a.start+.55));
 c.save();c.globalAlpha=alpha;
 const y=mobile?278:330,dy=18*(1-alpha);let title=a.title||a.name;
 if(title==='Plantain syrup')title='Plantain\nsyrup';if(title==='Angostura bitters')title='Angostura\nbitters';if(title==='Banana bitters')title='Banana\nbitters';
 const lines=title.split('\n');const size=(a.id==='intro'||a.id==='hero')?(mobile?87:100):(mobile?80:87);
 lines.forEach((l,i)=>txt(c,l,tx,y+i*(size+3)+dy,size,C.paper,700));
 const last=y+(lines.length-1)*(size+3);
 txt(c,isIngredient?a.measure:a.detail,tx,last+90+dy,isIngredient?69:40,C.gold,isIngredient?700:400);
 let note=a.note||({bourbon:'Add to the iced mixing glass.',mezcal:'Add to the bourbon.',plantain:'Prepared syrup · see recipe notes.',angostura:'Two measured dashes.',banana:'Two measured dashes.'}[a.id]);
 txt(c,note,tx,last+(isIngredient?149:145)+dy,mobile?24:25,C.muted);
 if(a.id==='intro'||a.id==='hero'){txt(c,'Bourbon. Mezcal. Plantain.',tx,last+211+dy,27,C.paper);txt(c,R.credits,tx,last+262+dy,mobile?20:23,C.muted);}
 c.restore();
 // Recipe ledger keeps exact amounts visible after each addition.
 if(t>=R.ingredients[0].start&&t<R.steps.find(s=>s.id==='hero').start&&!mobile){const lx=tx,ly=mobile?650:691;c.save();c.globalAlpha=smooth(p(t,...M.ledgerIn))*(1-smooth(p(t,...M.ledgerOut)));R.ingredients.forEach((i,j)=>{let done=t>=i.end,now=i.id===a.id;const col=now?C.gold:done?C.paper:'#8baba2';if(done){line(c,lx+1,ly+j*39-8,lx+7,ly+j*39-2,col,2);line(c,lx+7,ly+j*39-2,lx+19,ly+j*39-17,col,2);}else if(now){ellipse(c,lx+9,ly+j*39-8,5,5,col);}else{ellipse(c,lx+9,ly+j*39-8,2,2,col);}txt(c,i.name,lx+37,ly+j*39,22,col);txt(c,i.measure,lx+(mobile?490:480),ly+j*39,22,col,now?700:400,'right');});c.restore();}
 // Time ruler is part of the film, not player chrome.
 const fy=H-65;txt(c,'BAR PROVIDENCIA · RECIPE SUPPLIED BY MIZ',tx,fy,16,C.muted);txt(c,'with Codex',W-tx,fy,18,C.gold,400,'right');
 c.restore();
 return s;
}
const api={render,stateAt,activeAt,recipe:R};if(typeof module==='object')module.exports=api;else root.CocktailScene=api;
})(typeof window==='object'?window:this);
