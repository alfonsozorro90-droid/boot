import {cleanJsonText, sleep, normalizeArray, ensureText, unique} from './utils.js';

let sdkPromise=null;
async function sdk(){
  if(!sdkPromise) sdkPromise=import('https://esm.sh/@google/genai@2.6.0');
  return sdkPromise;
}
export async function createAI(apiKey){
  if(!apiKey) throw new Error('Falta GEMINI_API_KEY. Abre Configuración y pega la clave.');
  const {GoogleGenAI}=await sdk();
  return new GoogleGenAI({apiKey});
}

function responseText(r){
  if(typeof r?.text==='string') return r.text;
  if(typeof r?.text==='function') return r.text();
  const parts=r?.candidates?.[0]?.content?.parts||[];
  return parts.map(p=>p.text||'').join('\n');
}

async function generateJSON(ai, models, parts, opts={}){
  let last;
  const candidates=unique((Array.isArray(models)?models:[models]).concat(['gemini-flash-latest','gemini-3.8-flash']));
  for(const model of candidates){
    try{
      const r=await ai.models.generateContent({
        model,
        contents:[{role:'user',parts}],
        config:{responseMimeType:'application/json',temperature:opts.temperature??0.15,maxOutputTokens:opts.maxOutputTokens??32768}
      });
      const text=responseText(r); const parsed=JSON.parse(cleanJsonText(text));
      parsed.__model=model; return parsed;
    }catch(e){last=e; const msg=String(e?.message||e); if(/400|INVALID_ARGUMENT|not found|unsupported/i.test(msg)) continue; await sleep(800)}
  }
  throw last||new Error('Gemini no devolvió JSON válido.');
}

function guideCatalog(guides){return guides.map((g,i)=>`\n===== GUÍA ${i}: ${g.name} =====\n${g.text}\nESTRUCTURA LOCAL DETECTADA:\n${(g.structure||[]).map(h=>`${h.order}. ${h.title}`).join('\n')}`).join('\n')}

export async function analyzeWithGemini({apiKey,model,guides,source}){
  const ai=await createAI(apiKey);
  const prompt=`Actúa como analista documental, profesional de calidad y redactor técnico institucional.\n\nOBJETIVO\nCompara las GUÍAS con el DOCUMENTO DE ORIGEN, selecciona la guía principal aplicable, interpreta sus instrucciones y determina qué contenido puede redactarse con evidencia verificable.\n\nREGLAS CRÍTICAS\n- Las guías son reglas de construcción, no hechos del origen.\n- Selecciona una guía principal usando su índice real. selected_guide_name debe coincidir exactamente con el archivo.\n- Conserva literalmente TODOS los títulos de la guía principal y su orden. No fusiones, resumas ni renombres secciones.\n- Identifica todos los numerales, pasos, actividades, controles, requisitos y subapartados. Si la guía contiene N elementos fijos, deben mantenerse N.\n- Si el origen proviene de video y contiene ACC-XXXX, cada acción debe permanecer diferenciable.\n- No inventes datos, responsables, fechas, resultados, periodos ni controles.\n- status: completo, parcial o faltante.\n- Formula únicamente preguntas críticas que no puedan resolverse con el origen.\n- output_format: parrafo, lista, tabla o mixto.\n\nDevuelve SOLO JSON con esta forma exacta:\n{\n "detected_process":"",\n "selected_guide_index":0,\n "selected_guide_name":"",\n "supporting_guide_indices":[],\n "selection_reason":"",\n "proposed_document_title":"",\n "general_requirements":[],\n "sections":[{\n   "order":1,"title":"TÍTULO LITERAL","guide_instruction":"","criteria":[],"required":true,\n   "status":"completo","evidence":[],"draft_content":"","output_format":"parrafo",\n   "missing_questions":[{"category":"","question":"","why_needed":"","required":true}]\n }],\n "warnings":[]\n}\n\nCATÁLOGO Y TEXTO DE GUÍAS:${guideCatalog(guides)}\n\n===== DOCUMENTO DE ORIGEN: ${source.name} =====\n${source.text||''}`;
  const out=await generateJSON(ai,model,[{text:prompt}],{maxOutputTokens:32768});
  out.selected_guide_index=Math.max(0,Math.min(guides.length-1,Number(out.selected_guide_index)||0));
  out.selected_guide_name=guides[out.selected_guide_index]?.name||out.selected_guide_name;
  out.supporting_guide_indices=normalizeArray(out.supporting_guide_indices).map(Number).filter((x,i,a)=>Number.isInteger(x)&&x>=0&&x<guides.length&&x!==out.selected_guide_index&&a.indexOf(x)===i);
  out.sections=normalizeArray(out.sections).map((s,i)=>({...s,order:Number(s.order)||i+1,title:ensureText(s.title),criteria:normalizeArray(s.criteria),evidence:normalizeArray(s.evidence),missing_questions:normalizeArray(s.missing_questions)})).sort((a,b)=>a.order-b.order);
  out.general_requirements=normalizeArray(out.general_requirements); out.warnings=normalizeArray(out.warnings);
  return out;
}

export async function generateDraftWithGemini({apiKey,model,guides,source,analysis,answers}){
  const ai=await createAI(apiKey); const idx=analysis.selected_guide_index||0;
  const relevant=[guides[idx],...(analysis.supporting_guide_indices||[]).map(i=>guides[i]).filter(Boolean)];
  const prompt=`Actúa como redactor técnico institucional y auditor de cumplimiento documental.\nProduce un DOCUMENTO FINAL usando las guías aplicables, el origen, el análisis previo y las respuestas del usuario.\n\nFIDELIDAD OBLIGATORIA\n- Devuelve exactamente una sección por cada título de la guía principal.\n- Copia cada título literalmente y conserva el orden.\n- No omitas, fusiones ni inventes pasos.\n- Si el origen contiene un INVENTARIO DE ACCIONES OPERATIVAS, cada ACC-XXXX debe convertirse en paso o fila independiente, cronológicamente.\n- numbered_items solo para pasos secuenciales, sin prefijo numérico dentro del texto.\n- bullets para listas no secuenciales.\n- Usa tablas solo cuando corresponda.\n- No agregues una sección de datos faltantes.\n- source_basis debe indicar sustento real.\n- validation revisa cada criterio y status solo puede ser cumple, parcial o no_aplica.\n\nDevuelve SOLO JSON:\n{\n "title":"","subtitle":"","introductory_note":"",\n "sections":[{"order":1,"title":"","paragraphs":[],"bullets":[],"numbered_items":[],"tables":[{"title":"","headers":[],"rows":[]}],"source_basis":[]}],\n "validation":[{"section_title":"","criterion":"","status":"cumple","note":""}],\n "warnings":[]\n}\n\nANÁLISIS PREVIO:\n${JSON.stringify(analysis,null,2)}\n\nRESPUESTAS:\n${JSON.stringify(answers,null,2)}\n\nGUÍAS APLICABLES:\n${guideCatalog(relevant)}\n\nORIGEN:\n${source.text||''}`;
  const out=await generateJSON(ai,model,[{text:prompt}],{maxOutputTokens:32768});
  return normalizeFinal(out);
}

export async function regenerateSection({apiKey,model,guides,source,analysis,answers,document,sectionOrder}){
  const ai=await createAI(apiKey); const current=(document.sections||[]).find(s=>Number(s.order)===Number(sectionOrder));
  const prompt=`Regenera ÚNICAMENTE la sección indicada de un documento institucional. Mantén exactamente su título y orden. Usa solo hechos sustentados en el origen y respuestas. No inventes. Si es procedimiento de video, conserva todas las acciones relevantes ACC-XXXX. Devuelve SOLO JSON con {"order":1,"title":"","paragraphs":[],"bullets":[],"numbered_items":[],"tables":[],"source_basis":[]}.\n\nSECCIÓN ACTUAL:\n${JSON.stringify(current,null,2)}\nANÁLISIS:\n${JSON.stringify(analysis,null,2)}\nRESPUESTAS:\n${JSON.stringify(answers,null,2)}\nORIGEN:\n${source.text||''}\nGUÍA PRINCIPAL:\n${guides[analysis.selected_guide_index]?.text||''}`;
  const out=await generateJSON(ai,model,[{text:prompt}],{maxOutputTokens:16000});
  return normalizeSection({...out,order:sectionOrder,title:current?.title||out.title});
}

export async function auditWithGemini({apiKey,model,guides,source,analysis,document}){
  const ai=await createAI(apiKey);
  const prompt=`Actúa como auditor documental independiente. Compara el borrador final contra la guía y el origen. Evalúa: finalidad de cada sección, claridad, ausencia de invenciones, consistencia de nombres/fechas/sistemas, cobertura exacta de pasos fijos y ACC-XXXX, tablas, trazabilidad y limitaciones. Devuelve SOLO JSON: {"validation":[{"section_title":"","criterion":"","status":"cumple","note":""}],"warnings":[],"editorial_summary":""}. Status: cumple, parcial o no_aplica.\n\nGUÍA PRINCIPAL:\n${guides[analysis.selected_guide_index]?.text||''}\n\nORIGEN:\n${source.text||''}\n\nANÁLISIS:\n${JSON.stringify(analysis,null,2)}\n\nBORRADOR:\n${JSON.stringify(document,null,2)}`;
  const out=await generateJSON(ai,model,[{text:prompt}],{maxOutputTokens:20000});
  out.validation=normalizeArray(out.validation); out.warnings=normalizeArray(out.warnings); out.editorial_summary=ensureText(out.editorial_summary); return out;
}

export async function transcribeVideoWithGemini({apiKey,model,file,onProgress=()=>{}}){
  const ai=await createAI(apiKey);
  onProgress('Subiendo video a Gemini Files API…');
  let remote=await ai.files.upload({file,config:{mimeType:file.type||'video/mp4',displayName:file.name||'video'}});
  const name=remote.name;
  for(let i=0;i<180;i++){
    const state=String(remote.state||'').toUpperCase();
    if(!state||state==='ACTIVE')break;
    if(state==='FAILED')throw new Error(remote.error?.message||'Gemini no pudo procesar el video.');
    onProgress(`Gemini está preparando el video… ${state}`); await sleep(2000); remote=await ai.files.get({name});
  }
  if(String(remote.state||'ACTIVE').toUpperCase()!=='ACTIVE') throw new Error('El video no quedó listo en Gemini dentro del tiempo de espera.');
  onProgress('Transcribiendo audio y construyendo inventario de acciones…');
  const prompt=`Analiza TODO el video como auditor de procedimiento. No lo resumas. Identifica idioma, hablantes, transcripción cronológica y TODAS las acciones operativas atómicas. Cada clic, selección, navegación, diligenciamiento, carga, validación o resultado diferenciable debe ser una acción independiente. Asigna ACC-0001, ACC-0002... en orden. timestamp_start y timestamp_end deben ser HH:MM:SS absolutos del video. Incluye sistema, ruta/pantalla, elemento de interfaz, dato gestionado, validación, resultado, evidencia e incertidumbre cuando exista. Devuelve SOLO JSON:\n{\n "detected_language":"", "duration_estimate":"", "speakers":[], "full_transcript":"",\n "actions":[{"action_id":"ACC-0001","timestamp_start":"00:00:00","timestamp_end":"00:00:00","actor":"","system":"","location_path":"","action":"","interface_element":"","data_handled":"","validation":"","result":"","evidence":"","uncertainty":""}],\n "visual_evidence":[],"key_facts":[],"uncertainties":[]\n}`;
  const out=await generateJSON(ai,[model,'gemini-3.8-flash'],[
    {fileData:{fileUri:remote.uri,mimeType:remote.mimeType||file.type||'video/mp4'}},{text:prompt}
  ],{maxOutputTokens:32768,temperature:0.05});
  out.actions=normalizeArray(out.actions).map((a,i)=>({...a,action_id:`ACC-${String(i+1).padStart(4,'0')}`,timestamp_start:ensureText(a.timestamp_start),timestamp_end:ensureText(a.timestamp_end),action:ensureText(a.action)}));
  out.speakers=normalizeArray(out.speakers);out.visual_evidence=normalizeArray(out.visual_evidence);out.key_facts=normalizeArray(out.key_facts);out.uncertainties=normalizeArray(out.uncertainties);
  return {transcript:out,remoteFile:remote};
}

export function renderTranscriptAsSource(t,videoName){
  const actionBlocks=(t.actions||[]).map(a=>`[${a.action_id}]\nINICIO: ${a.timestamp_start||''}\nFIN: ${a.timestamp_end||''}\nACTOR: ${a.actor||''}\nSISTEMA: ${a.system||''}\nRUTA: ${a.location_path||''}\nACCIÓN: ${a.action||''}\nELEMENTO: ${a.interface_element||''}\nDATO: ${a.data_handled||''}\nVALIDACIÓN: ${a.validation||''}\nRESULTADO: ${a.result||''}\nEVIDENCIA: ${a.evidence||''}\nINCERTIDUMBRE: ${a.uncertainty||''}`).join('\n\n');
  return `[DOCUMENTO DE ORIGEN GENERADO DESDE VIDEO: ${videoName}]\n[IDIOMA DETECTADO] ${t.detected_language||''}\n[DURACIÓN APROXIMADA] ${t.duration_estimate||''}\n\n[HABLANTES]\n- ${(t.speakers||[]).join('\n- ')}\n\n[TOTAL DE ACCIONES OPERATIVAS] ${(t.actions||[]).length}\n[INVENTARIO DE ACCIONES OPERATIVAS — UNA ACCIÓN POR REGISTRO]\n${actionBlocks}\n\n[TRANSCRIPCIÓN COMPLETA]\n${t.full_transcript||''}\n\n[EVIDENCIA VISUAL]\n- ${(t.visual_evidence||[]).join('\n- ')}\n\n[HECHOS CLAVE VERIFICABLES]\n- ${(t.key_facts||[]).join('\n- ')}\n\n[FRAGMENTOS QUE REQUIEREN CONFIRMACIÓN]\n- ${(t.uncertainties||[]).join('\n- ')}`;
}

export async function chooseVisualCandidate({apiKey,model,action,candidates}){
  const ai=await createAI(apiKey);
  const parts=[{text:`Elige el fotograma que mejor demuestra EXACTAMENTE esta acción del procedimiento. Rechaza pantallas de reunión, recursión, cambio de ventana o fotogramas donde no se vea el sistema/elemento esperado. ACCIÓN: ${JSON.stringify(action)}. Los candidatos van numerados desde 0. Devuelve SOLO JSON {"matched":true,"candidate_index":0,"confidence":0.0,"evidence_summary":"","reject_reason":"","application_match":true,"element_match":true}. Si ninguno es confiable usa matched=false y candidate_index=-1.`}];
  for(let i=0;i<candidates.length;i++){parts.push({text:`CANDIDATO ${i}`});parts.push({inlineData:{mimeType:'image/jpeg',data:candidates[i].dataUrl.split(',')[1]}})}
  const out=await generateJSON(ai,[model,'gemini-3.8-flash'],parts,{maxOutputTokens:3000,temperature:0});
  out.candidate_index=Number(out.candidate_index);out.confidence=Number(out.confidence)||0;return out;
}

function normalizeSection(s={}){return {order:Number(s.order)||1,title:ensureText(s.title),paragraphs:normalizeArray(s.paragraphs).map(ensureText),bullets:normalizeArray(s.bullets).map(ensureText),numbered_items:normalizeArray(s.numbered_items).map(ensureText),tables:normalizeArray(s.tables).map(t=>({title:ensureText(t.title),headers:normalizeArray(t.headers).map(ensureText),rows:normalizeArray(t.rows).map(r=>normalizeArray(r).map(ensureText))})),source_basis:normalizeArray(s.source_basis).map(ensureText)}}
export function normalizeFinal(d={}){return {title:ensureText(d.title)||'Documento generado',subtitle:ensureText(d.subtitle),introductory_note:ensureText(d.introductory_note),sections:normalizeArray(d.sections).map((s,i)=>normalizeSection({...s,order:Number(s.order)||i+1})).sort((a,b)=>a.order-b.order),validation:normalizeArray(d.validation),warnings:normalizeArray(d.warnings)}}
