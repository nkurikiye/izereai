(() => {
  const card = document.querySelector('.bakame-preview-card');
  const form = document.querySelector('#bakame-preview-form');
  if (!card || !form) return;

  const questionInput = document.querySelector('#bakame-preview-question');
  const submitButton = form.querySelector('button[type="submit"]');
  const answer = document.querySelector('#bakame-preview-answer');
  const answerTitle = document.querySelector('#bakame-preview-answer-title');
  const answerCopy = document.querySelector('#bakame-preview-answer-copy');
  const followUp = document.querySelector('#bakame-preview-follow-up');
  const source = document.querySelector('#bakame-preview-source');
  const remaining = document.querySelector('#bakame-preview-remaining');
  const label = document.querySelector('#bakame-preview-label');
  const mode = document.querySelector('#bakame-preview-mode');
  const image = document.querySelector('#bakame-preview-image');
  const sessionKey = 'izere-bakame-preview-count';
  const maximumQuestions = 3;
  const configuredEndpoint = card.dataset.coachEndpoint.trim();
  const localHost = !window.location.hostname || ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const endpoint = configuredEndpoint || (localHost ? 'http://127.0.0.1:3000/api/coach/respond' : '');
  const imageByMood = {
    explaining: 'assets/bakame/explaining.png',
    thinking: 'assets/bakame/thinking.png',
    caution: 'assets/bakame/caution.png',
    celebrating: 'assets/bakame/celebrating.png'
  };

  function usedQuestions() {
    const value = Number(sessionStorage.getItem(sessionKey) || 0);
    return Number.isFinite(value) ? Math.min(maximumQuestions, Math.max(0, value)) : 0;
  }

  function updateLimit() {
    const left = maximumQuestions - usedQuestions();
    remaining.textContent = `${left} preview ${left === 1 ? 'question' : 'questions'} left`;
    if (left === 0) {
      questionInput.disabled = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Preview complete';
    }
  }

  function showUnavailable() {
    answer.hidden = false;
    label.textContent = 'COACH PREVIEW';
    answerTitle.textContent = 'Continue with a guided lesson.';
    answerCopy.textContent = 'Bakame’s live curriculum connection is not available on this page yet. You can still explore the same ideas through the Money Quest simulation.';
    followUp.textContent = 'No question was stored or counted.';
    source.textContent = 'Izere learning experience';
    remaining.textContent = `${maximumQuestions - usedQuestions()} preview questions left`;
    image.src = imageByMood.thinking;
  }

  async function askBakame(question) {
    if (!endpoint) {
      showUnavailable();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Bakame is thinking…';
    answer.hidden = true;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: 'money:foundations',
          question,
          locale: navigator.language || 'en',
          progressContext: { completedCount: 0, xp: 0, explanationLevel: 'beginner' }
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Bakame could not answer just now.');

      const current = payload.response;
      const nextCount = usedQuestions() + 1;
      sessionStorage.setItem(sessionKey, String(nextCount));
      label.textContent = payload.provider === 'openai' ? 'ADAPTIVE CURRICULUM RESPONSE' : payload.provider === 'policy' ? 'LEARNING BOUNDARY APPLIED' : 'APPROVED CURRICULUM RESPONSE';
      answerTitle.textContent = current.title;
      answerCopy.textContent = current.message;
      followUp.textContent = current.followUp;
      source.textContent = `Source · ${current.sourceIds.join(' · ')}`;
      image.src = imageByMood[current.mood] || imageByMood.explaining;
      answer.hidden = false;
      mode.textContent = payload.provider === 'openai' ? 'Adaptive AI · approved curriculum' : 'Controlled curriculum preview';
      updateLimit();
    } catch (error) {
      answer.hidden = false;
      label.textContent = 'COACH CONNECTION';
      answerTitle.textContent = 'Bakame needs a moment.';
      answerCopy.textContent = 'The learning service could not be reached. Please try again, or continue with the Money Quest below.';
      followUp.textContent = 'Your question was not stored or counted.';
      source.textContent = 'No response received';
      image.src = imageByMood.thinking;
      updateLimit();
    } finally {
      if (usedQuestions() < maximumQuestions) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Ask Bakame <span aria-hidden="true">→</span>';
      }
    }
  }

  document.querySelectorAll('[data-bakame-question]').forEach((button) => {
    button.addEventListener('click', () => {
      if (usedQuestions() >= maximumQuestions) return;
      questionInput.value = button.dataset.bakameQuestion;
      questionInput.focus();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (question.length < 2 || usedQuestions() >= maximumQuestions) return;
    askBakame(question);
  });

  updateLimit();
})();
