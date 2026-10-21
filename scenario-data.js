(function () {
  const goals = {
    security: {
      label: 'Financial security',
      targetCashShare: 0.65,
      summary: 'You chose to prioritise a dependable buffer while learning how long-term growth behaves.'
    },
    home: {
      label: 'Future home',
      targetCashShare: 0.5,
      summary: 'You chose a medium-term goal that needs both accessibility and some exposure to growth.'
    },
    freedom: {
      label: 'Future freedom',
      targetCashShare: 0.3,
      summary: 'You chose a longer horizon with more capacity to experience market uncertainty.'
    }
  };

  const rounds = [
    {
      years: 'Years 1–2',
      kicker: 'Round 01 · Build the base',
      title: 'Your plan begins.',
      story: 'You can direct €10,000 of savings across the next two years. Decide how much remains available and how much enters a long-term investment simulation.',
      icon: '01',
      returns: [0.06, 0.03],
      cashRates: [0.015, 0.015],
      inflation: [0.025, 0.027],
      marketLabel: '+9.2% over two years',
      marketCopy: 'The illustrative diversified-market path rises in both years. That favourable start is not guaranteed to continue.',
      event: {
        type: 'expense', amount: 1200, symbol: '⌁',
        title: 'Your laptop stops working.',
        copy: 'A replacement required for study or work costs €1,200. Available cash is used before any simulated investment is sold.'
      },
      quiz: {
        question: 'What is the emergency buffer doing in this scenario?',
        options: ['Guaranteeing a high return', 'Keeping money available for an unexpected cost', 'Preventing inflation'],
        correct: 1,
        feedback: 'A buffer is primarily about access and resilience. It cannot guarantee returns or eliminate inflation.'
      }
    },
    {
      years: 'Years 3–4',
      kicker: 'Round 02 · Weather uncertainty',
      title: 'Markets fall. Life continues.',
      story: 'You have another €10,000 to allocate, but the next two years will test whether your plan can absorb uncertainty without forcing a rushed decision.',
      icon: '02',
      returns: [-0.16, 0.08],
      cashRates: [0.018, 0.02],
      inflation: [0.032, 0.035],
      marketLabel: '−9.3% over two years',
      marketCopy: 'A sharp decline is followed by a partial recovery. The sequence matters when money is needed during the downturn.',
      event: {
        type: 'expense', amount: 2800, symbol: '⏸',
        title: 'Income pauses for six weeks.',
        copy: 'Essential costs total €2,800. If available cash is insufficient, the simulation sells investments at the current market value.'
      },
      quiz: {
        question: 'Why can a buffer matter during a market decline?',
        options: ['It guarantees the market will recover', 'It can reduce the need to sell long-term assets immediately', 'It makes investment losses impossible'],
        correct: 1,
        feedback: 'Liquidity can give a plan time. It does not change market returns or guarantee recovery.'
      }
    },
    {
      years: 'Years 5–6',
      kicker: 'Round 03 · Use new capacity',
      title: 'Your income improves.',
      story: 'Your regular savings continue and a professional milestone creates additional room. Decide whether your existing balance still fits the goal you chose.',
      icon: '03',
      returns: [0.11, 0.05],
      cashRates: [0.022, 0.022],
      inflation: [0.024, 0.022],
      marketLabel: '+16.6% over two years',
      marketCopy: 'The illustrative market path rebounds strongly. Previous losses are not erased at the same percentage rate they occurred.',
      event: {
        type: 'income', amount: 1800, symbol: '+',
        title: 'A promotion brings a €1,800 bonus.',
        copy: 'The bonus enters available cash after this round. It gives you additional flexibility for the next decision.'
      },
      quiz: {
        question: 'A portfolio falls 20%. What gain is needed to return to its starting value?',
        options: ['20%', '25%', '40%'],
        correct: 1,
        feedback: 'After a 20% fall, €100 becomes €80. A 25% gain on €80 is needed to return to €100.'
      }
    },
    {
      years: 'Years 7–8',
      kicker: 'Round 04 · Protect flexibility',
      title: 'A move changes the plan.',
      story: 'Your goal is closer, but relocation costs are approaching. Decide how much money should remain accessible for the next two years.',
      icon: '04',
      returns: [0.04, 0.07],
      cashRates: [0.02, 0.018],
      inflation: [0.029, 0.031],
      marketLabel: '+11.3% over two years',
      marketCopy: 'The market path grows moderately while inflation remains elevated, reducing the purchasing power of every nominal euro.',
      event: {
        type: 'expense', amount: 3500, symbol: '⌂',
        title: 'Relocation costs arrive.',
        copy: 'Deposit, transport and setup costs total €3,500. The engine again uses available cash before selling investments.'
      },
      quiz: {
        question: 'What does “real value” mean in this game?',
        options: ['Value adjusted for changes in purchasing power', 'The amount shown by the bank', 'A guaranteed future selling price'],
        correct: 0,
        feedback: 'Real value adjusts nominal money for inflation so that amounts can be compared in today’s purchasing power.'
      }
    },
    {
      years: 'Years 9–10',
      kicker: 'Round 05 · Finish deliberately',
      title: 'The destination is close.',
      story: 'This is the final allocation. The market path remains uncertain and your chosen goal now has less time to recover from disruption.',
      icon: '05',
      returns: [-0.07, 0.09],
      cashRates: [0.016, 0.016],
      inflation: [0.026, 0.025],
      marketLabel: '+1.4% over two years',
      marketCopy: 'A decline in year nine is followed by a recovery. The decade ends slightly higher, but the path is uneven.',
      event: {
        type: 'expense', amount: 2200, symbol: '◆',
        title: 'Your goal needs a first payment.',
        copy: 'A €2,200 goal-related payment becomes due. Accessible money protects the remaining long-term plan from an unnecessary sale.'
      },
      quiz: {
        question: 'Which result best evaluates this mission?',
        options: ['The highest investment balance', 'The luckiest market path', 'A plan aligned with the goal that survives interruptions'],
        correct: 2,
        feedback: 'Izere rewards informed, goal-aligned judgement—not activity, risk-taking or the highest simulated return.'
      }
    }
  ];

  window.IzereScenarios = {
    contributionPerRound: 10000,
    startingCash: 1000,
    monthlyEssentials: 1800,
    goals,
    rounds
  };
}());
