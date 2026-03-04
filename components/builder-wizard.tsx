"use client"

import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { TableDef, Rule, AnalysisGoal } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileSpreadsheet,
  Brain,
  Target,
  FileText,
  Table2,
  GitBranch,
  Play,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react"

// Step configuration - merged "定义目标" and "定义结论表" into one step
const STEPS = [
  { id: "import", title: "导入底表", icon: Upload, description: "上传 Excel 文件作为数据源" },
  { id: "recognize", title: "AI 识别", icon: Brain, description: "AI 自动分析数据结构" },
  { id: "goal_and_result", title: "定义目标与结果", icon: Target, description: "描述分析目标并定义结论表字段" },
  { id: "rules", title: "引入规则", icon: FileText, description: "上传或输入计算规则" },
  { id: "generate_plan", title: "生成计划", icon: GitBranch, description: "AI 规划构建步骤" },
  { id: "execute", title: "执行构建", icon: Play, description: "运行并生成结果" },
] as const

interface BuilderWizardProps {
  onComplete: (project: {
    baseTable: TableDef
    resultTable: TableDef
    intermediateTables: TableDef[]
    rules: Rule[]
    goal: AnalysisGoal
  }) => void
  onCancel: () => void
}

export function BuilderWizard({ onComplete, onCancel }: BuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Step data
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [recognizedColumns, setRecognizedColumns] = useState<string[]>([])
  const [goalDescription, setGoalDescription] = useState("")
  const [rulesText, setRulesText] = useState("")
  const [extractedRules, setExtractedRules] = useState<{ name: string; description: string }[]>([])
  const [resultColumns, setResultColumns] = useState<{ key: string; label: string; formula: string; sourceColumn?: string }[]>([])
  const [buildPlan, setBuildPlan] = useState<string[]>([])
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)

  const step = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  // Simulate AI typing effect
  const typeAiMessage = useCallback((message: string) => {
    setIsAiTyping(true)
    setAiSuggestion("")
    let index = 0
    const interval = setInterval(() => {
      if (index < message.length) {
        setAiSuggestion(prev => prev + message[index])
        index++
      } else {
        clearInterval(interval)
        setIsAiTyping(false)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)
    
    // Simulate AI recognition with more columns for demo
    setTimeout(() => {
      // Simulate a more realistic column count (could be up to 100)
      const baseColumns = [
        "销售人员", "员工编号", "部门", "区域", "大区", "省份", "城市",
        "客户名称", "客户编号", "客户类型", "客户等级", "客户行业",
        "产品名称", "产品编号", "产品类别", "产品线", "SKU",
        "消费金额", "成本", "毛利", "折扣", "实收金额",
        "交易日期", "下单时间", "发货时间", "签收时间", "账期"
      ]
      setRecognizedColumns(baseColumns)
      setIsProcessing(false)
      typeAiMessage(`文件 "${file.name}" 已成功解析。\n\n检测到 ${baseColumns.length} 个字段、约 12.8 万行数据。\n\n字段涵盖：人员信息、客户信息、产品信息、交易金额、时间维度等。\n\n数据看起来是一份销售业绩明细表，请确认是否正确？`)
    }, 1500)
  }, [typeAiMessage])

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  // Step-specific AI suggestions
  useEffect(() => {
    if (currentStep === 1 && uploadedFile && recognizedColumns.length > 0) {
      // Already typed in handleFileUpload
    } else if (currentStep === 2) {
      typeAiMessage("请描述您的分析目标，并定义期望的结论表字段。\n\n例如：「我需要计算每位销售人员的季度奖金，结论表包含：销售人员、有效业绩、应发奖金」\n\n提示：您可以直接从底表字段中选择引用，也可以定义需要计算的新字段。")
    } else if (currentStep === 3 && goalDescription) {
      typeAiMessage(`基于您的目标，我需要了解以下计算规则：\n\n1. 不同产品的业绩系数是多少？\n2. 提成比例如何确定？\n3. 是否有特殊条件或阈值？\n\n您可以直接输入规则文本，或上传包含规则的文档。`)
    } else if (currentStep === 4 && resultColumns.length > 0) {
      typeAiMessage(`正在生成构建计划...\n\n我将按以下步骤处理数据：\n\n1. 读取底表「销售业绩明细表」\n2. 应用产品系数规则，生成「有效业绩折算表」\n3. 按销售人员汇总，计算奖金\n4. 输出最终「销售奖金结论表」\n\n确认后即可开始执行。`)
      setBuildPlan([
        "读取底表「销售业绩明细表」(12.8万行)",
        "应用产品系数规则，计算有效业绩",
        "生成中间表「有效业绩折算表」",
        "按销售人员维度汇总",
        "应用奖金计算规则",
        "生成结论表「销售奖金结论表」"
      ])
    }
  }, [currentStep, uploadedFile, recognizedColumns.length, goalDescription, resultColumns.length, typeAiMessage])

  // Handle confirm current step
  const handleConfirm = useCallback(() => {
    if (currentStep === 3 && rulesText) {
      // Extract rules from text
      setExtractedRules([
        { name: "产品系数规则", description: "云服务器 ECS 系数 1.0，云数据库 RDS 系数 0.85，对象存储 OSS 系数 0.8" },
        { name: "奖金比例规则", description: "有效业绩 × 2.5% = 应发奖金" },
      ])
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete the wizard
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        // In real app, this would pass actual data
        onComplete({
          baseTable: {} as TableDef,
          resultTable: {} as TableDef,
          intermediateTables: [],
          rules: [],
          goal: { description: goalDescription, entities: [], targetMetrics: [], confirmed: true },
        })
      }, 2000)
    }
  }, [currentStep, rulesText, goalDescription, onComplete])

  // Render step content
  const renderStepContent = () => {
    switch (step.id) {
      case "import":
        return (
          <div className="space-y-8">
            {/* Title for import step */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-foreground">导入您的数据</h3>
              <p className="text-muted-foreground mt-2">上传 Excel 文件作为分析的数据源</p>
            </div>
            
            {!uploadedFile ? (
              <div
                className="border-2 border-dashed border-border rounded-2xl p-16 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-foreground">拖拽文件到此处</p>
                    <p className="text-muted-foreground mt-2">或点击选择文件</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>支持 .xlsx, .xls, .csv 格式</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-card rounded-2xl border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-7 h-7 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-foreground truncate">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => {
                      setUploadedFile(null)
                      setRecognizedColumns([])
                      setAiSuggestion("")
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                {isProcessing && (
                  <div className="flex items-center justify-center gap-3 mt-6 py-4 border-t border-border">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">AI 正在分析文件结构...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case "recognize":
        return (
          <div className="space-y-6">
            {recognizedColumns.length > 0 && (
              <div className="space-y-4">
                {/* Column stats */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">识别到的字段</h4>
                  <span className="text-xs text-muted-foreground">
                    共 {recognizedColumns.length} 个字段
                    {recognizedColumns.length > 15 && "（显示前 15 个）"}
                  </span>
                </div>
                
                {/* Column list with scroll - limit to first 15 */}
                <div className="max-h-28 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {recognizedColumns.slice(0, 15).map((col, index) => (
                      <Badge key={col} variant="secondary" className="text-xs py-0.5 px-2">
                        <span className="text-muted-foreground mr-1 font-mono">{index + 1}.</span>
                        {col}
                      </Badge>
                    ))}
                    {recognizedColumns.length > 15 && (
                      <Badge variant="outline" className="text-xs py-0.5 px-2 text-muted-foreground border-dashed">
                        +{recognizedColumns.length - 15} 更多字段
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Data preview */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>数据预览</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      显示前 5 行 / 共约 12.8 万行
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs w-12">#</th>
                          {recognizedColumns.slice(0, 7).map((col) => (
                            <th key={col} className="text-left py-2 px-3 font-medium text-foreground whitespace-nowrap">{col}</th>
                          ))}
                          {recognizedColumns.length > 7 && (
                            <th className="text-left py-2 px-3 font-medium text-muted-foreground text-xs">...</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 text-xs text-muted-foreground">1</td>
                          <td className="py-2 px-3 whitespace-nowrap">张三</td>
                          <td className="py-2 px-3 whitespace-nowrap">华东区</td>
                          <td className="py-2 px-3 whitespace-nowrap">上海</td>
                          <td className="py-2 px-3 whitespace-nowrap">云途科技</td>
                          <td className="py-2 px-3 whitespace-nowrap">云服务器 ECS</td>
                          <td className="py-2 px-3 whitespace-nowrap">580,000</td>
                          <td className="py-2 px-3 whitespace-nowrap">2026-01-05</td>
                          {recognizedColumns.length > 7 && <td className="py-2 px-3">...</td>}
                        </tr>
                        <tr className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 text-xs text-muted-foreground">2</td>
                          <td className="py-2 px-3 whitespace-nowrap">张三</td>
                          <td className="py-2 px-3 whitespace-nowrap">华东区</td>
                          <td className="py-2 px-3 whitespace-nowrap">上海</td>
                          <td className="py-2 px-3 whitespace-nowrap">云途科技</td>
                          <td className="py-2 px-3 whitespace-nowrap">对象存储 OSS</td>
                          <td className="py-2 px-3 whitespace-nowrap">320,000</td>
                          <td className="py-2 px-3 whitespace-nowrap">2026-01-08</td>
                          {recognizedColumns.length > 7 && <td className="py-2 px-3">...</td>}
                        </tr>
                        <tr className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 text-xs text-muted-foreground">3</td>
                          <td className="py-2 px-3 whitespace-nowrap">李四</td>
                          <td className="py-2 px-3 whitespace-nowrap">华北区</td>
                          <td className="py-2 px-3 whitespace-nowrap">北京</td>
                          <td className="py-2 px-3 whitespace-nowrap">鼎新科技</td>
                          <td className="py-2 px-3 whitespace-nowrap">云数据库 RDS</td>
                          <td className="py-2 px-3 whitespace-nowrap">680,000</td>
                          <td className="py-2 px-3 whitespace-nowrap">2026-01-06</td>
                          {recognizedColumns.length > 7 && <td className="py-2 px-3">...</td>}
                        </tr>
                        <tr className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 text-xs text-muted-foreground">4</td>
                          <td className="py-2 px-3 whitespace-nowrap">王五</td>
                          <td className="py-2 px-3 whitespace-nowrap">华南区</td>
                          <td className="py-2 px-3 whitespace-nowrap">深圳</td>
                          <td className="py-2 px-3 whitespace-nowrap">智创数据</td>
                          <td className="py-2 px-3 whitespace-nowrap">云服务器 ECS</td>
                          <td className="py-2 px-3 whitespace-nowrap">520,000</td>
                          <td className="py-2 px-3 whitespace-nowrap">2026-01-07</td>
                          {recognizedColumns.length > 7 && <td className="py-2 px-3">...</td>}
                        </tr>
                        <tr className="hover:bg-muted/30">
                          <td className="py-2 px-3 text-xs text-muted-foreground">5</td>
                          <td className="py-2 px-3 whitespace-nowrap">赵六</td>
                          <td className="py-2 px-3 whitespace-nowrap">华东区</td>
                          <td className="py-2 px-3 whitespace-nowrap">杭州</td>
                          <td className="py-2 px-3 whitespace-nowrap">云联网络</td>
                          <td className="py-2 px-3 whitespace-nowrap">云服务器 ECS</td>
                          <td className="py-2 px-3 whitespace-nowrap">450,000</td>
                          <td className="py-2 px-3 whitespace-nowrap">2026-01-09</td>
                          {recognizedColumns.length > 7 && <td className="py-2 px-3">...</td>}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case "goal_and_result":
        return (
          <div className="space-y-6">
            {/* Goal description */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">分析目标描述</label>
              <Textarea
                placeholder="请详细描述您的分析目标，例如：计算每位销售人员的季度奖金..."
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                className="min-h-[100px] bg-input"
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">快速模板：</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setGoalDescription("计算每位销售人员的季度奖金。奖金基于有效业绩乘以提成比例，其中不同产品有不同的业绩系数。")
                    setResultColumns([
                      { key: "salesperson", label: "销售人员", formula: "", sourceColumn: "销售人员" },
                      { key: "effectiveRevenue", label: "有效业绩", formula: "SUM(消费金额 × 产品系数)", sourceColumn: "" },
                      { key: "bonus", label: "应发奖金", formula: "有效业绩 × 2.5%", sourceColumn: "" },
                    ])
                  }}
                >
                  销售奖金计算
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setGoalDescription("分析各仓库到门店的配送时效达标率，按配送类型分别统计。")
                    setResultColumns([
                      { key: "warehouse", label: "仓库", formula: "", sourceColumn: "仓库编号" },
                      { key: "deliveryType", label: "配送类型", formula: "", sourceColumn: "配送类型" },
                      { key: "onTimeRate", label: "达标率", formula: "达标数 / 总数 × 100%", sourceColumn: "" },
                    ])
                  }}
                >
                  物流时效分析
                </Button>
              </div>
            </div>

            {/* Result table columns */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">结论表字段定义</label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setResultColumns([...resultColumns, { key: `field_${resultColumns.length + 1}`, label: "", formula: "", sourceColumn: "" }])}
                >
                  <Plus className="w-3 h-3" />
                  添加字段
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                从底表引用字段或定义计算字段。引用字段直接选择底表列；计算字段需要填写公式。
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {resultColumns.map((col, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-card rounded-lg border border-border">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="字段名称"
                          value={col.label}
                          onChange={(e) => {
                            const newCols = [...resultColumns]
                            newCols[i].label = e.target.value
                            newCols[i].key = e.target.value.replace(/\s+/g, '_')
                            setResultColumns(newCols)
                          }}
                          className="w-32 h-8 text-sm bg-input"
                        />
                        <select
                          value={col.sourceColumn || ""}
                          onChange={(e) => {
                            const newCols = [...resultColumns]
                            newCols[i].sourceColumn = e.target.value
                            if (e.target.value) {
                              newCols[i].formula = ""
                            }
                            setResultColumns(newCols)
                          }}
                          className="h-8 px-2 text-sm bg-input text-foreground border border-border rounded-md flex-1 appearance-none cursor-pointer"
                        >
                          <option value="">选择底表字段引用（可选）</option>
                          {recognizedColumns.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      {!col.sourceColumn && (
                        <Input
                          placeholder="计算公式，例如：SUM(消费金额 × 产品系数)"
                          value={col.formula}
                          onChange={(e) => {
                            const newCols = [...resultColumns]
                            newCols[i].formula = e.target.value
                            setResultColumns(newCols)
                          }}
                          className="h-8 text-sm bg-input font-mono"
                        />
                      )}
                      {col.sourceColumn && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-success" />
                          引用自底表字段「{col.sourceColumn}」
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => setResultColumns(resultColumns.filter((_, j) => j !== i))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {resultColumns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    点击"添加字段"定义结论表的列
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case "rules":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">计算规则</label>
              <Textarea
                placeholder="请输入计算规则，例如：&#10;1. 产品系数：云服务器 1.0，云数据库 0.85，对象存储 0.8&#10;2. 奖金比例：有效业绩 × 2.5%"
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                className="min-h-[150px] bg-input font-mono text-sm"
              />
            </div>
            {extractedRules.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  已提取的规则
                </h4>
                <div className="space-y-2">
                  {extractedRules.map((rule, i) => (
                    <div key={i} className="p-3 bg-success/5 border border-success/20 rounded-lg">
                      <p className="font-medium text-foreground text-sm">{rule.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      

      case "generate_plan":
        return (
          <div className="space-y-6">
            {buildPlan.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">构建计划</h4>
                <div className="space-y-2">
                  {buildPlan.map((planStep, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-foreground">{planStep}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case "execute":
        return (
          <div className="space-y-6">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">正在执行构建...</p>
                  <p className="text-sm text-muted-foreground mt-1">预计需要 10-30 秒</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">准备就绪</p>
                  <p className="text-sm text-muted-foreground mt-1">点击"开始执行"运行构建流程</p>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with progress */}
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">新建分析项目</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                步骤 {currentStep + 1} / {STEPS.length}：{step.title}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              取消
            </Button>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
        
        {/* Step indicators */}
        <div className="flex px-6 pb-4 gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === currentStep
            const isDone = i < currentStep
            
            return (
              <button
                key={s.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0",
                  isActive && "bg-primary text-primary-foreground",
                  isDone && "bg-success/20 text-success",
                  !isActive && !isDone && "bg-muted text-muted-foreground"
                )}
                onClick={() => isDone && setCurrentStep(i)}
                disabled={!isDone && !isActive}
              >
                {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content area - conditionally show AI panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Step content */}
        <div className={cn(
          "flex-1 p-6 overflow-y-auto",
          step.id === "import" && "flex items-center justify-center"
        )}>
          <div className={cn(
            step.id === "import" ? "w-full max-w-xl" : "max-w-2xl mx-auto"
          )}>
            {step.id !== "import" && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground mt-1">{step.description}</p>
              </div>
            )}
            {renderStepContent()}
          </div>
        </div>

        {/* Right: AI Assistant - hidden on import step */}
        {step.id !== "import" && (
          <div className="w-80 border-l border-border bg-card flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground">AI 助手</h4>
                <p className="text-xs text-muted-foreground">
                  {isAiTyping ? "正在输入..." : "准备就绪"}
                </p>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {aiSuggestion && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground whitespace-pre-wrap">
                      {aiSuggestion}
                      {isAiTyping && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with actions */}
      <div className="flex-shrink-0 border-t border-border bg-card px-6 py-4">
        <div className={cn(
          "flex items-center max-w-2xl mx-auto",
          step.id === "import" ? "justify-center" : "justify-between"
        )}>
          {step.id !== "import" && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              上一步
            </Button>
          )}
          
          <Button
            onClick={handleConfirm}
            disabled={
              isProcessing ||
              (step.id === "import" && !uploadedFile) ||
              (step.id === "goal_and_result" && (!goalDescription.trim() || resultColumns.length === 0)) ||
              (step.id === "rules" && !rulesText.trim() && extractedRules.length === 0)
            }
            className={cn("gap-2", step.id === "import" && "px-8")}
          >
            {currentStep === STEPS.length - 1 ? (
              <>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isProcessing ? "执行中..." : "开始执行"}
              </>
            ) : (
              <>
                {step.id === "import" ? "上传完成，下一步" : "确认，下一步"}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
