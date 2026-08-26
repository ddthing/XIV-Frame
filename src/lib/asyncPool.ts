type StartGuard = () => boolean

function cancelledResult(): PromiseRejectedResult {
  return {
    status: 'rejected',
    reason: new Error('작업이 시작되기 전에 취소되었습니다.'),
  }
}

export async function settleWithConcurrency<Input, Output>(
  items: readonly Input[],
  task: (item: Input, index: number) => Output | Promise<Output>,
  concurrency: number,
  canStart: StartGuard = () => true,
): Promise<PromiseSettledResult<Output>[]> {
  if (items.length === 0) return []

  const normalizedConcurrency = Number.isFinite(concurrency) ? Math.floor(concurrency) : 1
  const workerCount = Math.max(1, Math.min(items.length, normalizedConcurrency))
  const results = new Array<PromiseSettledResult<Output>>(items.length)
  let nextIndex = 0
  let stopped = false

  const worker = async () => {
    while (true) {
      const index = nextIndex
      nextIndex += 1
      if (index >= items.length) return

      if (stopped || !canStart()) {
        stopped = true
        results[index] = cancelledResult()
        continue
      }

      try {
        results[index] = { status: 'fulfilled', value: await task(items[index], index) }
      } catch (reason) {
        results[index] = { status: 'rejected', reason }
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker))
  return results
}
