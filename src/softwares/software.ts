export interface Software {
	domain: string
	token: string
	getToken(): Promise<string>
	follow(username: string, domain: string): Promise<any>
}
