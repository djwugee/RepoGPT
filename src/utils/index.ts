import { Message } from "../types"

export async function handleCopyToClipboard(
  mergedFiles: string,
  setShowCopyConfirmation: (show: boolean) => void,
  clipboardAPI: Clipboard
): Promise<void> {
  try {
    await clipboardAPI.writeText(mergedFiles)
    setShowCopyConfirmation(true)
    setTimeout(() => {
      setShowCopyConfirmation(false)
    }, 2000)
  } catch (err) {
    console.error(`Could not copy text: ${err}`)
  }
}

export function retrieveValueFromLocalStorage(key: string, setter: (value: string) => void, defaultValue?: string): void {
  const savedValue = localStorage.getItem(key);
  if (savedValue) {
    setter(savedValue);
  } else if (defaultValue) {
    setter(defaultValue);
  }
}

export async function githubAPIRequest(url: string, token: string, acceptRaw = false) {
  const headers = {} as any
  if (token) {
    headers.Authorization = `token ${token}`
    if (acceptRaw) {
      headers.Accept = 'application/vnd.github.v3.raw'
    }
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return acceptRaw ? await response.text() : await response.json()
}

export async function openAIRequest(
  method: string = 'GET',
  endpoint: string,
  apiKey?: string,
  body?: any,
): Promise<any> {

  const headers = {} as any
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json'
  }

  const config = {
    method,
    headers,
  } as any

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`https://api.openai.com/v1/${endpoint}`, config)

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return await response.json()
}
