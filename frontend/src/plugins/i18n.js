import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    appTitle: '萬巒鄉巴威颱風路況地圖',
    legend: '圖例',
    latestHazards: '最新路況',
    dataUpdatedAt: '資料更新時間',
    hazardType: {
      Flooding: '淹水',
      Landslide: '崩塌',
      RoadClosed: '禁止通行',
      FallenTree: '路樹倒塌',
      Pothole: '道路坑洞',
      SignalFailure: '號誌故障',
      Other: '其他',
    },
    severity: {
      Light: '輕微',
      Moderate: '中度',
      Severe: '嚴重',
    },
    status: {
      Active: '生效中',
      Resolved: '已排除',
    },
    field: {
      location: '地點/路段',
      hazardType: '類型',
      severity: '嚴重程度',
      status: '狀態',
      description: '說明',
      photo: '照片',
      photoFileName: '照片檔名',
      reportedAt: '回報時間',
      updatedAt: '更新時間',
      latitude: '緯度',
      longitude: '經度',
    },
    action: {
      add: '新增',
      edit: '編輯',
      delete: '刪除',
      save: '儲存',
      cancel: '取消',
      refresh: '重新整理',
      uploadPhoto: '上傳照片',
    },
    manage: '路況資料維護（本機）',
  },
}

export default createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages,
})
