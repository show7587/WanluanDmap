/**
 * 災害資料列舉值與圖釘樣式的唯一定義來源。
 *
 * 這個檔案刻意不依賴 Vite（不用 import.meta.env），因為除了前端元件之外，
 * CI 的資料驗證腳本（scripts/validate-data.mjs）也會直接用 Node import 它。
 * 後端對應的合法值清單寫在 backend/Models/RoadHazard.cs 的註解，兩邊要同步。
 */

export const HAZARD_TYPES = ['Flooding', 'Landslide', 'RoadClosed', 'FallenTree', 'Pothole', 'SignalFailure', 'Other']
export const SEVERITIES = ['Light', 'Moderate', 'Severe']
export const STATUSES = ['Active', 'Resolved']

// 每種災害類型的自訂圖示設定：底色 + 中央符號（emoji 或文字）。
export const iconStyleByType = {
  Flooding: { color: '#1e88e5', glyph: '\u{1F30A}' }, // 藍色 + 海浪
  Landslide: { color: '#fb8c00', glyph: '⚠' }, // 橙色 + 警告
  RoadClosed: { color: '#e53935', glyph: '⛔' }, // 紅色 + 禁止
  FallenTree: { color: '#43a047', glyph: '\u{1F333}' }, // 綠色 + 樹木
  Pothole: { color: '#6d4c41', glyph: '\u{1F573}️' }, // 棕色 + 坑洞
  SignalFailure: { color: '#5e35b1', glyph: '\u{1F6A6}' }, // 紫色 + 紅綠燈
  Other: { color: '#fdd835', glyph: '!' }, // 黃色 + 驚嘆號
}
