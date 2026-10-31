import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GuidedApp } from '/src/components/week11/guided/GuidedApp';
import { createSeedState, applyCommand } from '/src/lib/week11/engine';
import { missions, SEED_VERSION } from '/src/lib/week11/seed';
import '/src/styles.css';
function Practice() {
 const [view,setView]=useState(()=>({id:'horizontal-practice',shortId:'PRACTICE',status:'active',revision:0,textRevision:0,seedVersion:SEED_VERSION,state:createSeedState(),learner:{},evidence:[],readiness:missions.map(m=>({mission:m.key,ready:false,missing:['Practice fixture only'],required:true,optional:[]})),updatedAt:'2026-10-31',archived:[],reviews:[]}));
 const [learner,setLearner]=useState({}); const [lastResult,setLastResult]=useState(null); const [textSave,setTextSave]=useState({kind:'idle'});
 const store={view,learner,lastResult,textSave,busy:false,loadError:null,setLastResult,
 setLearner:(fn)=>{setLearner(fn);setTextSave({kind:'pending'});setTimeout(()=>setTextSave({kind:'saved',at:'practice'}),150)},
 flush:async()=>{},reloadAfterConflict:async()=>{},reset:async()=>{throw Error('Disabled in practice')},exportZip:async()=>{},exportLab:async()=>{},
 run:async(command)=>{const r=applyCommand(view.state,command,{attemptShort:'PRACTICE',revision:view.revision+1});if(r.state)setView(v=>({...v,state:r.state,revision:v.revision+1}));setLastResult(r.result);return r.result},
 captureEvidence:async(input)=>{setView(v=>({...v,evidence:[...v.evidence,{evidence_key:'EV-PRACTICE-'+input.slot,slot:input.slot,mission:input.mission,title:input.title,snapshot:{},content_hash:'practice',captured_revision:v.revision,created_at:'2026-10-31'}]}));setLastResult({ok:true,message:'Captured '+input.slot+'.'})}};
 return <div className="program-cyberfoundations"><GuidedApp store={store as never} onClassic={()=>{}} /></div>
}
createRoot(document.getElementById('practice')).render(<Practice/>);
