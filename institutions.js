const flowCopy = {
  today: {
    steps: [
      ['PRODUCT FIRST', 'Catalogue and disclosures', 'The journey begins with documents and product language.'],
      ['FRICTION', 'Questionnaire without context', 'The customer answers before understanding the trade-offs.']
    ],
    outcome: ['OUTCOME', 'Cash remains idle—or leaves', 'The bank retains the deposit but may lose the investment relationship.'],
    trust: ['34%', 'Fragile'], understanding: ['22%', 'Low']
  },
  izere: {
    steps: [
      ['CAPABILITY FIRST', 'Learn through real decisions', 'Adaptive lessons explain risk, inflation, fees and time in the customer’s language.'],
      ['SAFE PRACTICE', 'Simulate before acting', 'The customer experiences trade-offs without investing real money.']
    ],
    outcome: ['CONTROLLED HANDOFF', 'Informed, measurable intent', 'Comprehension evidence accompanies the customer into the institution-owned journey.'],
    trust: ['86%', 'Strengthened'], understanding: ['91%', 'Demonstrated']
  }
};

document.querySelectorAll('[data-flow]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.flow;
  const content = flowCopy[key];
  document.querySelectorAll('[data-flow]').forEach(item => item.setAttribute('aria-selected', String(item === button)));
  document.querySelector('.flow-canvas').dataset.activeFlow = key;
  ['one', 'two'].forEach((name, index) => {
    document.querySelector(`#flow-${name}-label`).textContent = content.steps[index][0];
    document.querySelector(`#flow-${name}-title`).textContent = content.steps[index][1];
    document.querySelector(`#flow-${name}-copy`).textContent = content.steps[index][2];
  });
  document.querySelector('#flow-outcome-label').textContent = content.outcome[0];
  document.querySelector('#flow-outcome-title').textContent = content.outcome[1];
  document.querySelector('#flow-outcome-copy').textContent = content.outcome[2];
  document.querySelector('#trust-meter').style.width = content.trust[0];
  document.querySelector('#trust-label').textContent = content.trust[1];
  document.querySelector('#understanding-meter').style.width = content.understanding[0];
  document.querySelector('#understanding-label').textContent = content.understanding[1];
}));

const capabilities = {
  learn: ['01 · LEARN', 'Make complexity understandable.', 'AI adapts explanations, examples and difficulty to the learner while remaining grounded in institution-approved content.', ['Plain-language concepts', 'Adaptive learning paths', 'Source-grounded explanations']],
  simulate: ['02 · SIMULATE', 'Turn concepts into judgement.', 'Learners test realistic decisions, experience consequences and build intuition without using real money.', ['Decision scenarios', 'Visible trade-offs', 'No transaction execution']],
  evidence: ['03 · EVIDENCE', 'Make learning measurable.', 'The institution sees progression and comprehension signals—not opaque engagement vanity metrics.', ['Completion and retention', 'Knowledge checks', 'Explainable learning signals']],
  handoff: ['04 · HANDOFF', 'Pass intent into governed channels.', 'Qualified interest enters the institution’s existing journey, where suitability, advice and execution remain controlled.', ['Institution-defined trigger', 'Consent-aware data handoff', 'Existing controls preserved']]
};

document.querySelectorAll('[data-capability]').forEach(button => button.addEventListener('click', () => {
  const content = capabilities[button.dataset.capability];
  document.querySelectorAll('[data-capability]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-selected', String(item === button)); });
  document.querySelector('#capability-kicker').textContent = content[0];
  document.querySelector('#capability-title').textContent = content[1];
  document.querySelector('#capability-copy').textContent = content[2];
  document.querySelector('#capability-list').replaceChildren(...content[3].map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
}));

const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  const element = entry.target;
  const target = Number(element.dataset.count);
  const start = performance.now();
  const animate = now => {
    const progress = Math.min((now - start) / 900, 1);
    element.textContent = `${element.dataset.prefix || ''}${Math.round(target * (1 - Math.pow(1 - progress, 3)))}${element.dataset.suffix || ''}`;
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
  countObserver.unobserve(element);
}), { threshold: .6 });
document.querySelectorAll('[data-count]').forEach(element => countObserver.observe(element));

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('in-view'));

document.querySelector('[data-flow="today"]').click();
