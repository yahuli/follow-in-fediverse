<script setup lang="ts">
import { softwareMap } from "./softwares/software";
import { localSet, localGet, $t } from './utils/chrome'
import { watch } from 'vue';
import { ref } from 'vue';
import { reactive } from 'vue';
import { onMounted } from 'vue';
import { Server } from './server'

const typeList = Array.from(softwareMap, (e) => e[0])
const serverList: Server[] = reactive([])
const snackbarMsg = ref('')
const snackbarVisible = ref(false)

onMounted(() => {
  localGet('serverList').then((result) => {
    if (result && result.serverList) {
      Object.assign(serverList, result.serverList)
    }
  })
  watch(serverList, () => {
    localSet({
      'serverList': serverList
    })
  })
})

function addServer() {
  serverList.push({
    domain: '',
    type: '',
    token: ''
  })
}

function getToken(server: Server) {
  if (server.domain && server.type) {
    const serverinstance = softwareMap.get(server.type)
    if (serverinstance) {
      serverinstance.domain = server.domain
      serverinstance.getToken().then((token: string) => {
        if (token) {
          server.token = token
        } else {
          alert($t('loginFirst'))
					chrome.windows.create({ url: `https://${server.domain}`, setSelfAsOpener: true })
        }
      }).catch((e: Error) => {
				console.error(e)
				alert($t('unknownError'))
			})
    }
  } else {
    alert($t('typeAndDomainNotNull'))
  }
}


function alert(msg: string) {
  snackbarVisible.value = true
  snackbarMsg.value = msg
}
</script>

<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar color="surface-variant" :title="$t('setting')" class="text-center"></v-app-bar>

    <v-main class="ma-4">
      <v-row v-for="server,index in serverList" v-bind:key="index">

        <v-col cols="3">
          <v-select
            v-model="server.type"
            :label="$t('serverType')"
            :items="typeList">
            <template v-slot:prepend>
              <v-btn color="red" @click="serverList.splice(index, 1)">{{ $t('delete') }}</v-btn>
            </template>
          </v-select>
        </v-col>

        <v-col cols="3">
          <v-text-field
            :label="$t('serverDomain')"
            v-model="server.domain"></v-text-field>
        </v-col>

        <v-col cols="3">
          <v-text-field
            :label="$t('serverToken')"
            v-model="server.token">
            <template v-slot:append>
              <v-btn @click="getToken(server)">{{ $t('getToken') }}</v-btn>
            </template>
          </v-text-field>
        </v-col>

      </v-row>
      <v-btn color="green" @click="addServer">{{ $t('addServer') }}</v-btn>
      <v-snackbar
        color="red"
        v-model="snackbarVisible"
        timeout="2000">{{ snackbarMsg }}</v-snackbar>
    </v-main>
  </v-layout>
</template>

<style scoped>
</style>
./server
