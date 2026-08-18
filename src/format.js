// Shared formatters. Money is always tabular and thousands-separated; dates read
// as they would in a register ("Jan 10"), never as an ISO string.

export const formatMoney = (value) =>
  `$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`

export const formatDate = (iso) => {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

export const MINUS = "\u2212"
