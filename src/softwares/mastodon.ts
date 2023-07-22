import axios from "axios";
import { ParsedInfo, Software } from "./software";

export class Mastodon implements Software {
	domain: string = ''
	token: string = ''
	private REGEX = /\/@(?<name>[\w_]+)(@(?<domain>[\w.\-]+))?/
	private SOFTWORE = 'mastodon'

	async sendSignal(tabId: number) {
		const token = await chrome.tabs.sendMessage(tabId, {
			type: 'TOKEN_MASTODON',
		})
		return token
	}

	async getToken() {
		const window = await chrome.windows.create({ url: `https://${this.domain}`, setSelfAsOpener: true })
		if (window.tabs) {
			const tabId = window.tabs[0].id
			if (tabId) {
				while(true) {
					try {
						const token = await this.sendSignal(tabId)
						setTimeout(() => {
							chrome.tabs.remove(tabId)
						}, 500);
						return token
					} catch (e) {}
				}
			}
		}
		return ''
	}

	async follow(username: string, domain: string) {
		const searchApi = `https://${this.domain}/api/v2/search`
		const followApi = `https://${this.domain}/api/v1/accounts`
		const userInfo = await axios({
			url: searchApi,
			method: "GET",
			params: {
				q: `@${username}@${domain}`,
				resolve: true,
				limit: 1
			}
		})
		if (userInfo.status == 200) {
			const followRsp = await axios({
				url: `${followApi}/${userInfo.data.accounts[0].id}/follow`,
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${this.token}`
				},
				data: {
					reblogs: true
				}
			})
			return followRsp
		}

	}

	parse(): ParsedInfo {
		if (this.REGEX.test(window.location.pathname)) {
			const groups = this.REGEX.exec(window.location.pathname)?.groups
			if (groups) {
				return {
					software: this.SOFTWORE,
					domain: groups.domain ?? window.location.host,
					name: groups.name
				}
			}
		}
		throw Error(`${this.SOFTWORE} parse error!`)
	}
}
