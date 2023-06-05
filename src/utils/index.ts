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
