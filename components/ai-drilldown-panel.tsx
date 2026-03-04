"use client"

import { useState, useEffect, useCallback } from "react"
import {
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ArrowLeft,
  User,
  Building2,
  Package,
  Video,
  Tv,
  ShoppingBag,
  Warehouse,
  Store,
  FileText,
  GitBranch,
  BookOpen,
  ArrowRight,
  Database,
  Settings2,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { DrilldownNode, Rule, DataLineage } from "@/lib/types"
import { formatFieldValue } from "@/lib/format-utils"

// Icon resolver
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Building2,
  Package,
  Video,
  Tv,
  ShoppingBag,
  Warehouse,
  Store,
  FileText,
  Truck,
}

function getIcon(name: string, className: string = "h-3.5 w-3.5") {
  const Icon = iconMap[name]
  return Icon ? <Icon className={className} /> : <Package className={className} />
}

// ===== Sub-components =====

function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />}
    </span>
  )
}

function AnalysisLoading() {
  return (
    <div className="flex items-center gap-3 py-6">
      <div className="relative flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <Sparkles className="absolute h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-foreground font-medium">AI 正在分析数据...</span>
        <span className="text-xs text-muted-foreground">正在从底表逐层拆解计算逻辑</span>
      </div>
    </div>
  )
}

// ===== Lineage Visualization =====

function LineageView({ lineage }: { lineage: DataLineage }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Source columns */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">数据来源</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {lineage.sourceColumns.map((col, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <Database className="h-3.5 w-3.5 text-primary" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">{col.tableName}</span>
                <span className="text-xs text-muted-foreground mx-1">.</span>
                <span className="text-sm text-foreground font-medium">{col.columnLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transformations */}
      {lineage.transformations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">计算步骤</span>
          </div>
          <div className="flex flex-col gap-1.5 relative">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />
            
            {lineage.transformations.map((trans, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-full bg-accent border-2 border-border flex items-center justify-center z-10 flex-shrink-0">
                  <span className="text-xs font-medium text-accent-foreground">{i + 1}</span>
                </div>
                <div className="flex-1 py-1">
                  <span className="text-sm text-foreground font-medium">{trans.stepTitle}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{trans.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ===== Rules Display =====

function RulesView({ rules, onAdjustRule }: { rules: Rule[]; onAdjustRule?: (ruleId: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">应用的规则</span>
      </div>
      
      {rules.map((rule) => (
        <div key={rule.id} className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Rule header */}
          <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-warning" />
              <span className="text-sm font-medium text-foreground">{rule.name}</span>
            </div>
            {onAdjustRule && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1 text-muted-foreground hover:text-primary"
                onClick={() => onAdjustRule(rule.id)}
              >
                <Settings2 className="h-3 w-3" />
                调整规则
              </Button>
            )}
          </div>
          
          {/* Rule content */}
          <div className="p-3 space-y-2">
            <p className="text-sm text-muted-foreground">{rule.description}</p>
            
            {rule.formula && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-primary/5 border border-primary/20">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-mono text-primary">{rule.formula}</span>
              </div>
            )}
            
            {rule.conditions && (
              <div className="text-xs text-muted-foreground bg-secondary/50 rounded px-2 py-1.5">
                <span className="text-foreground font-medium">条件: </span>
                {rule.conditions}
              </div>
            )}
            
            {/* Source text quote */}
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground italic leading-relaxed">
                  "{rule.sourceText}"
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ===== Recursive DrilldownNodeView =====

function DrilldownNodeView({
  node,
  onDrillChild,
  onAdjustRule,
  depth,
}: {
  node: DrilldownNode
  onDrillChild: (child: DrilldownNode) => void
  onAdjustRule?: (ruleId: string) => void
  depth: number
}) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("analysis")

  useEffect(() => {
    setLoading(true)
    const delay = Math.max(600, 1200 - depth * 200)
    const timer = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(timer)
  }, [node.id, depth])

  if (loading) return <AnalysisLoading />

  const hasChildren = node.children && node.children.length > 0
  const isLeaf = !hasChildren
  const hasLineage = !!node.lineage
  const hasRules = node.appliedRules && node.appliedRules.length > 0

  // Show tabs if we have lineage or rules info
  const showTabs = hasLineage || hasRules
  const tabCount = 1 + (hasLineage ? 1 : 0) + (hasRules ? 1 : 0)
  const gridCols = tabCount === 3 ? "grid-cols-3" : tabCount === 2 ? "grid-cols-2" : "grid-cols-1"

  return (
    <div className="flex flex-col gap-4">
      {showTabs ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${gridCols} h-9`}>
            <TabsTrigger value="analysis" className="text-xs gap-1.5">
              <Sparkles className="h-3 w-3" />
              AI 解读
            </TabsTrigger>
            {hasLineage && (
              <TabsTrigger value="lineage" className="text-xs gap-1.5">
                <GitBranch className="h-3 w-3" />
                计算来源
              </TabsTrigger>
            )}
            {hasRules && (
              <TabsTrigger value="rules" className="text-xs gap-1.5">
                <BookOpen className="h-3 w-3" />
                规则依据
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="analysis" className="mt-4">
            <AnalysisContent 
              node={node} 
              onDrillChild={onDrillChild} 
              isLeaf={isLeaf} 
              hasChildren={hasChildren} 
            />
          </TabsContent>
          
          {hasLineage && (
            <TabsContent value="lineage" className="mt-4">
              <LineageView lineage={node.lineage!} />
            </TabsContent>
          )}
          
          {hasRules && (
            <TabsContent value="rules" className="mt-4">
              <RulesView rules={node.appliedRules!} onAdjustRule={onAdjustRule} />
            </TabsContent>
          )}
        </Tabs>
      ) : (
        <AnalysisContent 
          node={node} 
          onDrillChild={onDrillChild} 
          isLeaf={isLeaf} 
          hasChildren={hasChildren} 
        />
      )}
    </div>
  )
}

function AnalysisContent({
  node,
  onDrillChild,
  isLeaf,
  hasChildren,
}: {
  node: DrilldownNode
  onDrillChild: (child: DrilldownNode) => void
  isLeaf: boolean
  hasChildren: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* AI Summary */}
      <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed text-foreground">
          <TypewriterText text={node.aiSummary} />
        </p>
      </div>

      {/* Children list (if any) */}
      {hasChildren && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            {node.children![0] && getIcon(node.children![0].levelIcon, "h-3.5 w-3.5 text-muted-foreground")}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {node.childrenLabel ?? `${node.children![0]?.levelLabel ?? ""}明细`}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {node.children!.map((child, index) => (
              <div
                key={child.id}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors bg-secondary/30"
                onClick={() => onDrillChild(child)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onDrillChild(child)}
              >
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground truncate">{child.label}</span>
                    {/* Show the highlighted value if exists */}
                    {child.values.find((v) => v.highlight) && (
                      <span className="text-sm font-mono font-medium text-primary shrink-0">
                        {formatFieldValue(child.values.find((v) => v.highlight)!)}
                      </span>
                    )}
                  </div>
                  {/* Show a few non-highlighted values as subtitle */}
                  <div className="flex items-center gap-3 mt-0.5">
                    {child.values
                      .filter((v) => !v.highlight)
                      .slice(0, 3)
                      .map((v) => (
                        <span key={v.key} className="text-xs text-muted-foreground">
                          {v.label} {formatFieldValue(v)}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Sparkles className="h-3 w-3" />
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formula display (leaf nodes) */}
      {isLeaf && node.formula && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">计算公式</span>
          </div>
          <div className="text-center py-3">
            <span className="font-mono text-base text-primary font-medium">{node.formula}</span>
          </div>
          {node.formulaLabel && (
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
              <span>{node.formulaLabel}</span>
            </div>
          )}
        </div>
      )}

      {/* Key-value data fields */}
      <div className="flex flex-col gap-1.5 mt-1">
        {node.values.map((field) => (
          <div
            key={field.key}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
              field.highlight
                ? "bg-primary/5 border border-primary/20"
                : "bg-secondary/50"
            }`}
          >
            <span className="text-sm text-muted-foreground">{field.label}</span>
            <span
              className={`text-sm font-mono font-medium ${
                field.highlight ? "text-primary" : "text-foreground"
              }`}
            >
              {formatFieldValue(field)}
            </span>
          </div>
        ))}
      </div>

      {/* Leaf node hint */}
      {isLeaf && (
        <div className="rounded-lg bg-secondary/50 px-3 py-2.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            已到达最底层数据。如需更细粒度的分析，可联系数据管理员导入更详细的底表。
          </p>
        </div>
      )}
    </div>
  )
}

// ===== Main Panel =====

interface AIDrilldownPanelProps {
  rootNode: DrilldownNode
  onClose: () => void
  onAdjustRule?: (ruleId: string) => void
}

export function AIDrilldownPanel({ rootNode, onClose, onAdjustRule }: AIDrilldownPanelProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<DrilldownNode[]>([rootNode])

  // Reset breadcrumbs when rootNode changes
  useEffect(() => {
    setBreadcrumbs([rootNode])
  }, [rootNode])

  const currentNode = breadcrumbs[breadcrumbs.length - 1]

  const handleDrillChild = useCallback((child: DrilldownNode) => {
    setBreadcrumbs((prev) => [...prev, child])
  }, [])

  const handleGoBack = useCallback(() => {
    if (breadcrumbs.length <= 1) return
    setBreadcrumbs((prev) => prev.slice(0, -1))
  }, [breadcrumbs.length])

  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1))
  }, [])

  const depth = breadcrumbs.length - 1

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">AI 数据解读</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">关闭分析面板</span>
        </Button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 border-b border-border px-4 py-2 overflow-x-auto">
        {breadcrumbs.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="sr-only">返回上一级</span>
          </Button>
        )}
        {breadcrumbs.map((crumb, i) => (
          <div key={`${crumb.id}-${i}`} className="flex items-center gap-1 shrink-0">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            <Badge
              variant={i === breadcrumbs.length - 1 ? "default" : "secondary"}
              className={`text-xs ${
                i < breadcrumbs.length - 1 ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={() => i < breadcrumbs.length - 1 && handleBreadcrumbClick(i)}
            >
              {crumb.label}
            </Badge>
          </div>
        ))}
      </div>

      {/* Level indicator */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        {getIcon(currentNode.levelIcon, "h-3.5 w-3.5 text-primary")}
        <span className="text-xs text-muted-foreground">
          {currentNode.levelLabel}
        </span>
        <span className="text-xs text-muted-foreground">
          {"·"}
        </span>
        <span className="text-xs text-foreground font-medium">
          {currentNode.label}
        </span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <DrilldownNodeView
            key={currentNode.id}
            node={currentNode}
            onDrillChild={handleDrillChild}
            onAdjustRule={onAdjustRule}
            depth={depth}
          />
        </div>
      </ScrollArea>
    </div>
  )
}
