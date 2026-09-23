import {ext, sha256Blob, isVideoName} from './utils.js';

export async function extractTextFromFile(file){
  const e=ext(file.name);
  if(e==='txt') return {text:await file.text(),pages:null};
  if(e==='docx'){
    if(!window.mammoth) throw new Error('Mammoth.js no cargó. Revisa tu conexión.');
    const out=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
    return {text:out.value||'',pages:null};
  }
  if(e==='pdf'){
    if(!window.pdfjsLib) throw new Error('PDF.js no cargó. Revisa tu conexión.');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
    const chunks=[];
    for(let i=1;i<=pdf.numPages;i++){
      const p=await pdf.getPage(i); const tc=await p.getTextContent();
      chunks.push(`[PÁGINA ${i}]\n`+tc.items.map(x=>x.str).join(' '));
    }
    return {text:chunks.join('\n\n'),pages:pdf.numPages};
  }
  throw new Error(`Formato no soportado: .${e}`);
}

export async function buildRecord(file,label='archivo'){
  const fp=await sha256Blob(file);
  if(isVideoName(file.name)||file.type.startsWith('video/')) return {name:file.name,size:file.size,mime:file.type||'video/mp4',extension:ext(file.name),fingerprint:fp,kind:'video',file};
  const {text,pages}=await extractTextFromFile(file);
  return {name:file.name,size:file.size,mime:file.type||'',extension:ext(file.name),fingerprint:fp,kind:label,text:text.slice(0,250000),pages,file};
}

export function extractGuideStructure(text=''){
  const lines=String(text).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const headings=[]; let order=0;
  const headingRx=/^(?:(\d+(?:\.\d+)*)[.)\-:]?\s+)?([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9 /()\-_,.]{2,90})$/;
  for(const line of lines){
    if(/^\[PÁGINA\s+\d+\]$/i.test(line))continue;
    const m=line.match(headingRx); if(!m)continue;
    const title=(m[2]||'').trim();
    if(title.length<3||title.length>100)continue;
    if(/^(PÁGINA|TABLA DE CONTENIDO|ÍNDICE)$/i.test(title))continue;
    if(headings.some(h=>h.title===title))continue;
    headings.push({order:++order,number:m[1]||'',title});
  }
  return headings.slice(0,80);
}
