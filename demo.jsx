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

const INTERVENTIONS = [
  { id: 'ta',     label: 'Deploy technical assistance',     impact: -12 },
  { id: 'gov',    label: 'Restructure governance',          impact: -18 },
  { id: 'cap',    label: 'Capital reallocation',            impact: -8  },
  { id: 'proc',   label: 'Procurement remediation',         impact: -10 },
];

function IzereDemo(){
  const [selectedId, setSelected] = useState('rail-baltica');
  const [interventions, setInterventions] = useState({});

  const selected = PROGRAMMES.find(p => p.id === selectedId);
  const totalImpact = useMemo(() => {
    return INTERVENTIONS
      .filter(i => interventions[i.id])
      .reduce((sum, i) => sum + i.impact, 0);
  }, [interventions]);

  const projected = Math.max(0, Math.min(100, selected.score + totalImpact));
  const projectedBand = projected >= 70 ? 'h' : projected >= 50 ? 'm' : 'l';

  const toggle = (id) => setInterventions(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="demo-frame">
      <div className="demo-bar">
        <div className="demo-bar-l">
          <span className="mono" style={{fontSize:11,color:'var(--ink-3)',letterSpacing:'0.08em'}}>izere/portfolio</span>
          <div className="demo-tabs">
            <span className="demo-tab active">Overview</span>
            <span className="demo-tab">Programmes</span>
            <span className="demo-tab">Signals</span>
            <span className="demo-tab">Audit</span>
          </div>
        </div>
        <div className="demo-bar-r">
          <span className="live-dot">DEMO · 5 PROGRAMMES</span>
          <span>· €481B</span>
        </div>
      </div>

      <div className="demo-body">
        {/* LEFT: programmes */}
        <div className="demo-left">
          <div className="demo-overline">
            <span className="demo-overline-l">Portfolio risk overview</span>
            <span className="demo-overline-r">ILLUSTRATIVE SCORES</span>
          </div>
          <h3 className="demo-headline">Five programmes.<br/><em>Three</em> tracking late.</h3>

          <div className="prog-list">
            {PROGRAMMES.map(p => (
              <button type="button" key={p.id}
                   aria-pressed={selectedId === p.id}
                   className={`prog-row ${selectedId === p.id ? 'selected' : ''}`}
                   onClick={() => { setSelected(p.id); setInterventions({}); }}>
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
            <div className="panel-headline">Programme detail · evidence chain</div>
            <div className="panel-name" style={{marginTop:6}}>{selected.name}</div>
            <div style={{fontSize:12.5,color:'var(--ink-3)',marginTop:4,fontFamily:'var(--mono)'}}>{selected.note}</div>
          </div>

          <div style={{display:'flex',alignItems:'baseline',gap:14}}>
            <div className={`panel-score ${projectedBand} ${totalImpact !== 0 ? 'is-projection' : ''}`}>{projected}<span className="out">/100</span></div>
            {totalImpact !== 0 && (
              <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--ink-3)'}}>
                <div>Baseline {selected.score}</div>
                <div className="forecast-delta">
                  Δ {totalImpact > 0 ? '+' : ''}{totalImpact}
                </div>
              </div>
            )}
          </div>

          <div className={`status-label ${totalImpact !== 0 ? 'forecast' : selected.band === 'l' ? 'on-track' : ''}`} role="status">{totalImpact !== 0 ? 'Scenario forecast' : selected.band === 'h' ? 'At risk' : selected.band === 'm' ? 'Watch' : 'On track'}</div>

          <div className="evidence">
            {selected.evidence.map((ev, i) => (
              <div key={i} className="ev-row">
                <div className="ev-icon">{ev.ic}</div>
                <div>
                  <div>{ev.label}</div>
                  <div className="ev-w" style={{marginTop:6}}>
                    <div className="ev-w-fill" style={{width: ev.w + '%'}}></div>
                  </div>
                </div>
                <div className="ev-shap">SHAP {ev.shap}</div>
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
              <span>Scenario impact on score</span>
              <span className={`delta ${totalImpact >= 0 ? 'neg' : ''}`}>
                {totalImpact === 0 ? '—' : (totalImpact > 0 ? '+' : '') + totalImpact + ' pts'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('izere-demo'));
root.render(<IzereDemo />);

