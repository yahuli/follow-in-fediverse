import { Software } from "./software";
import axios from "axios";

export class Misskey implements Software {
	domain: string = ''
	token: string = ''

	async getToken() {
		const cookies = await chrome.cookies.getAll({ domain: this.domain, name: 'token' })
		if (cookies.length > 0) {
			return cookies[0].value
		}
		return ''
	}

	async follow(username: string, domain: string) {
		const showApi = `https://${this.domain}/api/users/show`
		const followApi = `https://${this.domain}/api/following/create`
		const userInfo = await axios({
			url: showApi,
			method: 'POST',
			data: {
				username: username,
				host: domain,
				i: this.token
			}
		})
		if (userInfo.status == 200 && userInfo.data.id) {
			const followRsp = await axios({
				url: followApi,
				method: 'POST',
				data: {
					i: this.token,
					userId: userInfo.data.id
				}
			})
			return followRsp
		}
	}
}
