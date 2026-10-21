(function () {
  const data = window.IzereScenarios;
  const Engine = window.IzereTenYearEngine;
  if (!data || !Engine) return;

  const money = value => new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(value);

  const elements = {
    gate: document.querySelector('#goal-gate'),
    game: document.querySelector('#decade-game'),
    report: document.querySelector('#decade-report'),
    goalOptions: [...document.querySelectorAll('.goal-option')],
    start: document.querySelector('#start-run'),
    goal: document.querySelector('#run-goal'),
    round: document.querySelector('#run-round'),
    years: document.querySelector('#run-years'),
    progress: document.querySelector('#run-progress'),
    kicker: document.querySelector('#round-kicker'),
    title: document.querySelector('#round-title'),
    story: document.querySelector('#round-story'),
    icon: document.querySelector('#round-icon'),
    slider: document.querySelector('#run-allocation'),
    cashAllocation: document.querySelector('#run-cash-allocation'),
    investAllocation: document.querySelector('#run-invest-allocation'),
    allocationLabel: document.querySelector('#allocation-label'),
    preview: document.querySelector('#decision-preview-copy'),
    commit: document.querySelector('#commit-round'),
    decision: document.querySelector('#decision-panel'),
    result: document.querySelector('#round-result'),
    eventSymbol: document.querySelector('#event-symbol'),
    eventDate: document.querySelector('#event-date'),
    eventTitle: document.querySelector('#event-title'),
    eventCopy: document.querySelector('#event-copy'),
    marketResult: document.querySelector('#market-result'),
    marketCopy: document.querySelector('#market-copy'),
    marketSpark: document.querySelector('#market-spark'),
    resultNominal: document.querySelector('#result-nominal'),
    resultReal: document.querySelector('#result-real'),
    resultLiquidity: document.querySelector('#result-liquidity'),
    coachTitle: document.querySelector('#run-coach-title'),
    coachCopy: document.querySelector('#run-coach-copy'),
    quizQuestion: document.querySelector('#quiz-question'),
    quizOptions: document.querySelector('#quiz-options'),
    quizFeedback: document.querySelector('#quiz-feedback'),
    next: document.querySelector('#next-round'),
    nominal: document.querySelector('#nominal-total'),
    cash: document.querySelector('#run-cash'),
    investments: document.querySelector('#run-investments'),
    cashMonths: document.querySelector('#cash-months'),
    bufferBar: document.querySelector('#buffer-bar'),
    realToggle: document.querySelector('#real-toggle'),
    timeline: [...document.querySelectorAll('.decade-timeline i')],
    restart: document.querySelector('#restart-run')
  };

  let selectedGoal = 'security';
  let engine = null;
  let lastResult = null;
  let showingReal = false;

  elements.goalOptions.forEach(option => option.addEventListener('click', () => {
    selectedGoal = option.dataset.goal;
    elements.goalOptions.forEach(item => {
      const selected = item === option;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-checked', String(selected));
    });
  }));

  elements.start.addEventListener('click', () => {
    engine = new Engine(selectedGoal, data);
    showingReal = false;
    elements.realToggle.setAttribute('aria-pressed', 'false');
    elements.realToggle.textContent = 'Show today’s purchasing power';
    elements.gate.hidden = true;
    elements.report.hidden = true;
    elements.game.hidden = false;
    elements.goal.textContent = data.goals[selectedGoal].label;
    updateDashboard();
    renderRound();
    elements.game.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  elements.slider.addEventListener('input', updateAllocation);

  elements.commit.addEventListener('click', () => {
    const cashAllocation = Number(elements.slider.value);
    lastResult = engine.advance(cashAllocation);
    renderOutcome(lastResult);
    updateDashboard();
    elements.decision.hidden = true;
    elements.result.hidden = false;
    elements.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  elements.next.addEventListener('click', () => {
    if (engine.state.round >= data.rounds.length) {
      finishRun();
      return;
    }
    renderRound();
    document.querySelector('.round-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  elements.realToggle.addEventListener('click', () => {
    if (!engine) return;
    showingReal = !showingReal;
    elements.realToggle.setAttribute('aria-pressed', String(showingReal));
    elements.realToggle.textContent = showingReal ? 'Show nominal account value' : 'Show today’s purchasing power';
    if (showingReal) engine.markRealViewed();
    updateDashboard();
  });

  elements.restart.addEventListener('click', () => {
    engine = null;
    lastResult = null;
    elements.report.hidden = true;
    elements.game.hidden = true;
    elements.gate.hidden = false;
    elements.gate.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  function renderRound() {
    const index = engine.state.round;
    const round = data.rounds[index];
    elements.round.textContent = `Round ${index + 1} of ${data.rounds.length}`;
    elements.years.textContent = round.years;
    elements.progress.style.width = `${(index / data.rounds.length) * 100}%`;
    elements.kicker.textContent = round.kicker;
    elements.title.textContent = round.title;
    elements.story.textContent = round.story;
    elements.icon.textContent = round.icon;
    elements.slider.value = allocationDefault(index);
    elements.decision.hidden = false;
    elements.result.hidden = true;
    elements.next.disabled = true;
    elements.next.innerHTML = index === data.rounds.length - 1
      ? 'Complete the decade <span>›</span>'
      : 'Continue to the next round <span>›</span>';
    updateTimeline(index);
    updateAllocation();
  }

  function allocationDefault(index) {
    if (index === 0) return Math.round(data.goals[selectedGoal].targetCashShare * 10000 / 500) * 500;
    const previous = engine.state.cashShares[index - 1] || data.goals[selectedGoal].targetCashShare;
    return Math.round(previous * 10000 / 500) * 500;
  }

  function updateAllocation() {
    const cash = Number(elements.slider.value);
    const invest = data.contributionPerRound - cash;
    const share = cash / data.contributionPerRound;
    elements.cashAllocation.textContent = money(cash);
    elements.investAllocation.textContent = money(invest);
    elements.slider.style.setProperty('--cash-share', `${share * 100}%`);
    elements.slider.setAttribute('aria-valuetext', `${cash} euros kept available and ${invest} euros in the investment scenario`);

    if (share >= 0.75) {
      elements.allocationLabel.textContent = 'Access-first plan';
      elements.preview.textContent = 'Most new money remains available. This strengthens near-term resilience but limits exposure to potential long-term growth.';
    } else if (share <= 0.25) {
      elements.allocationLabel.textContent = 'Growth-first plan';
      elements.preview.textContent = 'Most new money enters the investment scenario. The plan depends more heavily on existing cash when life interrupts.';
    } else {
      elements.allocationLabel.textContent = 'Balanced starting point';
      elements.preview.textContent = 'This split adds to both your safety buffer and your exposure to market movements.';
    }
  }

  function renderOutcome(result) {
    const roundNumber = result.roundIndex + 1;
    elements.eventSymbol.textContent = result.round.event.symbol;
    elements.eventDate.textContent = `YEAR ${roundNumber * 2} · ${result.round.event.type === 'income' ? 'OPPORTUNITY' : 'LIFE EVENT'}`;
    elements.eventTitle.textContent = result.round.event.title;
    elements.eventCopy.textContent = result.round.event.copy;
    elements.marketResult.textContent = result.round.marketLabel;
    elements.marketCopy.textContent = result.round.marketCopy;
    elements.marketSpark.classList.toggle('negative', result.round.returns.reduce((total, rate) => total + rate, 0) < 0);
    elements.resultNominal.textContent = money(result.nominal);
    elements.resultReal.textContent = money(result.real);
    elements.resultLiquidity.textContent = liquidityLabel(result);
    elements.coachTitle.textContent = result.coach.title;
    elements.coachCopy.textContent = result.coach.copy;
    renderQuiz(result.round.quiz);
    updateTimeline(roundNumber);
    elements.progress.style.width = `${(roundNumber / data.rounds.length) * 100}%`;
  }

  function liquidityLabel(result) {
    if (result.uncovered > 0) return `${money(result.uncovered)} uncovered`;
    if (result.forcedSale > 0) return `${money(result.forcedSale)} sold`;
    return `${result.bufferMonths.toFixed(1)} months left`;
  }

  function renderQuiz(quiz) {
    elements.quizQuestion.textContent = quiz.question;
    elements.quizOptions.replaceChildren();
    elements.quizFeedback.hidden = true;
    elements.quizFeedback.className = '';
    quiz.options.forEach((answer, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = answer;
      button.addEventListener('click', () => answerQuiz(button, index, quiz));
      elements.quizOptions.append(button);
    });
  }

  function answerQuiz(button, index, quiz) {
    const correct = index === quiz.correct;
    [...elements.quizOptions.children].forEach((option, optionIndex) => {
      option.disabled = true;
      if (optionIndex === quiz.correct) option.classList.add('correct');
    });
    if (!correct) button.classList.add('incorrect');
    engine.answerQuiz(correct);
    elements.quizFeedback.textContent = `${correct ? 'Correct. ' : 'Not quite. '}${quiz.feedback}`;
    elements.quizFeedback.className = correct ? 'correct' : 'incorrect';
    elements.quizFeedback.hidden = false;
    elements.next.disabled = false;
  }

  function updateDashboard() {
    if (!engine) return;
    const state = engine.state;
    const nominal = state.cash + state.investments - state.debt;
    const real = nominal / state.inflationIndex;
    const bufferMonths = state.cash / data.monthlyEssentials;
    elements.nominal.textContent = money(showingReal ? real : nominal);
    elements.cash.textContent = money(state.cash);
    elements.investments.textContent = money(state.investments);
    elements.cashMonths.textContent = `${bufferMonths.toFixed(1)} months`;
    elements.bufferBar.style.width = `${Math.min(bufferMonths / 6, 1) * 100}%`;
  }

  function updateTimeline(completedCount) {
    elements.timeline.forEach((item, index) => {
      item.classList.toggle('complete', index < completedCount);
      item.classList.toggle('current', index === completedCount && completedCount < data.rounds.length);
    });
  }

  function finishRun() {
    const report = engine.report();
    elements.game.hidden = true;
    elements.report.hidden = false;
    document.querySelector('#report-profile').textContent = report.profile;
    document.querySelector('#report-summary').textContent = report.summary;
    document.querySelector('#report-score').textContent = report.total;
    document.querySelector('#final-nominal').textContent = money(report.nominal);
    document.querySelector('#final-real').textContent = money(report.real);
    document.querySelector('#final-sales').textContent = report.forcedSales === 0 ? 'None' : String(report.forcedSales);
    ['resilience', 'alignment', 'risk', 'inflation', 'mastery'].forEach(key => {
      document.querySelector(`#score-${key}`).style.width = `${report[key]}%`;
      document.querySelector(`#value-${key}`).textContent = report[key];
    });
    const badge = document.querySelector('#resilience-badge');
    if (badge) badge.classList.add('is-earned');
    elements.report.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}());
