export class CancellationError extends Error {
  constructor() {
    super('작업이 취소되었습니다.')
    this.name = 'AbortError'
  }
}

export type CancellationGate = {
  promise: Promise<never>
  isCancelled: () => boolean
  dispose: () => void
}

export type CancellationHub = {
  begin: () => CancellationGate
  cancel: () => void
}

export function createCancellationHub(): CancellationHub {
  let revision = 0
  const activeRejectors = new Set<(reason?: unknown) => void>()

  return {
    begin: () => {
      const revisionAtStart = revision
      let rejectCancellation!: (reason?: unknown) => void
      const promise = new Promise<never>((_, reject) => {
        rejectCancellation = reject
        activeRejectors.add(rejectCancellation)
      })

      return {
        promise,
        isCancelled: () => revisionAtStart !== revision,
        dispose: () => activeRejectors.delete(rejectCancellation),
      }
    },
    cancel: () => {
      revision += 1
      const cancellation = new CancellationError()
      activeRejectors.forEach((reject) => reject(cancellation))
      activeRejectors.clear()
    },
  }
}
