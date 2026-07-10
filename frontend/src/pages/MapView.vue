<template>
  <div class="map-page">
    <v-alert v-if="error" type="error" density="compact" closable>{{ error }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" />
    <HazardMap :hazards="activeHazards" :data-updated-at="dataUpdatedAt" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import HazardMap from '@/components/HazardMap.vue'

const store = useStore()

const activeHazards = computed(() => store.getters.activeHazards)
const dataUpdatedAt = computed(() => store.getters.latestUpdatedAt)
const loading = computed(() => store.state.loading)
const error = computed(() => store.state.error)

onMounted(() => {
  store.dispatch('loadHazards')
})
</script>

<style scoped>
.map-page {
  width: 100%;
  height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
}
.map-page :deep(.vue-map-container) {
  flex: 1;
}
</style>
