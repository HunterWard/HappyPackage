<template>
  <div>
    <q-scroll-area style="height: 510px; width: 450px" class="bg-white text-primary rounded-borders shadow-12">

        <q-list separator dense bordered class="">
            <q-item dense clickable v-for="Obj in fileList" :key="Obj.id" @click="$emit('listClicked', Obj.id)">
                <q-item-section top avatar>

                    <q-avatar v-if="Obj.type === 0" icon="games"/>
                    <q-avatar v-else icon="free_breakfast"/>
                </q-item-section>

                <q-item-section>
                    <q-item-label>{{ Obj.id }}</q-item-label>
                    <q-item-label caption>{{ Obj.name }}</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </q-scroll-area>
  </div>
</template>

<script>
const fs = require('fs');
import * as binR from '../helpers/bin';

export default {
    props: {
        ObjectList: Array,
        Type: Number
    },
    data() {
        return {
            fileList: []
        }
    },
    methods: {
        onListClick (obj) {
            this.$emit('listClicked', obj);
        }
    },
    created() {
        this.fileList = this.ObjectList;
        this.fileList.sort((a,b) => (a.type < b.type) ? 1 : -1);
    }
}
</script>

<style>

</style>