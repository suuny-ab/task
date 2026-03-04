"use client"

import { cn } from "@/lib/utils"
import type { Project, TableDef, RuleDocument } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileSpreadsheet, 
  Table2, 
  FileText, 
  ChevronRight,
  ChevronDown,
  Plus,
  Upload,
  Layers,
  CheckCircle2,
  Clock
} from "lucide-react"
import { useState } from "react"

interface DataAssetsPanelProps {
  project: Project
  selectedTableId: string | null
  onSelectTable: (tableId: string) => void
  onSelectRuleDoc: (docId: string) => void
  mode: "building" | "reading"
}

export function DataAssetsPanel({
  project,
  selectedTableId,
  onSelectTable,
  onSelectRuleDoc,
  mode,
}: DataAssetsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["tables", "rules"])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const allTables = [
    project.baseTable,
    ...project.intermediateTables,
    project.resultTable,
  ].filter((t): t is TableDef => t !== null)

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-sidebar-foreground">数据资产</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{project.name}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Tables Section */}
          <SectionHeader
            title="数据表"
            icon={<Layers className="w-4 h-4" />}
            count={allTables.length}
            isExpanded={expandedSections.includes("tables")}
            onToggle={() => toggleSection("tables")}
          />
          
          {expandedSections.includes("tables") && (
            <div className="mt-1 space-y-0.5">
              {allTables.map((table) => (
                <TableItem
                  key={table.id}
                  table={table}
                  isSelected={selectedTableId === table.id}
                  onClick={() => onSelectTable(table.id)}
                />
              ))}
              
              {mode === "building" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground h-8 px-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs">导入新表</span>
                </Button>
              )}
            </div>
          )}

          {/* Rules Section */}
          <div className="mt-4">
            <SectionHeader
              title="规则文档"
              icon={<FileText className="w-4 h-4" />}
              count={project.ruleDocuments.length}
              isExpanded={expandedSections.includes("rules")}
              onToggle={() => toggleSection("rules")}
            />
            
            {expandedSections.includes("rules") && (
              <div className="mt-1 space-y-0.5">
                {project.ruleDocuments.map((doc) => (
                  <RuleDocItem
                    key={doc.id}
                    doc={doc}
                    onClick={() => onSelectRuleDoc(doc.id)}
                  />
                ))}
                
                {mode === "building" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground h-8 px-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-xs">上传规则文档</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Analysis Goal */}
          {project.analysisGoal && (
            <div className="mt-4">
              <SectionHeader
                title="分析目标"
                icon={<CheckCircle2 className="w-4 h-4" />}
                isExpanded={expandedSections.includes("goal")}
                onToggle={() => toggleSection("goal")}
              />
              
              {expandedSections.includes("goal") && (
                <div className="mt-1 p-3 rounded-md bg-sidebar-accent/50 border border-sidebar-border">
                  <p className="text-xs text-sidebar-foreground leading-relaxed">
                    {project.analysisGoal.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.analysisGoal.targetMetrics.map((metric, i) => (
                      <span 
                        key={i}
                        className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Build Progress */}
      {mode === "building" && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">构建进度</span>
            <span className="text-sidebar-foreground font-medium">
              {project.buildPlan.filter(s => s.status === "done").length} / {project.buildPlan.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-sidebar-accent rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ 
                width: `${(project.buildPlan.filter(s => s.status === "done").length / project.buildPlan.length) * 100}%` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function SectionHeader({
  title,
  icon,
  count,
  isExpanded,
  onToggle,
}: {
  title: string
  icon: React.ReactNode
  count?: number
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
    >
      <div className="flex items-center gap-2 text-sidebar-foreground">
        {icon}
        <span className="text-xs font-medium">{title}</span>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground">({count})</span>
        )}
      </div>
      {isExpanded ? (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  )
}

function TableItem({
  table,
  isSelected,
  onClick,
}: {
  table: TableDef
  isSelected: boolean
  onClick: () => void
}) {
  const typeIcons = {
    base: FileSpreadsheet,
    intermediate: Table2,
    result: CheckCircle2,
  }
  const Icon = typeIcons[table.type]
  
  const typeLabels = {
    base: "底表",
    intermediate: "中间表",
    result: "结论表",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full px-2 py-2 rounded-md text-left transition-colors",
        isSelected 
          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
          : "hover:bg-sidebar-accent text-sidebar-foreground"
      )}
    >
      <Icon className={cn(
        "w-4 h-4 flex-shrink-0",
        table.type === "result" && !isSelected && "text-primary"
      )} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{table.name}</div>
        <div className={cn(
          "text-xs",
          isSelected ? "text-sidebar-primary-foreground/70" : "text-muted-foreground"
        )}>
          {typeLabels[table.type]} · {table.rowCount} 行
        </div>
      </div>
    </button>
  )
}

function RuleDocItem({
  doc,
  onClick,
}: {
  doc: RuleDocument
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-left hover:bg-sidebar-accent transition-colors"
    >
      <FileText className="w-4 h-4 flex-shrink-0 text-warning" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate text-sidebar-foreground">{doc.name}</div>
        <div className="text-xs text-muted-foreground">
          {doc.extractedRules.length} 条规则
        </div>
      </div>
    </button>
  )
}
