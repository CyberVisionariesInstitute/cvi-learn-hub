import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Week12App } from '@/components/week12/Week12App';
import { seedContent, type SourceSnapshot, type Week12View } from '@/lib/week12/model';
import type { Week12Store } from '@/lib/week12/useWeek12';
export const Route = createFileRoute('/w12-reflow')({ssr:false,component:Practice});
function Practice(){
 const [stage,setStage]=useState(6);
 const snapshot:SourceSnapshot={version:1,sourceShortId:'PRACTICE',sourceStatus:'active',sourceArchivedAt:null,studentName:'Fictional Practice',w11TextRevision:1,w11StateRevision:1,sourceComplete:false,sourceMissing:['Fictional incomplete source'],findings:[],comparison:{refs:[],text:''},report:{sections:[],limitations:'',liveChain:''},captions:{},evidence:[],historicalEventIds:[],correlationIds:[]};
 const [content,update]=useState(()=>seedContent(snapshot));
 const view:Week12View={id:'fictional-visual-attempt',textRevision:1,execOption:'written',content,snapshot,snapshotHash:'practice',capturedAt:'2026-11-01',updatedAt:'2026-11-01',volunteerStatus:'none',presenterSelected:false,sourceChange:null,reviews:[]};
 const store={view,content,execOption:'written',update,chooseExec:()=>{},saveState:{kind:'idle'},blocked:false,loadError:null,flush:async()=>true,reloadAfterConflict:async()=>{},refreshSource:async()=>{},setVolunteer:async()=>{},downloadZip:async()=>({filename:'practice',draft:true,files:[],zipBase64:''}),downloadFile:async()=>({filename:'practice',draft:true,content:''})} as Week12Store;
 return <div className="program-cyberfoundations"><Week12App store={store} stage={stage} onStage={setStage}/></div>;
}
