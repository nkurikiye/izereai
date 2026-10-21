const questChoices = {
  experience: {
    title: 'The experience was real. So is the shortfall.',
    copy: 'You enjoyed the concert, but the repair arrives with no money set aside. You now need €80 from another source or must delay the repair.',
    number: '€80 short',
    coachTitle: 'Opportunity cost is not regret.',
    coachCopy: 'The concert was not automatically a bad decision. The lesson is to recognise that spending the full €100 removed your safety margin before you chose.'
  },
  buffer: {
    title: 'Your buffer absorbs the surprise.',
    copy: 'The €80 repair is covered without borrowing or selling anything. You still have €20 available for the next unexpected cost.',
    number: '€20 left',
    coachTitle: 'Liquidity buys breathing room.',
    coachCopy: 'Money held for emergencies is doing a job even when it earns little. It protects your other plans when life changes unexpectedly.'
  },
  invest: {
    title: 'Your time horizon meets real life.',
    copy: 'In this scenario the market is down 8%, so the simulated investment is worth €92 when the €80 repair arrives. Selling now would leave €12.',
    number: '€92 now',
    coachTitle: 'Different goals need different pots.',
    coachCopy: 'Long-term investing and emergency saving solve different problems. A buffer can help you avoid selling an investment during an unfavourable moment.'
  }
};

const choiceCards = [...document.querySelectorAll('.choice-card')];
const resolveChoice = document.querySelector('#resolve-choice');
const retryChoice = document.querySelector('#retry-choice');
const consequence = document.querySelector('#consequence');
let selectedChoice = '';
let missionCompleted = false;

choiceCards.forEach(card => card.addEventListener('click', () => {
  selectedChoice = card.dataset.choice;
  choiceCards.forEach(item => {
    const selected = item === card;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-checked', String(selected));
  });
  document.querySelector('#choice-status').textContent = 'Choice ready';
  resolveChoice.disabled = false;
}));

resolveChoice.addEventListener('click', () => {
  if (!selectedChoice) return;
  const outcome = questChoices[selectedChoice];
  document.querySelector('#outcome-title').textContent = outcome.title;
  document.querySelector('#outcome-copy').textContent = outcome.copy;
  document.querySelector('#outcome-number').textContent = outcome.number;
  document.querySelector('#coach-title').textContent = outcome.coachTitle;
  document.querySelector('#coach-copy').textContent = outcome.coachCopy;
  consequence.hidden = false;
  resolveChoice.textContent = 'Outcome revealed';
  resolveChoice.disabled = true;

  if (!missionCompleted) {
    missionCompleted = true;
    document.querySelector('#quest-progress').textContent = '1';
    document.querySelector('#xp-total').textContent = '120';
    document.querySelector('#mastery-value').textContent = '17%';
    document.querySelector('#mastery-ring').style.setProperty('--mastery', '17%');
    document.querySelector('#map-progress').style.width = '20%';
    document.querySelector('#node-1').classList.remove('active');
    document.querySelector('#node-1').classList.add('complete');
    const nodeTwo = document.querySelector('#node-2');
    nodeTwo.classList.remove('locked');
    nodeTwo.classList.add('active');
    nodeTwo.removeAttribute('aria-disabled');
    document.querySelector('#liquidity-badge').classList.add('is-earned');
    const sparkles = document.querySelector('#quest-sparkles');
    sparkles.classList.remove('celebrate');
    requestAnimationFrame(() => sparkles.classList.add('celebrate'));
  }
  consequence.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

retryChoice.addEventListener('click', () => {
  selectedChoice = '';
  choiceCards.forEach(item => {
    item.classList.remove('selected');
    item.setAttribute('aria-checked', 'false');
  });
  document.querySelector('#choice-status').textContent = 'Select one';
  consequence.hidden = true;
  resolveChoice.innerHTML = 'See what happens <span>›</span>';
  resolveChoice.disabled = true;
  document.querySelector('.mission-play').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelectorAll('.mission-node').forEach(node => node.addEventListener('click', event => {
  if (node.getAttribute('aria-disabled') === 'true') event.preventDefault();
}));
