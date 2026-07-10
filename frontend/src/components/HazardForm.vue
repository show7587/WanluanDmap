<template>
  <v-form @submit.prevent="submit">
    <v-text-field v-model="form.location" :label="$t('field.location')" required />
    <v-row>
      <v-col cols="6">
        <v-text-field v-model.number="form.latitude" type="number" step="0.000001" :label="$t('field.latitude')" required />
      </v-col>
      <v-col cols="6">
        <v-text-field v-model.number="form.longitude" type="number" step="0.000001" :label="$t('field.longitude')" required />
      </v-col>
    </v-row>
    <v-select v-model="form.hazardType" :items="hazardTypeOptions" item-title="text" item-value="value" :label="$t('field.hazardType')" required />
    <v-select v-model="form.severity" :items="severityOptions" item-title="text" item-value="value" :label="$t('field.severity')" required />
    <v-select v-model="form.status" :items="statusOptions" item-title="text" item-value="value" :label="$t('field.status')" required />
    <v-textarea v-model="form.description" :label="$t('field.description')" />
    <v-file-input
      accept="image/*"
      :label="$t('action.uploadPhoto')"
      :loading="uploading"
      :error-messages="uploadError"
      prepend-icon="mdi-camera"
      @update:model-value="onPhotoSelected"
    />
    <v-text-field v-model="form.photo" :label="$t('field.photoFileName')" clearable />
    <v-img v-if="form.photo" :src="photoUrl(form.photo)" max-height="160" class="mb-4" />
    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="$emit('cancel')">{{ $t('action.cancel') }}</v-btn>
      <v-btn color="primary" type="submit">{{ $t('action.save') }}</v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { uploadPhoto } from '@/api/dataService'
import { HAZARD_TYPES, SEVERITIES, STATUSES } from '@/constants/hazards'

const props = defineProps({
  hazard: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['submit', 'cancel'])

const { t } = useI18n()

function emptyForm () {
  return {
    location: '',
    latitude: 22.5636,
    longitude: 120.5786,
    hazardType: 'Flooding',
    severity: 'Moderate',
    status: 'Active',
    description: '',
    photo: '',
  }
}

const form = reactive(emptyForm())

watch(() => props.hazard, hazard => {
  Object.assign(form, hazard ? { ...hazard } : emptyForm())
}, { immediate: true })

const hazardTypeOptions = HAZARD_TYPES.map(value => ({ value, text: t(`hazardType.${value}`) }))
const severityOptions = SEVERITIES.map(value => ({ value, text: t(`severity.${value}`) }))
const statusOptions = STATUSES.map(value => ({ value, text: t(`status.${value}`) }))

const uploading = ref(false)
const uploadError = ref('')

async function onPhotoSelected (files) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return
  uploading.value = true
  uploadError.value = ''
  try {
    form.photo = await uploadPhoto(file)
  } catch (err) {
    uploadError.value = err.message
  } finally {
    uploading.value = false
  }
}

function photoUrl (fileName) {
  return `${import.meta.env.BASE_URL}pic/${encodeURIComponent(fileName)}`
}

function submit () {
  emit('submit', { ...form, photo: form.photo || null })
}
</script>
