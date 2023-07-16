import axios from "axios";

const schema: Array<String> = [
	'http://nodeinfo.diaspora.software/ns/schema/1.0',
	'http://nodeinfo.diaspora.software/ns/schema/1.1',
	'http://nodeinfo.diaspora.software/ns/schema/2.0',
	'http://nodeinfo.diaspora.software/ns/schema/2.1',
]

const regexs: Record<string, RegExp> = {
	'mastodon': /\/@(?<name>[\w_]+)(@(?<domain>[\w.\-]+))?/,
	'misskey': /\/@(?<name>[\w_]+)(@(?<domain>[\w.\-]+))?/
}

async function parseSite() {
	const wellknown = await axios.get(window.location.origin + '/.well-known/nodeinfo')
	if (wellknown.status == 200) {
		const link = wellknown.data.links[0]
		const linkRel = link.rel
		if (linkRel && schema.includes(linkRel)) {
			const nodeinfo = await axios.get(link.href)
			if (nodeinfo.status == 200) {
				const software = nodeinfo.data.software.name
				const regx = regexs[software]
				const pathname = window.location.pathname
				if (regx.test(pathname)) {
					const groups = regx.exec(pathname)?.groups
					if (groups) {
						return [software, groups.domain ?? window.location.host, groups.name]
					}
				}
			}
		}
	}
	return []
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
						software: result[0],
						domain: result[1],
						name: result[2],
						currentDomain: window.location.host
					}
				})
			}
		})
	}
});

