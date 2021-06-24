<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-bar dense class="q-electron-drag">
        <q-space/>
        <q-btn
          class="q-ma-xs"
          dense
          flat
          round
          icon="info"
        />
        <q-btn
          class="q-ma-xs"
          dense
          flat
          round
          icon="settings"
          @click="$router.push('/options')"
        />
        <q-btn
          class="q-ma-xs"
          dense
          flat
          icon="minimize"
          @click="minimizeWindow"
        />
        <q-btn
          class="q-ma-xs"
          dense
          flat
          icon="close"
          @click="closeWindow"
        />
      </q-bar>
      <q-toolbar>
        <q-btn
          class="q-ma-xs"
          flat
          dense
          icon="home"
          @click="$router.push('/')"
        />

      <q-space/>
       <q-tabs v-model="tab" inline-label class='absolute-center q-electron-drag--exception'>
          <q-route-tab name="Devices" to="/devices" icon='videogame_asset' label="Devices" />
          <q-route-tab name="Library" to="/library" icon='folder' label="Library"/>
          <q-route-tab name="Explorer" to="/explorer" icon="travel_explore" label="Explorer"/>
        </q-tabs>
      </q-toolbar>
    </q-header>


    <q-page-container class="bg-blue-grey-3 text-grey-1">
      <router-view v-slot="{Component}">
        <transition name="fade">
          <component :is="Component"/>
        </transition>
      </router-view>

    </q-page-container>
    <q-footer>
      <q-bar dense class="text-white">

        <q-space />
        <div>Idle</div>
      </q-bar>
    </q-footer>
  </q-layout>
</template>

<script>

let fs = require('fs')
const ipcRenderer = require('electron').ipcRenderer;

export default {
  name: 'MainLayout',
  components: {  },
  data () {
    return {
      tab: '',
      first: null,
    }
  },
  computed: {
    isFirst() {
      return this.first;
    },
  },
  methods: {
      closeWindow() {
        ipcRenderer.send('closeWindow');
      },
      minimizeWindow() {
        ipcRenderer.send('minimize');
      },
  },
  created() {
    console.log('created')
    ipcRenderer.invoke('firstTime').then((result) => {
      if (result) {
        this.first = true;
        this.$router.push('setup');
    } else {
        this.first = true;
      }
    })



  }
}
</script>
<style>

</style>
