import type { DrilldownNode } from "./types"
import { formatFieldValue } from "./format-utils"

// ===== 节点类型判定 =====

export function isLeafNode(node: DrilldownNode): boolean {
  return !node.children || node.children.length === 0
}

// ===== 非叶子节点 Prompt =====

const BRANCH_SYSTEM_PROMPT = `你是企业数据分析平台的 AI 解读引擎。用户提供一个数据节点的结构化信息，你需要生成简明的分析摘要。

风格要求：
- 采用数据分析报告的书面语体，简练、精准、克制
- 读者是 B 端业务人员，熟悉本业务领域的基本概念和指标含义，无需解释常识
- 用数字说话：关键指标须带数值，涉及构成时给出占比
- 先总后分：先陈述该节点的核心结论指标，再说明构成或归因
- 如有规则影响结果，简要点明规则名称和生效条件，不要展开解释规则的含义
- 控制在 3-5 句话，每句话都应传递新信息，杜绝冗余和重复
- 直接输出分析文本，禁止任何开场白、标题、序号`

function buildBranchUserPrompt(node: DrilldownNode): string {
  const parts: string[] = []

  // 基本信息
  parts.push(`当前节点：`)
  parts.push(`  维度：${node.levelLabel}`)
  parts.push(`  名称：${node.label}`)

  // 指标
  parts.push(`  指标：`)
  for (const v of node.values) {
    const formatted = formatFieldValue(v)
    const tag = v.highlight ? "（核心结论指标）" : ""
    parts.push(`    - ${v.label}: ${formatted}${tag}`)
  }

  // 子节点摘要
  if (node.children && node.children.length > 0) {
    const childLevel = node.children[0].levelLabel
    parts.push("")
    parts.push(`${node.childrenLabel ?? `子节点（${node.children.length} 个${childLevel}）`}：`)
    for (const child of node.children) {
      const highlightField = child.values.find((v) => v.highlight) ?? child.values[0]
      const keyValue = highlightField
        ? `${highlightField.label} ${formatFieldValue(highlightField)}`
        : ""
      parts.push(`  - ${child.label}（${child.levelLabel}）：${keyValue}`)
    }
  }

  // 规则
  if (node.appliedRules && node.appliedRules.length > 0) {
    parts.push("")
    parts.push(`应用的规则：`)
    for (const rule of node.appliedRules) {
      parts.push(`  - ${rule.name}：${rule.description}`)
      if (rule.formula) parts.push(`    公式：${rule.formula}`)
      if (rule.conditions) parts.push(`    条件：${rule.conditions}`)
    }
  }

  // 数据血缘
  if (node.lineage) {
    parts.push("")
    parts.push(`数据血缘：`)
    const sources = node.lineage.sourceColumns
      .map((s) => `${s.tableName}.${s.columnLabel}`)
      .join("、")
    parts.push(`  来源：${sources}`)
    if (node.lineage.transformations.length > 0) {
      parts.push(`  计算步骤：`)
      for (const t of node.lineage.transformations) {
        parts.push(`    - ${t.stepTitle}：${t.description}`)
      }
    }
  }

  return parts.join("\n")
}

// ===== 叶子节点 Prompt =====

const LEAF_SYSTEM_PROMPT = `你是企业数据分析平台的 AI 解读引擎。用户提供一个最细粒度的数据节点，含具体计算公式和适用规则，你需要生成简明的计算说明。

风格要求：
- 采用数据分析报告的书面语体，简练、精准、克制
- 读者是 B 端业务人员，熟悉本业务领域的基本概念，无需解释常识
- 陈述原始数据 → 点明适用规则及生效条件 → 展示公式代入结果，一气呵成
- 控制在 2-3 句话，杜绝冗余和重复
- 直接输出分析文本，禁止任何开场白、标题、序号`

function buildLeafUserPrompt(node: DrilldownNode): string {
  const parts: string[] = []

  // 基本信息
  parts.push(`当前节点：`)
  parts.push(`  维度：${node.levelLabel}`)
  parts.push(`  名称：${node.label}`)

  // 指标
  parts.push(`  指标：`)
  for (const v of node.values) {
    const formatted = formatFieldValue(v)
    const tag = v.highlight ? "（核心结论指标）" : ""
    parts.push(`    - ${v.label}: ${formatted}${tag}`)
  }

  // 计算公式
  if (node.formula && node.formulaLabel) {
    parts.push("")
    parts.push(`计算公式：`)
    parts.push(`  ${node.formulaLabel}`)
    parts.push(`  ${node.formula}`)
  }

  // 规则（叶子节点带规则原文）
  if (node.appliedRules && node.appliedRules.length > 0) {
    parts.push("")
    parts.push(`应用的规则：`)
    for (const rule of node.appliedRules) {
      parts.push(`  - ${rule.name}：${rule.description}`)
      if (rule.sourceText) parts.push(`    规则原文：${rule.sourceText}`)
      if (rule.conditions) parts.push(`    条件：${rule.conditions}`)
    }
  }

  return parts.join("\n")
}

// ===== 统一入口 =====

export interface PromptPair {
  systemPrompt: string
  userPrompt: string
}

export function buildPrompt(node: DrilldownNode): PromptPair {
  if (isLeafNode(node)) {
    return {
      systemPrompt: LEAF_SYSTEM_PROMPT,
      userPrompt: buildLeafUserPrompt(node),
    }
  }
  return {
    systemPrompt: BRANCH_SYSTEM_PROMPT,
    userPrompt: buildBranchUserPrompt(node),
  }
}
