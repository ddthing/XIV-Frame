/** Keep decoded images while their URLs remain in the current composition. */
export function loadCanvasImages(
  sources: string[],
  previous: ReadonlyMap<string, HTMLImageElement>,
  createImage: () => HTMLImageElement = () => new Image(),
) {
  const pending = new Set<HTMLImageElement>()
  const images = sources.map(source => {
    const cached = previous.get(source)
    if (cached) return Promise.resolve(cached)
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = createImage()
      pending.add(image)
      image.onload = () => {
        pending.delete(image)
        image.onload = image.onerror = null
        resolve(image)
      }
      image.onerror = () => {
        pending.delete(image)
        image.onload = image.onerror = null
        reject(new Error('Image decode failed'))
      }
      image.src = source
    })
  })
  return {
    promise: Promise.all(images),
    cancel: () => pending.forEach(image => {
      image.onload = image.onerror = null
      image.src = ''
      pending.delete(image)
    }),
  }
}
