<template>
  <q-page padding >
    <div class="row flex flex-center">
      <p class="text-h4 text-bold text-center">Options</p>
    </div>
    <div class="row no-wrap items-start content-start">
      <div class="col-4 column inline no-wrap  ">
        <p class="text-subtitle1">Library Path:</p>
        <p class="text-caption">{{ getCurrentLibraryPath() }} <q-btn label="Change" dense class="self-end"/></p>
        <q-separator inset class=""/>
      </div>
    </div>
    <div class="row no-wrap items-start content-start">
      <div class="col-4 column inline no-wrap  ">
        <p class="text-subtitle1 q-mt-xs">Unpacker Path:</p>
        <p class="text-caption">PLACEHOLDER <q-btn label="Change" dense class="self-end"/></p>
        <q-separator inset/>
      </div>
    </div>

  </q-page>
</template>

<script>
const app = require('electron').remote.app;


export default {
  name: 'Options',
  methods: {
    getCurrentLibraryPath() {
      return app.getPath('userData') + '\\library';
    },

  }
}
</script>
