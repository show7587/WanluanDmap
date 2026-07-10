<template>
  <GoogleMap
    ref="mapRef"
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
    <CustomControl position="LEFT_BOTTOM">
      <div class="map-legend">
        <button type="button" class="legend-toggle" @click="legendOpen = !legendOpen">
          {{ $t('legend') }}
          <span class="legend-chevron">{{ legendOpen ? '▾' : '▸' }}</span>
        </button>
        <div v-show="legendOpen">
          <ul class="legend-items">
            <li v-for="type in HAZARD_TYPES" :key="type">
              <span class="legend-pin" :style="{ backgroundColor: iconStyleByType[type].color }">{{ iconStyleByType[type].glyph }}</span>
              <span>{{ $t(`hazardType.${type}`) }}</span>
            </li>
          </ul>
          <template v-if="latestHazards.length">
            <hr class="legend-divider">
            <p class="legend-subtitle">{{ $t('latestHazards') }}</p>
            <ul class="legend-latest">
              <li v-for="hazard in latestHazards" :key="hazard.id">
                <button type="button" class="latest-item" @click="focusHazard(hazard)">
                  <span class="legend-pin" :style="{ backgroundColor: (iconStyleByType[hazard.hazardType] || iconStyleByType.Other).color }">{{ (iconStyleByType[hazard.hazardType] || iconStyleByType.Other).glyph }}</span>
                  <span class="latest-time">{{ formatShortTime(hazard.updatedAt) }}</span>
                  <span class="latest-location">{{ hazard.location }}</span>
                </button>
              </li>
            </ul>
          </template>
        </div>
        <p v-if="dataUpdatedAt" class="legend-updated">{{ $t('dataUpdatedAt') }}：{{ formatDateTime(dataUpdatedAt) }}</p>
      </div>
    </CustomControl>
  </GoogleMap>
</template>

<script setup>
import { computed, ref } from 'vue'
import { GoogleMap, Marker, InfoWindow, CustomControl } from 'vue3-google-map'
import { HAZARD_TYPES, iconStyleByType } from '@/constants/hazards'

const props = defineProps({
  hazards: {
    type: Array,
    default: () => [],
  },
  // 所有災情（含已排除）中最新的更新時間，由 MapView 從 store 計算後傳入。
  dataUpdatedAt: {
    type: Date,
    default: null,
  },
})

const legendOpen = ref(true)
const mapRef = ref(null)

// 顯示中的災情依更新時間取最新五筆，給圖例下方的「最新路況」列表。
const latestHazards = computed(() =>
  [...props.hazards]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5),
)

// 點列表項目時把地圖平移到該災情並拉近。
function focusHazard (hazard) {
  const map = mapRef.value?.map
  if (!map) return
  map.panTo({ lat: hazard.latitude, lng: hazard.longitude })
  if (map.getZoom() < 15) {
    map.setZoom(15)
  }
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Center on Wanluan Township, Pingtung County, Taiwan.
const center = { lat: 22.5636, lng: 120.5786 }

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

// 列表用的精簡時間，例如「7/8 09:40」。
function formatShortTime (value) {
  return new Date(value).toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
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
.map-legend {
  margin: 10px;
  padding: 6px 10px 8px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  font-size: 12px;
  color: #333;
}
.legend-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: bold;
  color: inherit;
  cursor: pointer;
}
.legend-items {
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}
.legend-items li {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 22px;
}
.legend-pin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid #fff;
  border-radius: 50%;
  font-size: 11px;
  flex-shrink: 0;
}
.legend-divider {
  margin: 6px 0;
  border: none;
  border-top: 1px solid #ddd;
}
.legend-subtitle {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: bold;
}
.legend-latest {
  margin: 0;
  padding: 0;
  list-style: none;
}
.latest-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 2px 0;
  border: none;
  background: none;
  font-size: 12px;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.latest-item:hover .latest-location {
  text-decoration: underline;
}
.latest-time {
  color: #666;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.latest-location {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.legend-updated {
  margin: 6px 0 0;
  color: #666;
  font-size: 11px;
}
</style>
