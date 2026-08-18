import { useSyncExternalStore } from 'react'
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { capitalize, formatMoney } from './format'

// Color follows the category, never its rank, so sorting never repaints a bar.
// The order below is the validated one: adjacent slots clear the CVD separation
// check on this surface (worst pair dE 13.9), and every bar is also named on the
// axis, so identity is never carried by color alone. "other" is the catch-all
// and stays deliberately neutral.
const CATEGORY_COLORS = {
  food: "#0ea372",
  housing: "#c026d3",
  utilities: "#d97706",
  transport: "#6366f1",
  entertainment: "#f43f5e",
  salary: "#0891b2",
  other: "#94a3b8",
}
const FALLBACK_COLOR = "#94a3b8"

const AXIS_INK = "#9fabbd"
const GRID_INK = "#232c3b"
const MONO = "JetBrains Mono, ui-monospace, monospace"

// Upright bars have no room to label themselves on a phone, so the chart lies
// down instead of dropping ticks -- every bar keeps its name either way.
const NARROW = "(max-width: 720px)"

const subscribeToNarrow = (onChange) => {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

function useNarrow() {
  return useSyncExternalStore(
    subscribeToNarrow,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

function CategoryTooltip({ active, payload, total }) {
  if (!active || !payload || payload.length === 0) return null;

  const { category, amount } = payload[0].payload;
  const share = total > 0 ? Math.round((amount / total) * 100) : 0;

  return (
    <div className="chart-tooltip">
      <strong>{capitalize(category)}</strong>
      <span>{formatMoney(amount)} &middot; {share}% of spending</span>
    </div>
  );
}

function CategoryChart({ transactions }) {
  const narrow = useNarrow();

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

  const axisTick = { fill: AXIS_INK, fontSize: 11, fontFamily: MONO };
  const bars = data.map(d => (
    <Cell key={d.category} fill={CATEGORY_COLORS[d.category] || FALLBACK_COLOR} />
  ));

  return (
    <section className="card chart">
      <div className="card-head">
        <h2 className="card-title">Spending by category</h2>
        {total > 0 && <span className="card-meta">{formatMoney(total)} out</span>}
      </div>

      {data.length === 0 ? (
        <p className="empty">No spending recorded yet.</p>
      ) : narrow ? (
        <ResponsiveContainer width="100%" height={data.length * 38}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID_INK} strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="category"
              width={96}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={capitalize}
            />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
              content={<CategoryTooltip total={total} />}
            />
            <Bar dataKey="amount" maxBarSize={18} radius={[0, 6, 6, 0]} isAnimationActive={false}>
              {bars}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={GRID_INK} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={{ stroke: GRID_INK }}
              tick={axisTick}
              tickFormatter={capitalize}
              interval={0}
            />
            <YAxis
              width={64}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={formatMoney}
            />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
              content={<CategoryTooltip total={total} />}
            />
            <Bar dataKey="amount" maxBarSize={64} radius={[6, 6, 0, 0]} isAnimationActive={false}>
              {bars}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

export default CategoryChart
