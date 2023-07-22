<script lang="ts" setup>
import { onMounted, reactive, watch } from 'vue';
import { ref } from 'vue';
import { $t, localGet } from './utils/chrome';
import { Server } from './server';
import { softwareMap } from "./softwares/software";

const serverList: Server[] = reactive([])

const loading = ref(false)
const alertVisible = ref(false)
const alertMsg = ref('')
const usernameQuery = ref('')
const domainQuery = ref('')

onMounted(() => {
	loading.value = true
	alert($t('loading'))
	watch(serverList, (newValue, _) => {
		if (newValue.length > 0) {
			loading.value = false
			alertVisible.value = false
		}
	})
	chrome.runtime.onMessage.addListener((request) => {
		if (request.type === 'SITE_INFO') {
			if (!request.payload) {
				alert($t('notUserPage'))
				return
			}
			if (request.payload.name) {
				usernameQuery.value = request.payload.name
				domainQuery.value = request.payload.domain
				localGet('serverList').then((result) => {
					if (result && result.serverList) {
						Object.entries<Server>(result.serverList).map(([_, value]) => {
							if (value.domain != request.payload.currentDomain) {
								value.followed = false
								serverList.push(value)
							}
						})
						if (serverList.length == 0) {
							alert($t('noServer'))
						}
					}
				})
			}
		}
	})
	getCurrentTabId().then(tabId => {
		if (tabId) {
			chrome.tabs.sendMessage(tabId, {type: 'PARSE_SITE'})
		}
	})
})

async function getCurrentTabId() {
	const tabs = await chrome.tabs.query({active: true, currentWindow: true})
	return tabs[0].id
}

function follow(server: Server) {
	loading.value = true
	alertVisible.value = false
	const instance = softwareMap.get(server.type)
	if (instance) {
		instance.domain = server.domain
		instance.token = server.token
		instance.follow(usernameQuery.value, domainQuery.value).then(rsp => {
			if (rsp.status == 200) {
				server.followed = true
			} else {
				alert($t('unknownError'))
			}
		}).catch(e => {
			console.error(e)
			loading.value = false
			alert($t('unknownError'))
		})
	}
}

function alert(msg: string) {
	alertVisible.value = true
	alertMsg.value = msg
}
</script>

<template>
	<v-card
		:loading="loading"
		min-height="50"
		min-width="400">
		<v-btn
			width="100%"
			v-for="server in serverList"
			v-bind:key="server.domain"
			class="ma-1"
			:color="server.followed ? 'green' : ''"
			@click="follow(server)">{{ server.domain }}</v-btn>
		<v-alert
			v-if="alertVisible"
			color="warning"
			class="text-center"
			:text="alertMsg"></v-alert>
	</v-card>
</template>
