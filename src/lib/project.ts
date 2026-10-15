import type { EditorSnapshot } from '../store/history'
import { prepareImageForCanvas, revokeObjectUrl } from './imageUpload'

export const MAX_PROJECT_FILE_SIZE = 80 * 1024 * 1024
const MAX_ASSET_DATA_LENGTH = 28 * 1024 * 1024
const PROJECT_FORMAT = 'xiv-frame'
const PROJECT_VERSION = 1

type ProjectErrorCode = 'invalid' | 'version' | 'too-large' | 'image' | 'save'

export class ProjectFileError extends Error {
  constructor(readonly code: ProjectErrorCode) {
    super(`Project ${code}`)
    this.name = 'ProjectFileError'
  }
}

export interface ProjectDocument {
  format: typeof PROJECT_FORMAT
  version: typeof PROJECT_VERSION
  composition: EditorSnapshot
}

type Validator<T> = (value: unknown) => T
type AssetKey = 'images' | 'logoUrl' | 'characterSourceUrl' | 'characterCutoutUrl'
type ProjectSettings = Omit<EditorSnapshot, AssetKey>

function invalid(): never { throw new ProjectFileError('invalid') }

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid()
  return value as Record<string, unknown>
}

const number = (min: number, max: number): Validator<number> => value => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) invalid()
  return value
}

const boolean: Validator<boolean> = value => {
  if (typeof value !== 'boolean') invalid()
  return value
}

const text = (max: number): Validator<string> => value => {
  if (typeof value !== 'string' || value.length > max) invalid()
  return value
}

const choice = <T extends string>(...choices: T[]): Validator<T> => value => {
  if (typeof value !== 'string' || !choices.includes(value as T)) invalid()
  return value as T
}

const point: Validator<{ x: number; y: number }> = value => {
  const position = record(value)
  return { x: number(-100_000, 100_000)(position.x), y: number(-100_000, 100_000)(position.y) }
}

const array = <T>(validate: Validator<T>): Validator<T[]> => value => {
  if (!Array.isArray(value) || value.length > 4) invalid()
  return value.map(validate)
}

const position = choice('top-left', 'top-center', 'top-right', 'middle-left', 'center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right')

// This explicit schema is also the import allowlist: store actions and transient
// UI flags from untrusted JSON can never reach the store.
const settingValidators: { [K in keyof ProjectSettings]: Validator<ProjectSettings[K]> } = {
  imagePositions: array(point),
  imageScales: array(number(0.5, 3)),
  layoutPreset: choice('split', 'vertical-split', 'grid'),
  canvasRatio: choice('auto', '16:9', '2:1', '1:1', '4:5', '9:16'),
  backgroundColor: choice('white', 'light-gray', 'transparent'),
  imageGap: number(0, 100),
  imageTransition: choice('none', 'soft-blend'),
  blendWidth: number(0, 200),
  borderWidth: number(0, 50),
  showCopyright: boolean,
  copyrightColor: choice('black', 'white', 'gray'),
  copyrightPosition: choice('bottom-left', 'bottom-center', 'bottom-right'),
  grainIntensity: number(0, 100),
  characterName: text(500),
  serverName: text(500),
  signaturePosition: position,
  signatureAlign: choice('left', 'center', 'right'),
  fontFamily: choice('Pretendard', 'Terrarum Sans Bitmap', 'NexonMaplestory', 'TMoneyDungunbaram', 'OgRenaissanceSecret', 'Shouting', 'BookkMyungjo', 'x12y12pxMaruMinyaHangul', 'LotteriaChwapttaenggyeo', 'Bombaram', 'GoodNeighbor', 'SlowGothic', 'Ridibatang', 'Mulmaru'),
  signatureSize: number(50, 200),
  signatureColor: value => {
    if (typeof value !== 'string' || !/^#[a-f\d]{6}$/i.test(value)) invalid()
    return value
  },
  signatureOpacity: number(0, 100),
  upperLetterSpacing: number(-10, 20),
  upperBold: boolean,
  upperItalic: boolean,
  lowerLetterSpacing: number(-10, 20),
  lowerBold: boolean,
  lowerItalic: boolean,
  logoPosition: position,
  logoScale: number(10, 200),
  logoOpacity: number(0, 100),
  characterPosition: value => value === null ? null : point(value),
  characterScale: number(0.25, 2.4),
  characterOpacity: number(0, 100),
  characterFlipX: boolean,
  characterShadow: boolean,
}

function validateSettings(value: Record<string, unknown>): ProjectSettings {
  return Object.fromEntries(Object.entries(settingValidators).map(([key, validate]) => [key, validate(value[key])])) as ProjectSettings
}

function imageData(value: unknown): string {
  if (typeof value !== 'string') invalid()
  if (value.length > MAX_ASSET_DATA_LENGTH) throw new ProjectFileError('too-large')
  // SVG, remote URLs, blob URLs and arbitrary data documents are not importable.
  const prefix = /^data:image\/(avif|bmp|gif|jpeg|png|webp);base64,/.exec(value)
  if (!prefix) invalid()
  const body = value.slice(prefix[0].length)
  if (!body.length || body.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(body)) invalid()
  return value
}

const optionalImage = (value: unknown) => value === null ? null : imageData(value)

export function validateProjectDocument(value: unknown): ProjectDocument {
  const document = record(value)
  if (document.format !== PROJECT_FORMAT) invalid()
  if (document.version !== PROJECT_VERSION) throw new ProjectFileError('version')
  const raw = record(document.composition)
  const settings = validateSettings(raw)
  const images = array(imageData)(raw.images)
  if (settings.imagePositions.length !== images.length || settings.imageScales.length !== images.length) invalid()
  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    composition: {
      ...settings,
      images,
      logoUrl: optionalImage(raw.logoUrl),
      characterSourceUrl: optionalImage(raw.characterSourceUrl),
      characterCutoutUrl: optionalImage(raw.characterCutoutUrl),
    },
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new ProjectFileError('save'))
    reader.onerror = () => reject(new ProjectFileError('save'))
    reader.readAsDataURL(blob)
  })
}

async function embedImage(url: string): Promise<string> {
  if (url.startsWith('data:')) return imageData(url)
  if (!url.startsWith('blob:')) throw new ProjectFileError('save')
  const response = await fetch(url)
  if (!response.ok) throw new ProjectFileError('save')
  return imageData(await blobToDataUrl(await response.blob()))
}

/** The downloaded document carries its own images and has no browser-session URLs. */
export async function serializeProject(state: EditorSnapshot): Promise<string> {
  const settings = validateSettings({
    ...state,
    imagePositions: state.images.map((_, index) => state.imagePositions[index] ?? { x: 0, y: 0 }),
    imageScales: state.images.map((_, index) => state.imageScales[index] ?? 1),
  })
  const embedOptional = (url: string | null) => url === null ? null : embedImage(url)
  const [images, logoUrl, characterSourceUrl, characterCutoutUrl] = await Promise.all([
    Promise.all(state.images.map(embedImage)),
    embedOptional(state.logoUrl),
    embedOptional(state.characterSourceUrl),
    embedOptional(state.characterCutoutUrl),
  ])
  const document = validateProjectDocument({ format: PROJECT_FORMAT, version: PROJECT_VERSION, composition: { ...settings, images, logoUrl, characterSourceUrl, characterCutoutUrl } })
  const json = JSON.stringify(document)
  if (new Blob([json]).size > MAX_PROJECT_FILE_SIZE) throw new ProjectFileError('too-large')
  return json
}

function dataUrlToFile(dataUrl: string): File {
  const comma = dataUrl.indexOf(',')
  const mime = dataUrl.slice(5, dataUrl.indexOf(';'))
  const bytes = Uint8Array.from(atob(dataUrl.slice(comma + 1)), char => char.charCodeAt(0))
  return new File([bytes], `project-image.${mime.split('/')[1]}`, { type: mime })
}

export function releasePreparedProject(composition: EditorSnapshot) {
  new Set([...composition.images, composition.logoUrl, composition.characterSourceUrl, composition.characterCutoutUrl]).forEach(revokeObjectUrl)
}

/** Validate and decode everything before the caller atomically changes the store. */
export async function prepareProjectImport(file: File): Promise<EditorSnapshot> {
  if (file.size > MAX_PROJECT_FILE_SIZE) throw new ProjectFileError('too-large')
  let document: ProjectDocument
  try {
    document = validateProjectDocument(JSON.parse(await file.text()))
  } catch (error) {
    if (error instanceof ProjectFileError) throw error
    throw new ProjectFileError('invalid')
  }

  const createdUrls: string[] = []
  const prepared = new Map<string, string>()
  const prepare = async (data: string | null): Promise<string | null> => {
    if (data === null) return null
    const existing = prepared.get(data)
    if (existing) return existing
    const url = await prepareImageForCanvas(dataUrlToFile(data))
    createdUrls.push(url)
    prepared.set(data, url)
    return url
  }

  try {
    const composition = document.composition
    const images: string[] = []
    // Sequential decoding bounds peak memory and makes failed imports fully disposable.
    for (const data of composition.images) images.push((await prepare(data))!)
    return {
      ...composition,
      images,
      logoUrl: await prepare(composition.logoUrl),
      characterSourceUrl: await prepare(composition.characterSourceUrl),
      characterCutoutUrl: await prepare(composition.characterCutoutUrl),
    }
  } catch {
    createdUrls.forEach(revokeObjectUrl)
    throw new ProjectFileError('image')
  }
}
