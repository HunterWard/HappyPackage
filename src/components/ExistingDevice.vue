<template>
<div>
  <div v-if="(Device.sn === currentConnect || ftp)">
    <div v-if="folderAccess">
      <!-- Content Area -->
      <device-library :ObjectList="apps" :Type="0" v-on:listClicked="deviceLibClicked($event)"/>


    </div>
    <div v-else style="height: 500px">
      <div class="flex col full-width full-height flex-center text-primary">
        <q-card class="q-pa-md">
          This connected device doesn't have folder access, make sure you are in USB mode
        </q-card>
        <q-spinner-rings color="white" size="xl" />
      </div>
    </div>
  </div>
  <div v-else style="height: 500px">
    <div class="flex col full-width full-height flex-center text-primary">
      <q-card class="q-pa-md">
        This device is not currently connected<br>
      </q-card>
      <q-spinner-rings color="white" size="xl" />
    </div>
  </div>
</div>
</template>

<script>
import DeviceLibrary from 'src/components/DeviceLibrary.vue';
import * as Store from 'electron-store';
import { getAppInfo } from 'src/helpers/appinfo'

const fs = require('fs');
const store = new Store();

export default {
  components: { DeviceLibrary },
  props: {
      Device: Object
  },
  data() {
    return {
      currentConnect: '',
      ftp: false,
      dataDevice: null,
      folderAccess: false,
      apps: []
    }
  },
  computed: {
    isConnected() {
      const store = new Store();
      return store.get('storedDeviceConnected');
    },

  },
  methods: {
    checkConnect: async function() {
      this.currentConnect = store.get('storedDeviceConnected')
    },
    getDevs: async function() {
      while(1) {
        this.checkConnect();
        this.folderAccess = fs.existsSync(this.Device.path);
        if (this.folderAccess) {
          store.set('storedConnectedDeviceReady', true)
        }

        await new Promise(r => setTimeout(r, 1000))

      }
    },
    getAppDirList: function() {
      var appDir = fs.readdirSync(this.Device.path + 'app').map(fileName=> {
          return this.Device.path + 'app\\' + fileName;
      });
      return appDir;

    },
    getAppInfoList: function() {
      var appdir = this.getAppDirList()

      appdir.forEach(element => {
        this.apps.push(getAppInfo(element))
      });

    },
    deviceLibClicked: function(obj) {
      console.log(obj);
    }
  },
  created() {
    this.currentConnect = store.get('storedDeviceConnected')
    this.getDevs();
    this.dataDevice = this.Device.path;

    this.getAppInfoList();
  }
}
</script>

<style>

</style>