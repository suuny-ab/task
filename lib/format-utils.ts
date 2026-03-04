import type { DrilldownField } from "./types"

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 100000000) {
    return `${(value / 100000000).toFixed(2)} 亿`
  }
  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(2)} 万`
  }
  return `${value.toLocaleString("zh-CN")} 元`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatNumber(value: number): string {
  return value.toLocaleString("zh-CN")
}

export function formatFieldValue(field: DrilldownField): string {
  const v = field.value
  if (typeof v === "string") return v
  switch (field.format) {
    case "currency":
      return formatCurrency(v)
    case "percent":
      return formatPercent(v)
    case "coefficient":
      return `${v}`
    case "number":
      return formatNumber(v)
    default:
      return `${v}`
  }
}

export function formatCellValue(
  value: unknown,
  type: "text" | "number" | "percent" | "currency" | "date"
): string {
  if (value == null) return "-"
  switch (type) {
    case "currency":
      return formatCurrency(Number(value))
    case "percent":
      return formatPercent(Number(value))
    case "number":
      return formatNumber(Number(value))
    default:
      return String(value)
  }
}

// Aggregation helper
export function aggregate(
  data: Record<string, unknown>[],
  column: string,
  method: "sum" | "avg" | "count" | "max" | "min"
): number {
  const nums = data.map((r) => Number(r[column]) || 0)
  switch (method) {
    case "sum":
      return nums.reduce((a, b) => a + b, 0)
    case "avg":
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
    case "count":
      return nums.length
    case "max":
      return Math.max(...nums)
    case "min":
      return Math.min(...nums)
  }
}

export function formatAggregatedValue(
  value: number,
  format: "currency" | "number" | "percent"
): string {
  switch (format) {
    case "currency":
      return formatCurrency(value)
    case "percent":
      return formatPercent(value)
    default:
      return formatNumber(value)
  }
}
