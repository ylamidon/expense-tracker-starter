import { useState } from 'react'
import { capitalize, formatDate, formatMoney, MINUS } from './format'

function TransactionList({ transactions, categories, onDelete }) {
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  let filteredTransactions = transactions;
  if (filterType !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
  }
  if (filterCategory !== "all") {
    filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
  }

  const filtered = filterType !== "all" || filterCategory !== "all";

  const clearFilters = () => {
    setFilterType("all");
    setFilterCategory("all");
  };

  return (
    <section className="card ledger">
      <div className="card-head">
        <h2 className="card-title">Entries</h2>
        <div className="filters">
          <label className="visually-hidden" htmlFor="filter-type">Filter by type</label>
          <select
            id="filter-type"
            className="control control--compact"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="income">Money in</option>
            <option value="expense">Money out</option>
          </select>
          <label className="visually-hidden" htmlFor="filter-category">Filter by category</label>
          <select
            id="filter-category"
            className="control control--compact"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{capitalize(cat)}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty">
          {filtered ? (
            <>
              <p>No entries match these filters.</p>
              <button className="btn-quiet" type="button" onClick={clearFilters}>Clear filters</button>
            </>
          ) : (
            <p>Nothing recorded yet. Add your first entry to start the ledger.</p>
          )}
        </div>
      ) : (
        <div className="table-scroll">
          <table className="ledger-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col">Category</th>
                <th scope="col" className="col-amount">Amount</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id} className="ledger-row">
                  <td className="cell-date">{formatDate(t.date)}</td>
                  <td className="cell-description">{t.description}</td>
                  <td><span className="tag">{t.category}</span></td>
                  <td className={t.type === "income" ? "cell-amount cell-amount--in" : "cell-amount cell-amount--out"}>
                    {t.type === "income" ? "+" : MINUS}{formatMoney(t.amount)}
                  </td>
                  <td className="cell-action">
                    <button
                      className="row-delete"
                      type="button"
                      onClick={() => onDelete(t.id)}
                      aria-label={`Delete ${t.description}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default TransactionList
