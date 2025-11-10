import type { ModuleOptions } from '../module'
import type { Component } from 'vue'

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    nuxtDynamicUi?: ModuleOptions
  }
}

/**
 * The component entry format which encapsulates the component, its props and unique ID.
 */
export type ComponentEntry = {
  component: Component
  props: Record<string, any> | undefined
  id: string
}

/**
 * Defines the structure of the content to be rendered on a page.
 */
export type PageContent = Array<ComponentEntry>
