import { BarChart, Bar, Rectangle, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Color follows the category, never its rank, so sorting never repaints a bar.
const CATEGORY_COLORS = {
  food: "#2a78d6",
  housing: "#eda100",
  utilities: "#1baf7a",
  transport: "#4a3aa7",
  entertainment: "#e34948",
  salary: "#eb6834",
  other: "#e87ba4",
}
const FALLBACK_COLOR = "#898781"

const AXIS_INK = "#898781"
const GRID_INK = "#e1e0d9"

const formatAmount = (value) => `$${value.toLocaleString("en-US")}`

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const CategoryBar = (props) => (
  <Rectangle {...props} radius={[4, 4, 0, 0]} fill={CATEGORY_COLORS[props.payload.category] || FALLBACK_COLOR} />
)

function CategoryTooltip({ active, payload, total }) {
  if (!active || !payload || payload.length === 0) return null;

  const { category, amount } = payload[0].payload;
  const share = total > 0 ? Math.round((amount / total) * 100) : 0;

  return (
    <div className="chart-tooltip">
      <strong>{capitalize(category)}</strong>
      <span>{formatAmount(amount)} &middot; {share}% of spending</span>
    </div>
  );
}

function CategoryChart({ transactions }) {
  const totals = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const data = Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="chart-card">
      <h2>Spending by Category</h2>

      {data.length === 0 ? (
        <p className="chart-empty">No expenses recorded yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID_INK} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={{ stroke: GRID_INK }}
              tick={{ fill: AXIS_INK, fontSize: 12 }}
              tickFormatter={capitalize}
            />
            <YAxis
              width={60}
              tickLine={false}
              axisLine={false}
              tick={{ fill: AXIS_INK, fontSize: 12 }}
              tickFormatter={formatAmount}
            />
            <Tooltip
              cursor={{ fill: "rgba(11, 11, 11, 0.04)" }}
              content={<CategoryTooltip total={total} />}
            />
            <Bar dataKey="amount" maxBarSize={48} shape={CategoryBar} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default CategoryChart
