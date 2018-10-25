// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
require ('./bootstrap')
import Vue from 'vue'
import App from './App'
import router from './router'

import VueI18n from 'vue-i18n'
import Vuex from 'vuex'

Vue.config.productionTip = false

Vue.use(VueI18n)
Vue.use(Vuex)

const i18n = new VueI18n({
  locale: 'CN',
  messages: {
    'CN': require('./assets/common/lang/cn'),
    'EN': require('./assets/common/lang/en')
  }
})

var mydate = new Date()
const initdata = [{place: '01', items: ['01'], dates: [mydate.toLocaleString()], unsaved: [true]}]

axios.get('thing').then(res => {
  localStorage.setItem('ldata', res.data)
  store.commit('setTdata', {'tdata': JSON.parse(res.data.tdata), 'id': res.data.id, 'updatedAt': res.data.updated_at.toLocaleString('zh-cn' , {timeZone: 'Asia/Shanghai'}) })
}).catch(e => console.log(e))

if (tdata !== undefined){
    tdata = JSON.parse(tdata.tdata)
}
else{
    var tdata = initdata
    let tdataString = JSON.stringify(initdata)
    /*  axios.post('thing', {'tdata': tdataString}).then( res => {
        })
    */
}

const storagePlugin = store => {
  store.subscribe((mutation, state) => {
    localStorage.setItem('tdata', JSON.stringify(state.tdata))
    })
}

const store = new Vuex.Store({
  state: {
    id: 1,
    tdata,
    curIdx: {pi: 0, ii: 0},
    tempItem: '',
    tempPlace:'',
    updatedAt: ''
  },
  plugins: [storagePlugin],
  getters: {
    getId: function (state) {
      return state.id
    },
    getCurItem: function (state) {
      return state.tdata[state.curIdx.pi].items[state.curIdx.ii]
    },
    getTempItem: function (state) {
      return state.tempItem
    },
    getCurPlace: function (state) {
      var curIdx = state.curIdx
      return state.tdata[curIdx.pi].place
    },
    getTempPlace: function (state) {
      return state.tempPlace
    },
    getAllPlaces: () => {
      for (p in state){
      }
    },
    findItem: function (state) {
      let itemFounded = []
      let placeName = ''
      let item = state.tempItem
      for (let pi = 0, pLength = state.tdata.length; pi < pLength; pi++){
        let items = state.tdata[pi].items
        for (let ii = 0, iLength = items.length; ii <iLength; ii++){
          if(items[ii] === item) {
            placeName = state.tdata[pi].place
            itemFounded.push({placeName, item, pi, ii})
          }
        }
      }
      return itemFounded
    }
  },
  mutations: {
    setUpdatedAt: function (state, date) {
      state.tdata.updatedAt = date
    },
    setTdata: function (state, nd) {
      state.id = nd['id']
      state.tdata = nd['tdata']
      state.updatedAt = nd['updatedAt']
      //state = { ...state, ...nd}
    },
    addPlace: function (state, p) {
      var np = {place: p, items: [], dates: []}
      state.tdata.push(np)
    },
    addItem: function (state, newItem) {
      let mydate = new Date().toLocaleString('zh-cn' , {timeZone: 'Asia/Shanghai'})
      state.tdata[state.curIdx.pi].items.push(newItem)
      state.tdata[state.curIdx.pi].dates.push(mydate.toString())
      state.tdata[state.curIdx.pi].unsaved.push(true)
    },
    setCurItem: function (state) {
      if (state.tempItem == '') return false
      state.tdata[state.curIdx.pi].items[state.curIdx.ii] = state.tempItem
      let mydate = new Date()
      state.tdata[state.curIdx.pi].dates[state.curIdx.ii] = mydate.toLocaleString('zh-cn' , {timeZone: 'Asia/Shanghai'})
      state.tdata[state.curIdx.pi].unsaved[state.curIdx.ii] = true
      state.tempItem = ''
    },
    setCurPlace: function (state, pi) {
      state.curIdx.pi = pi
    },
    setCurIdx: function (state, Idx) {
      state.curIdx = Idx
    },
    setTempItem: function (state, item) {
      state.tempItem = item
    },
    setTempPlace: function (state, p) {
      state.tempPlace = p
    },
    deleteCurItem: function (state) {
      state.tdata[state.curIdx.pi].items.splice(state.curIdx.ii, 1)
      state.tdata[state.curIdx.pi].dates.splice(state.curIdx.ii, 1)
    },
    deleteCurPlace: function (state) {
      var pi = state.curIdx.pi
      state.tdata.splice(pi, 1)
      if (state.tdata.length === 0) {
        let mydate = new Date().toLocaleString('zh-CN')
        let mylocal = mydate
        state.tdata = [{place: '0', items: ['01'], dates: [mylocal]}]
      }
    },
    changePlaceName: function (state, newName) {
      if (newName === '') newName = state.getCurPlace.place
      state.tdata[state.curIdx.pi].place = newName
    },
    selectItemPlace: function (state,pIdx) {
      let tmpPidx = state.curIdx.pi
      let curItem = this.getters.getCurItem
      this.commit('setCurPlace',pIdx)
      this.commit('addItem', curItem)
      this.commit('setCurPlace', tmpPidx)
      this.commit('deleteCurItem')
    }
  },
  actions: {
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  i18n,
  components: { App },
  template: '<App/>'
})
