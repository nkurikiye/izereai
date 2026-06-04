// Izere tweaks panel — accent, mode, headline density
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "ultramarine",
  "dark": false,
  "headlineScale": 1.0
}/*EDITMODE-END*/;

const ACCENTS = {
  ultramarine: { '--accent':'oklch(0.52 0.22 268)', '--accent-2':'oklch(0.62 0.20 268)', '--accent-soft':'oklch(0.94 0.04 268)' },
  forest:      { '--accent':'oklch(0.48 0.14 150)', '--accent-2':'oklch(0.58 0.13 150)', '--accent-soft':'oklch(0.94 0.04 150)' },
  carmine:     { '--accent':'oklch(0.55 0.20 22)',  '--accent-2':'oklch(0.65 0.18 22)',  '--accent-soft':'oklch(0.94 0.04 22)'  },
  iron:        { '--accent':'oklch(0.32 0.02 270)', '--accent-2':'oklch(0.45 0.02 270)', '--accent-soft':'oklch(0.94 0.005 270)'},
};

function applyTweaks(t){
  const r = document.documentElement;
  const a = ACCENTS[t.accent] || ACCENTS.ultramarine;
  Object.entries(a).forEach(([k,v]) => r.style.setProperty(k, v));
  document.body.classList.toggle('dark', !!t.dark);
  // headline scale via CSS var
  r.style.setProperty('--headline-scale', t.headlineScale);
  document.querySelectorAll('.hero h1, .section-header h2, .case-text h2, .cta-content h2').forEach(el => {
    el.style.fontSize = '';
    if (t.headlineScale !== 1.0) el.style.transform = `scale(${t.headlineScale})`;
    else el.style.transform = '';
    el.style.transformOrigin = 'left top';
  });
}

function IzereTweaks(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTweaks(t); }, [t]);
  return (
    <TweaksPanel>
      <TweakSection label="Accent color" />
      <TweakRadio
        label="Accent"
        value={t.accent}
        options={['ultramarine','forest','carmine','iron']}
        onChange={(v) => setTweak('accent', v)}
      />
      <TweakSection label="Theme" />
      <TweakToggle
        label="Dark mode"
        value={t.dark}
        onChange={(v) => setTweak('dark', v)}
      />
      <TweakSection label="Headline density" />
      <TweakSlider
        label="Headline scale"
        value={t.headlineScale}
        min={0.85} max={1.15} step={0.05}
        onChange={(v) => setTweak('headlineScale', v)}
      />
    </TweaksPanel>
  );
}

const tRoot = ReactDOM.createRoot(document.getElementById('tweaks-root'));
tRoot.render(<IzereTweaks />);
