<template>
  <q-page class='q-gutter-xs' padding>
    <div class="row">
      <div class="col-8">

      </div>
      <div class="col-4">.col-4</div>
    </div>
  </q-page>
</template>

<script>
import * as Store from 'electron-store';
import electron from "electron";

const ipcRenderer = electron.ipcRenderer;


const store = new Store();


export default {
  name: 'PageIndex',
  props: {
    firstTime: Boolean
  },
  methods: {
  },
  created() {
  }
}
</script>
