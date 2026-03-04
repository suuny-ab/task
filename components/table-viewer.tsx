"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { TableDef, ColumnDef as TableColumnDef } from "@/lib/types"
import { ResultTable } from "@/components/result-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  FileSpreadsheet, 
  Table2, 
  CheckCircle2, 
  Info,
  Sparkles,
  GitBranch,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Search,
  Columns,
} from "lucide-react"

interface TableViewerProps {
  table: TableDef
  onDrillRow: (row: Record<string, unknown>) => void
  selectedRowId: string | null
}

export function TableViewer({ table, onDrillRow, selectedRowId }: TableViewerProps) {
  const [showColumnInfo, setShowColumnInfo] = useState(false)
  const [columnSearch, setColumnSearch] = useState("")
  const [showAllColumns, setShowAllColumns] = useState(false)
  
  const typeIcons = {
    base: FileSpreadsheet,
    intermediate: Table2,
    result: CheckCircle2,
  }
  const TypeIcon = typeIcons[table.type]
  
  const typeLabels = {
    base: "底表",
    intermediate: "中间表",
    result: "结论表",
  }

  const generatedColumns = table.columns.filter(c => c.isGenerated)

  // Filter columns by search
  const filteredColumns = useMemo(() => {
    if (!columnSearch.trim()) return generatedColumns
    const search = columnSearch.toLowerCase()
    return generatedColumns.filter(c => 
      c.label.toLowerCase().includes(search) || 
      c.key.toLowerCase().includes(search)
    )
  }, [generatedColumns, columnSearch])

  // Limit displayed columns unless "show all" is enabled
  const MAX_COLUMNS_PREVIEW = 12
  const displayedColumns = showAllColumns 
    ? filteredColumns 
    : filteredColumns.slice(0, MAX_COLUMNS_PREVIEW)
  const hasMoreColumns = filteredColumns.length > MAX_COLUMNS_PREVIEW && !showAllColumns

  // Format row count with proper units
  const formatRowCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)} 百万`
    } else if (count >= 10000) {
      return `${(count / 10000).toFixed(1)} 万`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)} 千`
    }
    return count.toString()
  }

  // Check if this is a large dataset
  const isLargeDataset = table.rowCount > 10000
  const displayedRows = table.data.length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex items-center justify-center h-10 w-10 rounded-lg",
            table.type === "result" ? "bg-primary/10" : "bg-accent"
          )}>
            <TypeIcon className={cn(
              "h-5 w-5",
              table.type === "result" ? "text-primary" : "text-accent-foreground"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{table.name}</h2>
              <Badge variant="secondary" className="text-xs">
                {typeLabels[table.type]}
              </Badge>
            </div>
            {table.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{table.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>共 {formatRowCount(table.rowCount)} 行</span>
              <span>{table.columns.length} 列</span>
              {generatedColumns.length > 0 && (
                <span className="text-primary">
                  {generatedColumns.length} 个新生成字段
                </span>
              )}
            </div>
            {isLargeDataset && displayedRows < table.rowCount && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-warning">
                <AlertTriangle className="h-3 w-3" />
                <span>当前展示 {displayedRows} 行样本数据，完整数据共 {formatRowCount(table.rowCount)} 行</span>
              </div>
            )}
          </div>
        </div>
        
        {generatedColumns.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowColumnInfo(!showColumnInfo)}
          >
            <Info className="h-3.5 w-3.5" />
            字段说明
            {showColumnInfo ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>

      {/* Column Info Panel (collapsible) */}
      {showColumnInfo && generatedColumns.length > 0 && (
        <div className="border-b border-border bg-muted/30 p-4">
          {/* Header with search */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">新生成字段说明</span>
              <Badge variant="secondary" className="text-xs">
                {generatedColumns.length} 个字段
              </Badge>
            </div>
            {generatedColumns.length > 6 && (
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="搜索字段..."
                  value={columnSearch}
                  onChange={(e) => setColumnSearch(e.target.value)}
                  className="h-8 pl-8 text-sm bg-background"
                />
              </div>
            )}
          </div>
          
          {/* Column grid with scroll */}
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",
            generatedColumns.length > 9 && "max-h-64 overflow-y-auto pr-2"
          )}>
            {displayedColumns.map((col) => (
              <ColumnInfoCard key={col.key} column={col} />
            ))}
          </div>
          
          {/* Show more button */}
          {hasMoreColumns && (
            <div className="mt-3 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => setShowAllColumns(true)}
              >
                <Columns className="h-3.5 w-3.5" />
                显示全部 {filteredColumns.length} 个字段
              </Button>
            </div>
          )}
          
          {/* No results */}
          {columnSearch && filteredColumns.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              未找到匹配的字段
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <ResultTable
          columns={table.columns}
          data={table.data}
          onDrillRow={onDrillRow}
          selectedRowId={selectedRowId}
        />
      </div>
    </div>
  )
}

function ColumnInfoCard({ column }: { column: TableColumnDef }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{column.label}</span>
        {column.drillable && (
          <Badge variant="default" className="text-xs gap-1">
            <Sparkles className="h-3 w-3" />
            可下钻
          </Badge>
        )}
      </div>
      
      {column.formulaDescription && (
        <p className="text-xs text-muted-foreground mb-2">{column.formulaDescription}</p>
      )}
      
      <div className="flex flex-wrap gap-1.5">
        {column.sourceColumns && column.sourceColumns.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GitBranch className="h-3 w-3" />
            <span>来源: {column.sourceColumns.join(", ")}</span>
          </div>
        )}
        {column.appliedRuleIds && column.appliedRuleIds.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-warning">
            <FileText className="h-3 w-3" />
            <span>{column.appliedRuleIds.length} 条规则</span>
          </div>
        )}
      </div>
    </div>
  )
}
