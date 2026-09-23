import {extractDriveId, bytes} from './utils.js';
let accessToken='';
function waitGIS(){return new Promise((res,rej)=>{let n=0;const t=setInterval(()=>{if(window.google?.accounts?.oauth2){clearInterval(t);res()}else if(++n>100){clearInterval(t);rej(new Error('Google Identity Services no cargó.'))}},100)})}
export async function connectDrive(clientId){
  if(!clientId) throw new Error('Configura GOOGLE_OAUTH_CLIENT_ID para usar Drive.');
  await waitGIS();
  return new Promise((resolve,reject)=>{
    const client=google.accounts.oauth2.initTokenClient({client_id:clientId,scope:'https://www.googleapis.com/auth/drive.readonly',callback:(r)=>{if(r.error)return reject(new Error(r.error_description||r.error));accessToken=r.access_token;sessionStorage.setItem('bot_drive_token',accessToken);resolve(r)}});
    client.requestAccessToken({prompt:''});
  });
}
export function isDriveConnected(){accessToken=accessToken||sessionStorage.getItem('bot_drive_token')||'';return !!accessToken}
export function disconnectDrive(){accessToken='';sessionStorage.removeItem('bot_drive_token')}
async function driveFetch(url,opts={}){accessToken=accessToken||sessionStorage.getItem('bot_drive_token')||'';if(!accessToken)throw new Error('Conecta Google Drive primero.');const r=await fetch(url,{...opts,headers:{...(opts.headers||{}),Authorization:`Bearer ${accessToken}`}});if(r.status===401){disconnectDrive();throw new Error('La sesión de Drive venció. Vuelve a conectarla.')}if(!r.ok){let t=await r.text();throw new Error(`Drive ${r.status}: ${t.slice(0,300)}`)}return r}
export async function getDriveMetadata(reference){const id=extractDriveId(reference);if(!id)throw new Error('No se pudo identificar el ID del archivo de Drive.');const r=await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?fields=id,name,mimeType,size,modifiedTime,md5Checksum`);return await r.json()}
export async function downloadDriveFile(reference,onProgress=()=>{}){const meta=await getDriveMetadata(reference);const r=await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(meta.id)}?alt=media`);const total=Number(r.headers.get('content-length')||meta.size||0);if(!r.body){const blob=await r.blob();return {meta,blob:new File([blob],meta.name,{type:meta.mimeType||blob.type})}}
  const rd=r.body.getReader();const chunks=[];let got=0;while(true){const {done,value}=await rd.read();if(done)break;chunks.push(value);got+=value.byteLength;onProgress(total?`Descargando ${bytes(got)} de ${bytes(total)}`:`Descargando ${bytes(got)}`, total?got/total:0)}
  const blob=new Blob(chunks,{type:meta.mimeType||'application/octet-stream'});return {meta,blob:new File([blob],meta.name,{type:meta.mimeType||blob.type})};
}
