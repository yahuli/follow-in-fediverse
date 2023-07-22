import axios from "axios";
import { ParsedInfo, Software } from "./software";

export class Pixelfed implements Software {
	domain: string = ''
	token: string = ''
	// pixelfed has two different user profile page to show between logined and visitor
	private LOGINED_REGEX = /\/i\/web\/profile\/\d+/
	private VISITOR_REGEX = /\/\w+/
	private SOFTWORE = 'pixelfed'

	async getToken() {
		const cookies = await chrome.cookies.getAll({ domain: this.domain , name: 'XSRF-TOKEN'})
		if (cookies.length > 0) {
			return decodeURIComponent(cookies[0].value)
		}
		return ''
	}

	async follow(username: string, domain: string) {
		const searchApi = 'https://pixelfed.social/api/v2/search'
		const followApi = 'https://pixelfed.social/api/v1/accounts'

		const headers = {
			'X-Xsrf-Token': this.token,
		}

		const searchRsp = await axios({
			url: searchApi,
			withCredentials: true,
			method: 'GET',
			headers: headers,
			params: {
				q: `@${username}@${domain}`,
				resolve: true,
				_pe: 1
			}
		})
		if (searchRsp.status == 200 && searchRsp.headers['content-type'] == 'application/json') {
			return axios({
				url: `${followApi}/${searchRsp.data.accounts[0].id}/follow`,
				method: 'POST',
				headers: headers,
				data: {
					"id": searchRsp.data.accounts[0].id,
					"following": true,
					"followed_by": false,
					"blocking": false,
					"muting": false,
					"muting_notifications": null,
					"requested": false,
					"domain_blocking": null,
					"showing_reblogs": null,
					"endorsed": false
			}
			})
		} else {
			console.error(searchRsp)
			throw new Error(`${this.SOFTWORE} search user error`)
		}
	}

	parse(): ParsedInfo {
		if (this.VISITOR_REGEX.test(window.location.pathname)) {
			const el = document.querySelector('.username-bar')
			if (el && el.querySelector('span')) {
				return {
					software: this.SOFTWORE,
					domain: window.location.host,
					name: el.querySelector('span')!.innerHTML
				}
			}
		}

		if(this.LOGINED_REGEX.test(window.location.pathname)) {
			const el = document.querySelector('.username')
			// remote user
			if (el && el.querySelector('a')) {
				const actorInfo = el.querySelector('a')!.innerHTML.split('@')
				return {
					software: this.SOFTWORE,
					domain: actorInfo[2],
					name: actorInfo[1]
				}
			}
			// local user
			if (el && el.querySelector('span')) {
				const actorInfo = el.querySelector('span')!.innerHTML.split('@')
				return {
					software: this.SOFTWORE,
					domain: window.location.host,
					name: actorInfo[1]
				}
			}
		}
		throw Error(`${this.SOFTWORE} parse error!`)
	}
}
