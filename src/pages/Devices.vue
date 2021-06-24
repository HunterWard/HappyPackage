<template>
  <q-page class="q-py-xs q-px-md">
      <div class="row fit">
        <div class="col">
          <p class="text-h6 q-ma-xs">Your Devices:</p>
        </div>
      </div>

      <q-dialog v-model="confirmDelete" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="red" text-color="white" />
            <span class="q-ml-sm text-primary">Are you sure you want to remove this device?</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn outline label="Cancel" color="primary" v-close-popup />
            <q-btn push label="Yes, Delete This Device" color="red" v-close-popup @click="deleteSelectedDevice" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-splitter v-model="splitterModel" style="height: 565px" disable class="flex q-px-xs">
        <template v-slot:before>
          <q-tabs vertical inline-label shrink dense v-model="tab" active-bg-color="primary" style="height: 505px" @input="refreshConnected" align="left">
            <q-tab v-for="device in devices" :key="device.nick" :name="device.nick" content-class="full-width" alight="left">
              <q-item dense class="full-width justify-left">
                <q-item-section class="float-left justify-left">
                    <div v-if="device.sn === deviceConnected && deviceReady">
                      <q-icon name="radio_button_checked" color='green' right size="xs"/>
                    </div>
                    <div v-if="device.sn === deviceConnected && !deviceReady">
                      <q-icon name="radio_button_checked" color='yellow' right size="xs"/>
                    </div>
                    <div v-if="device.sn != deviceConnected">
                      <q-icon name="radio_button_unchecked" right size="xs"/>
                    </div>

                </q-item-section>
                <q-item-label class="text-caption justify-left">{{device.nick}}</q-item-label>

              </q-item>
            </q-tab>
            <!--
            <q-tab v-for="device in devices" :key="device.nick" :name="device.nick">
              {{device.nick}}
              <div v-if="device.sn === deviceConnected && deviceReady">
                <q-icon name="radio_button_checked" color='green' right/>
              </div>
              <div v-if="device.sn === deviceConnected && !deviceReady">
                <q-icon name="radio_button_checked" color='yellow' right/>
              </div>
              <div v-if="device.sn != deviceConnected">
                <q-icon name="radio_button_unchecked" right/>
              </div>

            </q-tab>
            -->
            <q-tab name='addNew' label="Add New Device" tab></q-tab>
          </q-tabs>
          <q-btn push glossy color="red" class="flex stretch" :disable='deviceTab' @click="confirmDelete = true">
            Remove This Device
          </q-btn>
        </template>
        <template v-slot:after>
          <q-tab-panels v-model="tab" class="q-mx-md shadow-5" style="height: 560px">
            <q-tab-panel v-for="device in devices" :key="device.nick" :name="device.nick" class="bg-primary">
              <existing-device :Device="device"/>
            </q-tab-panel>

            <q-tab-panel name="addNew" class="bg-primary">
              <p class="text-h6 text-bold q-pl-md">Add New Device</p>
              <q-form>
                <div class="row">
                  <div class="col-5  q-px-md text-white">
                    <p class="q-mb-xs">Device Info</p>
                    <q-select :options="newDeviceTypeOptions"
                    label="Device Type"
                    label-color="white"
                    standout
                    dense
                    v-model="newDeviceTypeValue"
                    options-dense
                    options-selected-class="text-white"
                    options-dark
                    @input="checkFTPOnly() || checkFormDone()"/>

                    <q-input label="Device Nickname" maxlength="10" label-color="white" standout dense v-model="newDeviceNickValue" class="q-py-xs" @input="checkFormDone"/>

                    <q-select :options="newDeviceConnectionType"
                    label="Connection Type"
                    label-color="white"
                    standout
                    dense
                    v-model="newDeviceConnectionTypeValue"
                    options-dense
                    options-selected-class="text-white"
                    options-dark
                    @input="checkFormDone"/>

                  </div>
                  <div class="col q-px-md">
                    <p class="q-mb-xs">Device Connection</p>
                    <q-card class="text-black q-pa-xs q-my-xs">
                      <q-stepper v-model="step" ref="stepper">
                        <q-step
                          :name="1"
                          title="Complete Info"
                          active-icon="keyboard_arrow_left"

                          :done="step > 1"
                          >
                          <p class="text-body2"><b>Device Type:</b><br/>Happy Package currently supports <b>PS3</b> and <b>Vita</b></p>
                          <p class="text-body2"><b>Device Nickname:</b><br/>Unique nickname to identify device</p>
                          <p class="text-body2"><b>Connection Type:</b><br/>How do you want to connect your device.  Can be changed/added later</p>
                          <div class="fit row justify-end items-end">
                            <q-btn label="Continue" :disable="!step1Done" color="primary" @click="step++"/>
                          </div>


                        </q-step>
                        <q-step
                          v-if="newDeviceConnectionTypeValue === 'USB' || newDeviceConnectionTypeValue === 'Both'"
                          :name="2"

                          title="USB Connect"
                          icon="usb"
                          active-icon="usb"
                          :done="step > 2"
                          >
                          <p class="text-body2 text-bold">REQUIRES VITASHELL</p>
                          <p class="text-body">Open VitaShell, press <b>Search for Device</b> below and then press <b>SELECT</b> on Vita</p>

                          <div v-if="!devFound">
                            <div v-if="searching" class="fit row wrap justify-center items-start content-start">
                              <q-spinner-rings color="primary" size="xl"></q-spinner-rings>
                            </div>
                            <div v-else class="fit row justify-center items-end">
                              <q-btn label="search for device" color="primary" @click="USBVitaSearch"/>
                            </div>
                          </div>
                          <div v-else>
                            <q-separator/>
                            <div class="row align-center q-mt-md">
                              <p>
                              <b>Device Found:</b><br>
                              {{ driveInfo.description }}
                              </p>

                            </div>
                            <div class="row">
                              <div class="col">

                                <b>Free Space:</b> {{ (deviceInfo.free / 1073741824).toFixed(2) }} GB <br>
                                <b>Total Space:</b> {{ (deviceInfo.total / 1073741824).toFixed(2)}} GB <br>
                              </div>
                            </div>

                            <div class="">
                              <b>App Folder Path:</b> {{ deviceInfo.path }}
                              <q-btn label="Change" size="sm" dense color="primary" class="q-ml-xs" outline @click="changeAppPath">
                                <q-tooltip>Only change if the default path is incorrect</q-tooltip>
                              </q-btn>

                            </div>

                          </div>


                          <div class="fit row justify-end items-end">
                            <q-btn label="Use This Device" :disable="!devFound" color="primary" class="q-ma-xs" @click="useThisDevice"/>
                          </div>
                        </q-step>
                        <q-step
                          v-if="newDeviceConnectionTypeValue === 'FTP' || newDeviceConnectionTypeValue === 'Both'"
                          :name="3"
                          title="FTP Connect"
                          icon="folder_shared"
                          :done="step > 3"
                          >
                          <p class="text-body2"></p>
                        </q-step>
                      </q-stepper>
                    </q-card>
                    <q-btn label="Finish" color="white" text-color="primary"></q-btn>
                  </div>
                </div>

              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
  </q-page>
</template>

<script>
import { ipcRenderer } from 'electron';
import checkDiskSpace from 'check-disk-space'
import * as Store from 'electron-store';
import ExistingDevice from 'src/components/ExistingDevice.vue';

const fs = require('fs');
const store = new Store();

export default {
  components: { ExistingDevice },
  data() {
    return {
      tab: '',
      devices: [],
      splitterModel: 12,
      newDeviceTypeOptions: ['Vita', 'PS3'],
      newDeviceTypeValue: '',
      newDeviceNickValue: '',
      newDeviceConnectionType: ['USB', 'FTP', 'Both'],
      newDeviceConnectionTypeValue: '',
      step: 1,
      step1Done: false,
      searching: false,
      confirmDelete: false,
      devFound: false,
      connectedDevice: '',
      deviceReady: false,
      driveInfo: {
      },
      deviceInfo: {
        "path": '',
        "name": '',
        "nick": '',
        "usb": false,
        "ftp": false,
        "total": null,
        "free": null,
        "sn": null
      }
    }
  },
  computed: {
    newInfo() {
      return this.deviceInfo;
    },
    deviceConnected() {
      return this.connectedDevice;
    },
    deviceTab() {
      return this.tab === 'addNew';
    }
  },
  methods: {
    getDevices: function() {
      this.devices = store.get('devices')
    },
    checkFTPOnly: function () {
      if (this.newDeviceTypeValue === 'PS3') {
        this.newDeviceConnectionType = ['FTP'];
        return true;
      } else {
        this.newDeviceConnectionType = ['USB', 'FTP', 'Both']
        return false;
      }
    },
    checkFormDone: function() {
      if (this.newDeviceTypeValue != '' && this.newDeviceNickValue != '' && this.newDeviceConnectionTypeValue != '') {
        this.step1Done = true;
        return true;
      }
    },
    USBVitaSearch: async function() {
      let device = null;
      this.searching = true;

      while(!device) {
        // Allow a few seconds to press button on console
        console.log('Checking...')
        await new Promise(r => setTimeout(r, 3000))

        // Check for Vita, if not found keep looping
        window.drivelist.list().then(drives => {
          for (var x = 0; x < drives.length; x++) {
            if (drives[x]['description'].includes('SONY')) {
              device = drives[x];
            }
          }
        })
      }
      console.log(device);
      this.driveInfo = device;
      this.newDeviceConnected()
    },
    newDeviceConnected: async function() {
      checkDiskSpace(this.driveInfo.mountpoints[0].path).then(diskspace => {
        console.log(diskspace)
        this.deviceInfo.free = diskspace.free;
        this.deviceInfo.total = diskspace.size;
        this.deviceInfo.path = this.driveInfo.mountpoints[0].path;
      })
      console.log("FIRED")
      this.searching = false;
      this.devFound = true
    },
    changeAppPath: async function() {
      ipcRenderer.invoke('selectDirectory', this.deviceInfo.path).then((returned) => {
        console.log(returned)
        if(!returned.canceled) {
          this.deviceInfo.path = returned.filePaths[0] + '\\';
        }

      })
    },
    useThisDevice: function() {
      if (this.newDeviceTypeValue === 'USB') {
        this.device.usb = true;
      }
      if (this.newDeviceTypeValue === 'FTP') {
        this.device.ftp = true;
      }
      if (this.newDeviceTypeValue === 'BOTH') {
        this.device.usb = true;
        this.device.ftp = true;
      }
      this.deviceInfo.nick = this.newDeviceNickValue;
      this.deviceInfo.name = this.driveInfo.description;
      this.deviceInfo.sn = store.get('recentDeviceAdded');

      // Arr[] of devices
      var currentDevices = store.get('devices');
      currentDevices.push(this.deviceInfo);
      store.set('devices', currentDevices);
      store.set('storedDeviceConnected', this.deviceInfo.sn)

      this.getDevices();
      this.refreshConnected();
      this.tab = this.deviceInfo.nick;
    },
    setSN: function(sn) {
      this.deviceInfo.sn = sn;
    },
    getCurrentDevice: function() {
      return store.get('storedDeviceConnected');
    },
    refreshConnected: function() {
      this.connectedDevice = store.get('storedDeviceConnected');
    },
    watchDevs: async function() {

      while(1) {
        this.connectedDevice = store.get('storedDeviceConnected');
        this.deviceReady = store.get('storedConnectedDeviceReady');
        await new Promise(r => setTimeout(r, 2000))

      }
    },
    deleteSelectedDevice: function() {
      var allDevs = store.get('devices');
      for (let x = 0; x < allDevs.length; x++) {
        if (allDevs[x].nick === this.tab) {
          if (store.get('storedDeviceConnected') === allDevs[x].sn) {
            store.delete('storedDeviceConnected');
            store.delete('storedConnectedDeviceReady');
          }
          allDevs.splice(x, 1);

        }
      }
      store.set('devices', allDevs);
      this.getDevices();
      this.initTab();
    },
    initTab: function() {
      if (this.devices.length === 0) {
        console.log('DEVICES: ' + this.devices.length)
        this.tab = 'addNew';
      } else {
        for (let x = 0; x < this.devices.length; x++) {
          if (this.devices[x].sn === this.connectedDevice) {
            this.tab = this.devices[x].nick;
          }
        }
        if (this.tab == '') {
          this.tab = this.devices[0].nick;
        }

      }
    }
  },
  created() {
    this.getDevices();
    this.refreshConnected();


    this.watchDevs();
  },
  beforeMount() {

  },
  mounted() {
    this.initTab();
  }
}
</script>
