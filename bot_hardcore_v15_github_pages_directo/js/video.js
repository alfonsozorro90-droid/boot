import {parseClock, clamp, clock} from './utils.js';
import {chooseVisualCandidate} from './gemini.js';

function waitEvent(el,name){return new Promise((res,rej)=>{const ok=()=>{cleanup();res()};const bad=()=>{cleanup();rej(el.error||new Error(`Error de video: ${name}`))};const cleanup=()=>{el.removeEventListener(name,ok);el.removeEventListener('error',bad)};el.addEventListener(name,ok,{once:true});el.addEventListener('error',bad,{once:true})})}
export async function loadVideoFile(file,videoEl){if(videoEl.src)URL.revokeObjectURL(videoEl.src);videoEl.src=URL.createObjectURL(file);videoEl.load();await waitEvent(videoEl,'loadedmetadata');return {duration:videoEl.duration,width:videoEl.videoWidth,height:videoEl.videoHeight}}
async function seek(video,sec){const target=clamp(sec,0,Math.max(0,(video.duration||sec)-.05));if(Math.abs(video.currentTime-target)<.08)return;video.currentTime=target;await waitEvent(video,'seeked')}
export async function captureFrame(video,canvas,sec,quality=.86){await seek(video,sec);const maxW=1280;const scale=Math.min(1,maxW/(video.videoWidth||maxW));canvas.width=Math.max(2,Math.round((video.videoWidth||1280)*scale));canvas.height=Math.max(2,Math.round((video.videoHeight||720)*scale));const ctx=canvas.getContext('2d',{alpha:false});ctx.drawImage(video,0,0,canvas.width,canvas.height);return {second:sec,timestamp:clock(sec),dataUrl:canvas.toDataURL('image/jpeg',quality)}}

export async function buildVisualEvidence({apiKey,model,actions,video,canvas,onProgress=()=>{},candidatesPerAction=3}){
  const results=[];const n=actions.length;
  for(let i=0;i<n;i++){
    const a=actions[i];const start=parseClock(a.timestamp_start);const end=parseClock(a.timestamp_end)||start+2;const mid=(start+end)/2;
    const seconds=candidatesPerAction<=1?[mid]:[Math.max(0,start+.15),mid,Math.min(video.duration-.1,Math.max(mid,end-.15))].slice(0,candidatesPerAction);
    const uniq=[...new Set(seconds.map(x=>Math.round(x*10)/10))];const candidates=[];
    for(const sec of uniq){try{candidates.push(await captureFrame(video,canvas,sec))}catch{}}
    let verdict={matched:false,candidate_index:-1,confidence:0,reject_reason:'No se pudo verificar automáticamente.'};
    if(candidates.length){
      try{verdict=await chooseVisualCandidate({apiKey,model,action:a,candidates})}catch(e){verdict.reject_reason=String(e?.message||e)}
    }
    const idx=verdict.matched&&verdict.candidate_index>=0&&verdict.candidate_index<candidates.length?verdict.candidate_index:Math.min(1,candidates.length-1);
    const selected=candidates[idx]||null;const status=verdict.matched&&verdict.confidence>=.67?'verified':'manual_review';
    results.push({action_id:a.action_id,action:a.action,timestamp:a.timestamp_start,status,confidence:verdict.confidence||0,evidence_summary:verdict.evidence_summary||'',reject_reason:verdict.reject_reason||'',selected_index:idx,candidates,selected});
    onProgress(`Evidencia ${i+1}/${n} · ${a.action_id} · ${status}`, (i+1)/n);
  }
  return results;
}
