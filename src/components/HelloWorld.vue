<template>
  <div>
    <button type="button" class="btn btn-primary">{{$t('message.addPlace')}}</button>
    <button type="button" class="btn btn-primary">{{$t('message.Patch')}}</button>
    <div   v-for="(place, pi) in tdata" :key="pi" >
    {{$t('message.place')}}
      <a :name="place.place" href="#" v-show="nVShowPlaceArrow[pi]"> ==== </a>
      <button v-bind:class="{hightlightBorder: nVShowPlaceArrow[pi]}"  class='placeTitle' @click="onshowEditPlaceDialog(pi)" :style="{ backgroundColor: '#'+pClass[pi]+'0'+'0'}" >{{place.place}}</button>
      <div  v-for="(item,ii) in  place.items" :title="item" :key="ii" is-link >
        <button class='itemIndent itemButton ' :style="{ backgroundColor: '#'+pClass[pi]+'0'+pClass[ii], color: '#fff'}"  @click="onshowEditItemDialog([pi,ii])" :value="item"> {{item}}</button>
                {{place.dates[ii]}}   <em v-if="place.unsaved[ii]">unsaved</em>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  components: { 
  },
  computed: {
    id: function (){
      return this.$store.getters.getId
    },
    tdata: function () {
      return this.$store.state.tdata
    },
    updatedAt: {
      get: function () {
        let localtime = new Date(this.$store.state.updatedAt)
        return localtime.toLocaleString('zh-cn', { timeZone: 'Asia/Shanghai'})
      },
      set: function (newVal) {
        this.$store.commit('setUpdatedAt', newVal)
      }
    },
    curItem: {
      get: function () {
        return this.$store.getters.getCurItem
      },
      set: function (newVal) {
        this.$store.commit('setTempItem', newVal)
      }
    },
    tempPlace:{
      get: function () {
        return this.$store.getters.getTempPlace
      },
      set: function (newVal) {
        this.$store.commit('setTempPlace', newVal)
      }
    },
    tempItem:{
      get: function () {
        return this.$store.getters.getTempItem
      },
      set: function (newVal) {
        this.$store.commit('setTempItem', newVal)
      }
    },
    newItem: {
      get: function () {
        return ''
      },
      set: function (newVal) {
        this.$store.commit('setTempItem', newVal)
      }
    },
    curPlace: {
      get: function () {
        return this.$store.getters.getCurPlace
      },
      set: function (newVal) {
        this.$store.commit('setCurPlace', newVal)
      }
    },
    classObject: {
      get: function(pi) {
        return {'place': true}
      }
    },
  },
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      msg: 'Hello World!',
      findItemName: '',
      fShowAddItem: false,
      fShowEditItem: false,
      fShowEditPlace: false,
      fShowSelectItem: false,
      fSelectChanged: false,
      pClass: ['3', '6','9','c'],
      selectedPlace: 1,
      nVShowPlaceArrow: [],
      itemFounded: '',
      watchingUpdated: '',
      nShowAlertSeconds: false
    }
  },
  watch: {
    updatedAt: function(newVal, oldVal) {
      this.watchingUpdated = newVal
    },
  },
  methods: {
    countDownChanged (cSec) {
      this.nShowAlertSeconds = cSec
    },
    onPostTdata: function () {
      axios.post('thing', {'tdata': JSON.stringify(this.tdata)}).then( res => {
      }).catch( e => {console.log('post error:'+e)})
    },
    trunkUnsaved: function () {
      let ltdata = this.tdata
        for (let p in ltdata){
          for(let i in ltdata[p]){
            let itemLength
            if (i === 'items'){           
                itemLength = ltdata[p][i].length
                if (ltdata[p]['unsaved'] === undefined ) {
                    ltdata[p]['unsaved'] = []
                }
                for (let j in ltdata[p][i]) {
                  ltdata[p]['unsaved'][j] = false 
                  
                }
              }
            }
          }
    },
    onPatchTdata: function () {
     axios.patch('thing/' + this.id, {'tdata': JSON.stringify(this.tdata)})
      .then( res => { 
        this.watchingUpdated = res.data.updated_at.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        this.nShowAlertSeconds = 5 
        this.trunkUnsaved()
      })
      .catch( e => {console.log('post error:'+e)})
    },
    onAddPlace: function () {
      if(!this.tempPlace) {
        alert('message.cannot_be_empty')
        this.tempPlace= ''
        return false
      }
     
      let tp = this.tempPlace
      let places = this.tdata.map(x => x.place).filter(x => x === tp)
      if(places.length === 0 ) {
        this.$store.commit('addPlace', tp.toString())
        this.$refs.refAddPlaceModal.hide()
      }
      else {
        alert (this.tempPlace + '   message.already_exists')
      }
    },
    onAddItem: function () {
      if(!this.tempItem) {
        alert('message.cannot_be_empty')
        this.tempItem= ''
        return false
      }
      if ( this.FindItem(this.tempItem)) { 
        alert( this.tempItem + '    message.already_exists')
        this.tempItem= ''
        return false
      }
      this.$store.commit('addItem', this.tempItem)
      this.tempItem= ''
      this.fShowAddItem = false

    },
    onshowAddPlaceDialog: function () {
      this.tempPlace = ''
      this.$refs.refAddPlace.focus
    },
    onshowAddItemDialog: function (curPi) {
      this.$store.commit('setCurIdx', {pi: curPi})
      this.fShowAddItem = true
    },
    onshowEditItemDialog: function (arr) {
      this.selectedPlace = parseInt(arr[0])
      this.$store.commit('setCurIdx', {pi: arr[0], ii: arr[1]})
      this.fShowEditItem = true
    },
    onshowEditPlaceDialog: function (pi) {
      this.$store.commit('setCurPlace', pi)
      this.tempPlace = this.curPlace
      this.fShowEditPlace = true
    },
    onCommit: function () {
      if ( this.tempItem =='') {
        //this.$store.commit('setTempItem', this.curItem)
        alert ('message.cannot_be_empty')
        return false
      }
      this.$store.commit('setCurItem')
      this.fShowEditItem = false
      if (this.fSelectChanged === true ){
        this.$store.commit('selectItemPlace', this.selectedPlace)
        this.fSelectChanged = false
      }
    },
    onShowEditPlace: function (pi) {
      this.$store.commit('setCurPlace', pi)
      this.fShowEditPlace = true
    },
    onEditPlace: function () {
      if(this.tempPlace === ''){
        alert('message.cannot_be_empty')
        return
      }
      this.$store.commit('changePlaceName', this.tempPlace)
      this.fShowEditPlace = false
    },
    onDeleteCurItem: function () {
      var bDel = confirm("Are you sure?")
      if (!bDel) return
      this.$store.commit('deleteCurItem')
      this.fShowEditItem = false
    },
    onDeleteCurPlace: function () {
      this.$store.commit('deleteCurPlace')
      this.$store.commit('setCurPlace', 0)
      this.fShowEditPlace = false
    },
    onSelectPlace: function () {
      this.fSelectChanged = true
    },
    onSelectItem: function() {
        this.fShowSelectItem = false
    },
    onSearchItem(findItemName){
      this.$store.commit('setTempItem', findItemName)
      this.itemFounded = this.$store.getters.findItem 
      if(this.itemFounded.length === 0 ) {
        alert (findItemName+'message.not_found')
        this.findItemName=''
        return false
      }
      this.fShowSelectItem = true
      this.findItemName=''
    },
    FindItem( findItemName ) {
      this.$store.commit('setTempItem', findItemName)
      this.itemFounded = this.$store.getters.findItem 
      if(this.itemFounded.length !== 0 ) return true
    },
    focusInput: function (e) {
      this.$refs.AddPlace.focus()
    },
    onClickPlace: function (place) {
      let arr = new Array(this.tdata.length)
      arr[place.pi] = true
      this.nVShowPlaceArrow =  arr
      this.fShowSelectItem = false
    },
  }
}
</script>

<style>
.itemIndent{
    margin: 0px 0px 0px 5em;
}
.itemButton{
    height: 3em;
    border-radius: 5px;
}
.NewItemButton{
    background-color: blue;
    display: block;
}
.placeTitle{
    width: 80%;
}
.hightlightBorder{
    border: 8px solid red;
}
#findItem{
    width: 60%;
    margin: 1em;
}
.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
    background: red;
  }
  100% {
    transform: scale(1);
  }
}
.alertFont{
    background: pink ;
    font-size: 2em;
}
</style>
