"""Generate and align ElevenLabs narration. No secret is written into site files.
Usage: python scripts/voiceover.py [--key-file /private/path]
Requires: ELEVENLABS_API_KEY, FFmpeg, and optional ELEVENLABS_VOICE_ID.
"""
import argparse, json, os, subprocess, sys, tempfile, urllib.request, urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent

def run(args):
    return subprocess.run(args,check=True,capture_output=True).stdout.decode().strip()

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--key-file',type=Path);args=ap.parse_args()
    key=os.environ.get('ELEVENLABS_API_KEY') or os.environ.get('ELEVEN_API_KEY')
    if not key and args.key_file:key=args.key_file.read_text().strip()
    if not key:
        print('ELEVENLABS_API_KEY is not available in this environment. Set it before generating narration.',file=sys.stderr);return 2
    config=json.loads((ROOT/'narration.json').read_text(encoding='utf-8'))
    def api(path,body=None):
        headers={'xi-api-key':key,'Content-Type':'application/json'}
        req=urllib.request.Request('https://api.elevenlabs.io'+path,data=json.dumps(body,ensure_ascii=False).encode() if body is not None else None,headers=headers)
        try:
            with urllib.request.urlopen(req,timeout=90) as resp:return resp.read()
        except urllib.error.HTTPError as exc:
            # Return only HTTP status: never echo credential-bearing request headers.
            raise RuntimeError('ElevenLabs returned HTTP '+str(exc.code)) from None
    voice=os.environ.get('ELEVENLABS_VOICE_ID')
    if not voice:
        voices=json.loads(api('/v2/voices?page_size=100')).get('voices',[])
        # Choose a built-in narration voice returned by this account, never an invented ID.
        ranked=sorted(voices,key=lambda v:(v.get('name','').lower()=='george','narration' in str(v.get('labels',{})).lower(),v.get('category')=='premade'),reverse=True)
        if not ranked:raise RuntimeError('No available voice. Set ELEVENLABS_VOICE_ID to an existing account voice.')
        voice=ranked[0]['voice_id'];print('Narration voice:',ranked[0].get('name','selected account voice'))
    segments=config['segments']
    with tempfile.TemporaryDirectory(prefix='cocktail-voice-') as td:
        td=Path(td);aligned=[]
        for n,seg in enumerate(segments):
            raw=td/f'{n}.mp3'
            payload={'text':seg['text'],'model_id':config['model'],'seed':1417,'voice_settings':{'stability':.58,'similarity_boost':.78,'style':.18,'use_speaker_boost':True,'speed':1.0}}
            if n:payload['previous_text']=segments[n-1]['text']
            if n+1<len(segments):payload['next_text']=segments[n+1]['text']
            raw.write_bytes(api('/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',payload))
            duration=float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(raw)]))
            window=seg['end']-seg['start'];tempo=max(1.,duration/(window-.035))
            # Keep pitch unchanged while fitting each spoken cue inside its exact visual window.
            filters=[]
            while tempo>2:filters.append('atempo=2');tempo/=2
            filters.append(f'atempo={tempo:.6f}');filters+=['afade=t=in:st=0:d=0.012',f'apad=whole_dur={window}',f'atrim=duration={window}',f'adelay={round(seg["start"]*1000)}:all=1']
            target=td/f'{n}-aligned.wav'
            run(['ffmpeg','-y','-v','error','-i',str(raw),'-af',','.join(filters),'-ac','1','-ar','48000',str(target)])
            aligned.append(target);print(f'Cue {n+1}/{len(segments)} aligned')
        cmd=['ffmpeg','-y','-v','error']
        for f in aligned:cmd+=['-i',str(f)]
        graph=''.join(f'[{i}:a]' for i in range(len(aligned)))+f'amix=inputs={len(aligned)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,apad,atrim=duration=30[out]'
        target=ROOT/'assets/narration.mp3'
        cmd+=['-filter_complex',graph,'-map','[out]','-ac','2','-ar','48000','-b:a','192k',str(target)]
        run(cmd)
    (ROOT/'audio-config.json').write_text(json.dumps({'available':True,'src':'assets/narration.mp3','provider':'ElevenLabs','duration':30})+'\n')
    print('Created assets/narration.mp3. Run npm run export, then publish these assets with the site.')
    return 0
if __name__=='__main__':
    try:sys.exit(main())
    except (RuntimeError,subprocess.CalledProcessError) as exc:
        print(str(exc),file=sys.stderr);sys.exit(1)
