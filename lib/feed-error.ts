export type FeedErrorCategory =
  | 'permanent_not_found'
  | 'permanent_parse'
  | 'temporary_server'
  | 'temporary_network'
  | 'unknown'

export type FeedErrorInfo = {
  category: FeedErrorCategory
  isPermanent: boolean
  headline: string
  userMessage: string
  helpText: string
}

export function classifyFeedError(errorMessage: string | null): FeedErrorInfo {
  if (!errorMessage) {
    return {
      category: 'unknown',
      isPermanent: false,
      headline: 'Error',
      userMessage: 'An unknown error occurred.',
      helpText: 'Try refreshing the feed. If the problem persists, check the feed URL.',
    }
  }

  const msg = errorMessage.toLowerCase()

  if (msg.startsWith('http 404') || msg.startsWith('http 410')) {
    const code = errorMessage.split(':')[0]
    return {
      category: 'permanent_not_found',
      isPermanent: true,
      headline: 'Feed not found',
      userMessage: `The feed returned ${code}, meaning it may have moved or been deleted.`,
      helpText: "Check the feed publisher's website for a new RSS URL, or remove this feed.",
    }
  }

  if (msg.startsWith('http 429') || msg.startsWith('http 5')) {
    const code = errorMessage.split(':')[0]
    return {
      category: 'temporary_server',
      isPermanent: false,
      headline: 'Server error',
      userMessage: `The feed server returned ${code}. This is usually temporary.`,
      helpText: 'The feed will be retried automatically. You can also try refreshing manually.',
    }
  }

  if (msg.includes('parse') || msg.includes('xml')) {
    return {
      category: 'permanent_parse',
      isPermanent: true,
      headline: 'Invalid feed',
      userMessage: 'The feed content could not be parsed. It may not be a valid RSS or Atom feed.',
      helpText: 'This feed may be broken or no longer maintained. Consider removing it.',
    }
  }

  if (msg.includes('timed out') || msg.includes('timeout') || msg.includes('fetch')) {
    return {
      category: 'temporary_network',
      isPermanent: false,
      headline: 'Network error',
      userMessage: 'The feed could not be reached. This may be a temporary network issue.',
      helpText: 'The feed will be retried automatically. Check that the URL is still correct.',
    }
  }

  return {
    category: 'unknown',
    isPermanent: false,
    headline: 'Error',
    userMessage: errorMessage,
    helpText: 'Try refreshing the feed. If the problem persists, the feed may be broken.',
  }
}
