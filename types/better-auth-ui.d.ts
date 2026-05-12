import type { ComponentType, ReactNode } from 'react'

declare module '@better-auth-ui/core' {
  interface AuthConfig {
    Link: ComponentType<{ href: string; children?: ReactNode; className?: string }>
  }

  interface AuthPluginRegister {
    builtins: {
      id: string
      captchaComponent?: ReactNode
      authButtons?: ComponentType<{ view: string }>[]
      localization?: Record<string, unknown>
      viewPaths?: import('@better-auth-ui/core').AuthPluginViewPaths
      additionalFields?: import('@better-auth-ui/core').AdditionalFields
      [key: string]: unknown
    }
  }
}
