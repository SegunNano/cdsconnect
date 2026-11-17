export const squarePhoto = (file, size = 480, quality = 0.82) => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image.'))
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
        const side = Math.min(img.width, img.height)
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = Math.min(size, side)
        canvas.getContext('2d').drawImage(
            img, (img.width - side) / 2, (img.height - side) / 2, side, side,
            0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        canvas.toBlob(
            blob => blob
                ? resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
                : reject(new Error('Could not process that image.')),
            'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')) }
    img.src = url
})