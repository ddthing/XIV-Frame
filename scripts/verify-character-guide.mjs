import { shouldShowCharacterGuide } from '../src/lib/characterGuide.ts'
import { drawCharacterHitArea } from '../src/lib/characterHitArea.ts'

const selectedButNotInteracting = shouldShowCharacterGuide({
  isExporting: false,
  isHovered: false,
  isDragging: false,
  isResizing: false,
})

if (selectedButNotInteracting) {
  throw new Error('Character guide must hide after interaction ends, even when the character remains selected.')
}

const activeInteraction = shouldShowCharacterGuide({
  isExporting: false,
  isHovered: false,
  isDragging: true,
  isResizing: false,
})

if (!activeInteraction) {
  throw new Error('Character guide must remain visible while the character is being dragged.')
}

console.log('Character guide visibility states are valid.')

const operations = []
const context = {
  drawImage: (...args) => operations.push(['drawImage', ...args.slice(1)]),
  fillRect: (...args) => operations.push(['fillRect', ...args]),
  globalCompositeOperation: 'source-over',
  fillStyle: '',
}
const image = {}
const shape = { colorKey: '#123456' }

drawCharacterHitArea(context, shape, image, 320, 640)

if (context.globalCompositeOperation !== 'source-in' || context.fillStyle !== shape.colorKey) {
  throw new Error('Character hit area must preserve only the PNG alpha region.')
}

if (operations[0]?.[0] !== 'drawImage' || operations[1]?.[0] !== 'fillRect') {
  throw new Error('Character hit area must draw the source image before colorizing its alpha.')
}

console.log('Character hit area uses the PNG alpha mask.')
