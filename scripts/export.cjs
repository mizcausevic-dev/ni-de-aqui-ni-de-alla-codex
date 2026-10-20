/* npm install, then npm run export. Requires FFmpeg on PATH.
   No realtime recording: render precisely 900 frames at timestamps n/30. */
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{once}=require('node:events');
let canvasLib;try{canvasLib=require('@napi-rs/canvas');}catch{canvasLib=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}
const {createCanvas,GlobalFonts,loadImage}=canvasLib,scene=require('../scene.js'),R=require('../recipe.js');
const root=path.resolve(__dirname,'..');
GlobalFonts.registerFromPath(path.join(root,'assets/SpaceGrotesk-Regular.woff2'),'Space Grotesk');
GlobalFonts.registerFromPath(path.join(root,'assets/SpaceGrotesk-Bold.woff2'),'Space Grotesk');
const portrait=process.argv.includes('--portrait'),W=portrait?1080:1920,H=portrait?1440:1080;
fs.mkdirSync(path.join(root,'output'),{recursive:true});
const canvas=createCanvas(W,H),ctx=canvas.getContext('2d');
const audioPath=path.join(root,'assets/narration.mp3');
const hasVoice=fs.existsSync(audioPath);
const output=path.join(root,'output',portrait?'cocktail-premium-portrait.mp4':hasVoice?'cocktail-premium-with-voiceover.mp4':'cocktail-premium-graphics-preview.mp4');
async function main(){
scene.setAssets({hero:await loadImage(path.join(root,'assets/hero-studio.jpg'))});
const snapshots=process.argv.includes('--stills');
if(snapshots){for(const t of [0,1.5,3.8,5.7,7.6,9.4,12.3,15,17.6,19.8,21.8,24.1,28]){scene.render(ctx,t,W,H);fs.writeFileSync(path.join(root,'output',`frame-${t}.png`),canvas.toBuffer('image/png'));}console.log('Stills rendered.');process.exit(0);}
const ff=spawn('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',String(R.fps),'-i','pipe:0',...(hasVoice?['-i',audioPath,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-af','apad','-t','30']:['-an']),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-frames:v',String(R.duration*R.fps),'-movflags','+faststart',output],{stdio:['pipe','inherit','inherit']});
ff.on('error',err=>{console.error('FFmpeg could not start:',err.message);process.exitCode=1;});
(async()=>{try{for(let n=0;n<R.duration*R.fps;n++){scene.render(ctx,n/R.fps,W,H);const pixels=ctx.getImageData(0,0,W,H).data;if(!ff.stdin.write(pixels))await once(ff.stdin,'drain');if(n%90===0)console.log(`${n}/${R.duration*R.fps} frames`);}ff.stdin.end();const [code]=await once(ff,'close');if(code!==0)throw Error(`FFmpeg exit ${code}`);console.log(output);}catch(e){console.error(e);ff.kill();process.exitCode=1;}})();

}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
