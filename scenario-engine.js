(function () {
  class TenYearEngine {
    constructor(goalKey, data) {
      this.data = data;
      this.goalKey = goalKey;
      this.goal = data.goals[goalKey];
      this.state = {
        round: 0,
        cash: data.startingCash,
        investments: 0,
        debt: 0,
        inflationIndex: 1,
        contributed: 0,
        forcedSales: 0,
        forcedSaleValue: 0,
        quizCorrect: 0,
        quizzesAnswered: 0,
        viewedReal: false,
        bufferScores: [],
        cashShares: [],
        history: []
      };
    }

    advance(cashAllocation) {
      const round = this.data.rounds[this.state.round];
      const total = this.data.contributionPerRound;
      const cashShare = cashAllocation / total;
      const annualCash = cashAllocation / 2;
      const annualInvest = (total - cashAllocation) / 2;
      const startCash = this.state.cash;
      const startInvestments = this.state.investments;

      for (let year = 0; year < 2; year += 1) {
        this.state.cash = (this.state.cash + annualCash) * (1 + round.cashRates[year]);
        this.state.investments = Math.max(0, (this.state.investments + annualInvest) * (1 + round.returns[year]));
        this.state.inflationIndex *= (1 + round.inflation[year]);
      }

      let forcedSale = 0;
      let uncovered = 0;
      if (round.event.type === 'income') {
        this.state.cash += round.event.amount;
      } else {
        const paidFromCash = Math.min(this.state.cash, round.event.amount);
        this.state.cash -= paidFromCash;
        let remaining = round.event.amount - paidFromCash;
        if (remaining > 0) {
          forcedSale = Math.min(this.state.investments, remaining);
          this.state.investments -= forcedSale;
          remaining -= forcedSale;
          if (forcedSale > 0) {
            this.state.forcedSales += 1;
            this.state.forcedSaleValue += forcedSale;
          }
        }
        if (remaining > 0) {
          uncovered = remaining;
          this.state.debt += remaining;
        }
      }

      this.state.contributed += total;
      this.state.cashShares.push(cashShare);
      const bufferMonths = this.state.cash / this.data.monthlyEssentials;
      this.state.bufferScores.push(Math.min(bufferMonths / 3, 1) * 100);

      const nominal = this.state.cash + this.state.investments - this.state.debt;
      const real = nominal / this.state.inflationIndex;
      const result = {
        roundIndex: this.state.round,
        round,
        startCash,
        startInvestments,
        cashAllocation,
        investmentAllocation: total - cashAllocation,
        cash: this.state.cash,
        investments: this.state.investments,
        debt: this.state.debt,
        nominal,
        real,
        bufferMonths,
        forcedSale,
        uncovered,
        inflationIndex: this.state.inflationIndex,
        coach: this.coachFor({ cashShare, bufferMonths, forcedSale, round })
      };
      this.state.history.push(result);
      this.state.round += 1;
      return result;
    }

    coachFor({ cashShare, bufferMonths, forcedSale, round }) {
      if (forcedSale > 0) {
        return {
          title: 'Your time horizon was interrupted.',
          copy: `The event exceeded available cash, so ${this.format(forcedSale)} was removed from the investment scenario. The lesson is not to avoid investing; it is to separate near-term resilience from long-term capital.`
        };
      }
      if (round.event.type === 'income') {
        return {
          title: 'More capacity creates a new decision.',
          copy: 'The additional income strengthens flexibility, but it does not automatically belong in one asset. Revisit the goal, its timing and the buffer before changing the plan.'
        };
      }
      if (cashShare >= 0.8) {
        return {
          title: 'Access is strong; growth exposure is limited.',
          copy: 'The expense is covered comfortably, but most new money remained in cash. Whether that fits depends on when the goal arrives and how much volatility the plan can tolerate.'
        };
      }
      if (cashShare <= 0.2) {
        return {
          title: 'The plan leaned heavily on future growth.',
          copy: `The expense was covered this time, with ${bufferMonths.toFixed(1)} months of essential costs still available. A different event sequence could produce another outcome.`
        };
      }
      return {
        title: 'Two jobs, one coordinated plan.',
        copy: 'Available cash absorbed the event while part of the contribution remained exposed to the long-term scenario. The appropriate balance changes with the goal and time horizon.'
      };
    }

    answerQuiz(isCorrect) {
      this.state.quizzesAnswered += 1;
      if (isCorrect) this.state.quizCorrect += 1;
    }

    markRealViewed() {
      this.state.viewedReal = true;
    }

    report() {
      const average = values => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
      const resilience = Math.round(average(this.state.bufferScores));
      const averageCashShare = average(this.state.cashShares);
      const alignment = Math.round(Math.max(25, 100 - Math.abs(averageCashShare - this.goal.targetCashShare) * 150));
      const risk = Math.round(Math.max(30, 94 - this.state.forcedSales * 24));
      const inflation = this.state.viewedReal ? 100 : 55;
      const mastery = Math.round((this.state.quizCorrect / Math.max(this.state.quizzesAnswered, 1)) * 100);
      const total = Math.round(resilience * 0.30 + alignment * 0.25 + risk * 0.20 + inflation * 0.15 + mastery * 0.10);
      const nominal = this.state.cash + this.state.investments - this.state.debt;
      const real = nominal / this.state.inflationIndex;

      let profile = 'Flexible balancer.';
      if (resilience >= 82) profile = 'Resilient planner.';
      else if (alignment >= 82 && risk >= 75) profile = 'Goal-led builder.';
      else if (averageCashShare < 0.3) profile = 'Growth-focused explorer.';

      return {
        profile,
        total,
        resilience,
        alignment,
        risk,
        inflation,
        mastery,
        nominal,
        real,
        forcedSales: this.state.forcedSales,
        summary: `${this.goal.summary} Across this path, the plan finished with ${this.format(real)} in today’s purchasing power.`
      };
    }

    format(value) {
      return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
    }
  }

  window.IzereTenYearEngine = TenYearEngine;
}());
