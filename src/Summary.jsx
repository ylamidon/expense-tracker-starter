import { formatMoney } from './format'

function Summary({ transactions }) {
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const overdrawn = balance < 0;

  // The rail is what came in; the red fill is what went back out of it. The fill
  // caps at the full rail, so the label carries the overspend the bar can't.
  const spentRatio = totalIncome > 0 ? totalExpenses / totalIncome : (totalExpenses > 0 ? 1 : 0);
  const spentPercent = Math.round(spentRatio * 100);
  const leftPercent = Math.max(0, 100 - spentPercent);
  const spentShare = Math.min(spentRatio, 1);

  return (
    <section className="overview" aria-label="Balance">
      <div className="summary">
        <div className="card stat stat--income">
          <p className="stat-label">Income</p>
          <p className="stat-value">{formatMoney(totalIncome)}</p>
        </div>
        <div className="card stat stat--expense">
          <p className="stat-label">Expenses</p>
          <p className="stat-value">{formatMoney(totalExpenses)}</p>
        </div>
        <div className="card stat stat--balance">
          <p className="stat-label">{overdrawn ? "Overdrawn by" : "Balance"}</p>
          <p className="stat-value">{formatMoney(balance)}</p>
        </div>
      </div>

      <div className="rail">
        <div
          className="rail-track"
          role="img"
          aria-label={`${spentPercent}% of income has been spent`}
        >
          <div className="rail-spent" style={{ width: `${spentShare * 100}%` }} />
          <span className="rail-tick" style={{ left: "25%" }} />
          <span className="rail-tick" style={{ left: "50%" }} />
          <span className="rail-tick" style={{ left: "75%" }} />
        </div>
        <div className="rail-keys">
          <span className="rail-key rail-key--spent">Spent {spentPercent}% of income</span>
          <span className="rail-key rail-key--left">{leftPercent}% left</span>
        </div>
      </div>
    </section>
  );
}

export default Summary
