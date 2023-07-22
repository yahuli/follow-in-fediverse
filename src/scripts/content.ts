import axios from "axios";
import { softwareMap } from "../softwares/software";

const schema: Array<String> = [
	'http://nodeinfo.diaspora.software/ns/schema/1.0',
	'http://nodeinfo.diaspora.software/ns/schema/1.1',
	'http://nodeinfo.diaspora.software/ns/schema/2.0',
	'http://nodeinfo.diaspora.software/ns/schema/2.1',
]

async function parseSite() {
	const wellknown = await axios.get(window.location.origin + '/.well-known/nodeinfo')
	if (wellknown.status == 200) {
		const link = wellknown.data.links[0]
		const linkRel = link.rel
		if (linkRel && schema.includes(linkRel)) {
			const nodeinfo = await axios.get(link.href)
			if (nodeinfo.status == 200) {
				const software = nodeinfo.data.software.name
				const instance = softwareMap.get(software)
				return instance!.parse()
			}
		}
	}
	return null
}


chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
	if (request.type === 'TOKEN_MASTODON') {
		while(!document.querySelector('#initial-state')) {}
		const stateText = document.querySelector('#initial-state')?.innerHTML
		if (stateText) {
			const stateJson = JSON.parse(stateText)
			const token = stateJson['meta']['access_token']
			sendResponse(token)
		}
	}

	if (request.type === 'PARSE_SITE') {
		parseSite().then(result => {
			if (result) {
				chrome.runtime.sendMessage({
					type: 'SITE_INFO',
					payload: {
						software: result.software,
						domain: result.domain,
						name: result.name,
						currentDomain: window.location.host
					}
				})
			}
		}).catch(e => {
			chrome.runtime.sendMessage({
				type: 'SITE_INFO',
				payload: false
			})
			console.error(e)
		})
	}
});

