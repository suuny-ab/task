# DataLens AI - 项目分析文档

## 一、项目目标

### 1.1 业务背景

公司每个月或每年需要为销售计算奖金。当前流程存在以下痛点：

**现状问题：**
- BI 工程师需要根据数仓里的原始底表（几百万行、几十列）进行初步计算，耗时约 1 人天
- 之后需要花 3-4 天与不同部门的销售 Leader 核对数据，确认业绩是否符合预期
- 大部分时间消耗在回答"数据合理性"问题上

**典型场景：**
> Leader 觉得张三拿 10 万奖金多了，想看原因。通过分析发现张三有几十个客户，按消费额排序看前十名，发现大客户收入确实高，符合预期。但如果发现第一个客户的贡献过高，Leader 可能想继续下钻：这个客户的钱花在了哪些产品上？每个产品贡献了多少奖金？

### 1.2 解决方案

设计一个分两阶段的 AI 应用：

**阶段一：AI 辅助数据分析**
- 目标用户：BI 工程师
- 输入：原始底表（几百万行、几十列）+ 计算规则文档
- 输出：结论表（约 100 行、10 列，显示每个销售的应发奖金）
- 核心价值：将原本 1 人天的工作缩短到 30 分钟

**阶段二：AI 自主数据解读**
- 目标用户：销售 Leader、HR 等非技术人员
- 核心能力：当用户看到结论表并想分析数据高低的逻辑时，AI 根据底表到结论表的生成逻辑进行一层层拆解

### 1.3 核心交互设计

**递归式下钻解读：**
1. 业务主管选中某个销售的奖金数字，旁边出现 AI 问号按钮
2. 点击后，AI 自动对数字进行解读，告知计算来源（由哪些客户构成、Top 10 客户是谁）
3. 如果对二级数据（如第一个客户的消费额）仍有疑问，可以继续点击旁边的 AI 按钮，AI 会进一步下钻解读
4. 这是一种递归式的调用，直到最底层的计算公式

**下钻层级示例（销售奖金场景）：**
```
销售（张三，奖金 10 万）
  ↓ 点击下钻
客户明细（Top 10 客户，客户 A 贡献 3 万）
  ↓ 点击下钻  
产品明细（云服务器 58 万消费，系数 1.0）
  ↓ 点击下钻
计算公式（58 万 × 1.0 = 58 万有效业绩）
```

### 1.4 项目愿景

> 让懂数据的 BI 工程师在半小时内完成从底表到结论表的构建，并将后续的数据解读工作全部交给 AI。这样，不懂技术的业务人员也可以直接通过问 AI 的方式，了解数据的全貌。

---

## 二、业务流程

整个应用分为两大阶段，对应两类用户角色和两种使用模式。

### 阶段一：构建流程（Building Mode）

**角色：** BI 工程师
**目标：** 从原始底表 + 计算规则 → 生成结论表（约 100 行 × 10 列）
**核心价值：** 将原本 1 人天的工作缩短到 30 分钟

```
┌──────────────────────────────────────────────────────────────┐
│                     构建流程总览                              │
│                                                              │
│  ① 创建项目                                                  │
│       ↓                                                      │
│  ② 上传底表 → Excel 解析 → 数据预览                          │
│       ↓                                                      │
│  ③ AI 识别数据结构 → 用户确认/调整                            │
│       ↓                                                      │
│  ④ 定义分析目标 → AI 理解意图 → 用户确认                      │
│       ↓                                                      │
│  ⑤ 引入规则文档 → AI 提取规则 → 映射到列 → 用户确认           │
│       ↓                                                      │
│  ⑥ 定义结论表结构 → AI 建议字段 → 用户确认                    │
│       ↓                                                      │
│  ⑦ AI 生成构建计划 → 展示计算 DAG → 用户确认                  │
│       ↓                                                      │
│  ⑧ 执行构建 → 生成中间表 + 结论表 → 交付                      │
└──────────────────────────────────────────────────────────────┘
```

#### Step 1：创建项目

- 用户点击「新建项目」按钮
- 输入项目名称和描述（如"2026年Q1销售奖金核算"）
- 系统创建空白项目，进入构建向导

#### Step 2：上传底表

- **用户操作：** 上传 Excel 文件（原始底表，可能几百万行、几十列）
- **系统处理：**
  - 解析 Excel 文件，提取所有列名
  - 识别每列的数据类型（文本/数字/日期/货币等）
  - 统计总行数、列数
  - 提取前 N 行作为预览数据
- **界面展示：**
  - 显示文件信息（文件名、大小、行数、列数）
  - 数据预览表格（前 20 行）
  - 列信息概览（列名 + 推断类型）
- **对应组件：** `BuilderWizard` → Step "import"
- **当前状态：** ❌ Mock（只保存文件名，不解析内容）

#### Step 3：AI 识别数据结构

- **系统处理：** 将列名 + 样本数据发送给 LLM
- **AI 输出：**
  - 每列的业务含义（如 `revenue` → "消费金额"，`product` → "产品名称"）
  - 每列的数据类型确认或修正
  - 识别维度列（分组依据）和指标列（需要计算的数值）
- **用户操作：** 确认 AI 的识别结果，可手动修正
- **对应组件：** `BuilderWizard` → Step "recognize"
- **当前状态：** ❌ Mock（硬编码列名列表）

#### Step 4：定义分析目标

- **用户操作：** 用自然语言描述目标
  - 例："计算每个销售人员的季度应发奖金"
- **AI 处理：**
  - 理解用户意图
  - 提取关键实体（销售人员、客户、产品、交易金额）
  - 提取目标指标（有效业绩、奖金比例、应发奖金）
- **用户操作：** 确认 AI 理解是否正确
- **对应组件：** `BuilderWizard` → Step "goal_and_result" 的前半部分
- **当前状态：** ❌ Mock（硬编码分析目标）

#### Step 5：引入规则文档

- **用户操作：** 上传规则文档（Word/PDF）或直接文本输入
  - 例：上传《2026年Q1销售奖金计算规则.docx》
- **AI 处理：**
  - 解析文档内容
  - 提取结构化规则（规则名、描述、公式、条件）
  - 将规则映射到底表的列（如"产品系数规则"映射到 `product_name` 和 `revenue` 列）
- **用户操作：** 确认提取的规则是否正确，可手动修正
- **数据结构：** 对应 `Rule` 类型（含 `formula`、`conditions`、`matchedBaseColumns`）
- **对应组件：** `BuilderWizard` → Step "rules"
- **当前状态：** ❌ Mock（硬编码规则）

#### Step 6：定义结论表结构

- **AI 处理：** 根据分析目标 + 规则，建议结论表包含哪些字段
  - 原始字段：排名、姓名、部门、区域（直接来自底表）
  - 生成字段：总营收（聚合）、有效业绩（规则计算）、奖金比例（规则计算）、应发奖金（规则计算）
- **关键信息：** 每个生成字段需要记录
  - `sourceColumns`：来源列
  - `appliedRuleIds`：使用了哪些规则
  - `formula` / `formulaDescription`：计算公式
  - `drillable`：是否支持下钻
- **用户操作：** 确认或调整字段定义
- **对应组件：** `BuilderWizard` → Step "goal_and_result" 的后半部分
- **当前状态：** ❌ Mock（硬编码结论表结构）

#### Step 7：AI 生成构建计划

- **AI 处理：** 规划从底表到结论表的计算步骤
  - 步骤 1：关联产品系数，计算每笔交易的有效业绩
  - 步骤 2：按销售人员汇总有效业绩
  - 步骤 3：根据业绩档位确定奖金比例
  - 步骤 4：计算应发奖金，生成排名
- **界面展示：** 展示计算 DAG（有向无环图），显示数据流向
- **用户操作：** 确认计划或调整步骤
- **对应组件：** `BuilderWizard` → Step "generate_plan" + `WorkflowCanvas`
- **当前状态：** ❌ Mock（硬编码计划步骤）

#### Step 8：执行构建

- **系统处理：**
  - 按计划逐步执行计算
  - 每步生成中间结果（如"有效业绩折算表"）
  - 最终生成结论表
- **界面展示：**
  - 执行进度条
  - 每步的执行状态和产出
  - 最终结论表预览
- **数据记录：** 保存完整的计算链路（用于阶段二的下钻解读）
  - 底表 → 中间表 → 结论表的映射关系
  - 每个字段的计算血缘（`DataLineage`）
- **对应组件：** `BuilderWizard` → Step "execute"
- **当前状态：** ❌ Mock（直接返回硬编码结果）

---

### 阶段二：解读流程（Reading Mode）

**角色：** 销售 Leader、HR 等非技术人员
**目标：** 理解结论表中每个数字的来源和合理性
**核心价值：** 业务人员无需依赖 BI，自助完成数据核查

```
┌──────────────────────────────────────────────────────────────┐
│                     解读流程总览                              │
│                                                              │
│  ① 查看结论表 → 发现疑问数字                                 │
│       ↓                                                      │
│  ② 点击 AI 下钻按钮 → 打开解读面板                           │
│       ↓                                                      │
│  ③ AI 生成一级解读                                            │
│     （总营收、有效业绩、奖金比例、客户 Top N）                │
│       ↓                                                      │
│  ④ 继续下钻 → AI 生成二级解读                                │
│     （某客户的产品消费明细）                                  │
│       ↓                                                      │
│  ⑤ 继续下钻 → AI 生成三级解读                                │
│     （具体产品的计算公式：消费额 × 系数 = 有效业绩）          │
│       ↓                                                      │
│  ⑥ 发现问题 → 切换到构建模式 → 调整规则 → 重新计算           │
└──────────────────────────────────────────────────────────────┘
```

#### Step 1：查看结论表

- **用户操作：** 选择已完成的项目，进入解读模式
- **界面展示：**
  - 结论表（排名、姓名、部门、总营收、有效业绩、奖金比例、应发奖金）
  - 带有 AI 标记（Sparkles 图标）的可下钻字段
  - 支持排序、分页
- **对应组件：** `TableViewer` + `ResultTable`
- **当前状态：** ✅ UI 完整（数据硬编码）

#### Step 2：触发下钻

- **用户操作：** 点击结论表中某一行（如"张三，奖金 11.30 万"）
- **系统响应：**
  - 高亮选中行
  - 右侧打开 AI 下钻面板
- **对应组件：** `ResultTable` → `onDrillRow` → `AIDrilldownPanel`
- **当前状态：** ✅ UI 完整

#### Step 3：一级解读（销售维度）

- **AI 输出：**
  - 文字解读："张三本期总营收 528 万，经产品系数折算后有效业绩 452 万，按 2.5% 的奖金比例，最终应发奖金 11.30 万"
  - 关键指标卡片：总营收、有效业绩、奖金比例、应发奖金
  - 客户贡献明细（Top N 列表，每个客户可继续下钻）
  - 计算来源（数据血缘）：显示数据从哪张表的哪个字段经过哪些计算步骤得来
  - 规则依据：显示应用了哪些规则（产品系数规则、奖金比例规则）
- **数据结构：** `DrilldownNode`（含 `aiSummary`、`values`、`children`、`lineage`、`appliedRules`）
- **对应组件：** `AIDrilldownPanel` → 根节点
- **当前状态：** ✅ UI 完整（aiSummary 硬编码，需 LLM 动态生成）

#### Step 4：二级解读（客户维度）

- **用户操作：** 点击某个客户（如"上海云途科技有限公司，贡献奖金 3.30 万"）
- **AI 输出：**
  - 文字解读："该客户消费总额 158 万，经不同产品系数折算后有效业绩 132 万"
  - 客户指标：消费总额、有效业绩、奖金贡献、占比
  - 产品消费明细（每个产品可继续下钻）
- **数据结构：** `DrilldownNode.children[i]`
- **当前状态：** ✅ UI 完整（数据硬编码，需从底表动态聚合）

#### Step 5：三级解读（产品维度 / 叶子节点）

- **用户操作：** 点击某个产品（如"云服务器 ECS，消费 58 万"）
- **AI 输出：**
  - 文字解读："云服务器 ECS 消费 58 万，产品系数 1.0，折算后有效业绩 58 万"
  - 计算公式展示：`58 万 × 1.0 = 58 万`
  - 规则引用：显示产品系数规则原文
- **数据结构：** `DrilldownNode`（含 `formula`、`formulaLabel`、`appliedRules`）
- **当前状态：** ✅ UI 完整（数据硬编码，需从底表动态查询）

#### Step 6：调整与迭代

- **用户操作：** 如果发现规则有误或需要调整，点击"调整规则"
- **系统响应：** 切换回构建模式，定位到规则编辑步骤
- **调整后：** 重新执行构建，生成新的结论表
- **对应组件：** `AIDrilldownPanel` → `onAdjustRule` → 切换到 building mode
- **当前状态：** ✅ UI 入口完整（调整逻辑未实现）

---

### 交互模式总结

```
┌─────────────┐     切换模式      ┌─────────────┐
│             │ ───────────────→ │             │
│  构建模式    │                   │  解读模式    │
│ (Building)  │ ←─────────────── │ (Reading)   │
│             │    调整规则        │             │
└─────────────┘                   └─────────────┘
     │                                   │
     │ 左侧：数据资产面板                 │ 左侧：数据资产面板
     │ 中间：构建向导 / 工作流画布         │ 中间：结论表查看器
     │ 右侧：AI 对话面板                  │ 右侧：AI 下钻解读面板
     │                                   │
     ↓                                   ↓
  输出：结论表 + 计算血缘            输入：结论表 + 计算血缘
```

### 数据流转关系

```
底表（Excel 上传）
  │
  ├── 列定义（AI 识别）
  ├── 规则文档（AI 提取）
  ├── 分析目标（用户定义）
  │
  ↓ 构建计划（AI 生成）
  │
  ├── 中间表 1（如：有效业绩折算表）
  ├── 中间表 2（如有需要）
  │
  ↓ 执行计算
  │
  结论表（最终交付）
  │
  ↓ 下钻解读（AI 驱动）
  │
  ├── Level 1：按销售汇总（从结论表聚合）
  ├── Level 2：按客户拆分（从中间表/底表聚合）
  ├── Level 3：按产品拆分（从底表查询）
  └── Level N：计算公式（规则原文）
```

---

## 三、完整功能 vs 当前实现

### 阶段一：构建流程（对应业务流程 Step 2 - Step 8）

| 功能 | 完整实现 | 当前实现 |
|------|---------|---------|
| **上传底表** | 解析 Excel 内容，提取列名和数据 | ❌ Mock：只保存文件名 |
| **数据预览** | 显示真实的前 N 行数据 | ❌ Mock：硬编码假数据 |
| **AI 识别列** | AI 分析列类型和业务含义 | ❌ Mock：硬编码列名列表 |
| **上传规则** | 解析文档，提取计算规则 | ❌ Mock：硬编码规则 |
| **AI 理解规则** | AI 理解规则逻辑并关联到列 | ❌ Mock：硬编码关联 |
| **生成构建计划** | AI 规划计算步骤 | ❌ Mock：硬编码步骤 |
| **执行计算** | 真正执行计算生成结论表 | ❌ Mock：直接返回假数据 |

### 阶段二：解读流程

| 功能 | 完整实现 | 当前实现 |
|------|---------|---------|
| **结论表展示** | 显示计算结果 | ✅ Mock：硬编码数据，UI 完整 |
| **点击触发下钻** | 点击任意行触发 AI 解读 | ✅ Mock：UI 完整 |
| **AI 解读文案** | LLM 根据数据动态生成 | ❌ Mock：硬编码文案 |
| **递归下钻** | 动态计算下钻树结构 | ❌ Mock：硬编码树结构 |
| **计算来源展示** | 显示数据血缘 | ✅ Mock：UI 完整，数据硬编码 |
| **规则依据展示** | 显示应用的规则 | ✅ Mock：UI 完整，数据硬编码 |

### 通用功能

| 功能 | 完整实现 | 当前实现 |
|------|---------|---------|
| **场景切换** | 多项目/场景支持 | ✅ 完整：3 个 demo 场景 |
| **模式切换** | 构建/解读模式 | ✅ 完整 |
| **响应式布局** | 适配不同屏幕 | ✅ 完整 |
| **数据持久化** | 保存到数据库 | ❌ 无：纯前端状态 |
| **用户认证** | 登录/权限 | ❌ 无 |

---

## 四、功能选择与实现决策

### 4.1 背景约束

- 求职面试任务，面试官提供 UI 原型，要求自选未完成功能进行实现
- 应聘岗位：**AI 应用工程师**
- 时间限制：**1 天**
- 部署目标：面试官的 Vercel 服务器

### 4.2 选择实现的功能：AI 下钻解读接入 LLM（P0）

**选择理由：**

1. **与岗位最匹配**：AI 应用工程师的核心能力是 LLM 集成、Prompt 设计、AI 产品交互。AI 下钻解读正是整个产品最核心的 AI 功能，直接展示这些能力。
2. **展示效果最直观**：面试官打开页面，点击结论表中任意一行，右侧面板 AI 实时流式生成解读文案（替代原来的硬编码文字）。无需解释，效果一目了然。
3. **通用性设计**：本应用不限于奖金核算，适用于任何"底表 → 结论表 → 逐层下钻解读"的场景（直播分佣、物流时效等）。Prompt 设计基于数据结构本身（维度、指标、子节点、规则、公式），不绑定任何具体业务语义，AI 通过读取数据自行推断场景。
4. **改动可控**：保留原有的 Mock 数据结构（values、children、rules），仅将硬编码的 `aiSummary` 替换为 LLM 实时生成。改动集中、风险低，1 天内可完成。

**不选择的功能及理由：**

| 功能 | 不选理由 |
|------|---------|
| Excel 解析 | 偏基础设施，与 AI 岗位关联弱，展示价值低 |
| 数据库持久化 | 不是 AI 能力，1 天内做不精 |
| 动态计算引擎 | 工作量大，需实现完整计算逻辑，超出时间 |
| 用户认证 | 与岗位完全无关 |

### 4.3 实现方案：方案 A（替换 aiSummary 生成方式）

**方案说明：**
- `values`、`children`、`rules` 等下钻树数据保持原有 Mock 结构不变
- 仅将 `aiSummary`（当前硬编码的解读文案）改为实时调用 LLM 流式生成
- 前端展示真实的流式打字效果（非本地模拟）

**未采纳的方案 B：**
- 连数据结构（子节点、指标值）也由 LLM 动态生成
- 理由：LLM 生成结构化数据容易出错，1 天内做不稳定，且收益不大

### 4.4 技术选型

- LLM 服务：**DeepSeek**（国内模型，API 兼容 OpenAI 格式，价格低，中文能力强）
- SDK：`openai` JS SDK（DeepSeek API 兼容 OpenAI 协议，可直接复用）
- 后端：Next.js API Route（与前端同项目，部署到 Vercel 自动变为 Serverless Function）
- 响应方式：流式（Streaming），避免用户等待空白，实现逐字输出效果

### 4.5 Prompt 设计方案

#### 设计思路

通过观察三个完整下钻树（张三/销售奖金、李佳琦/直播分佣、华东仓/物流时效），发现所有场景的 `aiSummary` 遵循共同模式：

- **Level 1-2（非叶子节点）：** 陈述核心指标 → 解释指标间计算关系 → 提及子节点构成概况
- **Level 3（叶子节点）：** 列出原始数据 → 引用规则/系数 → 展示计算结果

AI 不需要知道具体业务场景，只需根据节点数据中"有什么字段"来决定"说什么话"。

#### 方案选择：按节点类型分两个 Prompt 模板（方案 B）

**未采纳的方式 A（单一 Prompt）：**
- 一个 System Prompt 覆盖所有情况，让 AI 自己判断节点类型
- 缺点：AI 可能遗漏信息或格式不稳定

**采纳的方式 B（分类型模板）：**
- 代码中判断节点是否为叶子节点（`children` 是否存在且非空）
- 非叶子节点和叶子节点各使用独立的 Prompt 模板
- 优点：输出更稳定可控，每种模板可以精确引导 AI 关注该类型的重点信息

#### 通用设计原则

- **通用性**：Prompt 不包含任何具体业务场景词汇（不写"奖金"、"分佣"、"物流"），维度名称、指标名称全部来自数据本身
- **结构化输入**：将 DrilldownNode 的字段（label、levelLabel、values、children、formula、appliedRules、lineage）序列化为统一文本模板传入
- **区分节点类型**：非叶子节点侧重解读指标关系和子节点构成；叶子节点侧重解释计算公式和规则引用

#### 非叶子节点 Prompt 模板

**System Prompt：**
```
你是一个数据分析解读助手。用户会给你一个数据节点的结构化信息。
你的任务是用简洁的中文解读这个节点的数据含义。

要求：
1. 先陈述核心指标数据
2. 解释关键指标之间的计算关系（如果有规则信息）
3. 说明子节点的构成概况（谁贡献最多、占比如何）
4. 如果有异常值或值得注意的特征，主动指出
5. 面向非技术人员，避免术语
6. 简洁，控制在 3-5 句话
7. 直接陈述事实，不要用"让我来分析"之类的开场白
```

**User Prompt 数据模板：**
```
当前节点：
  维度：{levelLabel}
  名称：{label}
  指标：
    - {values[0].label}: {格式化后的值}
    - {values[1].label}: {格式化后的值}
    ...

子节点（{children.length} 个{children[0].levelLabel}）：
  - {child.label}: {child 的 highlight 值或首个值}
  - ...

应用的规则（如有）：
  - {rule.name}: {rule.description}
    公式: {rule.formula}
    条件: {rule.conditions}

数据血缘（如有）：
  来源表: {lineage.sourceColumns的描述}
  计算步骤: {lineage.transformations的描述}
```

#### 叶子节点 Prompt 模板

**System Prompt：**
```
你是一个数据分析解读助手。用户会给你一个最细粒度的数据节点信息，
包含具体的计算公式和应用的规则。

你的任务是用简洁的中文解释这个计算过程。

要求：
1. 列出原始数据
2. 说明应用了什么规则，引用规则原文
3. 展示计算公式的含义
4. 给出最终结果
5. 面向非技术人员，避免术语
6. 简洁，控制在 2-3 句话
7. 直接陈述事实，不要用"让我来分析"之类的开场白
```

**User Prompt 数据模板：**
```
当前节点：
  维度：{levelLabel}
  名称：{label}
  指标：
    - {values[0].label}: {格式化后的值}
    - ...

计算公式：
  {formulaLabel}: {formula}

应用的规则：
  - {rule.name}: {rule.description}
    规则原文: {rule.sourceText}
    条件: {rule.conditions}
```

### 4.6 AI 下钻解读流程与接口定义

#### 前置条件

下钻树（`DrilldownNode`）由前置的构建流程生成。当前原型中为硬编码 Mock，未来由构建阶段根据底表、中间表、结论表和规则自动生成。AI 下钻解读模块不关心树是怎么来的，只接收 `DrilldownNode` 作为输入。

#### 完整调用流程

```
用户在解读模式点击结论表某一行
      ↓
page.tsx: handleDrillRow(row)
      ↓
getDrilldownNode() 返回该行对应的 DrilldownNode
      ↓
前端拿到 DrilldownNode，展示 values / children / rules 等结构化数据
      ↓
同时，前端从 DrilldownNode 中提取 AI 所需字段
      ↓
判断节点类型：children 存在且非空 → branch，否则 → leaf
      ↓
调用 POST /api/drilldown，传入裁剪后的数据
      ↓
后端根据 nodeType 选择对应的 Prompt 模板
      ↓
组装 System Prompt + User Prompt
      ↓
调用 DeepSeek API（流式模式）
      ↓
流式返回文本，前端逐字渲染替代原来的硬编码 aiSummary
```

#### 输入数据结构：DrilldownNode（前置流程提供）

前置流程（构建阶段）需要为每个可下钻的结论表行生成如下结构的 `DrilldownNode`：

```typescript
// 来自 lib/types.ts，这是前置流程的输出、AI 解读的输入
interface DrilldownNode {
  id: string
  label: string                // 节点名称，如 "张三"、"华东仓"
  levelLabel: string           // 维度名称，如 "销售"、"仓库"
  levelIcon: string            // UI 图标名称

  values: DrilldownField[]     // 关键指标数组
  aiSummary: string            // ← 当前硬编码，将改为 AI 实时生成

  formula?: string             // 叶子节点：计算公式，如 "58.00 万 × 1.0 = 58.00 万"
  formulaLabel?: string        // 叶子节点：公式含义，如 "原始消费 × 产品系数 = 有效业绩"

  childrenLabel?: string       // 非叶子节点：子节点分组标题，如 "客户贡献明细（Top 5）"
  children?: DrilldownNode[]   // 非叶子节点：子节点数组

  lineage?: DataLineage        // 数据血缘（Level 1 可能有）
  appliedRules?: Rule[]        // 应用的计算规则
}

interface DrilldownField {
  key: string
  label: string                // 指标名称，如 "总营收"
  value: string | number       // 指标值，如 5280000
  format: "text" | "number" | "currency" | "percent" | "coefficient"
  highlight?: boolean          // 是否为核心结论指标
}

interface DataLineage {
  sourceColumns: {
    tableId: string
    tableName: string          // 来源表名，如 "销售业绩明细表"
    columnKey: string
    columnLabel: string        // 来源列名，如 "消费金额"
  }[]
  transformations: {
    stepId: string
    stepTitle: string          // 步骤名称，如 "系数折算"
    description: string        // 步骤描述
  }[]
}

interface Rule {
  id: string
  name: string                 // 规则名称，如 "产品系数规则"
  description: string          // 规则描述
  formula?: string             // 计算公式，如 "有效业绩 = 原始消费 × 产品系数"
  conditions?: string          // 条件，如 "云服务器 ECS: 1.0; 对象存储 OSS: 0.8"
  sourceText: string           // 规则原文
  // ... 其他字段 AI 解读不使用
}
```

#### 节点类型判定规则

```
if (node.children && node.children.length > 0) → branch（非叶子节点）
else → leaf（叶子节点）
```

#### API 接口：POST /api/drilldown

**请求结构：**

```typescript
interface DrilldownRequest {
  nodeType: "branch" | "leaf"
  node: BranchNodeInput | LeafNodeInput
}
```

**非叶子节点输入（branch）——前端从 DrilldownNode 中提取并裁剪：**

```typescript
interface BranchNodeInput {
  label: string                // ← DrilldownNode.label
  levelLabel: string           // ← DrilldownNode.levelLabel
  values: {                    // ← DrilldownNode.values，数值格式化为可读字符串
    label: string
    value: string              // 格式化后，如 "528.00 万"、"2.5%"
    highlight?: boolean
  }[]
  childrenLabel?: string       // ← DrilldownNode.childrenLabel
  childrenSummary?: {          // ← 从 DrilldownNode.children 裁剪，只保留摘要
    label: string              //    child.label
    levelLabel: string         //    child.levelLabel
    keyValue: string           //    child 中 highlight 字段的格式化值
  }[]
  rules?: {                    // ← DrilldownNode.appliedRules 裁剪
    name: string
    description: string
    formula?: string
    conditions?: string
  }[]
  lineage?: {                  // ← DrilldownNode.lineage 裁剪
    source: string             //    拼接为 "表名.列名" 格式
    steps: string[]            //    每个 transformation 的 "标题：描述"
  }
}
```

**叶子节点输入（leaf）——前端从 DrilldownNode 中提取：**

```typescript
interface LeafNodeInput {
  label: string                // ← DrilldownNode.label
  levelLabel: string           // ← DrilldownNode.levelLabel
  values: {                    // ← DrilldownNode.values，数值格式化为可读字符串
    label: string
    value: string
    highlight?: boolean
  }[]
  formula: string              // ← DrilldownNode.formula
  formulaLabel: string         // ← DrilldownNode.formulaLabel
  rules?: {                    // ← DrilldownNode.appliedRules 裁剪
    name: string
    description: string
    sourceText?: string        // 叶子节点带规则原文，用于 AI 引用
    conditions?: string
  }[]
}
```

**响应：流式文本**

```
Content-Type: text/event-stream
每个 chunk 为一段文本片段，前端逐步拼接渲染
```

#### 数据裁剪示例

以张三（非叶子节点）为例，展示从 `DrilldownNode` 到 `BranchNodeInput` 的裁剪过程：

```
DrilldownNode（前置流程提供，完整树）         BranchNodeInput（发给 API，裁剪后）
─────────────────────────────────         ──────────────────────────────────
id: "s1"                                  ×（不传）
label: "张三"                          →  label: "张三"
levelLabel: "销售"                     →  levelLabel: "销售"
levelIcon: "User"                         ×（不传，纯 UI）
aiSummary: "张三本期..."                  ×（不传，这是输出不是输入）
                                      
values: [                              →  values: [
  { key: "totalRevenue",                    { label: "总营收",
    label: "总营收",                          value: "528.00 万" },     ← 数值格式化
    value: 5280000,                         { label: "有效业绩",
    format: "currency" },                     value: "452.00 万" },
  ...                                       { label: "奖金比例",
]                                             value: "2.5%" },
                                            { label: "应发奖金",
                                              value: "11.30 万",
                                              highlight: true }
                                          ]

childrenLabel: "客户贡献明细（Top 5）"  →  childrenLabel: "客户贡献明细（Top 5）"
children: [                            →  childrenSummary: [
  { id: "c1-1",                             { label: "上海云途科技有限公司",
    label: "上海云途科技有限公司",               levelLabel: "客户",
    levelLabel: "客户",                        keyValue: "奖金贡献 3.30 万" },
    values: [...],                          { label: "杭州数联信息技术",
    children: [                               levelLabel: "客户",
      { 云服务器 ECS... },                     keyValue: "奖金贡献 2.13 万" },
      { 对象存储 OSS... },    ← 全部丢弃    { label: "苏州智算科技",
      { 云数据库 RDS... },                     levelLabel: "客户",
    ],                                        keyValue: "奖金贡献 1.55 万" }
    aiSummary: "...",         ← 丢弃      ]
  },
  ...
]

appliedRules: [                        →  rules: [
  { id: "rule-bonus-1",                    { name: "产品系数规则",
    name: "产品系数规则",                     description: "不同产品按不同系数折算有效业绩",
    description: "...",                      formula: "有效业绩 = 原始消费 × 产品系数",
    formula: "...",                          conditions: "云服务器 ECS: 1.0; ..." },
    conditions: "...",                     { name: "奖金比例规则",
    sourceDocId: "...",       ← 丢弃        description: "根据有效业绩分档确定奖金比例",
    sourceText: "...",        ← 丢弃        formula: "奖金 = 有效业绩 × 奖金比例",
    matchedBaseColumns: [...] ← 丢弃        conditions: "有效业绩 ≥ 400万: 2.5%; ..." }
    affectedColumns: [...]    ← 丢弃      ]
  },
  ...
]

lineage: {                             →  lineage: {
  sourceColumns: [{                        source: "销售业绩明细表.消费金额",
    tableId: "tbl-bonus-base",             steps: [
    tableName: "销售业绩明细表",               "系数折算：各产品消费按产品系数折算为有效业绩",
    columnKey: "revenue",                    "汇总计算：按销售人员汇总有效业绩，应用奖金比例规则"
    columnLabel: "消费金额"                 ]
  }],                                    }
  transformations: [{
    stepId: "step-bonus-4",   ← 丢弃
    stepTitle: "系数折算",
    description: "各产品消费按..."
  }, ...]
}
```

#### 裁剪原则总结

| 裁剪操作 | 原因 |
|---------|------|
| 去掉 `id`、`levelIcon` | 内部标识和 UI 字段，AI 不需要 |
| 去掉 `aiSummary` | 这是 AI 的输出，不是输入 |
| `values` 的数值预先格式化为字符串 | 避免 AI 自行格式化出错（如把 5280000 写成"五百二十八万"） |
| `children` 裁剪为 `childrenSummary` | AI 只需知道子节点概况，不需要完整嵌套树 |
| `appliedRules` 去掉 `id`、`sourceDocId`、`affectedColumns`、`matchedBaseColumns` | 内部关联字段，AI 不需要 |
| `lineage` 去掉 `tableId`、`stepId` | 内部标识，AI 只需要可读的描述文本 |
| 叶子节点的 `rules` 保留 `sourceText` | 叶子节点需要 AI 引用规则原文 |
| 非叶子节点的 `rules` 保留 `formula` | 非叶子节点需要 AI 解释宏观计算关系 |

### 当前状态一句话
> **UI 高保真原型，交互流程完整，但所有数据和 AI 能力都是硬编码 Mock。**

### 需要真正实现的核心能力
1. 文件解析（Excel 读取）
2. AI 能力（LLM 调用）
3. 数据计算（下钻树生成）

---

## 六、技术栈

- Next.js 16 / React 19 / TypeScript
- shadcn/ui / Tailwind CSS
- Lucide Icons

---

## 七、部署

- 平台：Vercel
- 状态：待部署
- URL：（部署后填写）
