import type { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    nuxtDynamicUi?: ModuleOptions
  }

  interface NuxtOptions {
    nuxtDynamicUi: ModuleOptions
  }
}
