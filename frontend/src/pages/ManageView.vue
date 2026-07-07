<template>
  <v-container>
    <v-alert v-if="error" type="error" density="compact" closable class="mb-4">{{ error }}</v-alert>
    <v-row>
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>{{ editing ? $t('action.edit') : $t('action.add') }}</v-card-title>
          <v-card-text>
            <HazardForm :hazard="editing" @submit="onSubmit" @cancel="editing = null" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="7">
        <v-card>
          <v-card-title>
            {{ $t('appTitle') }}
            <v-btn icon="mdi-refresh" variant="text" @click="load" />
          </v-card-title>
          <v-table>
            <thead>
              <tr>
                <th>{{ $t('field.location') }}</th>
                <th>{{ $t('field.hazardType') }}</th>
                <th>{{ $t('field.severity') }}</th>
                <th>{{ $t('field.status') }}</th>
                <th>{{ $t('field.photo') }}</th>
                <th>{{ $t('field.updatedAt') }}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="hazard in hazards" :key="hazard.id">
                <td>{{ hazard.location }}</td>
                <td>{{ $t(`hazardType.${hazard.hazardType}`) }}</td>
                <td>{{ $t(`severity.${hazard.severity}`) }}</td>
                <td>{{ $t(`status.${hazard.status}`) }}</td>
                <td>
                  <img v-if="hazard.photo" :src="photoUrl(hazard.photo)" :alt="hazard.photo" class="photo-thumb">
                </td>
                <td>{{ new Date(hazard.updatedAt).toLocaleString('zh-TW') }}</td>
                <td>
                  <v-btn size="small" variant="text" @click="editing = hazard">{{ $t('action.edit') }}</v-btn>
                  <v-btn size="small" variant="text" color="error" @click="onDelete(hazard.id)">{{ $t('action.delete') }}</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import HazardForm from '@/components/HazardForm.vue'
import { createHazard, fetchHazardsFromApi, removeHazard, updateHazard } from '@/api/dataService'

const hazards = ref([])
const editing = ref(null)
const error = ref('')

async function load () {
  try {
    hazards.value = await fetchHazardsFromApi()
  } catch (err) {
    error.value = err.message
  }
}

async function onSubmit (payload) {
  try {
    if (editing.value) {
      await updateHazard(editing.value.id, payload)
    } else {
      await createHazard(payload)
    }
    editing.value = null
    await load()
  } catch (err) {
    error.value = err.message
  }
}

async function onDelete (id) {
  try {
    await removeHazard(id)
    await load()
  } catch (err) {
    error.value = err.message
  }
}

function photoUrl (fileName) {
  return `${import.meta.env.BASE_URL}pic/${encodeURIComponent(fileName)}`
}

onMounted(load)
</script>

<style scoped>
.photo-thumb {
  display: block;
  max-height: 40px;
  border-radius: 4px;
}
</style>
