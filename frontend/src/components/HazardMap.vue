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

const markerColorByType = {
  Flooding: 'blue',
  Landslide: 'orange',
  RoadClosed: 'red',
  Other: 'yellow',
}

function markerOptions (hazard) {
  const color = markerColorByType[hazard.hazardType] || 'yellow'
  return {
    position: { lat: hazard.latitude, lng: hazard.longitude },
    title: hazard.location,
    icon: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
  }
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
.hazard-time {
  color: #666;
  font-size: 0.85em;
}
</style>
