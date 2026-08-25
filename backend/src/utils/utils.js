/**
 * Extracts the WebAuthn Relying Party ID (rpId) from an origin or URL string.
 * @param {string} urlString - e.g. "https://cdsconnect.vercel.app" or "http://localhost:5173"
 * @returns {string} - e.g. "cdsconnect.vercel.app" or "localhost"
 */
export const getRpId = (urlString) => {
  try {
    // Prepend protocol if missing so URL parser doesn't fail on plain domain strings
    const validUrl = urlString.startsWith('http://') || urlString.startsWith('https://')
      ? urlString
      : `https://${urlString}`

    return new URL(validUrl).hostname
  } catch (err) {
    console.error('Invalid URL string provided for rpId extraction:', urlString)
    return 'localhost'
  }
}