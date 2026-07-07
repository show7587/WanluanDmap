<template>
  <GoogleMap
    :api-key="apiKey"
    style="width: 100%; height: 100%"
    :center="center"
    :zoom="13"
  >
    <Marker
      v-for="hazard in hazards"
      :key="hazard.id"
      :options="markerOptions(hazard)"
    >
      <InfoWindow>
        <div class="hazard-info">
          <h3>{{ hazard.location }}</h3>
          <p>
            <strong>{{ $t('field.hazardType') }}：</strong>{{ $t(`hazardType.${hazard.hazardType}`) }}
            ／<strong>{{ $t('field.severity') }}：</strong>{{ $t(`severity.${hazard.severity}`) }}
          </p>
          <p v-if="hazard.description">{{ hazard.description }}</p>
          <img
            v-if="hazard.photo"
            :src="photoUrl(hazard.photo)"
            :alt="hazard.location"
            class="hazard-photo"
          >
          <p class="hazard-time">{{ $t('field.updatedAt') }}：{{ formatDateTime(hazard.updatedAt) }}</p>
        </div>
      </InfoWindow>
    </Marker>
  </GoogleMap>
</template>

<script setup>
import { GoogleMap, Marker, InfoWindow } from 'vue3-google-map'

defineProps({
  hazards: {
    type: Array,
    default: () => [],
  },
})

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Center on Wanluan Township, Pingtung County, Taiwan.
const center = { lat: 22.5636, lng: 120.5786 }

// 每種災害類型的自訂圖示設定：底色 + 中央符號（emoji 或文字）。
const iconStyleByType = {
  Flooding: { color: '#1e88e5', glyph: '\u{1F30A}' }, // 藍色 + 海浪
  Landslide: { color: '#fb8c00', glyph: '\u26A0' }, // 橙色 + 警告
  RoadClosed: { color: '#e53935', glyph: '\u26D4' }, // 紅色 + 禁止
  FallenTree: { color: '#43a047', glyph: '\u{1F333}' }, // 綠色 + 樹木
  Pothole: { color: '#6d4c41', glyph: '\u{1F573}️' }, // 棕色 + 坑洞
  SignalFailure: { color: '#5e35b1', glyph: '\u{1F6A6}' }, // 紫色 + 紅綠燈
  Other: { color: '#fdd835', glyph: '!' }, // 黃色 + 驚嘆號
}

// 產生一個內嵌 SVG 的水滴形圖釘，回傳 data URI 供 Marker 的 icon 使用。
function buildPinIcon ({ color, glyph }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
    <path d="M20 2C10.6 2 3 9.6 3 19c0 12 17 31 17 31s17-19 17-31C37 9.6 29.4 2 20 2z"
      fill="${color}" stroke="#ffffff" stroke-width="2"/>
    <circle cx="20" cy="19" r="12" fill="#ffffff"/>
    <text x="20" y="19" font-size="15" text-anchor="middle" dominant-baseline="central">${glyph}</text>
  </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function markerOptions (hazard) {
  const style = iconStyleByType[hazard.hazardType] || iconStyleByType.Other
  return {
    position: { lat: hazard.latitude, lng: hazard.longitude },
    title: hazard.location,
    icon: buildPinIcon(style),
  }
}

function photoUrl (fileName) {
  return `${import.meta.env.BASE_URL}pic/${encodeURIComponent(fileName)}`
}

function formatDateTime (value) {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-TW')
}
</script>

<style scoped>
.hazard-info {
  max-width: 240px;
}
.hazard-photo {
  display: block;
  width: 100%;
  border-radius: 4px;
  margin-bottom: 8px;
}
.hazard-time {
  color: #666;
  font-size: 0.85em;
}
</style>
