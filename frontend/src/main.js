import { registerPlugins } from '@/plugins'
import App from './App.vue'
import { createApp } from 'vue'
import store from './api/store'
import i18n from './plugins/i18n'

const app = createApp(App)

// registerPlugins already registers vuetify and the router.
registerPlugins(app)
app.use(store)
app.use(i18n)
app.mount('#app')
