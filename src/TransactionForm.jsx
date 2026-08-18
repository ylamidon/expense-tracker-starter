import { useState } from 'react'
import { capitalize } from './format'

function TransactionForm({ categories, onAdd }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("food");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Name the entry so you can find it later.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    onAdd({
      id: Date.now(),
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      date: new Date().toISOString().split('T')[0],
    });

    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("food");
    setError("");
  };

  return (
    <section className="card entry-card">
      <div className="card-head">
        <h2 className="card-title">New entry</h2>
      </div>

      <form className="entry-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="entry-description">Description</label>
          <input
            id="entry-description"
            className="control"
            type="text"
            placeholder="Coffee, rent, paycheck"
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError(""); }}
          />
        </div>

        <div className="segmented" role="radiogroup" aria-label="Entry type">
          <button
            type="button"
            role="radio"
            aria-checked={type === "expense"}
            className={type === "expense" ? "segment is-selected is-out" : "segment"}
            onClick={() => setType("expense")}
          >
            Money out
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={type === "income"}
            className={type === "income" ? "segment is-selected is-in" : "segment"}
            onClick={() => setType("income")}
          >
            Money in
          </button>
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="entry-amount">Amount</label>
            <input
              id="entry-amount"
              className="control"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="entry-category">Category</label>
            <select
              id="entry-category"
              className="control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{capitalize(cat)}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn-primary" type="submit">Add entry</button>

        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </section>
  );
}

export default TransactionForm
