import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {GuidedApp} from './components/week11/guided/GuidedApp';
import {UsersView,TicketsView} from './components/week11/DirectoryViews';
import {LogsView} from './components/week11/InvestigationViews';
import {createSeedState,applyCommand} from './lib/week11/engine';
import './styles.css';
function Practice(){
 const [state,setState]=useState(()=>createSeedState());
 const [learner,setL]=useState(()=>JSON.parse(localStorage.getItem('fictional-writing')||'{}'));
 const [save,setSave]=useState({kind:'idle'});const [result,setResult]=useState(null);
 const view={id:'fictional-final',shortId:'FAKE',status:'active',revision:state.seq,textRevision:0,seedVersion:state.seed,state,learner,evidence:[],readiness:['M01','M02','M03','M04','M05','M06'].map(mission=>({mission,ready:false,missing:[],required:!['M01','M03','M04'].includes(mission),optional:[]})),updatedAt:'',archived:[],reviews:[]};
 const store={view,learner,textSave:save,busy:false,lastResult:result,setLearner(fn){setL(prev=>{const n=fn(prev);setSave({kind:'pending'});setTimeout(()=>{localStorage.setItem('fictional-writing',JSON.stringify(n));setSave({kind:'saved',at:'practice confirmed'});},500);return n;});},async run(cmd){const r=applyCommand(state,cmd,{attemptShort:'FAKE',revision:state.seq});if(r.state)setState(r.state);setResult(r.result);return r.result;},async flush(){},capture(){throw Error('No capture on this practice page');},exportAll(){},exportLab(){},reloadAfterConflict(){}};
 const classic=new URLSearchParams(location.search).has('classic');
 return <div className="dark demo-lab-cyberfoundations">{classic?<><TicketsView store={store} initial="T201"/><UsersView store={store} dir="AD" selected="ad-alex" onSelect={()=>{}}/><LogsView store={store} kind="signin"/></>:<GuidedApp store={store} onClassic={()=>{}}/>}</div>;
}
createRoot(document.getElementById('practice')).render(<Practice/>);
