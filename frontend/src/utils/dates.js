// DB timestamps arrive as "2026-08-24 07:27:17.07" with no timezone.
// Safari can't parse the space form, so normalise it first.
export const parseDate = (value) => {
    if (!value) return null
    const d = new Date(String(value).replace(' ', 'T'))
    return isNaN(d) ? null : d
}

export const formatDate = (value) => {
    const d = parseDate(value)
    return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

export const ageInHours = (value) => {
    const d = parseDate(value)
    return d ? (Date.now() - d.getTime()) / 36e5 : 0
}

export const timeAgo = (value) => {
    const h = ageInHours(value)
    if (h < 1) return `${Math.max(1, Math.round(h * 60))} min ago`
    if (h < 24) return `${Math.floor(h)} hr ago`
    const days = Math.floor(h / 24)
    return `${days} day${days !== 1 ? 's' : ''} ago`
}