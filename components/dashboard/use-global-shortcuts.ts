import { useEffect, useRef } from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (['input', 'textarea', 'select'].includes(tag)) return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

type Options = {
  onOpenSearch: () => void
  onToggleOverlay: () => void
  router: AppRouterInstance
}

export function useGlobalShortcuts({ onOpenSearch, onToggleOverlay, router }: Options) {
  const onOpenSearchRef = useRef(onOpenSearch)
  const onToggleOverlayRef = useRef(onToggleOverlay)
  const routerRef = useRef(router)
  const pendingGRef = useRef(false)
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { onOpenSearchRef.current = onOpenSearch }, [onOpenSearch])
  useEffect(() => { onToggleOverlayRef.current = onToggleOverlay }, [onToggleOverlay])
  useEffect(() => { routerRef.current = router }, [router])

  useEffect(() => {
    function clearChord() {
      pendingGRef.current = false
      if (chordTimerRef.current) {
        clearTimeout(chordTimerRef.current)
        chordTimerRef.current = null
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      // `?` works even in inputs (it's a meta query, not navigation)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        clearChord()
        onToggleOverlayRef.current()
        return
      }

      // Cmd+K / Ctrl+K — search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        clearChord()
        onOpenSearchRef.current()
        return
      }

      // All remaining shortcuts skip when input is focused
      if (isInputFocused()) return

      // Handle pending g+X chord
      if (pendingGRef.current) {
        clearChord()
        if (e.key === 'h') { e.preventDefault(); routerRef.current.push('/dashboard'); return }
        if (e.key === 's') { e.preventDefault(); routerRef.current.push('/dashboard/saved'); return }
        if (e.key === 'd') { e.preventDefault(); routerRef.current.push('/dashboard/digest'); return }
        return // unknown chord — silently ignore
      }

      // `g` — start chord (ignore key-repeat to avoid timer leaks)
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat) {
        e.preventDefault()
        if (chordTimerRef.current) clearTimeout(chordTimerRef.current)
        pendingGRef.current = true
        chordTimerRef.current = setTimeout(clearChord, 750)
        return
      }

      // `/` — search (preventDefault stops browser find-in-page)
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        onOpenSearchRef.current()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearChord()
    }
  }, []) // stable — all values accessed via refs
}
