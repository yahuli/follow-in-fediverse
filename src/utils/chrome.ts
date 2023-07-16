export async function localSet(items: Record<string, any>) {
    return await chrome.storage.local.set(items)
}

export async function localGet(key: string | string[] | { [key: string]: any } | null) {
    return await chrome.storage.local.get(key)
}

export function $t(msgName: string) {
    return chrome.i18n.getMessage(msgName)
}