"use client"

import { useState, useCallback, useMemo } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { ProjectPhase, DrilldownNode, AIMessage, UserResponseType } from "@/lib/types"
import { scenarios, getDrilldownNode } from "@/lib/scenario-data"
import { AppHeader } from "@/components/app-header"
import { DataAssetsPanel } from "@/components/data-assets-panel"
import { WorkflowCanvas } from "@/components/workflow-canvas"
import { TableViewer } from "@/components/table-viewer"
import { AIConversation } from "@/components/ai-conversation"
import { AIDrilldownPanel } from "@/components/ai-drilldown-panel"
import { BuilderWizard } from "@/components/builder-wizard"

export default function Home() {
  // Show new project wizard
  const [showNewProjectWizard, setShowNewProjectWizard] = useState(false)

  // Current scenario / project
  const [currentScenarioId, setCurrentScenarioId] = useState(scenarios[0].id)
  const currentScenario = useMemo(
    () => scenarios.find((s) => s.id === currentScenarioId) ?? scenarios[0],
    [currentScenarioId]
  )
  const project = currentScenario.project

  // Mode (building / reading)
  const [mode, setMode] = useState<ProjectPhase>(project.phase)

  // Selected table
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    project.resultTable?.id ?? null
  )

  // Selected row for drilldown
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [drilldownNode, setDrilldownNode] = useState<DrilldownNode | null>(null)

  // AI conversation messages (for building mode)
  const [aiMessages, setAiMessages] = useState<AIMessage[]>(() => {
    // Generate initial messages from completed build steps
    const msgs: AIMessage[] = []
    project.buildPlan.forEach((step) => {
      if (step.status === "done" && step.aiSuggestion) {
        msgs.push({
          id: `msg-${step.id}`,
          role: "ai",
          content: step.aiSuggestion,
          timestamp: new Date().toISOString(),
          stepId: step.id,
          userResponse: step.userDecision as UserResponseType | undefined,
        })
      }
    })
    return msgs
  })

  // Get current step for building mode
  const currentBuildStep = useMemo(
    () => project.buildPlan.find((s) => s.status === "current") ?? null,
    [project.buildPlan]
  )

  // Get selected table
  const selectedTable = useMemo(() => {
    if (!selectedTableId) return project.resultTable
    if (project.baseTable?.id === selectedTableId) return project.baseTable
    if (project.resultTable?.id === selectedTableId) return project.resultTable
    return project.intermediateTables.find((t) => t.id === selectedTableId) ?? project.resultTable
  }, [selectedTableId, project])

  // Handle new project
  const handleNewProject = useCallback(() => {
    setShowNewProjectWizard(true)
    setMode("building") // Auto switch to building mode
  }, [])

  // Handle wizard complete
  const handleWizardComplete = useCallback(() => {
    setShowNewProjectWizard(false)
    // In production, this would add the new project to scenarios
    // For now, just close the wizard
  }, [])

  // Handle wizard cancel
  const handleWizardCancel = useCallback(() => {
    setShowNewProjectWizard(false)
  }, [])

  // Handle scenario change
  const handleScenarioChange = useCallback((id: string) => {
    setCurrentScenarioId(id)
    const newScenario = scenarios.find((s) => s.id === id)
    if (newScenario) {
      setMode(newScenario.project.phase)
      setSelectedTableId(newScenario.project.resultTable?.id ?? null)
      setSelectedRowId(null)
      setDrilldownNode(null)
      // Reset AI messages for new scenario
      const msgs: AIMessage[] = []
      newScenario.project.buildPlan.forEach((step) => {
        if (step.status === "done" && step.aiSuggestion) {
          msgs.push({
            id: `msg-${step.id}`,
            role: "ai",
            content: step.aiSuggestion,
            timestamp: new Date().toISOString(),
            stepId: step.id,
            userResponse: step.userDecision as UserResponseType | undefined,
          })
        }
      })
      setAiMessages(msgs)
    }
  }, [])

  // Handle mode change
  const handleModeChange = useCallback((newMode: ProjectPhase) => {
    setMode(newMode)
    if (newMode === "reading") {
      // Switch to result table when entering reading mode
      const resultId = scenarios.find(s => s.id === currentScenarioId)?.project.resultTable?.id ?? null
      setSelectedTableId(resultId)
    }
  }, [currentScenarioId])

  // Handle table selection
  const handleSelectTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId)
    setSelectedRowId(null)
    setDrilldownNode(null)
  }, [])

  // Handle rule doc selection
  const handleSelectRuleDoc = useCallback((docId: string) => {
    // Could open a rule viewer modal in production
  }, [])

  // Handle drill row click
  const handleDrillRow = useCallback((row: Record<string, unknown>) => {
    const rowId = String(row.id ?? "")
    setSelectedRowId(rowId)
    const node = getDrilldownNode(currentScenario, rowId, row)
    setDrilldownNode(node)
  }, [currentScenario])

  // Handle close drilldown panel
  const handleCloseDrilldown = useCallback(() => {
    setSelectedRowId(null)
    setDrilldownNode(null)
  }, [])

  // Handle adjust rule (returns to building mode)
  const handleAdjustRule = useCallback((_ruleId?: string) => {
    setMode("building")
  }, [])

  // Handle user response in AI conversation
  const handleUserResponse = useCallback((_response: UserResponseType, _adjustedContent?: string) => {
    // In production, this would update the build step state
  }, [])

  // Handle send message in AI conversation
  const handleSendMessage = useCallback((content: string) => {
    const newMsg: AIMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }
    setAiMessages((prev) => [...prev, newMsg])
    
    // Simulate AI response
    setTimeout(() => {
      const aiReply: AIMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "ai",
        content: "收到您的消息。在实际应用中，我会根据您的输入来调整构建逻辑或回答问题。",
        timestamp: new Date().toISOString(),
      }
      setAiMessages((prev) => [...prev, aiReply])
    }, 1000)
  }, [])

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <AppHeader
          currentProject={project}
          mode={mode}
          onModeChange={handleModeChange}
          scenarios={scenarios.map((s) => ({ id: s.id, name: s.name, icon: s.icon }))}
          currentScenarioId={currentScenarioId}
          onScenarioChange={handleScenarioChange}
          onNewProject={handleNewProject}
          isNewProjectWizard={showNewProjectWizard}
        />

        {/* Main content - three column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Data Assets (hidden during new project wizard) */}
          {!showNewProjectWizard && (
            <div className="w-64 flex-shrink-0">
              <DataAssetsPanel
                project={project}
                selectedTableId={selectedTableId}
                onSelectTable={handleSelectTable}
                onSelectRuleDoc={handleSelectRuleDoc}
                mode={mode}
              />
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {showNewProjectWizard ? (
              <BuilderWizard
                onComplete={handleWizardComplete}
                onCancel={handleWizardCancel}
              />
            ) : mode === "building" ? (
              <WorkflowCanvas
                project={project}
                onStepClick={() => {}}
              />
            ) : selectedTable ? (
              <TableViewer
                table={selectedTable}
                onDrillRow={handleDrillRow}
                selectedRowId={selectedRowId}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                请选择要查看的数据表
              </div>
            )}
          </div>

          {/* Right sidebar - AI panel (hidden during new project wizard) */}
          {!showNewProjectWizard && (
            <div className="w-80 flex-shrink-0">
              {mode === "building" ? (
                <AIConversation
                  currentStep={currentBuildStep}
                  messages={aiMessages}
                  onUserResponse={handleUserResponse}
                  onSendMessage={handleSendMessage}
                />
              ) : drilldownNode ? (
                <AIDrilldownPanel
                  rootNode={drilldownNode}
                  onClose={handleCloseDrilldown}
                  onAdjustRule={handleAdjustRule}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-card border-l border-border p-6 text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">AI 数据解读</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    点击表格中带有 AI 标记的字段，
                    <br />
                    即可开启智能下钻解读
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
