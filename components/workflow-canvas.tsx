"use client"

import { cn } from "@/lib/utils"
import type { BuildStep, Project, TableDef } from "@/lib/types"
import { 
  Upload, 
  Brain, 
  Target, 
  FileText, 
  Table2, 
  GitBranch, 
  Play,
  Check,
  Circle,
  AlertCircle,
  ChevronRight,
  FileSpreadsheet,
  ArrowRight
} from "lucide-react"

const stepIcons: Record<BuildStep["type"], typeof Upload> = {
  import: Upload,
  recognize: Brain,
  goal: Target,
  rules: FileText,
  define_result: Table2,
  generate_plan: GitBranch,
  execute: Play,
}

interface WorkflowCanvasProps {
  project: Project
  onStepClick?: (stepId: string) => void
}

export function WorkflowCanvas({ project, onStepClick }: WorkflowCanvasProps) {
  const { buildPlan, baseTable, intermediateTables, resultTable } = project

  return (
    <div className="flex flex-col gap-8 p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">构建流程</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI 引导的数据分析构建过程
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>已完成 {buildPlan.filter(s => s.status === "done").length} / {buildPlan.length} 步</span>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex flex-col gap-3">
        {buildPlan.map((step, index) => {
          const Icon = stepIcons[step.type]
          const isLast = index === buildPlan.length - 1
          
          return (
            <div key={step.id} className="flex items-start gap-4">
              {/* Status indicator and connector line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    step.status === "done" && "bg-success/20 border-success text-success",
                    step.status === "current" && "bg-primary/20 border-primary text-primary animate-pulse",
                    step.status === "pending" && "bg-muted border-border text-muted-foreground",
                    step.status === "error" && "bg-destructive/20 border-destructive text-destructive"
                  )}
                >
                  {step.status === "done" ? (
                    <Check className="w-5 h-5" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : step.status === "current" ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                {!isLast && (
                  <div 
                    className={cn(
                      "w-0.5 h-8 mt-2",
                      step.status === "done" ? "bg-success/50" : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div 
                className={cn(
                  "flex-1 p-4 rounded-lg border transition-all cursor-pointer",
                  step.status === "done" && "bg-card border-border hover:border-success/50",
                  step.status === "current" && "bg-primary/5 border-primary shadow-sm shadow-primary/10",
                  step.status === "pending" && "bg-muted/30 border-border/50 opacity-60",
                  step.status === "error" && "bg-destructive/5 border-destructive/50"
                )}
                onClick={() => onStepClick?.(step.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        步骤 {step.order}
                      </span>
                      <span className="text-foreground font-medium">{step.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {step.description}
                    </p>
                    
                    {/* AI Suggestion preview */}
                    {step.aiSuggestion && step.status === "done" && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border/50">
                        <div className="flex items-center gap-2 text-xs text-primary mb-1">
                          <Brain className="w-3.5 h-3.5" />
                          <span>AI 建议</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {step.aiSuggestion}
                        </p>
                      </div>
                    )}

                    {/* User decision badge */}
                    {step.userDecision && (
                      <div className="mt-2 flex items-center gap-2">
                        <span 
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            step.userDecision === "accepted" && "bg-success/20 text-success",
                            step.userDecision === "adjusted" && "bg-warning/20 text-warning",
                            step.userDecision === "rejected" && "bg-destructive/20 text-destructive"
                          )}
                        >
                          {step.userDecision === "accepted" ? "已确认" : step.userDecision === "adjusted" ? "已调整" : "已拒绝"}
                        </span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Data Flow Visualization */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">数据流向</h3>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {/* Base Table */}
          {baseTable && (
            <TableNode table={baseTable} />
          )}
          
          {/* Arrow */}
          {baseTable && (intermediateTables.length > 0 || resultTable) && (
            <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
          
          {/* Intermediate Tables */}
          {intermediateTables.map((table, i) => (
            <div key={table.id} className="flex items-center gap-3">
              <TableNode table={table} />
              {(i < intermediateTables.length - 1 || resultTable) && (
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
          
          {/* Result Table */}
          {resultTable && (
            <TableNode table={resultTable} isResult />
          )}
        </div>
      </div>
    </div>
  )
}

function TableNode({ table, isResult }: { table: TableDef; isResult?: boolean }) {
  const Icon = table.type === "base" ? FileSpreadsheet : Table2
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border flex-shrink-0",
        isResult 
          ? "bg-primary/10 border-primary/50 text-primary" 
          : table.type === "intermediate"
          ? "bg-accent border-border text-accent-foreground"
          : "bg-card border-border text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      <div>
        <div className="text-sm font-medium">{table.name}</div>
        <div className="text-xs text-muted-foreground">{table.rowCount} 行</div>
      </div>
    </div>
  )
}
