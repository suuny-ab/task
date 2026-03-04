"use client"

import { useState, useMemo } from "react"
import { Sparkles, ArrowUpDown, ArrowUp, ArrowDown, Table2, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { ColumnDef } from "@/lib/types"
import { formatCellValue } from "@/lib/format-utils"

// Pagination config
const ROWS_PER_PAGE = 50
const MAX_VISIBLE_COLUMNS = 10

interface ResultTableProps {
  columns: ColumnDef[]
  data: Record<string, unknown>[]
  onDrillRow: (row: Record<string, unknown>) => void
  selectedRowId: string | null
  showPagination?: boolean
}

export function ResultTable({ columns, data, onDrillRow, selectedRowId, showPagination = true }: ResultTableProps) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  // Determine if we have many columns
  const hasManyCols = columns.length > MAX_VISIBLE_COLUMNS
  
  // Determine if we need pagination
  const totalRows = data.length
  const needsPagination = showPagination && totalRows > ROWS_PER_PAGE
  const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE)

  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(key)
      setSortDirection(key === "rank" ? "asc" : "desc")
    }
  }

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (!sortField) return 0
      const av = a[sortField]
      const bv = b[sortField]
      if (av == null || bv == null) return 0
      const mul = sortDirection === "asc" ? 1 : -1
      if (typeof av === "number" && typeof bv === "number") return mul * (av - bv)
      return mul * String(av).localeCompare(String(bv))
    })
    return sorted
  }, [data, sortField, sortDirection])

  // Apply pagination
  const paginatedData = needsPagination
    ? sortedData.slice(currentPage * ROWS_PER_PAGE, (currentPage + 1) * ROWS_PER_PAGE)
    : sortedData

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    )
  }

  // Find the drillable column
  const drillableCol = columns.find((c) => c.drillable)

  // Handle empty data
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Table2 className="h-8 w-8 mb-4 opacity-50" />
        <p className="text-sm">暂无数据</p>
        <p className="text-xs mt-1">表格数据尚未加载，请检查数据源</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col">
      {/* Table with horizontal scroll for many columns */}
      <div className={cn(
        "overflow-x-auto",
        hasManyCols && "border border-border rounded-lg"
      )}>
      <Table className={cn(hasManyCols && "min-w-max")}>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={col.align === "right" ? "text-right" : ""}
              >
                {col.sortable ? (
                  <button
                    className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                      col.align === "right" ? "ml-auto" : ""
                    }`}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label} <SortIcon field={col.key} />
                  </button>
                ) : (
                  <span className={col.align === "right" ? "block text-right" : ""}>
                    {col.label}
                  </span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row) => {
            const rowId = String(row.id ?? "")
            const isSelected = selectedRowId === rowId
            return (
              <TableRow
                key={rowId}
                className={`border-border transition-colors ${
                  isSelected ? "bg-primary/5" : ""
                }`}
              >
                {columns.map((col) => {
                  const val = row[col.key]
                  const isDrillable = col.drillable
                  const isRank = col.key === "rank"

                  return (
                    <TableCell
                      key={col.key}
                      className={`${col.align === "right" ? "text-right" : ""} ${
                        isRank
                          ? "font-mono text-muted-foreground text-xs"
                          : col.type === "text"
                            ? col.key === "name"
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                            : col.type === "percent"
                              ? "font-mono text-muted-foreground"
                              : "font-mono text-foreground"
                      }`}
                    >
                      {isDrillable ? (
                        <div
                          className="relative inline-flex items-center gap-1.5"
                          onMouseEnter={() =>
                            setHoveredCell({ row: rowId, col: col.key })
                          }
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <span
                            className={`font-mono font-semibold transition-colors ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {formatCellValue(val, col.type)}
                          </span>
                          {(hoveredCell?.row === rowId || isSelected) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-6 w-6 rounded-full transition-all ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                      : "bg-primary/10 text-primary hover:bg-primary/20"
                                  }`}
                                  onClick={() => onDrillRow(row)}
                                >
                                  <Sparkles className="h-3 w-3" />
                                  <span className="sr-only">
                                    AI 分析 {row.name ? String(row.name) : ""} 的 {drillableCol?.label ?? "数据"}
                                  </span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>AI 解读此数据</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : isRank ? (
                        `#${val}`
                      ) : (
                        formatCellValue(val, col.type)
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>
      
      {/* Pagination controls */}
      {needsPagination && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-sm text-muted-foreground">
            显示 {currentPage * ROWS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ROWS_PER_PAGE, totalRows)} 行，共 {totalRows} 行
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">上一页</span>
            </Button>
            <span className="text-sm text-muted-foreground min-w-[80px] text-center">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">下一页</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Column count hint */}
      {hasManyCols && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          共 {columns.length} 列，可横向滚动查看更多
        </div>
      )}
    </div>
  )
}
