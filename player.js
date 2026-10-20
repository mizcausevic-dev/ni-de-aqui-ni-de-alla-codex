(function(){
'use strict';
const canvas=document.getElementById('film'),ctx=canvas.getContext('2d',{alpha:false});
const play=document.getElementById('play'),seek=document.getElementById('seek'),clock=document.getElementById('clock'),status=document.getElementById('status');
const params=new URLSearchParams(location.search),D=COCKTAIL_RECIPE.duration;
let capture=params.get('capture')==='1',playing=false,time=Math.min(D,Math.max(0,Number(params.get('t'))||0)),base=0,raf=0,ready=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function fit(){const portrait=params.get('portrait')==='1'||(!capture&&matchMedia('(max-width:720px)').matches);canvas.width=portrait?1080:1920;canvas.height=portrait?1440:1080;draw();}
function draw(){CocktailScene.render(ctx,time,canvas.width,canvas.height);seek.value=time;clock.textContent=`00:${String(Math.floor(time)).padStart(2,'0')} / 00:30`;canvas.setAttribute('aria-label',`${CocktailScene.activeAt(time).name||CocktailScene.activeAt(time).title.replace('\n',' ')}. ${Math.floor(time)} of 30 seconds.`);}
function frame(now){if(!playing)return;time=Math.min(D,(now-base)/1000);draw();if(time<D)raf=requestAnimationFrame(frame);else pause();}
function pause(){playing=false;cancelAnimationFrame(raf);play.textContent='Play';}
function start(){if(!ready)return;if(time>=D)time=0;playing=true;base=performance.now()-time*1000;play.textContent='Pause';raf=requestAnimationFrame(frame);}
function jump(t){const wasPlaying=playing;pause();time=Math.min(D,Math.max(0,t));draw();if(wasPlaying&&time<D)start();}
function restart(){pause();time=0;draw();start();}
function setCapture(value){capture=value;document.body.classList.toggle('capture',capture);document.getElementById('capture').setAttribute('aria-pressed',String(capture));fit();}
play.addEventListener('click',()=>playing?pause():start());document.getElementById('restart').addEventListener('click',restart);
seek.addEventListener('input',()=>jump(Number(seek.value)));
document.getElementById('capture').addEventListener('click',()=>{pause();time=0;setCapture(true);status.textContent='';draw();});
document.addEventListener('keydown',e=>{if(e.target.matches('input,button,summary,a')&&e.key!=='Escape')return;if(e.code==='Space'){e.preventDefault();playing?pause():start();}if(e.key.toLowerCase()==='r')restart();if(e.key==='Escape')setCapture(false);if(e.key==='ArrowRight'){e.preventDefault();jump(time+1);}if(e.key==='ArrowLeft'){e.preventDefault();jump(time-1);}});
window.addEventListener('resize',fit);
window.cocktail={renderAt(t){pause();time=Math.min(D,Math.max(0,t));draw();return CocktailScene.stateAt(time);},play:start,pause,restart,get time(){return time;},get playing(){return playing;},duration:D};
setCapture(capture);
Promise.all([document.fonts.load('400 30px "Space Grotesk"'),document.fonts.load('700 100px "Space Grotesk"')]).then(()=>{ready=true;fit();if(params.get('autoplay')==='1'&&!reduced)start();if(reduced)status.textContent='Reduced motion is enabled. Press Play when ready.';}).catch(()=>{ready=true;draw();status.textContent='The display font could not load. Please reload before capture.';});
})();
