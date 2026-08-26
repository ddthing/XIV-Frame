import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'

const projectRoot = process.cwd()
const baseUrl = 'http://127.0.0.1:3000/ko'
const nextEntrypoint = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
const playwrightEntrypoint = path.join(projectRoot, 'node_modules', '@playwright', 'test', 'cli.js')

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function waitForServer(server, timeoutMilliseconds = 120_000) {
  const deadline = Date.now() + timeoutMilliseconds
  let serverExitCode
  server.once('exit', (code) => { serverExitCode = code })

  while (Date.now() < deadline) {
    if (serverExitCode !== undefined) {
      throw new Error(`Next.js dev server exited before becoming ready (code ${serverExitCode}).`)
    }

    try {
      const response = await fetch(baseUrl)
      if (response.status < 500) return
    } catch {
      // The server is still starting.
    }

    await wait(250)
  }

  throw new Error(`Timed out waiting for ${baseUrl}.`)
}

function stopProcessTree(child) {
  if (!child?.pid) return

  if (process.platform === 'win32') {
    child.kill()
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
      timeout: 5_000,
    })
  } else {
    child.kill('SIGTERM')
  }
}

function runPlaywright(args) {
  return new Promise((resolve, reject) => {
    const runner = spawn(process.execPath, [playwrightEntrypoint, 'test', ...args], {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
      windowsHide: true,
    })

    runner.once('error', reject)
    runner.once('exit', (code) => resolve(code ?? 1))
  })
}

const server = spawn(process.execPath, [nextEntrypoint, 'dev', '--hostname', '127.0.0.1'], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
})

try {
  await waitForServer(server)
  process.exitCode = await runPlaywright(process.argv.slice(2))
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  stopProcessTree(server)
}
