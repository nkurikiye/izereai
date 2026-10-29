// Izere interactive demo — clickable programmes, evidence chain, what-if intervention slider
const { useState, useMemo } = React;

const PROGRAMMES = [
  {
    id: 'rail-baltica',
    tag: 'CEF',
    name: 'Rail Baltica TEN-T',
    score: 84,
    band: 'h',
    note: 'Cost overrun 4× baseline · 14-month detection lead',
    evidence: [
      { ic: 'BC', label: 'Bidder concentration · Latvia', shap: '+18.4', w: 92 },
      { ic: 'CD', label: 'Cross-state coordination divergence', shap: '+14.2', w: 78 },
      { ic: 'FG', label: 'Financing gap 2027–28 unconfirmed', shap: '+11.8', w: 64 },
      { ic: 'MA', label: 'Milestone amendment frequency', shap: '+9.1',  w: 52 },
      { ic: 'GS', label: 'Governance distance — 3-state structure', shap: '+7.3', w: 41 },
    ],
  },
  {
    id: 'romania',
    tag: 'RRF',
    name: 'Romania NRRP',
    score: 77,
    band: 'h',
    note: 'SOE governance blockage · 2% absorption Dec 2024',
    evidence: [
      { ic: 'GB', label: 'SOE governance blockage signal', shap: '+15.6', w: 84 },
      { ic: 'AB', label: 'Absorption rate 2% vs 18% target', shap: '+13.9', w: 76 },
      { ic: 'PD', label: 'Procurement delay (4 sub-measures)', shap: '+10.4', w: 58 },
      { ic: 'PR', label: 'Political restructuring impact', shap: '+8.2',  w: 46 },
      { ic: 'TC', label: 'Technical assistance capacity gap', shap: '+5.9', w: 33 },
    ],
  },
  {
    id: 'seine-nord',
    tag: 'CEF',
    name: 'Canal Seine-Nord',
    score: 58,
    band: 'm',
    note: 'Permit delay +5y · cost +€3.7B over baseline',
    evidence: [
      { ic: 'EP', label: 'Environmental permit delay (+5y)', shap: '+12.1', w: 70 },
      { ic: 'CO', label: 'Cost overrun trajectory', shap: '+9.8',  w: 58 },
      { ic: 'BR', label: 'Bidder retention quarter-on-quarter', shap: '+6.4', w: 42 },
      { ic: 'CC', label: 'Construction calendar slip', shap: '+5.1',  w: 35 },
    ],
  },
  {
    id: 'poland',
    tag: 'RRF',
    name: 'Poland KPO',
    score: 52,
    band: 'm',
    note: 'Milestone drift Q3 · 4 flagged sub-measures',
    evidence: [
      { ic: 'MD', label: 'Milestone drift Q3 (4 sub-measures)', shap: '+10.2', w: 64 },
      { ic: 'RE', label: 'Reform-conditioning resolution time', shap: '+7.8', w: 48 },
      { ic: 'DR', label: 'Disbursement-request bottleneck', shap: '+5.4', w: 36 },
      { ic: 'SM', label: 'Sub-measure dependency density', shap: '+3.9', w: 26 },
    ],
  },
  {
    id: 'cohesion',
    tag: 'COH',
    name: 'EU Cohesion 21–27',
    score: 44,
    band: 'l',
    note: 'Absorption 11% Aug 2025 · N+3 risk in 6 MS',
    evidence: [
      { ic: 'AB', label: 'Absorption 11% (worst on record)', shap: '+8.6', w: 54 },
      { ic: 'N3', label: 'N+3 decommitment risk · 6 Member States', shap: '+6.2', w: 40 },
      { ic: 'OP', label: 'Operational programme launch lag', shap: '+4.1', w: 28 },
      { ic: 'SF', label: 'Structural fund regulation transition', shap: '+2.8', w: 18 },
    ],
  },
];

// Transparent baseline model. Coefficients are hypotheses until fitted on historical outcomes.
const FEATURES = [
  {id:'design', label:'Design maturity at award', min:0,max:100,step:5,unit:'%',base:60,weight:-0.035,reference:60},
  {id:'permits',label:'Unresolved permits',min:0,max:10,step:1,unit:'',base:3,weight:0.32,reference:3},
  {id:'procurement',label:'Procurement slippage',min:0,max:12,step:1,unit:' months',base:2,weight:0.19,reference:2},
  {id:'changes',label:'Approved design changes',min:0,max:15,step:1,unit:'',base:4,weight:0.12,reference:4},
  {id:'stakeholders',label:'Coordinating authorities',min:1,max:12,step:1,unit:'',base:4,weight:0.07,reference:4}
];
const sigmoid = x => 1/(1+Math.exp(-x));
function calculateRisk(inputs) {
  const contributions=FEATURES.map(f=>({...f,value:inputs[f.id],contribution:(inputs[f.id]-f.reference)*f.weight}));
  const logOdds=-0.5+contributions.reduce((a,f)=>a+f.contribution,0);
  return {index:Math.round(sigmoid(logOdds)*100),contributions:contributions.sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution))};
}
const initialInputs=()=>Object.fromEntries(FEATURES.map(f=>[f.id,f.base]));

const INTERVENTIONS = [
  { id: 'ta',     label: 'Deploy technical assistance',     impact: -12 },
  { id: 'gov',    label: 'Restructure governance',          impact: -18 },
  { id: 'cap',    label: 'Capital reallocation',            impact: -8  },
  { id: 'proc',   label: 'Procurement remediation',         impact: -10 },
];

function IzereDemo(){
  const [selectedId, setSelected] = useState('rail-baltica');
  const [interventions, setInterventions] = useState({});
  const [view, setView] = useState('Overview');
  const [inputs,setInputs]=useState(initialInputs);

  const selected = PROGRAMMES.find(p => p.id === selectedId);
  const totalImpact = useMemo(() => {
    return INTERVENTIONS
      .filter(i => interventions[i.id])
      .reduce((sum, i) => sum + i.impact, 0);
  }, [interventions]);

  const calculated=useMemo(()=>calculateRisk(inputs),[inputs]);
  const projected = Math.max(0, Math.min(100, calculated.index + totalImpact));
  const projectedBand = projected >= 70 ? 'h' : projected >= 50 ? 'm' : 'l';

  const toggle = (id) => setInterventions(prev => ({ ...prev, [id]: !prev[id] }));
  const reset = () => {setInterventions({});setInputs(initialInputs());};
  const riskLabel = n => n >= 70 ? 'High' : n >= 50 ? 'Elevated' : 'Lower';

  return (
    <div className="demo-frame">
      <div className="demo-bar">
        <div className="demo-bar-l">
          <span className="mono" style={{fontSize:11,color:'rgba(255,255,255,0.6)',letterSpacing:'0.08em'}}>izere/portfolio</span>
          <div className="demo-tabs">
            {['Overview','Programmes','Signals','Audit'].map(tab => <button key={tab} type="button" className={`demo-tab ${view === tab ? 'active' : ''}`} onClick={() => setView(tab)} style={{background:'transparent',border:0,cursor:'pointer',font:'inherit',color:'inherit'}} aria-pressed={view === tab}>{tab}</button>)}
          </div>
        </div>
        <div className="demo-bar-r">
          <span className="live-dot">INTERACTIVE SANDBOX · 5 SCENARIOS</span>
        </div>
      </div>

      <div className="demo-body">
        {/* LEFT: programmes */}
        <div className="demo-left">
          <div className="demo-overline">
            <span className="demo-overline-l">Portfolio risk overview</span>
            <span className="demo-overline-r">ILLUSTRATIVE DATA · NOT LIVE MONITORING</span>
          </div>
          <h3 className="demo-headline">Five scenarios.<br/><em>Explore</em> project risk.</h3>

          <div className="prog-list">
            {PROGRAMMES.map(p => (
              <button type="button" key={p.id}
                   className={`prog-row ${selectedId === p.id ? 'selected' : ''}`}
                   style={{width:"100%",background:"transparent",border:0,textAlign:"left",cursor:"pointer",color:"inherit",font:"inherit"}}
                   aria-pressed={selectedId === p.id}
                   onClick={() => { setSelected(p.id); reset(); }}>
                <div className="lbl">
                  <span className="tag">{p.tag}</span>
                  <span className="nm">{p.name}</span>
                </div>
                <div className="prog-bar">
                  <div className={`prog-bar-fill ${p.band}`} style={{width: p.score + '%'}}></div>
                </div>
                <div className="prog-val">{p.score}</div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: detail panel */}
        <div className="demo-right">
          <div>
            <div className="panel-headline">{view === "Audit" ? "Model transparency · audit" : view === "Signals" ? "Early-warning signals · evidence" : view === "Programmes" ? "Selected programme · profile" : "Programme detail · evidence chain"}</div>
            <div className="panel-name" style={{marginTop:6}}>{selected.name}</div>
            <div style={{fontSize:12.5,color:'rgba(255,255,255,0.55)',marginTop:4,fontFamily:'var(--mono)'}}>{selected.note}</div>
            <div style={{fontSize:11,marginTop:8,color:"#d9d9d9"}}>Illustrative scenario based on public project themes. The input-based index below is computed from an explicit logistic formula with illustrative coefficients. It is not a calibrated probability or real-time prediction.</div>
          </div>

          <div style={{display:'flex',alignItems:'baseline',gap:14}}>
            <div className={`panel-score ${projectedBand}`}>{projected}<span className="out">/100</span></div>
            {totalImpact !== 0 && (
              <div style={{fontFamily:'var(--mono)',fontSize:12,color:'rgba(255,255,255,0.55)'}}>
                <div>Input-based index {calculated.index}</div>
                <div style={{color: totalImpact < 0 ? 'oklch(0.7 0.1 150)' : 'var(--carmine)'}}>
                  Δ {totalImpact > 0 ? '+' : ''}{totalImpact}
                </div>
              </div>
            )}
          </div>

          {view === "Audit" && <div style={{fontSize:12,padding:"12px",border:"1px solid rgba(255,255,255,.2)",marginTop:10,lineHeight:1.6}}>MODEL CARD · DEMONSTRATION ONLY<br/>Inputs: example project signals. Risk index: sigmoid(-0.5 + sum of weighted feature deviations), scaled 0–100. Contributions are exact additive terms in log-odds, not SHAP values. Intervention effects: assumed, not causal estimates. Production use requires dated source evidence, model validation, calibration and human review.</div>}
          <div style={{padding:"12px 0",borderTop:"1px solid rgba(255,255,255,.2)"}}><div style={{fontSize:12,letterSpacing:".08em",marginBottom:10}}>PROJECT INPUTS · ADJUST TO RECALCULATE</div>{FEATURES.map(f=><label key={f.id} style={{display:"block",marginBottom:12,fontSize:12}}><span style={{display:"flex",justifyContent:"space-between",gap:8}}><span>{f.label}</span><strong>{inputs[f.id]}{f.unit}</strong></span><input type="range" min={f.min} max={f.max} step={f.step} value={inputs[f.id]} onChange={e=>setInputs(v=>({...v,[f.id]:Number(e.target.value)}))} style={{width:"100%",accentColor:"#c5b7ff"}} /></label>)}</div>
          <div style={{fontSize:12,marginBottom:8}}>MODEL EXPLANATION · LOG-ODDS CONTRIBUTIONS</div>
          <div className="evidence">
            {calculated.contributions.map((ev, i) => (
              <div key={i} className="ev-row">
                <div className="ev-icon">{i+1}</div>
                <div>
                  <div>{ev.label}</div>
                  <div className="ev-w" style={{marginTop:6}}>
                    <div className="ev-w-fill" style={{width: Math.min(100,Math.abs(ev.contribution)*45) + '%'}}></div>
                  </div>
                </div>
                <div className="ev-shap">{ev.contribution>=0?"+":""}{ev.contribution.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="whatif">
            <div className="whatif-hd">
              <span className="l">What-if · interventions</span>
              <span className="r">{Object.values(interventions).filter(Boolean).length} of {INTERVENTIONS.length} active</span>
            </div>
            <div className="whatif-options">
              {INTERVENTIONS.map(iv => (
                <label key={iv.id} className={`whatif-opt ${interventions[iv.id] ? 'on' : ''}`}>
                  <input type="checkbox" checked={!!interventions[iv.id]} onChange={() => toggle(iv.id)} />
                  <span>{iv.label}</span>
                </label>
              ))}
            </div>
            <div className="whatif-impact">
              <span>Illustrative scenario change</span>
              <span className={`delta ${totalImpact >= 0 ? 'neg' : ''}`}>
                {totalImpact === 0 ? '—' : (totalImpact > 0 ? '+' : '') + totalImpact + ' pts'}
              </span>
            </div>
            <button type="button" onClick={reset} style={{marginTop:10,padding:"8px 12px",background:"transparent",color:"white",border:"1px solid rgba(255,255,255,.4)",cursor:"pointer"}}>Reset scenario</button>
            <div style={{fontSize:12,marginTop:10,color:"rgba(255,255,255,.75)"}} aria-live="polite">Input-based baseline: {riskLabel(calculated.index)} ({calculated.index}/100) · Scenario: {riskLabel(projected)} ({projected}/100)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('izere-demo'));
root.render(<IzereDemo />);
