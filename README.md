<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: nuxt-dynamic-ui
- Description: My new Nuxt module
-->

# Nuxt Dynamic UI

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads](https://img.shields.io/npm/dm/nuxt-dynamic-ui.svg)](https://www.npmjs.com/package/nuxt-dynamic-ui)
[![License][license-src]][license-href]
[![Nuxt 4.2.1](https://img.shields.io/badge/Nuxt-4.2.1-brightgreen)](https://nuxt.com)

A lightweight Nuxt module for dynamically mapping and rendering Vue components from configurable directories. It auto-generates a type-safe component registry and provides a composable (useDynamicUI) to build data-driven interfaces at runtime.

It follow the Dynamic [Components Design Pattern](https://www.patterns.dev/vue/dynamic-components/). This approach allows us to render components dynamically at runtime based on configuration, making the system more flexible and easier to extend.

👇🏻 Here my video where I explain in detail how to use it, how I created it and why I designed it 👇🏻

[![Watch the video](https://img.youtube.com/vi/Zg3kdse9BdY/0.jpg)](https://youtu.be/Zg3kdse9BdY)

## Features

<!-- Highlight some of the features your module provide here -->

✨ **Automatic Component Mapping**
Automatically scans specified directories and generates a fully type-safe mapping of your Vue components, ready to be used anywhere in your app.

🧩 **Type-Safe Component Props**
Each component’s props are inferred and linked automatically, so you get complete IntelliSense and type safety when generating components dynamically.

⚡ **Composable API** (useDynamicUI)
Use a simple and intuitive composable to generate components dynamically at runtime, passing either static props or dynamic connectors.

🔄 **Dynamic Data Binding**
Supports connectors — functions or objects that provide props dynamically, perfect for data-driven UIs or components connected to APIs.

📁 **Configurable Directories**
You decide which component directories to include. The module can handle multiple target directories seamlessly (but not yet nested).

💡 **Works Great for CMS-Driven Pages**
Ideal for headless CMS setups or configuration-based UIs where the layout and components are defined in JSON or API responses.

---

## Quick Setup

1. Add `nuxt-dynamic-ui` dependency to your project:

```bash
# Using pnpm
pnpm add -D nuxt-dynamic-ui

# Using yarn
yarn add --dev nuxt-dynamic-ui

# Using npm
npm install --save-dev nuxt-dynamic-ui
```

2. Add `nuxt-dynamic-ui` to the `modules` section of `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-dynamic-ui'],
})
```

That's it! You can now use Nuxt Dynamic UI in your Nuxt app ✨

---

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with playground, with devtools client UI
npm run dev

# Develop with playground, with bundled client UI
npm run play:prod

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

---

## Module Options

```ts
export type ModuleOptions = {
  /**
   * Enable Nuxt DevTools integration
   *
   * @default true
   */
  devtools: boolean

  /**
   * Component directories to scan
   */
  targetDirs: string[]
}
```

Example usage in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-dynamic-ui'],
  nuxtDynamicUi: {
    devtools: true,
    targetDirs: ['components/ui', 'components/sections'],
  },
})
```

---

## Runtime Usage

### `useDynamicUI` Composable

The core composable provided by the module is `useDynamicUI`. It lets you generate dynamic components at runtime with optional props and deterministic unique IDs.

```html
<script setup lang="ts">
  import type { PageContent } from 'nuxt-dynamic-ui'

  const { generateComponent } = useDynamicUI()

  const content = computed<PageContent>(() => [
    generateComponent('testComponent', {
      props: {
        title: 'Placeholder Title',
        description: 'This is a placeholder component',
      },
    }),

    // Add component here and extend page content
    // ...
  ])
</script>

<template>
  <div>
    <component
      :is="component"
      v-for="{ component, id, props } in content"
      :key="id"
      v-bind="props"
    />
  </div>
</template>
```

The `generateComponent` function return a `ComponentEntry` and has the following structure:

```ts
type ComponentEntry = {
  component: Component // Vue component instance
  props?: Record<string, any> // Optional props to pass to the component
  id: string // Deterministic unique ID based on key + props
}
```

## Auto-Generated Components Mapping

The module automatically generates:

```ts
export type ComponentsKey = 'testComponent' | 'anotherComponent'

export type ComponentPropsMap = {
  testComponent: TestComponentProps
  anotherComponent: AnotherComponentProps
}

export const componentsMapping: Record<ComponentsKey, Component> = {
  testComponent: TestComponent,
  anotherComponent: AnotherComponent,
}
```

- `ComponentsKey` — Union of all component keys.
- `ComponentPropsMap` — Maps keys to their props types.
- `componentsMapping` — Maps keys to actual Vue components.

This ensures **full type safety** when using `generateComponent`.

---

## Connector

The connector is an optional way to provide dynamic or computed props when generating a component. Instead of passing static props directly, you can pass a function that returns props at runtime. This is useful for:

- Fetching data dynamically
- Computing props based on other reactive state
- Delaying prop generation until render time

```html
<script setup lang="ts">
  import type { PageContent } from 'nuxt-dynamic-ui'

  type RawData = {
    name: string
    description: string
    media: {
      thumbnail: string
      video: string
    }
  }

  const { generateComponent } = useDynamicUI()

  const rawData: RawData = {
    name: 'Name',
    description: 'Description',
    media: {
      thumbnail: demoPlatform,
      video: 'https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb',
    },
  }

  function mapRawData(input: RawData): HomeHeroProps {
    return {
      title: input?.name ?? '',
      subtitle: input?.description ?? '',
      thumbnailSrc: input?.media.thumbnail ?? '',
      videoSrc: input?.media.video ?? '',
    }
  }

  const content = computed<PageContent>(() => [
    generateComponent('homeHero', {
      connector: mapRawData(rawData),
    }),
  ])
</script>

<template>
  <div>
    <component
      :is="component"
      v-for="{ component, id, props } in content"
      :key="id"
      v-bind="props"
    />
  </div>
</template>
```

### Rules

1. If `props` is provided, it is used directly.
2. If `props` is not provided but `connector` is, `connector` will generate the props.
3. `connector` can be either:
   - A **function** returning the props
   - A **direct object** (like `props`) but evaluated at generation time

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-dynamic-ui/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-dynamic-ui
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-dynamic-ui.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-dynamic-ui
[license-src]: https://img.shields.io/npm/l/nuxt-dynamic-ui.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-dynamic-ui
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <strong>🌟 Star this repository if you find it helpful!</strong>
</div>
