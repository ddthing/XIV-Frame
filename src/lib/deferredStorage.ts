export type SyncStorage = {
  getItem: (name: string) => string | null
  setItem: (name: string, value: string) => void
  removeItem: (name: string) => void
}

type TimerHandle = unknown
type ScheduleTimer = (callback: () => void, delay: number) => TimerHandle
type CancelTimer = (timer: TimerHandle) => void

export function createDeferredStorage(
  storage: SyncStorage,
  delay = 200,
  scheduleTimer: ScheduleTimer = (callback, timeout) => globalThis.setTimeout(callback, timeout),
  cancelTimer: CancelTimer = (timer) => globalThis.clearTimeout(timer as ReturnType<typeof setTimeout>),
) {
  let pendingWrite: { name: string; value: string } | null = null
  let timer: TimerHandle | null = null

  const flush = () => {
    if (timer !== null) {
      cancelTimer(timer)
      timer = null
    }

    const write = pendingWrite
    pendingWrite = null
    if (write) storage.setItem(write.name, write.value)
  }

  const schedule = () => {
    if (timer !== null) return
    timer = scheduleTimer(() => {
      timer = null
      const write = pendingWrite
      pendingWrite = null
      if (write) storage.setItem(write.name, write.value)
    }, delay)
  }

  return {
    getItem: (name: string) => storage.getItem(name),
    setItem: (name: string, value: string) => {
      pendingWrite = { name, value }
      schedule()
    },
    removeItem: (name: string) => {
      flush()
      storage.removeItem(name)
    },
    flush,
  }
}
