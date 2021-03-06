import Vue from 'vue'
import Vuex from 'vuex'
import _ from 'lodash'
import config from '@/config'
import api from '@/api'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: {
      username: '',
      token: ''
    },
    path: [],
    activeWorkspace: config.servers[0],
    filters: {
      search: new RegExp(),
      hidden: false
    }
  },
  mutations: {
    initialiseStore (state) {
      if (localStorage.getItem('iarlStorage')) {
        const iarlStorage = JSON.parse(localStorage.getItem('iarlStorage'))
        !_.isEmpty(iarlStorage.user) && (state.user = iarlStorage.user)
        !_.isEmpty(iarlStorage.path) && (state.path = iarlStorage.path)
        !_.isEmpty(iarlStorage.activeWorkspace) && (state.activeWorkspace = iarlStorage.activeWorkspace)
      }
    },
    backPath (state, index) {
      state.path = state.path.slice(0, index)
    },
    addDirectory (state, directory) {
      state.path.push(directory)
    },
    updateSearch (state, search) {
      state.filters.search = search
    },
    changeHidden (state) {
      state.filters.hidden = !state.filters.hidden
    },
    updateUser (state, user) {
      state.user = user
    },
    updateWorkspace (state, workspace) {
      state.activeWorkspace = { ...workspace }
      api.defaults.headers.lcc = workspace.id
      state.path = []
    }
  },
  actions: {
    login ({ commit }, user) {
      return new Promise((resolve, reject) => {
        api.post('/api/login', user)
          .then(res => {
            commit('updateUser', {
              token: res.data.token,
              username: user.username
            })
            resolve()
          })
          .catch(err => {
            reject(err)
          })
      })
    }
  }
})

store.subscribe((mutation, state) => {
  localStorage.setItem('iarlStorage', JSON.stringify({
    user: state.user,
    activeWorkspace: state.activeWorkspace,
    path: state.path
  }))
})

export default store
