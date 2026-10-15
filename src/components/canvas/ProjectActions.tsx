'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { AlertCircle, Check, FolderOpen, Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
import { captureEditorSnapshot, type EditorSnapshot } from '@/store/history'
import { prepareProjectImport, ProjectFileError, releasePreparedProject, serializeProject } from '@/lib/project'

interface ProjectActionsProps {
  variant?: 'dark' | 'light'
  compact?: boolean
}

export function ProjectActions({ variant = 'dark', compact = false }: ProjectActionsProps) {
  const t = useTranslations('Project')
  const isExporting = useStore(state => state.isExporting)
  const [busy, setBusy] = useState<'save' | 'open' | null>(null)
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null)
  const busyRef = useRef(false)
  const mountedRef = useRef(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!notice || notice.error) return
    const timer = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const reportError = useCallback((error: unknown, operation: 'save' | 'open') => {
    if (!mountedRef.current) return
    const key = error instanceof ProjectFileError && error.code === 'too-large'
      ? 'tooLarge'
      : error instanceof ProjectFileError && error.code === 'version'
        ? 'versionError'
        : operation === 'save' ? 'saveError' : 'openError'
    setNotice({ message: t(key), error: true })
  }, [t])

  const saveProject = useCallback(async () => {
    if (busyRef.current || useStore.getState().isExporting) return
    busyRef.current = true
    setBusy('save')
    setNotice(null)
    try {
      const json = await serializeProject(useStore.getState())
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      const anchor = document.createElement('a')
      const today = new Date()
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      anchor.href = url
      anchor.download = `XIV-Frame-${date}.xivframe`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      if (mountedRef.current) setNotice({ message: t('saved'), error: false })
    } catch (error) {
      reportError(error, 'save')
    } finally {
      busyRef.current = false
      if (mountedRef.current) setBusy(null)
    }
  }, [reportError, t])

  useEffect(() => {
    const handleSave = () => {
      // A closing mobile sheet must not handle the shared keyboard command.
      if (containerRef.current?.getClientRects().length) void saveProject()
    }
    window.addEventListener('xiv-frame:save-project', handleSave)
    return () => window.removeEventListener('xiv-frame:save-project', handleSave)
  }, [saveProject])

  const openProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file || busyRef.current || useStore.getState().isExporting) return
    busyRef.current = true
    setBusy('open')
    setNotice(null)
    const initialState = useStore.getState()
    const documentKeys = Object.keys(captureEditorSnapshot(initialState)) as (keyof EditorSnapshot)[]
    let documentChanged = false
    const unsubscribe = useStore.subscribe(state => {
      if (state.isExporting || documentKeys.some(key => state[key] !== initialState[key])) documentChanged = true
    })
    try {
      const composition = await prepareProjectImport(file)
      if (!mountedRef.current) {
        releasePreparedProject(composition)
        return
      }
      if (documentChanged || useStore.getState().isExporting) {
        releasePreparedProject(composition)
        setNotice({ message: t('changedDuringOpen'), error: true })
        return
      }
      useStore.getState().applyEdit(composition)
      window.dispatchEvent(new Event('xiv-frame:project-opened'))
      setNotice({ message: t('opened'), error: false })
    } catch (error) {
      reportError(error, 'open')
    } finally {
      unsubscribe()
      busyRef.current = false
      if (mountedRef.current) setBusy(null)
    }
  }

  const buttonClass = variant === 'dark'
    ? 'text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground'
    : 'border border-border bg-card text-foreground hover:bg-muted'
  const labelClass = compact ? 'sr-only' : variant === 'dark' ? 'hidden xl:inline' : ''

  return (
    <div ref={containerRef} className="relative flex items-center gap-1" aria-label={t('label')} role="group" aria-busy={busy !== null}>
      <input ref={inputRef} type="file" accept=".xivframe,.json,application/json" className="hidden" tabIndex={-1} aria-label={t('open')} onChange={event => void openProject(event)} />
      <Button type="button" variant="ghost" size="sm" disabled={busy !== null || isExporting} title={t('openHint')} aria-label={t('open')} onClick={() => inputRef.current?.click()} className={`h-10 min-w-10 rounded-md px-2.5 text-xs font-semibold ${buttonClass}`}>
        {busy === 'open' ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" /> : <FolderOpen aria-hidden="true" className="size-3.5" />}
        <span className={labelClass}>{t('open')}</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" disabled={busy !== null || isExporting} title={t('saveHint')} aria-label={t('save')} onClick={() => void saveProject()} className={`h-10 min-w-10 rounded-md px-2.5 text-xs font-semibold ${buttonClass}`}>
        {busy === 'save' ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" /> : <Save aria-hidden="true" className="size-3.5" />}
        <span className={labelClass}>{t('save')}</span>
      </Button>
      {notice && (
        <div role={notice.error ? 'alert' : 'status'} className={`absolute right-0 top-full z-50 mt-2 flex w-64 max-w-[calc(100vw-2rem)] items-start gap-2 rounded-lg border border-border bg-card p-3 text-xs leading-5 shadow-lg ${notice.error ? 'text-destructive' : 'text-foreground'}`}>
          {notice.error ? <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
          <span>{notice.message}</span>
        </div>
      )}
      <span className="sr-only" role="status">{busy ? t(busy === 'open' ? 'opening' : 'saving') : ''}</span>
    </div>
  )
}

export default ProjectActions
