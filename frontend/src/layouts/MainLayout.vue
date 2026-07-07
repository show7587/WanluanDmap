<template>
  <v-app-bar density="compact" color="primary">
    <v-app-bar-title>{{ $t('appTitle') }}</v-app-bar-title>
    <v-btn v-if="isDev" to="/manage" variant="text">{{ $t('manage') }}</v-btn>
  </v-app-bar>
  <router-view />
</template>

<script setup>
const isDev = import.meta.env.DEV
</script>
