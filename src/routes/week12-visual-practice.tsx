import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Week12App } from '@/components/week12/Week12App';
import { normalizeContent, seedContent, fillEmptyFromSource, type SourceSnapshot, type Week12View, type ExecOption } from '@/lib/week12/model';
import type { Week12Store, SaveState } from '@/lib/week12/useWeek12';

export const Route = createFileRoute('/week12-visual-practice')({ ssr: false, component: Practice });
const snapshot: SourceSnapshot = {
 version: 1, sourceShortId: 'PRACTICE', sourceStatus: 'active', sourceArchivedAt: null, studentName: 'Fictional Practice', w11TextRevision: 3, w11StateRevision: 4, sourceComplete: true, sourceMissing: [],
 findings: ['F1','F2'].map((key,i)=>({key,title:`Practice finding ${i+1}`,refs:[`LIB-${77+i}`], observation:'The fictional library record shows an opening after closing time.', hypothesis:'A staff member may have returned.', conclusion:'The library door was opened after closing time.', uncertainty:'The record does not identify who held the badge.',nextAction:'Ask the manager to confirm the visit.',priority:'medium',rationale:'Review the available records.'})),
 comparison:{refs:['LIB-79'],text:'A different library visit was during opening hours.'},report:{sections:[{n:1,title:'Scope',text:'Fictional library door records only.'}],limitations:'Door records alone do not identify the person.',liveChain:'LA-0001 → AT-0002: fictional practice action and result.'},captions:{'EV-PRACTICE-001':'Door evidence saved in fictional practice.'},evidence:[{key:'EV-PRACTICE-001',slot:'E17',mission:'M06',title:'Library records',capturedRevision:1,contentHash:'practice'}],historicalEventIds:['LIB-77','LIB-78','LIB-79'],correlationIds:[]
};
function Practice(){
 const [stage,setStage]=useState(1), [content,setContent]=useState(()=>seedContent(snapshot)),[execOption,chooseExec]=useState<ExecOption>('written'),[saveState,setSaveState]=useState<SaveState>({kind:'idle'}),[source,setSource]=useState(snapshot);
 useEffect(()=>{const saved=localStorage.getItem('w12-fictional-draft');if(saved){const p=JSON.parse(saved);setContent(normalizeContent(p.content));chooseExec(p.execOption);setStage(p.stage);}},[]);
 useEffect(()=>{if(saveState.kind!=='pending')return;const t=setTimeout(()=>{localStorage.setItem('w12-fictional-draft',JSON.stringify({content,execOption,stage}));setSaveState({kind:'saved',at:'practice confirmed'});},300);return()=>clearTimeout(t);},[content,execOption,saveState,stage]);
 const view:Week12View={id:'fictional-visual-attempt',textRevision:1,execOption,content,snapshot:source,snapshotHash:'practice',capturedAt:'2026-11-01',updatedAt:'2026-11-01',volunteerStatus:'none',presenterSelected:false,sourceChange:null,reviews:[]};
 const store={view,content,execOption,saveState,blocked:false,loadError:null,update:(fn)=>{setContent(fn);setSaveState({kind:'pending'});},chooseExec:(opt)=>{chooseExec(opt);setSaveState({kind:'pending'});},flush:async()=>{},reloadAfterConflict:async()=>setSaveState({kind:'pending'}),refreshSource:async()=>{setSource(snapshot);setContent(c=>fillEmptyFromSource(c,snapshot)??c);},setVolunteer:async()=>{},downloadFile:async(file)=>({filename:file,draft:true,content:'fictional download'}),downloadZip:async()=>({filename:'week-12-portfolio-DRAFT.zip',files:['README.md'],draft:true})} as Week12Store;
 return <div className="program-cyberfoundations"><div aria-label="Fictional fixture controls"><button onClick={()=>setSource({...snapshot,sourceComplete:false,sourceMissing:['Practice Case File incomplete']})}>Draft fixture</button><button onClick={()=>setSaveState({kind:'conflict'})}>Conflict fixture</button></div><Week12App store={store} stage={stage} onStage={setStage}/></div>;
}