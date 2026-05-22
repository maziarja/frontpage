'use client'

import { useState, useRef, useTransition } from 'react'
import { UploadIcon, Loader2Icon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { parseOpmlPreview, importOpml } from '@/app/_actions/opml'
import type { OpmlPreviewResult, ImportResult } from '@/app/_actions/opml'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ModalState = 'upload' | 'preview' | 'importing' | 'done'

export function OpmlImportModal({ open, onOpenChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<ModalState>('upload')
  const [error, setError] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [preview, setPreview] = useState<OpmlPreviewResult | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setState('upload')
    setError(null)
    setFileContent(null)
    setPreview(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose(nextOpen: boolean) {
    if (state === 'importing') return // block closing during import
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target?.result as string
      setFileContent(content)
      startTransition(async () => {
        const res = await parseOpmlPreview(content)
        if ('error' in res) {
          setError(res.error)
        } else {
          setPreview(res)
          setState('preview')
        }
      })
    }
    reader.readAsText(file)
  }

  function handleImport() {
    if (!fileContent) return
    setState('importing')
    startTransition(async () => {
      const res = await importOpml(fileContent)
      if ('error' in res) {
        setError(res.error)
        setState('upload')
      } else {
        setResult(res)
        setState('done')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Import OPML</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Upload state */}
          {state === 'upload' && (
            <div className="flex flex-col gap-4 px-5 py-5">
              <p className="text-muted-foreground text-sm">
                Select an OPML file exported from another RSS reader. Your existing subscriptions
                will be skipped automatically.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="border-input hover:border-primary hover:bg-muted flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2Icon size={24} className="text-muted-foreground animate-spin" />
                ) : (
                  <UploadIcon size={24} className="text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {isPending ? 'Parsing file…' : 'Click to choose an OPML file'}
                </span>
                <span className="text-muted-foreground text-xs">.opml or .xml</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".opml,.xml"
                className="hidden"
                onChange={handleFileChange}
              />

              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          )}

          {/* Preview state */}
          {state === 'preview' && preview && (
            <div className="flex flex-col gap-4 px-5 py-4">
              <p className="text-muted-foreground text-sm">
                Found <span className="text-foreground font-medium">{preview.totalFeeds}</span> feed
                {preview.totalFeeds !== 1 ? 's' : ''}
                {preview.dupCount > 0 && <>, {preview.dupCount} already subscribed</>}.{' '}
                {preview.newCount > 0
                  ? `${preview.newCount} will be imported.`
                  : 'Nothing new to import.'}
              </p>

              <div className="flex flex-col gap-3">
                {preview.categories.map((cat) => (
                  <div key={cat.name}>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                      {cat.name}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {cat.feeds.map((feed) => (
                        <div
                          key={feed.xmlUrl}
                          className="flex items-center justify-between gap-2 rounded px-1 py-0.5"
                        >
                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm ${feed.isDuplicate ? 'text-muted-foreground' : ''}`}
                            >
                              {feed.title}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">{feed.xmlUrl}</p>
                          </div>
                          {feed.isDuplicate && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              Already subscribed
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {preview.uncategorized.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                      Uncategorized
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {preview.uncategorized.map((feed) => (
                        <div
                          key={feed.xmlUrl}
                          className="flex items-center justify-between gap-2 rounded px-1 py-0.5"
                        >
                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm ${feed.isDuplicate ? 'text-muted-foreground' : ''}`}
                            >
                              {feed.title}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">{feed.xmlUrl}</p>
                          </div>
                          {feed.isDuplicate && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              Already subscribed
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Importing state */}
          {state === 'importing' && (
            <div className="flex flex-col items-center gap-3 px-5 py-12">
              <Loader2Icon size={28} className="text-muted-foreground animate-spin" />
              <p className="text-muted-foreground text-sm">
                Importing feeds… this may take a moment.
              </p>
            </div>
          )}

          {/* Done state */}
          {state === 'done' && result && (
            <div className="flex flex-col gap-3 px-5 py-6">
              <p className="text-base font-medium">Import complete</p>
              <div className="text-muted-foreground flex flex-col gap-1 text-sm">
                <span>
                  <span className="text-foreground font-medium">{result.imported}</span> feed
                  {result.imported !== 1 ? 's' : ''} imported
                </span>
                {result.skipped > 0 && <span>{result.skipped} skipped (already subscribed)</span>}
                {result.failed > 0 && <span>{result.failed} failed (unreachable or invalid)</span>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(state === 'preview' || state === 'done') && (
          <div className="flex justify-end gap-2 border-t px-5 py-3">
            {state === 'preview' && (
              <>
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!preview || preview.newCount === 0}
                >
                  {preview && preview.newCount > 0
                    ? `Import ${preview.newCount} feed${preview.newCount !== 1 ? 's' : ''}`
                    : 'Nothing to import'}
                </Button>
              </>
            )}
            {state === 'done' && (
              <Button onClick={() => handleClose(false)}>
                Close
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
