"use client"

import { cn } from "@/lib/utils"
import type { Project, ProjectPhase } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Sparkles, 
  Hammer, 
  BookOpen,
  Settings,
  Plus,
} from "lucide-react"

interface AppHeaderProps {
  currentProject: Project | null
  mode: ProjectPhase
  onModeChange: (mode: ProjectPhase) => void
  scenarios: { id: string; name: string; icon: string }[]
  currentScenarioId: string
  onScenarioChange: (id: string) => void
  onNewProject?: () => void
  isNewProjectWizard?: boolean
}

export function AppHeader({
  currentProject,
  mode,
  onModeChange,
  scenarios,
  currentScenarioId,
  onScenarioChange,
  onNewProject,
  isNewProjectWizard = false,
}: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
      {/* Left: Logo and Project Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">DataLens AI</span>
        </div>
        
        <div className="h-6 w-px bg-border" />
        
        {/* Project/Scenario Selector */}
        <div className="flex items-center gap-2">
          <Select value={currentScenarioId} onValueChange={onScenarioChange}>
            <SelectTrigger className="w-[200px] h-9 bg-secondary/50 border-border">
              <SelectValue placeholder="选择项目" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => onNewProject?.()}
          >
            <Plus className="h-4 w-4" />
            新建项目
          </Button>
        </div>
      </div>

      {/* Center: Mode Toggle or New Project Indicator */}
      {isNewProjectWizard ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Hammer className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">新建项目</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50">
          <Button
            variant={mode === "building" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-1.5 h-8",
              mode === "building" ? "" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onModeChange("building")}
          >
            <Hammer className="h-4 w-4" />
            构建模式
          </Button>
          <Button
            variant={mode === "reading" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-1.5 h-8",
              mode === "reading" ? "" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onModeChange("reading")}
          >
            <BookOpen className="h-4 w-4" />
            解读模式
          </Button>
        </div>
      )}

      {/* Right: Status and Settings */}
      <div className="flex items-center gap-3">
        {currentProject && !isNewProjectWizard && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {mode === "building" ? "构建进度" : "数据状态"}:
            </span>
            {mode === "building" ? (
              <span className="text-foreground font-medium">
                {currentProject.buildPlan.filter(s => s.status === "done").length} / {currentProject.buildPlan.length} 步
              </span>
            ) : (
              <span className="text-success font-medium">已就绪</span>
            )}
          </div>
        )}
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">设置</span>
        </Button>
      </div>
    </header>
  )
}
