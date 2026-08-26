import net from 'node:net'

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' })
    let settled = false

    const finish = (available) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(available)
    }

    socket.setTimeout(750, () => finish(false))
    socket.once('connect', () => finish(false))
    socket.once('error', (error) => {
      socket.destroy()
      if (error.code !== 'ECONNREFUSED') {
        finish(false)
        return
      }

      const server = net.createServer()
      server.once('error', () => resolve(false))
      server.listen({ port, host: '127.0.0.1', exclusive: true }, () => {
        server.close(() => resolve(true))
      })
    })
  })
}

export async function findRunningPerfUrl(startPort = 3000) {
  const port = Number.isInteger(startPort) && startPort >= 1024 && startPort <= 65535
    ? startPort
    : 3000
  const url = `http://127.0.0.1:${port}/ko`

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1_000) })
    return response.status < 500 ? url : null
  } catch {
    return null
  }
}

export async function findAvailablePerfPort(startPort = 3000) {
  const normalizedStartPort = Number.isInteger(startPort) && startPort >= 1024 && startPort <= 65535
    ? startPort
    : 3000

  for (let port = normalizedStartPort; port <= 65535; port += 1) {
    if (await isPortAvailable(port)) return port
  }

  throw new Error(`Could not find an available port starting at ${normalizedStartPort}.`)
}
