'use client'

import { useState } from 'react'
import { RssIcon } from 'lucide-react'

type Props = {
  src: string | null | undefined
  size?: number
  className?: string
}

export function FeedFavicon({ src, size = 16, className = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <RssIcon size={size} className={`shrink-0 ${className}`} aria-hidden="true" />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-sm ${className}`}
      aria-hidden="true"
      onError={() => setFailed(true)}
    />
  )
}
