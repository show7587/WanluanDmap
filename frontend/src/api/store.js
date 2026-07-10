import Vuex from 'vuex'
import { fetchHazards } from './dataService'

export default new Vuex.Store({
  state: {
    hazards: [],
    loading: false,
    error: '',
  },
  mutations: {
    setHazards (state, hazards) {
      state.hazards = hazards
    },
    setLoading (state, loading) {
      state.loading = loading
    },
    setError (state, error) {
      state.error = error
    },
  },
  actions: {
    async loadHazards ({ commit }) {
      commit('setLoading', true)
      commit('setError', '')
      try {
        const hazards = await fetchHazards()
        commit('setHazards', hazards)
      } catch (err) {
        commit('setError', err.message)
      } finally {
        commit('setLoading', false)
      }
    },
  },
  getters: {
    activeHazards: state => state.hazards.filter(h => h.status === 'Active'),
    // 所有災情（含已排除）中最新的更新時間；資料裡的時間格式混雜
    // （有無時區的都有），所以先轉成 timestamp 再比大小。
    latestUpdatedAt: state => {
      const times = state.hazards
        .map(h => new Date(h.updatedAt).getTime())
        .filter(Number.isFinite)
      return times.length ? new Date(Math.max(...times)) : null
    },
  },
})
