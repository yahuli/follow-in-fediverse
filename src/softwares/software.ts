import { Mastodon } from "./mastodon"
import { Misskey } from "./misskey"
import { Pixelfed } from "./pixelfed"

export type ParsedInfo = {
	software: string,
	domain: string,
	name: string
}
export interface Software {
	domain: string
	token: string
	getToken(): Promise<string>
	follow(username: string, domain: string): Promise<any>
	parse(): ParsedInfo
}

export const softwareMap = new Map<string, Software>([
  ['mastodon', new Mastodon()],
  ['misskey', new Misskey()],
	['pixelfed', new Pixelfed()]
])

export {Mastodon, Misskey}
