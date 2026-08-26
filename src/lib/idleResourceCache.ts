type DisposableResource = {
  dispose?: () => void | Promise<void>
}

type TimerId = ReturnType<typeof globalThis.setTimeout>
type ScheduleTimer = (callback: () => void, delay: number) => TimerId
type CancelTimer = (timer: TimerId) => void

type IdleResourceCacheOptions = {
  idleMs: number
  scheduleTimer?: ScheduleTimer
  cancelTimer?: CancelTimer
}

export type IdleResourceCache<T extends DisposableResource> = {
  use: <Result>(task: (resource: T) => Result | Promise<Result>) => Promise<Result>
  scheduleDispose: () => void
}

export function createIdleResourceCache<T extends DisposableResource>(
  factory: () => Promise<T>,
  {
    idleMs,
    scheduleTimer = globalThis.setTimeout,
    cancelTimer = globalThis.clearTimeout,
  }: IdleResourceCacheOptions,
): IdleResourceCache<T> {
  let resourcePromise: Promise<T> | null = null
  let resource: T | null = null
  let activeUsers = 0
  let disposalPromise: Promise<void> | null = null
  let idleTimer: TimerId | null = null
  let disposeRequested = false

  const cancelScheduledDispose = () => {
    if (idleTimer !== null) {
      cancelTimer(idleTimer)
      idleTimer = null
    }
    disposeRequested = false
  }

  const disposeWhenIdle = async () => {
    if (activeUsers > 0 || !disposeRequested || !resource) return

    disposeRequested = false
    const currentResource = resource
    resource = null
    resourcePromise = null

    const pendingDispose = Promise.resolve().then(() => currentResource.dispose?.()).then(() => undefined, () => undefined)
    disposalPromise = pendingDispose
    try {
      await pendingDispose
    } finally {
      if (disposalPromise === pendingDispose) disposalPromise = null
    }
  }

  const armIdleTimer = () => {
    if (idleTimer !== null || activeUsers > 0 || !disposeRequested) return
    idleTimer = scheduleTimer(() => {
      idleTimer = null
      void disposeWhenIdle()
    }, idleMs)
  }

  const getResource = async () => {
    cancelScheduledDispose()
    if (disposalPromise) await disposalPromise
    if (resourcePromise) return resourcePromise

    const pending = Promise.resolve().then(factory)
    const tracked = pending.then(
      (nextResource) => {
        resource = nextResource
        return nextResource
      },
      (error) => {
        if (resourcePromise === tracked) resourcePromise = null
        throw error
      },
    )
    resourcePromise = tracked
    return tracked
  }

  return {
    use: async <Result>(task: (currentResource: T) => Result | Promise<Result>) => {
      activeUsers += 1
      try {
        const currentResource = await getResource()
        return await task(currentResource)
      } finally {
        activeUsers -= 1
        if (activeUsers === 0 && disposeRequested) armIdleTimer()
      }
    },
    scheduleDispose: () => {
      disposeRequested = true
      armIdleTimer()
    },
  }
}
