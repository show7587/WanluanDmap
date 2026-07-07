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
  },
})
