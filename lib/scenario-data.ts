import type { 
  ScenarioConfig, 
  DrilldownNode, 
  Project, 
  TableDef, 
  RuleDocument, 
  Rule, 
  AnalysisGoal, 
  BuildStep 
} from "./types"

// ===== Helper to create demo projects =====

function createDemoProject(
  id: string,
  name: string,
  description: string,
  baseTable: TableDef,
  resultTable: TableDef,
  intermediateTables: TableDef[],
  ruleDocuments: RuleDocument[],
  analysisGoal: AnalysisGoal,
  buildSteps: BuildStep[]
): Project {
  return {
    id,
    name,
    description,
    phase: "reading", // completed projects start in reading mode
    currentBuildStep: buildSteps.length,
    baseTable,
    intermediateTables,
    resultTable,
    ruleDocuments,
    analysisGoal,
    buildPlan: buildSteps,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-28T23:59:59Z",
  }
}

// =============== Scenario A: Sales Bonus ===============

const bonusRules: Rule[] = [
  {
    id: "rule-bonus-1",
    name: "产品系数规则",
    description: "不同产品按不同系数折算有效业绩",
    affectedColumns: ["adjustedRevenue"],
    formula: "有效业绩 = 原始消费 × 产品系数",
    conditions: "云服务器 ECS: 1.0; 对象存储 OSS: 0.8; 云数据库 RDS: 0.85; 弹性伸缩 ESS: 0.85",
    sourceDocId: "doc-bonus-1",
    sourceText: "根据产品价值和利润率，设定不同的业绩折算系数：核心计算产品（ECS）系数 1.0，存储类产品系数 0.8，数据库产品系数 0.85。",
    matchedBaseColumns: ["product_name", "revenue"],
  },
  {
    id: "rule-bonus-2",
    name: "奖金比例规则",
    description: "根据有效业绩分档确定奖金比例",
    affectedColumns: ["bonusRate", "bonusAmount"],
    formula: "奖金 = 有效业绩 × 奖金比例",
    conditions: "有效业绩 ≥ 400万: 2.5%; 300-400万: 2.2%; 200-300万: 2.0%; 150-200万: 1.8%; <150万: 1.5%",
    sourceDocId: "doc-bonus-1",
    sourceText: "销售奖金按阶梯比例计算：季度有效业绩超过400万按2.5%，300-400万按2.2%，200-300万按2.0%，150-200万按1.8%，150万以下按1.5%。",
    matchedBaseColumns: ["adjustedRevenue"],
  },
]

const bonusRuleDocuments: RuleDocument[] = [
  {
    id: "doc-bonus-1",
    name: "2026年Q1销售奖金计算规则",
    fileName: "bonus_rules_2026Q1.docx",
    content: `销售奖金计算规则说明

一、产品系数
根据产品价值和利润率，设定不同的业绩折算系数：
- 核心计算产品（ECS）系数 1.0
- 存储类产品系数 0.8
- 数据库产品系数 0.85
- 弹性伸缩类产品系数 0.85

二、奖金比例
销售奖金按阶梯比例计算：
- 季度有效业绩超过400万：2.5%
- 300-400万：2.2%
- 200-300万：2.0%
- 150-200万：1.8%
- 150万以下：1.5%`,
    uploadedAt: "2026-02-01T10:00:00Z",
    extractedRules: bonusRules,
  },
]

const bonusBaseTable: TableDef = {
  id: "tbl-bonus-base",
  name: "销售业绩明细表",
  type: "base",
  description: "2026年Q1销售业绩明细底表，来源于 ERP 系统导出",
  columns: [
    { key: "salesperson", label: "销售人员", type: "text" },
    { key: "department", label: "部门", type: "text" },
    { key: "region", label: "区域", type: "text" },
    { key: "customer", label: "客户名称", type: "text" },
    { key: "product", label: "产品名称", type: "text" },
    { key: "revenue", label: "消费金额", type: "currency" },
    { key: "date", label: "交易日期", type: "date" },
  ],
  data: [
    { id: "b1", salesperson: "张三", department: "华东区", region: "上海", customer: "上海云途科技有限公司", product: "云服务器 ECS", revenue: 580000, date: "2026-01-05" },
    { id: "b2", salesperson: "张三", department: "华东区", region: "上海", customer: "上海云途科技有限公司", product: "对象存储 OSS", revenue: 320000, date: "2026-01-08" },
    { id: "b3", salesperson: "张三", department: "华东区", region: "上海", customer: "上海云途科技有限公司", product: "云数据库 RDS", revenue: 280000, date: "2026-01-12" },
    { id: "b4", salesperson: "张三", department: "华东区", region: "上海", customer: "杭州数联信息技术", product: "云服务器 ECS", revenue: 420000, date: "2026-01-15" },
    { id: "b5", salesperson: "张三", department: "华东区", region: "上海", customer: "杭州数联信息技术", product: "云数据库 RDS", revenue: 180000, date: "2026-01-18" },
    { id: "b6", salesperson: "李四", department: "华北区", region: "北京", customer: "北京鼎新科技集团", product: "云服务器 ECS", revenue: 680000, date: "2026-01-06" },
    { id: "b7", salesperson: "李四", department: "华北区", region: "北京", customer: "北京鼎新科技集团", product: "弹性伸缩 ESS", revenue: 350000, date: "2026-01-10" },
    { id: "b8", salesperson: "王五", department: "华南区", region: "深圳", customer: "深圳智创数据", product: "云服务器 ECS", revenue: 520000, date: "2026-01-07" },
    { id: "b9", salesperson: "王五", department: "华南区", region: "深圳", customer: "深圳智创数据", product: "对象存储 OSS", revenue: 280000, date: "2026-01-14" },
    { id: "b10", salesperson: "赵六", department: "华东区", region: "杭州", customer: "杭州云联网络", product: "云服务器 ECS", revenue: 450000, date: "2026-01-09" },
  ],
  rowCount: 128459,
}

const bonusIntermediateTable: TableDef = {
  id: "tbl-bonus-adj",
  name: "有效业绩折算表",
  type: "intermediate",
  description: "经产品系数折算后的有效业绩明细",
  columns: [
    { key: "salesperson", label: "销售人员", type: "text" },
    { key: "customer", label: "客户名称", type: "text" },
    { key: "product", label: "产品名称", type: "text" },
    { key: "revenue", label: "原始消费", type: "currency" },
    { key: "coefficient", label: "产品系数", type: "number" },
    { key: "adjustedRevenue", label: "有效业绩", type: "currency", isGenerated: true, sourceColumns: ["revenue", "coefficient"], appliedRuleIds: ["rule-bonus-1"] },
  ],
  data: [
    { id: "i1", salesperson: "张三", customer: "上海云途科技有限公司", product: "云服务器 ECS", revenue: 580000, coefficient: 1.0, adjustedRevenue: 580000 },
    { id: "i2", salesperson: "张三", customer: "上海云途科技有限公司", product: "对象存储 OSS", revenue: 320000, coefficient: 0.8, adjustedRevenue: 256000 },
    { id: "i3", salesperson: "张三", customer: "上海云途科技有限公司", product: "云数据库 RDS", revenue: 280000, coefficient: 0.85, adjustedRevenue: 238000 },
    { id: "i4", salesperson: "张三", customer: "杭州数联信息技术", product: "云服务器 ECS", revenue: 420000, coefficient: 1.0, adjustedRevenue: 420000 },
    { id: "i5", salesperson: "张三", customer: "杭州数联信息技术", product: "云数据库 RDS", revenue: 180000, coefficient: 0.85, adjustedRevenue: 153000 },
    { id: "i6", salesperson: "李四", customer: "北京鼎新科技集团", product: "云服务器 ECS", revenue: 680000, coefficient: 1.0, adjustedRevenue: 680000 },
    { id: "i7", salesperson: "李四", customer: "北京鼎新科技集团", product: "弹性伸缩 ESS", revenue: 350000, coefficient: 0.85, adjustedRevenue: 297500 },
    { id: "i8", salesperson: "王五", customer: "深圳智创数据", product: "云服务器 ECS", revenue: 520000, coefficient: 1.0, adjustedRevenue: 520000 },
  ],
  sourceStepId: "step-bonus-4",
  rowCount: 3842,
}

const bonusResultTable: TableDef = {
  id: "tbl-bonus-result",
  name: "销售奖金结论表",
  type: "result",
  description: "2026年Q1销售奖金结论表",
  columns: [
    { key: "rank", label: "排名", type: "number", sortable: true, align: "left" },
    { key: "name", label: "姓名", type: "text", align: "left" },
    { key: "department", label: "部门", type: "text", align: "left" },
    { key: "region", label: "区域", type: "text", align: "left" },
    { key: "totalRevenue", label: "总营收", type: "currency", sortable: true, align: "right" },
    { key: "adjustedRevenue", label: "有效业绩", type: "currency", sortable: true, align: "right", isGenerated: true, sourceColumns: ["totalRevenue"], appliedRuleIds: ["rule-bonus-1"], formulaDescription: "各产品消费按系数折算后汇总" },
    { key: "bonusRate", label: "奖金比例", type: "percent", align: "right", isGenerated: true, sourceColumns: ["adjustedRevenue"], appliedRuleIds: ["rule-bonus-2"], formulaDescription: "根据有效业绩档位确定" },
    { key: "bonusAmount", label: "应发奖金", type: "currency", sortable: true, drillable: true, align: "right", isGenerated: true, sourceColumns: ["adjustedRevenue", "bonusRate"], appliedRuleIds: ["rule-bonus-2"], formulaDescription: "有效业绩 × 奖金比例" },
  ],
  data: [
    { id: "s1", rank: 1, name: "张三", department: "华东区", region: "上海", totalRevenue: 5280000, adjustedRevenue: 4520000, bonusRate: 0.025, bonusAmount: 113000 },
    { id: "s2", rank: 2, name: "李四", department: "华北区", region: "北京", totalRevenue: 4860000, adjustedRevenue: 4100000, bonusRate: 0.025, bonusAmount: 102500 },
    { id: "s3", rank: 3, name: "王五", department: "华南区", region: "深圳", totalRevenue: 4320000, adjustedRevenue: 3680000, bonusRate: 0.022, bonusAmount: 80960 },
    { id: "s4", rank: 4, name: "赵六", department: "华东区", region: "杭州", totalRevenue: 3950000, adjustedRevenue: 3420000, bonusRate: 0.022, bonusAmount: 75240 },
    { id: "s5", rank: 5, name: "孙七", department: "西南区", region: "成都", totalRevenue: 3580000, adjustedRevenue: 2980000, bonusRate: 0.020, bonusAmount: 59600 },
    { id: "s6", rank: 6, name: "周八", department: "华北区", region: "天津", totalRevenue: 3210000, adjustedRevenue: 2750000, bonusRate: 0.020, bonusAmount: 55000 },
    { id: "s7", rank: 7, name: "吴九", department: "华南区", region: "广州", totalRevenue: 2890000, adjustedRevenue: 2480000, bonusRate: 0.018, bonusAmount: 44640 },
    { id: "s8", rank: 8, name: "郑十", department: "华东区", region: "南京", totalRevenue: 2650000, adjustedRevenue: 2280000, bonusRate: 0.018, bonusAmount: 41040 },
    { id: "s9", rank: 9, name: "陈一一", department: "西北区", region: "西安", totalRevenue: 2380000, adjustedRevenue: 1960000, bonusRate: 0.015, bonusAmount: 29400 },
    { id: "s10", rank: 10, name: "林二二", department: "东北区", region: "大连", totalRevenue: 2120000, adjustedRevenue: 1780000, bonusRate: 0.015, bonusAmount: 26700 },
    { id: "s11", rank: 11, name: "黄三三", department: "华东区", region: "苏州", totalRevenue: 1950000, adjustedRevenue: 1620000, bonusRate: 0.015, bonusAmount: 24300 },
    { id: "s12", rank: 12, name: "杨四四", department: "华南区", region: "厦门", totalRevenue: 1780000, adjustedRevenue: 1480000, bonusRate: 0.012, bonusAmount: 17760 },
  ],
  sourceStepId: "step-bonus-5",
  rowCount: 12,
}

const bonusBuildSteps: BuildStep[] = [
  { id: "step-bonus-1", order: 1, type: "import", title: "导入底表", description: "导入 销售业绩明细表.xlsx，共 12.8 万条交易明细", status: "done", inputTableIds: [], appliedRuleIds: [], aiSuggestion: "检测到 Excel 文件包含 7 个字段、128,459 行数据，涵盖 12 名销售的季度交易记录。", userDecision: "accepted" },
  { id: "step-bonus-2", order: 2, type: "recognize", title: "AI 识别数据结构", description: "AI 自动识别字段类型和业务含义", status: "done", inputTableIds: ["tbl-bonus-base"], appliedRuleIds: [], aiSuggestion: "字段识别完成：销售人员(文本)、部门(文本)、区域(文本)、客户名称(文本)、产品名称(文本)、消费金额(货币)、交易日期(日期)", userDecision: "accepted" },
  { id: "step-bonus-3", order: 3, type: "goal", title: "定义分析目标", description: "用户确认计算目标：每人应发奖金 = 有效业绩 × 奖金比例", status: "done", inputTableIds: ["tbl-bonus-base"], appliedRuleIds: [], aiSuggestion: "理解您的目标：计算销售人员的季度奖金。需要先按产品系数折算有效业绩，再根据业绩档位确定奖金比例。", userDecision: "accepted" },
  { id: "step-bonus-4", order: 4, type: "rules", title: "引入规则文档", description: "上传 bonus_rules_2026Q1.docx，AI 提取产品系数和奖金比例规则", status: "done", inputTableIds: ["tbl-bonus-base"], appliedRuleIds: ["rule-bonus-1", "rule-bonus-2"], aiSuggestion: "已从文档中提取 2 条规则：\n1. 产品系数规则（影响有效业绩计算）\n2. 奖金比例规则（影响最终奖金计算）", userDecision: "accepted" },
  { id: "step-bonus-5", order: 5, type: "define_result", title: "定义结论表结构", description: "确认结论表包含：排名、姓名、部门、区域、总营收、有效业绩、奖金比例、应发奖金", status: "done", inputTableIds: ["tbl-bonus-base"], outputTableId: "tbl-bonus-result", appliedRuleIds: [], aiSuggestion: "建议结论表结构：\n• 排名、姓名、部门、区域（原始字段）\n• 总营收（聚合计算）\n• 有效业绩（规则1计算，支持下钻）\n• 奖金比例、应发奖金（规则2计算，支持下钻）", userDecision: "accepted" },
  { id: "step-bonus-6", order: 6, type: "generate_plan", title: "AI 生成构建计划", description: "AI 规划计算步骤：底表 → 系数折算 → 按人汇总 → 奖金计算 → 结论表", status: "done", inputTableIds: ["tbl-bonus-base"], appliedRuleIds: ["rule-bonus-1", "rule-bonus-2"], aiSuggestion: "构建计划：\n步骤1: 关联产品系数，计算每笔交易的有效业绩\n步骤2: 按销售人员汇总有效业绩\n步骤3: 根据业绩档位确定奖金比例\n步骤4: 计算应发奖金，生成排名", userDecision: "accepted" },
  { id: "step-bonus-7", order: 7, type: "execute", title: "执行构建", description: "生成「有效业绩折算表」和「销售奖金结论表」", status: "done", inputTableIds: ["tbl-bonus-base"], outputTableId: "tbl-bonus-result", appliedRuleIds: ["rule-bonus-1", "rule-bonus-2"], aiSuggestion: "构建完成！\n• 中间表「有效业绩折算表」：3,842 行（有效业绩明细）\n• 结论表「销售奖金结论表」：12 行（每人一行）\n• 奖金总额：¥770,140", userDecision: "accepted" },
]

const bonusDrilldown: Record<string, DrilldownNode> = {
  s1: {
    id: "s1", label: "张三", levelLabel: "销售", levelIcon: "User",
    aiSummary: "张三本期总营收 528.00 万，经产品系数折算后有效业绩为 452.00 万，按 2.5% 的奖金比例，最终应发奖金 11.30 万。该销售共服务 5 个客户，以下为按奖金贡献排序的客户明细：",
    lineage: {
      sourceColumns: [
        { tableId: "tbl-bonus-base", tableName: "销售业绩明细表", columnKey: "revenue", columnLabel: "消费金额" },
      ],
      transformations: [
        { stepId: "step-bonus-4", stepTitle: "系数折算", description: "各产品消费按产品系数折算为有效业绩" },
        { stepId: "step-bonus-7", stepTitle: "汇总计算", description: "按销售人员汇总有效业绩，应用奖金比例规则" },
      ],
    },
    appliedRules: bonusRules,
    values: [
      { key: "totalRevenue", label: "总营收", value: 5280000, format: "currency" },
      { key: "adjustedRevenue", label: "��效业绩", value: 4520000, format: "currency" },
      { key: "bonusRate", label: "奖金比例", value: 0.025, format: "percent" },
      { key: "bonusAmount", label: "应发奖金", value: 113000, format: "currency", highlight: true },
    ],
    childrenLabel: "客户贡献明细（Top 5）",
    children: [
      {
        id: "c1-1", label: "上海云途科技有限公司", levelLabel: "客户", levelIcon: "Building2",
        aiSummary: "上海云途科技有限公司为张三贡献了 3.30 万奖金，占其总奖金的 29.2%。该客户消费总额 158.00 万，经不同产品系数折算后有效业绩为 132.00 万。",
        values: [
          { key: "revenue", label: "客户总消费", value: 1580000, format: "currency" },
          { key: "adjusted", label: "有效业绩", value: 1320000, format: "currency" },
          { key: "bonus", label: "奖金贡献", value: 33000, format: "currency", highlight: true },
          { key: "pct", label: "占比", value: 0.292, format: "percent" },
        ],
        childrenLabel: "产品消费明细",
        children: [
          {
            id: "p1", label: "云服务器 ECS", levelLabel: "产品", levelIcon: "Package",
            aiSummary: "云服务器 ECS 在客户上海云途科技有限公司的消费中贡献了 58.00 万营收。该产品的业绩计算系数为 1.0（核心计算产品），折算后有效业绩为 58.00 万。",
            formula: "58.00 万 × 1.0 = 58.00 万",
            formulaLabel: "原始消费 × 产品系数 = 有效业绩",
            appliedRules: [bonusRules[0]],
            values: [
              { key: "revenue", label: "原始消费", value: 580000, format: "currency" },
              { key: "coeff", label: "产品系数", value: 1.0, format: "coefficient" },
              { key: "adjusted", label: "有效业绩", value: 580000, format: "currency" },
              { key: "bonus", label: "奖金贡献", value: 14500, format: "currency", highlight: true },
            ],
          },
          {
            id: "p2", label: "对象存储 OSS", levelLabel: "产品", levelIcon: "Package",
            aiSummary: "对象存储 OSS 的消费额为 32.00 万，产品系数 0.8（存储类产品），折算后有效业绩 25.60 万。",
            formula: "32.00 万 × 0.8 = 25.60 万",
            formulaLabel: "原始消费 × 产品系数 = 有效业绩",
            appliedRules: [bonusRules[0]],
            values: [
              { key: "revenue", label: "原始消费", value: 320000, format: "currency" },
              { key: "coeff", label: "产品系数", value: 0.8, format: "coefficient" },
              { key: "adjusted", label: "有效业绩", value: 256000, format: "currency" },
              { key: "bonus", label: "奖金贡献", value: 6400, format: "currency", highlight: true },
            ],
          },
          {
            id: "p3", label: "云数据库 RDS", levelLabel: "产品", levelIcon: "Package",
            aiSummary: "云数据库 RDS 消费 28.00 万，系数 0.85（数据库产品），折算有效业绩 23.80 万。",
            formula: "28.00 万 × 0.85 = 23.80 万",
            formulaLabel: "原始消费 × 产品系数 = 有效业绩",
            appliedRules: [bonusRules[0]],
            values: [
              { key: "revenue", label: "原始消费", value: 280000, format: "currency" },
              { key: "coeff", label: "产品系数", value: 0.85, format: "coefficient" },
              { key: "adjusted", label: "有效业绩", value: 238000, format: "currency" },
              { key: "bonus", label: "奖金贡献", value: 5950, format: "currency", highlight: true },
            ],
          },
        ],
      },
      {
        id: "c1-2", label: "杭州数联信息技术", levelLabel: "客户", levelIcon: "Building2",
        aiSummary: "杭州数联信息技术为张三贡献了 2.13 万奖金，占总奖金的 18.8%。消费总额 98.00 万，折算有效业绩 85.00 万。",
        values: [
          { key: "revenue", label: "客户总消费", value: 980000, format: "currency" },
          { key: "adjusted", label: "有效业绩", value: 850000, format: "currency" },
          { key: "bonus", label: "奖金贡献", value: 21250, format: "currency", highlight: true },
        ],
      },
      {
        id: "c1-3", label: "苏州智算科技", levelLabel: "客户", levelIcon: "Building2",
        aiSummary: "苏州智算科技为张三贡献了 1.55 万奖金。消费总额 72.00 万，折算有效业绩 62.00 万。",
        values: [
          { key: "revenue", label: "客户总消费", value: 720000, format: "currency" },
          { key: "adjusted", label: "有效业绩", value: 620000, format: "currency" },
          { key: "bonus", label: "奖金贡献", value: 15500, format: "currency", highlight: true },
        ],
      },
    ],
  },
  s2: {
    id: "s2", label: "李四", levelLabel: "销售", levelIcon: "User",
    aiSummary: "李四本期总营收 486.00 万，折算后有效业绩 410.00 万，按 2.5% 的奖金比例，应发奖金 10.25 万。共服务 4 个客户。",
    lineage: {
      sourceColumns: [
        { tableId: "tbl-bonus-base", tableName: "销售业绩明细表", columnKey: "revenue", columnLabel: "消费金额" },
      ],
      transformations: [
        { stepId: "step-bonus-4", stepTitle: "系数折算", description: "各产品消费按产品系数折算为有效业绩" },
        { stepId: "step-bonus-7", stepTitle: "汇总计算", description: "按销售人员汇总有效业绩，应用奖金比例规则" },
      ],
    },
    appliedRules: bonusRules,
    values: [
      { key: "totalRevenue", label: "总营收", value: 4860000, format: "currency" },
      { key: "adjustedRevenue", label: "有效业绩", value: 4100000, format: "currency" },
      { key: "bonusRate", label: "奖金比例", value: 0.025, format: "percent" },
      { key: "bonusAmount", label: "应发奖金", value: 102500, format: "currency", highlight: true },
    ],
    childrenLabel: "客户贡献明细",
    children: [
      {
        id: "c2-1", label: "北京鼎新科技集团", levelLabel: "客户", levelIcon: "Building2",
        aiSummary: "北京鼎新科技集团为李四贡献了 2.80 万奖金，占总奖金的 27.3%。消费总额 135.00 万。",
        values: [
          { key: "revenue", label: "客户总消费", value: 1350000, format: "currency" },
          { key: "adjusted", label: "有效业绩", value: 1120000, format: "currency" },
          { key: "bonus", label: "奖金贡献", value: 28000, format: "currency", highlight: true },
        ],
      },
    ],
  },
  s3: {
    id: "s3", label: "王五", levelLabel: "销售", levelIcon: "User",
    aiSummary: "王五本期总营收 432.00 万，折算后有效业绩 368.00 万，按 2.2% 的奖金比例，应发奖金 8.10 万。",
    appliedRules: bonusRules,
    values: [
      { key: "totalRevenue", label: "总营收", value: 4320000, format: "currency" },
      { key: "adjustedRevenue", label: "有效业绩", value: 3680000, format: "currency" },
      { key: "bonusRate", label: "奖金比例", value: 0.022, format: "percent" },
      { key: "bonusAmount", label: "应发奖金", value: 80960, format: "currency", highlight: true },
    ],
  },
}

// Default drilldown generator for rows without specific data
function generateDefaultBonusDrilldown(row: Record<string, unknown>): DrilldownNode {
  return {
    id: String(row.id),
    label: String(row.name),
    levelLabel: "销售",
    levelIcon: "User",
    aiSummary: `${row.name} 本期总营收 ${((row.totalRevenue as number) / 10000).toFixed(2)} 万，折算后有效业绩 ${((row.adjustedRevenue as number) / 10000).toFixed(2)} 万，按 ${((row.bonusRate as number) * 100).toFixed(1)}% 的奖金比例，应发奖金 ${((row.bonusAmount as number) / 10000).toFixed(2)} 万。`,
    appliedRules: bonusRules,
    values: [
      { key: "totalRevenue", label: "总营收", value: row.totalRevenue as number, format: "currency" },
      { key: "adjustedRevenue", label: "有效业绩", value: row.adjustedRevenue as number, format: "currency" },
      { key: "bonusRate", label: "奖金比例", value: row.bonusRate as number, format: "percent" },
      { key: "bonusAmount", label: "应发奖金", value: row.bonusAmount as number, format: "currency", highlight: true },
    ],
    childrenLabel: "客户贡献明细",
    children: [
      {
        id: `${row.id}-c1`, label: "主要客户A", levelLabel: "客户", levelIcon: "Building2",
        aiSummary: "主要客户A为该销售贡献了最大份额的奖金。",
        values: [
          { key: "revenue", label: "客户总消费", value: Math.round((row.totalRevenue as number) * 0.35), format: "currency" },
          { key: "bonus", label: "奖金贡献", value: Math.round((row.bonusAmount as number) * 0.35), format: "currency", highlight: true },
        ],
      },
    ],
  }
}

const bonusProject = createDemoProject(
  "proj-bonus",
  "销售奖金核算",
  "从销售业绩底表计算各销售人员的奖金分配",
  bonusBaseTable,
  bonusResultTable,
  [bonusIntermediateTable],
  bonusRuleDocuments,
  {
    description: "计算每个销售人员的应发奖金，奖金 = 有效业绩 × 奖金比例",
    entities: ["销售人员", "客户", "产品", "交易金额"],
    targetMetrics: ["有效业绩", "奖金比例", "应发奖金"],
    confirmed: true,
  },
  bonusBuildSteps
)

const bonusScenario: ScenarioConfig = {
  id: "sales-bonus",
  name: "销售奖金核算",
  description: "从销售业绩底表计算各销售人员的奖金分配",
  icon: "Wallet",
  project: bonusProject,
  drilldownData: bonusDrilldown,
}

// =============== Scenario B: Live Streaming Commission ===============

const commissionRules: Rule[] = [
  {
    id: "rule-comm-1",
    name: "退货扣减规则",
    description: "有效 GMV 需扣除退货金额",
    affectedColumns: ["effectiveGmv"],
    formula: "有效 GMV = GMV × (1 - 退货率)",
    sourceDocId: "doc-comm-1",
    sourceText: "达人分佣基于有效 GMV 计算，需扣除7天内的退货金额。",
    matchedBaseColumns: ["gmv", "returnRate"],
  },
  {
    id: "rule-comm-2",
    name: "分佣比例规则",
    description: "根据达人等级确定分佣比例",
    affectedColumns: ["commissionRate", "commission"],
    formula: "分佣 = 有效 GMV × 分佣比例",
    conditions: "S级达人: 8.0%; A级达人: 7.5%; B级达人: 6.0%; C级达人: 5.0%",
    sourceDocId: "doc-comm-1",
    sourceText: "分佣比例按达人等级划分：S级8%，A级7.5%，B级6%，C级5%。",
    matchedBaseColumns: ["kolLevel", "effectiveGmv"],
  },
]

const commissionRuleDocuments: RuleDocument[] = [
  {
    id: "doc-comm-1",
    name: "直播达人分佣规则",
    fileName: "commission_rules.docx",
    content: `直播达人分佣规则

一、有效 GMV 计算
达人分佣基于有效 GMV 计算，需扣除7天内的退货金额。

二、分佣比例
分佣比例按达人等级划分：
- S级达人：8%
- A级达人：7.5%
- B级达人：6%
- C级达人：5%`,
    uploadedAt: "2026-02-01T10:00:00Z",
    extractedRules: commissionRules,
  },
]

const commissionBaseTable: TableDef = {
  id: "tbl-comm-base",
  name: "直播订单明细表",
  type: "base",
  description: "2026年2月直播订单明细，来源于电商平台导出",
  columns: [
    { key: "kolName", label: "达人名称", type: "text" },
    { key: "liveSession", label: "直播场次", type: "text" },
    { key: "sku", label: "商品名称", type: "text" },
    { key: "orderId", label: "订单号", type: "text" },
    { key: "amount", label: "订单金额", type: "currency" },
    { key: "status", label: "订单状态", type: "text" },
    { key: "date", label: "下单时间", type: "date" },
  ],
  data: [
    { id: "o1", kolName: "李佳琦", liveSession: "2.14 情人节专场", sku: "兰蔻小黑瓶精华", orderId: "LV2026021400001", amount: 899, status: "已完成", date: "2026-02-14" },
    { id: "o2", kolName: "李佳琦", liveSession: "2.14 情人节专场", sku: "雅诗兰黛眼霜", orderId: "LV2026021400002", amount: 590, status: "已完成", date: "2026-02-14" },
    { id: "o3", kolName: "李佳琦", liveSession: "2.14 情人节专场", sku: "SK-II神仙水", orderId: "LV2026021400003", amount: 1280, status: "已退货", date: "2026-02-14" },
    { id: "o4", kolName: "薇娅", liveSession: "2.12 美妆专场", sku: "资生堂红腰子", orderId: "LV2026021200001", amount: 720, status: "已完成", date: "2026-02-12" },
    { id: "o5", kolName: "薇娅", liveSession: "2.12 美妆专场", sku: "CPB肌肤之钥", orderId: "LV2026021200002", amount: 1580, status: "已完成", date: "2026-02-12" },
    { id: "o6", kolName: "罗永浩", liveSession: "2.15 数码专场", sku: "iPhone 15 Pro", orderId: "LV2026021500001", amount: 8999, status: "已完成", date: "2026-02-15" },
    { id: "o7", kolName: "罗永浩", liveSession: "2.15 数码专场", sku: "AirPods Pro", orderId: "LV2026021500002", amount: 1899, status: "已退货", date: "2026-02-15" },
    { id: "o8", kolName: "辛巴", liveSession: "2.10 年货节", sku: "五粮液52度", orderId: "LV2026021000001", amount: 1099, status: "已完成", date: "2026-02-10" },
  ],
  rowCount: 523847,
}

const commissionResultTable: TableDef = {
  id: "tbl-comm-result",
  name: "达人分佣结论表",
  type: "result",
  description: "2026年2月达人分佣结论表",
  columns: [
    { key: "rank", label: "排名", type: "number", sortable: true, align: "left" },
    { key: "name", label: "达人", type: "text", align: "left" },
    { key: "level", label: "等级", type: "text", align: "left" },
    { key: "liveCount", label: "场次", type: "number", align: "right" },
    { key: "gmv", label: "GMV", type: "currency", sortable: true, align: "right" },
    { key: "effectiveGmv", label: "有效 GMV", type: "currency", sortable: true, align: "right", isGenerated: true, appliedRuleIds: ["rule-comm-1"] },
    { key: "commissionRate", label: "分佣比例", type: "percent", align: "right", isGenerated: true, appliedRuleIds: ["rule-comm-2"] },
    { key: "commission", label: "分佣金额", type: "currency", sortable: true, drillable: true, align: "right", isGenerated: true, appliedRuleIds: ["rule-comm-2"] },
  ],
  data: [
    { id: "kol1", rank: 1, name: "李佳琦", level: "S", liveCount: 12, gmv: 15800000, effectiveGmv: 12640000, commissionRate: 0.08, commission: 1011200 },
    { id: "kol2", rank: 2, name: "薇娅", level: "S", liveCount: 10, gmv: 13200000, effectiveGmv: 10560000, commissionRate: 0.08, commission: 844800 },
    { id: "kol3", rank: 3, name: "罗永浩", level: "A", liveCount: 8, gmv: 8900000, effectiveGmv: 7120000, commissionRate: 0.075, commission: 534000 },
    { id: "kol4", rank: 4, name: "辛巴", level: "A", liveCount: 9, gmv: 7650000, effectiveGmv: 6120000, commissionRate: 0.075, commission: 459000 },
    { id: "kol5", rank: 5, name: "雪梨", level: "B", liveCount: 14, gmv: 5200000, effectiveGmv: 4160000, commissionRate: 0.06, commission: 249600 },
    { id: "kol6", rank: 6, name: "烈儿宝贝", level: "B", liveCount: 11, gmv: 4800000, effectiveGmv: 3840000, commissionRate: 0.06, commission: 230400 },
  ],
  sourceStepId: "step-comm-5",
  rowCount: 6,
}

const commissionBuildSteps: BuildStep[] = [
  { id: "step-comm-1", order: 1, type: "import", title: "导入底表", description: "导入 live_orders_202602.xlsx，共 15,842 条订单", status: "done", inputTableIds: [], appliedRuleIds: [], userDecision: "accepted" },
  { id: "step-comm-2", order: 2, type: "recognize", title: "AI 识别数据结构", description: "AI 识别订单、商品、达人、状态等字段", status: "done", inputTableIds: ["tbl-comm-base"], appliedRuleIds: [], userDecision: "accepted" },
  { id: "step-comm-3", order: 3, type: "goal", title: "定义分析目标", description: "计算各达人的有效 GMV 和分佣金额", status: "done", inputTableIds: ["tbl-comm-base"], appliedRuleIds: [], userDecision: "accepted" },
  { id: "step-comm-4", order: 4, type: "rules", title: "引入规则文档", description: "上传分佣规则，提取退货扣减和分佣比例规则", status: "done", inputTableIds: ["tbl-comm-base"], appliedRuleIds: ["rule-comm-1", "rule-comm-2"], userDecision: "accepted" },
  { id: "step-comm-5", order: 5, type: "execute", title: "执行构建", description: "计算有效 GMV，应用分佣比例，生成结论表", status: "done", inputTableIds: ["tbl-comm-base"], outputTableId: "tbl-comm-result", appliedRuleIds: ["rule-comm-1", "rule-comm-2"], userDecision: "accepted" },
]

const commissionDrilldown: Record<string, DrilldownNode> = {
  kol1: {
    id: "kol1", label: "李佳琦", levelLabel: "达人", levelIcon: "Video",
    aiSummary: "李佳琦本期共进行 12 场直播，总带货 GMV 达 1,580.00 万，扣除退货后有效 GMV 为 1,264.00 万，按 S 级达人 8.0% 分佣比例，总分佣金额 101.12 万。",
    appliedRules: commissionRules,
    values: [
      { key: "gmv", label: "带货 GMV", value: 15800000, format: "currency" },
      { key: "effectiveGmv", label: "有效 GMV", value: 12640000, format: "currency" },
      { key: "rate", label: "分佣比例", value: 0.08, format: "percent" },
      { key: "commission", label: "分佣金额", value: 1011200, format: "currency", highlight: true },
    ],
    childrenLabel: "直播场次明细（Top 3）",
    children: [
      {
        id: "live-1", label: "2.14 情人节专场", levelLabel: "直播场次", levelIcon: "Tv",
        aiSummary: "2月14日情人节专场 GMV 达 420.00 万，有效 GMV 336.00 万，分佣 26.88 万。",
        values: [
          { key: "gmv", label: "场次 GMV", value: 4200000, format: "currency" },
          { key: "effectiveGmv", label: "有效 GMV", value: 3360000, format: "currency" },
          { key: "commission", label: "分佣金额", value: 268800, format: "currency", highlight: true },
        ],
        childrenLabel: "商品明细",
        children: [
          {
            id: "sku-1", label: "兰蔻小黑瓶精华", levelLabel: "商品", levelIcon: "ShoppingBag",
            aiSummary: "兰蔻小黑瓶精华售出 580 件，单价 899 元，退货率 12%，有效 GMV 45.89 万。",
            formula: "580 件 × 899 元 × (1 - 12%) = 45.89 万",
            formulaLabel: "销量 × 单价 × (1 - 退货率) = 有效 GMV",
            appliedRules: [commissionRules[0]],
            values: [
              { key: "sales", label: "销量", value: 580, format: "number" },
              { key: "price", label: "单价", value: 899, format: "currency" },
              { key: "returnRate", label: "退货率", value: 0.12, format: "percent" },
              { key: "effectiveGmv", label: "有效 GMV", value: 458920, format: "currency" },
              { key: "commission", label: "分佣", value: 36714, format: "currency", highlight: true },
            ],
          },
        ],
      },
    ],
  },
  kol2: {
    id: "kol2", label: "薇娅", levelLabel: "达人", levelIcon: "Video",
    aiSummary: "薇娅本期共进行 10 场直播，总 GMV 1,320.00 万，有效 GMV 1,056.00 万，按 S 级 8% 分佣，总分佣 84.48 万。",
    appliedRules: commissionRules,
    values: [
      { key: "gmv", label: "带货 GMV", value: 13200000, format: "currency" },
      { key: "effectiveGmv", label: "有效 GMV", value: 10560000, format: "currency" },
      { key: "rate", label: "分佣比例", value: 0.08, format: "percent" },
      { key: "commission", label: "分佣金额", value: 844800, format: "currency", highlight: true },
    ],
  },
}

const commissionProject = createDemoProject(
  "proj-commission",
  "直播达人分佣",
  "计算直播达人的带货分佣金额",
  commissionBaseTable,
  commissionResultTable,
  [],
  commissionRuleDocuments,
  {
    description: "计算各直播达人的有效 GMV 和分佣金额",
    entities: ["达人", "直播场次", "商品", "订单"],
    targetMetrics: ["有效 GMV", "分佣金额"],
    confirmed: true,
  },
  commissionBuildSteps
)

const commissionScenario: ScenarioConfig = {
  id: "live-commission",
  name: "直播达人分佣",
  description: "计算直播达人的带货分佣金额",
  icon: "Video",
  project: commissionProject,
  drilldownData: commissionDrilldown,
}

// =============== Scenario C: Logistics Timeliness ===============

const logisticsRules: Rule[] = [
  {
    id: "rule-log-1",
    name: "时效性计算规则",
    description: "根据实际配送时间和承诺时效计算达标率",
    affectedColumns: ["onTimeRate"],
    formula: "达标率 = 按时送达订单数 / 总订单数",
    conditions: "承诺时效：次日达 24h，标准配送 72h，经济配送 120h",
    sourceDocId: "doc-log-1",
    sourceText: "配送时效按承诺类型划分：次日达需在24小时内送达，标准配送72小时，经济配送120小时。",
    matchedBaseColumns: ["deliveryType", "deliveryTime"],
  },
]

const logisticsRuleDocuments: RuleDocument[] = [
  {
    id: "doc-log-1",
    name: "物流时效考核标准",
    fileName: "logistics_sla.docx",
    content: `物流时效考核标准

配送时效按承诺类型划分：
- 次日达：24小时内送达
- 标准配送：72小时内送达
- 经济配送：120小时内送达

达标率 = 按时送达订单数 / 总订单数`,
    uploadedAt: "2026-02-01T10:00:00Z",
    extractedRules: logisticsRules,
  },
]

const logisticsBaseTable: TableDef = {
  id: "tbl-log-base",
  name: "配送记录明细表",
  type: "base",
  description: "2026年2月配送记录明细，来源于 WMS 系统导出",
  columns: [
    { key: "warehouseId", label: "仓库编号", type: "text" },
    { key: "storeId", label: "门店编号", type: "text" },
    { key: "orderId", label: "运单号", type: "text" },
    { key: "deliveryType", label: "配送类型", type: "text" },
    { key: "promisedTime", label: "承诺时效(h)", type: "number" },
    { key: "actualTime", label: "实际耗时(h)", type: "number" },
    { key: "status", label: "是否达标", type: "text" },
  ],
  data: [
    { id: "d1", warehouseId: "WH-SH01", storeId: "ST-001", orderId: "SF2026020100001", deliveryType: "次日达", promisedTime: 24, actualTime: 18, status: "达标" },
    { id: "d2", warehouseId: "WH-SH01", storeId: "ST-002", orderId: "SF2026020100002", deliveryType: "次日达", promisedTime: 24, actualTime: 26, status: "超时" },
    { id: "d3", warehouseId: "WH-SH01", storeId: "ST-003", orderId: "SF2026020100003", deliveryType: "标准配送", promisedTime: 72, actualTime: 48, status: "达标" },
    { id: "d4", warehouseId: "WH-BJ01", storeId: "ST-101", orderId: "SF2026020100004", deliveryType: "次日达", promisedTime: 24, actualTime: 22, status: "达标" },
    { id: "d5", warehouseId: "WH-BJ01", storeId: "ST-102", orderId: "SF2026020100005", deliveryType: "经济配送", promisedTime: 120, actualTime: 96, status: "达标" },
    { id: "d6", warehouseId: "WH-GZ01", storeId: "ST-201", orderId: "SF2026020100006", deliveryType: "次日达", promisedTime: 24, actualTime: 32, status: "超时" },
    { id: "d7", warehouseId: "WH-GZ01", storeId: "ST-202", orderId: "SF2026020100007", deliveryType: "标准配送", promisedTime: 72, actualTime: 65, status: "达标" },
    { id: "d8", warehouseId: "WH-CD01", storeId: "ST-301", orderId: "SF2026020100008", deliveryType: "次日达", promisedTime: 24, actualTime: 20, status: "达标" },
  ],
  rowCount: 1048523,
}

const logisticsResultTable: TableDef = {
  id: "tbl-log-result",
  name: "物流时效分析结论表",
  type: "result",
  description: "2026年2月物流时效分析结论表",
  columns: [
    { key: "rank", label: "排名", type: "number", sortable: true, align: "left" },
    { key: "warehouse", label: "仓库", type: "text", align: "left" },
    { key: "region", label: "区域", type: "text", align: "left" },
    { key: "totalOrders", label: "总订单", type: "number", sortable: true, align: "right" },
    { key: "onTimeOrders", label: "按时送达", type: "number", align: "right" },
    { key: "onTimeRate", label: "达标率", type: "percent", sortable: true, drillable: true, align: "right", isGenerated: true, appliedRuleIds: ["rule-log-1"] },
    { key: "avgDeliveryTime", label: "平均耗时", type: "number", sortable: true, align: "right" },
  ],
  data: [
    { id: "wh1", rank: 1, warehouse: "华东仓", region: "上海", totalOrders: 12580, onTimeOrders: 12077, onTimeRate: 0.96, avgDeliveryTime: 18.5 },
    { id: "wh2", rank: 2, warehouse: "华南仓", region: "深圳", totalOrders: 9860, onTimeOrders: 9366, onTimeRate: 0.95, avgDeliveryTime: 20.2 },
    { id: "wh3", rank: 3, warehouse: "华北仓", region: "北京", totalOrders: 8920, onTimeOrders: 8384, onTimeRate: 0.94, avgDeliveryTime: 21.8 },
    { id: "wh4", rank: 4, warehouse: "西南仓", region: "成都", totalOrders: 6750, onTimeOrders: 6210, onTimeRate: 0.92, avgDeliveryTime: 24.5 },
    { id: "wh5", rank: 5, warehouse: "东北仓", region: "大连", totalOrders: 5230, onTimeOrders: 4654, onTimeRate: 0.89, avgDeliveryTime: 28.6 },
    { id: "wh6", rank: 6, warehouse: "西北仓", region: "西安", totalOrders: 5183, onTimeOrders: 4458, onTimeRate: 0.86, avgDeliveryTime: 32.1 },
  ],
  sourceStepId: "step-log-5",
  rowCount: 6,
}

const logisticsBuildSteps: BuildStep[] = [
  { id: "step-log-1", order: 1, type: "import", title: "导入底表", description: "导入 delivery_records_202602.xlsx，共 48,523 条配送记录", status: "done", inputTableIds: [], appliedRuleIds: [], userDecision: "accepted" },
  { id: "step-log-2", order: 2, type: "recognize", title: "AI 识别数据结构", description: "AI 识别仓库、门店、运单、时效等字段", status: "done", inputTableIds: ["tbl-log-base"], appliedRuleIds: [], userDecision: "accepted" },
  { id: "step-log-3", order: 3, type: "goal", title: "定义分析目标", description: "分析各仓库的配送时效达标率", status: "done", inputTableIds: ["tbl-log-base"], appliedRuleIds: [], userDecision: "accepted" },
  { id: "step-log-4", order: 4, type: "rules", title: "引入规则文档", description: "上传物流时效考核标准", status: "done", inputTableIds: ["tbl-log-base"], appliedRuleIds: ["rule-log-1"], userDecision: "accepted" },
  { id: "step-log-5", order: 5, type: "execute", title: "执行构建", description: "计算各仓库达标率，生成分析结论表", status: "done", inputTableIds: ["tbl-log-base"], outputTableId: "tbl-log-result", appliedRuleIds: ["rule-log-1"], userDecision: "accepted" },
]

const logisticsDrilldown: Record<string, DrilldownNode> = {
  wh1: {
    id: "wh1", label: "华东仓", levelLabel: "仓库", levelIcon: "Warehouse",
    aiSummary: "华东仓本月总配送 12,580 单，按时送达 12,077 单，达标率 96.0%，平均配送耗时 18.5 小时，为全国最优。",
    appliedRules: logisticsRules,
    values: [
      { key: "totalOrders", label: "总订单", value: 12580, format: "number" },
      { key: "onTimeOrders", label: "按时送达", value: 12077, format: "number" },
      { key: "onTimeRate", label: "达标率", value: 0.96, format: "percent", highlight: true },
      { key: "avgTime", label: "平均耗时", value: 18.5, format: "number" },
    ],
    childrenLabel: "门店明细（Top 3）",
    children: [
      {
        id: "store-1", label: "上海徐汇店", levelLabel: "门店", levelIcon: "Store",
        aiSummary: "上海徐汇店月配送 1,850 单，达标率 98.2%，平均耗时 15.2 小时。",
        values: [
          { key: "totalOrders", label: "总订单", value: 1850, format: "number" },
          { key: "onTimeRate", label: "达标率", value: 0.982, format: "percent", highlight: true },
          { key: "avgTime", label: "平均耗时", value: 15.2, format: "number" },
        ],
        childrenLabel: "配送批次明细",
        children: [
          {
            id: "batch-1", label: "次日达批次", levelLabel: "配送类型", levelIcon: "Truck",
            aiSummary: "次日达批次 680 单，全部在 24 小时内送达，达标率 100%。",
            formula: "680 单 / 680 单 = 100%",
            formulaLabel: "按时送达 / 总订单 = 达标率",
            appliedRules: logisticsRules,
            values: [
              { key: "total", label: "总订单", value: 680, format: "number" },
              { key: "onTime", label: "按时送达", value: 680, format: "number" },
              { key: "rate", label: "达标率", value: 1.0, format: "percent", highlight: true },
            ],
          },
        ],
      },
      {
        id: "store-2", label: "上海浦东店", levelLabel: "门店", levelIcon: "Store",
        aiSummary: "上海浦东店月配送 1,620 单，达标率 97.5%，平均耗时 16.8 小时。",
        values: [
          { key: "totalOrders", label: "总订单", value: 1620, format: "number" },
          { key: "onTimeRate", label: "达标率", value: 0.975, format: "percent", highlight: true },
          { key: "avgTime", label: "平均耗时", value: 16.8, format: "number" },
        ],
      },
    ],
  },
  wh6: {
    id: "wh6", label: "西北仓", levelLabel: "仓库", levelIcon: "Warehouse",
    aiSummary: "西北仓本月总配送 5,183 单，按时送达 4,458 单，达标率 86.0%，平均配送耗时 32.1 小时，需要关注并改进。",
    appliedRules: logisticsRules,
    values: [
      { key: "totalOrders", label: "总订单", value: 5183, format: "number" },
      { key: "onTimeOrders", label: "按时送达", value: 4458, format: "number" },
      { key: "onTimeRate", label: "达标率", value: 0.86, format: "percent", highlight: true },
      { key: "avgTime", label: "平均耗时", value: 32.1, format: "number" },
    ],
    childrenLabel: "门店明细",
    children: [
      {
        id: "store-xn1", label: "西安高新店", levelLabel: "门店", levelIcon: "Store",
        aiSummary: "西安高新店月配送 980 单，达标率 82.5%，是该仓库达标率最低的门店。",
        values: [
          { key: "totalOrders", label: "总订单", value: 980, format: "number" },
          { key: "onTimeRate", label: "达标率", value: 0.825, format: "percent", highlight: true },
        ],
      },
    ],
  },
}

const logisticsProject = createDemoProject(
  "proj-logistics",
  "物流时效分析",
  "分析各仓库和门店的配送时效达标情况",
  logisticsBaseTable,
  logisticsResultTable,
  [],
  logisticsRuleDocuments,
  {
    description: "分析各仓库的配送时效达标率，找出需要改进的环节",
    entities: ["仓库", "门店", "运单", "配送类型"],
    targetMetrics: ["达标率", "平均耗时"],
    confirmed: true,
  },
  logisticsBuildSteps
)

const logisticsScenario: ScenarioConfig = {
  id: "logistics-timeliness",
  name: "物流时效分析",
  description: "分析各仓库和门店的配送时效达标情况",
  icon: "Truck",
  project: logisticsProject,
  drilldownData: logisticsDrilldown,
}

// =============== Export All Scenarios ===============

export const scenarios: ScenarioConfig[] = [
  bonusScenario,
  commissionScenario,
  logisticsScenario,
]

// Helper to get drilldown node, with fallback to default generator
export function getDrilldownNode(
  scenario: ScenarioConfig,
  rowId: string,
  row?: Record<string, unknown>
): DrilldownNode | null {
  const existing = scenario.drilldownData[rowId]
  if (existing) return existing
  
  // Generate default drilldown for bonus scenario
  if (scenario.id === "sales-bonus" && row) {
    return generateDefaultBonusDrilldown(row)
  }
  
  // Generate default drilldown for commission scenario
  if (scenario.id === "live-commission" && row) {
    return generateDefaultCommissionDrilldown(row)
  }
  
  // Generate default drilldown for logistics scenario
  if (scenario.id === "logistics-timeliness" && row) {
    return generateDefaultLogisticsDrilldown(row)
  }
  
  return null
}

function generateDefaultCommissionDrilldown(row: Record<string, unknown>): DrilldownNode {
  return {
    id: String(row.id),
    label: String(row.name),
    levelLabel: "达人",
    levelIcon: "Video",
    aiSummary: `${row.name} 本期共进行 ${row.liveCount} 场直播，总 GMV ${((row.gmv as number) / 10000).toFixed(2)} 万，有效 GMV ${((row.effectiveGmv as number) / 10000).toFixed(2)} 万，按 ${row.level} 级 ${((row.commissionRate as number) * 100).toFixed(1)}% 分佣比例，总分佣 ${((row.commission as number) / 10000).toFixed(2)} 万。`,
    appliedRules: commissionRules,
    values: [
      { key: "gmv", label: "带货 GMV", value: row.gmv as number, format: "currency" },
      { key: "effectiveGmv", label: "有效 GMV", value: row.effectiveGmv as number, format: "currency" },
      { key: "rate", label: "分佣比例", value: row.commissionRate as number, format: "percent" },
      { key: "commission", label: "分佣金额", value: row.commission as number, format: "currency", highlight: true },
    ],
  }
}

function generateDefaultLogisticsDrilldown(row: Record<string, unknown>): DrilldownNode {
  return {
    id: String(row.id),
    label: String(row.warehouse),
    levelLabel: "仓库",
    levelIcon: "Warehouse",
    aiSummary: `${row.warehouse} 本月总配送 ${(row.totalOrders as number).toLocaleString()} 单，按时送达 ${(row.onTimeOrders as number).toLocaleString()} 单，达标率 ${((row.onTimeRate as number) * 100).toFixed(1)}%，平均配送耗时 ${row.avgDeliveryTime} 小时。`,
    appliedRules: logisticsRules,
    values: [
      { key: "totalOrders", label: "总订单", value: row.totalOrders as number, format: "number" },
      { key: "onTimeOrders", label: "按时送达", value: row.onTimeOrders as number, format: "number" },
      { key: "onTimeRate", label: "达标率", value: row.onTimeRate as number, format: "percent", highlight: true },
      { key: "avgTime", label: "平均耗时", value: row.avgDeliveryTime as number, format: "number" },
    ],
  }
}
