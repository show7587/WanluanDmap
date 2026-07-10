/**
 * 驗證 public/data/roadHazards.json 的格式與內容。
 *
 * 這份 JSON 是正式站唯一的資料來源，而且維護流程允許手動編輯，
 * 所以在 CI（deploy 前）跑這個腳本，擋下打錯逗號、經緯度填反、
 * 類型打錯字、照片檔名不存在等會直接壞掉正式站的手誤。
 *
 * 用法：npm run validate:data（在 frontend/ 目錄下）
 */

import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { HAZARD_TYPES, SEVERITIES, STATUSES } from '../src/constants/hazards.js'

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = path.join(frontendRoot, 'public/data/roadHazards.json')
const picDir = path.join(frontendRoot, 'public/pic')

// 萬巒鄉周邊的合理座標範圍（放寬到鄰近鄉鎮邊界，主要是抓經緯度填反或少個位數）。
const LAT_RANGE = [22.3, 22.8]
const LNG_RANGE = [120.3, 120.9]

const errors = []

function fail (message) {
  errors.push(message)
}

let raw
try {
  raw = readFileSync(dataPath, 'utf8')
} catch {
  console.error(`找不到資料檔：${dataPath}`)
  process.exit(1)
}

let hazards
try {
  hazards = JSON.parse(raw)
} catch (err) {
  console.error(`roadHazards.json 不是合法的 JSON：${err.message}`)
  process.exit(1)
}

if (!Array.isArray(hazards)) {
  console.error('roadHazards.json 的最外層必須是陣列。')
  process.exit(1)
}

const seenIds = new Set()

hazards.forEach((h, index) => {
  const label = `第 ${index + 1} 筆（id=${h?.id ?? '?'}, location=${h?.location ?? '?'}）`

  if (typeof h !== 'object' || h === null) {
    fail(`${label}：不是物件。`)
    return
  }

  if (!Number.isInteger(h.id) || h.id <= 0) {
    fail(`${label}：id 必須是正整數。`)
  } else if (seenIds.has(h.id)) {
    fail(`${label}：id 重複。`)
  } else {
    seenIds.add(h.id)
  }

  if (typeof h.location !== 'string' || h.location.trim() === '') {
    fail(`${label}：location 必須是非空字串。`)
  }

  if (typeof h.latitude !== 'number' || h.latitude < LAT_RANGE[0] || h.latitude > LAT_RANGE[1]) {
    fail(`${label}：latitude（${h.latitude}）必須是 ${LAT_RANGE[0]}～${LAT_RANGE[1]} 之間的數字，是不是跟經度填反了？`)
  }

  if (typeof h.longitude !== 'number' || h.longitude < LNG_RANGE[0] || h.longitude > LNG_RANGE[1]) {
    fail(`${label}：longitude（${h.longitude}）必須是 ${LNG_RANGE[0]}～${LNG_RANGE[1]} 之間的數字，是不是跟緯度填反了？`)
  }

  if (!HAZARD_TYPES.includes(h.hazardType)) {
    fail(`${label}：hazardType「${h.hazardType}」不在合法清單：${HAZARD_TYPES.join(', ')}。`)
  }

  if (!SEVERITIES.includes(h.severity)) {
    fail(`${label}：severity「${h.severity}」不在合法清單：${SEVERITIES.join(', ')}。`)
  }

  if (!STATUSES.includes(h.status)) {
    fail(`${label}：status「${h.status}」不在合法清單：${STATUSES.join(', ')}。`)
  }

  if (h.description !== null && typeof h.description !== 'string') {
    fail(`${label}：description 必須是字串或 null。`)
  }

  if (h.photo !== null) {
    if (typeof h.photo !== 'string' || h.photo.trim() === '') {
      fail(`${label}：photo 必須是檔名字串或 null。`)
    } else if (!existsSync(path.join(picDir, h.photo))) {
      fail(`${label}：photo「${h.photo}」在 public/pic/ 裡找不到對應檔案，是不是忘了把照片一起 commit？`)
    }
  }

  for (const field of ['reportedAt', 'updatedAt']) {
    if (typeof h[field] !== 'string' || !Number.isFinite(Date.parse(h[field]))) {
      fail(`${label}：${field}（${h[field]}）不是可解析的時間字串。`)
    }
  }

  const reported = Date.parse(h.reportedAt)
  const updated = Date.parse(h.updatedAt)
  if (Number.isFinite(reported) && Number.isFinite(updated)) {
    if (updated < reported) {
      fail(`${label}：updatedAt（${h.updatedAt}）早於 reportedAt（${h.reportedAt}）。`)
    }
    // 抓年份或月份打錯造成的未來時間。留 24 小時的餘裕，
    // 因為沒帶時區的時間字串在 CI（UTC）上會被當成 UTC 解析，跟台灣差 8 小時。
    const dayMs = 24 * 60 * 60 * 1000
    for (const [field, time] of [['reportedAt', reported], ['updatedAt', updated]]) {
      if (time > Date.now() + dayMs) {
        fail(`${label}：${field}（${h[field]}）是未來的時間，是不是年份或月份打錯了？`)
      }
    }
  }
})

if (errors.length > 0) {
  console.error(`roadHazards.json 驗證失敗，共 ${errors.length} 個問題：\n`)
  for (const message of errors) {
    console.error(`  ✗ ${message}`)
  }
  process.exit(1)
}

console.log(`roadHazards.json 驗證通過（共 ${hazards.length} 筆資料）。`)
