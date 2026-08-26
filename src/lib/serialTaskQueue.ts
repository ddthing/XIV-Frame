export type SerialTaskQueue = {
  run: <T>(task: () => Promise<T> | T, canStart?: () => boolean) => Promise<T>
}

export function createSerialTaskQueue(): SerialTaskQueue {
  let tail: Promise<void> = Promise.resolve()

  return {
    run: <T>(task: () => Promise<T> | T, canStart = () => true) => {
      const queuedTask = tail.then(() => {
        if (!canStart()) return Promise.reject(new Error('작업이 시작되기 전에 취소되었습니다.'))
        return task()
      })
      tail = queuedTask.then(() => undefined, () => undefined)
      return queuedTask
    },
  }
}
