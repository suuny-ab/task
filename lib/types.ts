// ===== DataLens AI - Complete Type System =====

// ===== Project / Workspace =====

export type ProjectPhase = "building" | "reading"
export type BuildStepStatus = "pending" | "current" | "done" | "error"

export interface Project {
  id: string
  name: string
  description: string
  phase: ProjectPhase
  currentBuildStep: number
  baseTable: TableDef | null
  intermediateTables: TableDef[]
  resultTable: TableDef | null
  ruleDocuments: RuleDocument[]
  analysisGoal: AnalysisGoal | null
  buildPlan: BuildStep[]
  createdAt: string
  updatedAt: string
}

// ===== Table Definitions =====

export type TableType = "base" | "intermediate" | "result"
export type ColumnDataType = "text" | "number" | "percent" | "currency" | "date"

export interface TableDef {
  id: string
  name: string
  type: TableType
  description?: string
  columns: ColumnDef[]
  data: Record<string, unknown>[]
  sourceStepId?: string // which build step produced this table
  rowCount: number
}

export interface ColumnDef {
  key: string
  label: string
  type: ColumnDataType
  sortable?: boolean
  drillable?: boolean // show AI drilldown button on this column
  align?: "left" | "right"
  isGenerated?: boolean // whether this is a newly generated field (not in base table)
  sourceColumns?: string[] // source columns for calculation
  appliedRuleIds?: string[] // IDs of rules used in calculation
  formula?: string // calculation formula
  formulaDescription?: string // human-readable formula description
}

// ===== Rule System =====

export interface RuleDocument {
  id: string
  name: string
  fileName: string
  content: string
  uploadedAt: string
  extractedRules: Rule[]
}

export interface Rule {
  id: string
  name: string
  description: string
  affectedColumns: string[] // columns this rule affects
  formula?: string
  conditions?: string
  sourceDocId: string
  sourceText: string // original text quote from document
  matchedBaseColumns: string[] // matched columns from base table
}

// ===== Analysis Goal =====

export interface AnalysisGoal {
  description: string // user's natural language description
  entities: string[] // AI-identified key entities
  targetMetrics: string[] // target metrics to compute
  confirmed: boolean
}

// ===== Build Process =====

export interface BuildStep {
  id: string
  order: number
  type: "import" | "recognize" | "goal" | "rules" | "define_result" | "generate_plan" | "execute"
  title: string
  description: string
  status: BuildStepStatus
  inputTableIds: string[]
  outputTableId?: string
  appliedRuleIds: string[]
  aiSuggestion?: string
  userDecision?: "accepted" | "adjusted" | "rejected"
  adjustedContent?: string
}

// ===== Drilldown & Lineage =====

export interface DataLineage {
  sourceColumns: { tableId: string; tableName: string; columnKey: string; columnLabel: string }[]
  transformations: { stepId: string; stepTitle: string; description: string }[]
}

export interface DrilldownNode {
  id: string
  label: string
  levelLabel: string // e.g. "销售", "客户", "仓库"
  levelIcon: string // lucide icon name
  values: DrilldownField[] // key-value pairs to display
  aiSummary: string // AI-generated explanation
  formula?: string // leaf calculation formula
  formulaLabel?: string // formula description
  childrenLabel?: string // label for the children section
  children?: DrilldownNode[]
  // Enhanced fields for lineage and rules
  lineage?: DataLineage
  appliedRules?: Rule[]
}

export interface DrilldownField {
  key: string
  label: string
  value: string | number
  format: "text" | "number" | "currency" | "percent" | "coefficient"
  highlight?: boolean
  drillable?: boolean
}

// ===== AI Conversation =====

export type AIMessageRole = "ai" | "user" | "system"
export type UserResponseType = "accept" | "adjust" | "reject"

export interface AIMessage {
  id: string
  role: AIMessageRole
  content: string
  timestamp: string
  stepId?: string // related build step
  suggestions?: AISuggestion[]
  userResponse?: UserResponseType
  adjustedContent?: string
}

export interface AISuggestion {
  id: string
  label: string
  description?: string
  action: "accept" | "adjust" | "reject" | "custom"
}

// ===== Scenario / Demo Data =====

export interface ScenarioConfig {
  id: string
  name: string
  description: string
  icon: string
  // Pre-built project state (for demo scenarios)
  project: Project
  // Drilldown data keyed by row identifier
  drilldownData: Record<string, DrilldownNode>
}

// ===== UI State =====

export interface AppState {
  currentProjectId: string | null
  mode: ProjectPhase
  selectedTableId: string | null
  selectedRowId: string | null
  selectedColumnKey: string | null
  drilldownPanelOpen: boolean
  aiPanelOpen: boolean
}
