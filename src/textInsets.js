import { getTextByPathList, numberToFixed } from './utils'
import { RATIO_EMUs_Points } from './constants'

/**
 * @description 默认内边距（EMU）
 * ref: https://ooxml.info/docs/21/21.1/21.1.2/21.1.2.1/21.1.2.1.1/
 */
const DEFAULT_INSET_EMU = {
  lIns: 91440, // 0.1 in
  rIns: 91440, // 0.1 in
  tIns: 45720, // 0.05 in
  bIns: 45720, // 0.05 in
}

/**
 * @description 按“当前节点 -> 布局占位符 -> 母版占位符”顺序获取某一侧 inset 原始值（EMU 字符串）
 * ref: https://learn.microsoft.com/en-us/openspecs/office_standards/ms-oe376/8b5c01b6-a623-4952-a8ab-e6a5177e47ec
 */
function pickInsetAttr(slideNode, layoutNode, masterNode, attrName) {
  let v = getTextByPathList(slideNode, ['p:txBody', 'a:bodyPr', 'attrs', attrName])
  if (v !== undefined && v !== null && v !== '') return v
  if (layoutNode) {
    v = getTextByPathList(layoutNode, ['p:txBody', 'a:bodyPr', 'attrs', attrName])
    if (v !== undefined && v !== null && v !== '') return v
  }
  if (masterNode) {
    v = getTextByPathList(masterNode, ['p:txBody', 'a:bodyPr', 'attrs', attrName])
  }
  return v
}

/**
 * @description 将 EMU 字符串转换为 pt（保留 numberToFixed 默认精度）
 */
function emuToPt(emuStr) {
  if (emuStr === undefined || emuStr === null || emuStr === '') return null
  const v = parseInt(emuStr, 10)
  if (!Number.isFinite(v)) return null
  return numberToFixed(v * RATIO_EMUs_Points)
}

/**
 * @description 读取文本框 a:bodyPr 四边距（lIns/tIns/rIns/bIns），并转换为 pt
 * 解析顺序：当前节点 -> layout -> master（逐边级联）
 */
export function getTextInsets(node, slideLayoutSpNode, slideMasterSpNode) {
  if (!node || !node['p:txBody']) return null

  const li = pickInsetAttr(node, slideLayoutSpNode, slideMasterSpNode, 'lIns') ?? DEFAULT_INSET_EMU.lIns
  const ti = pickInsetAttr(node, slideLayoutSpNode, slideMasterSpNode, 'tIns') ?? DEFAULT_INSET_EMU.tIns
  const ri = pickInsetAttr(node, slideLayoutSpNode, slideMasterSpNode, 'rIns') ?? DEFAULT_INSET_EMU.rIns
  const bi = pickInsetAttr(node, slideLayoutSpNode, slideMasterSpNode, 'bIns') ?? DEFAULT_INSET_EMU.bIns

  const l = emuToPt(li) ?? 0
  const t = emuToPt(ti) ?? 0
  const r = emuToPt(ri) ?? 0
  const b = emuToPt(bi) ?? 0

  return { l, t, r, b }
}
