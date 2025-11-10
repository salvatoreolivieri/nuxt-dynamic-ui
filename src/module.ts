import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join, parse, relative } from 'pathe'
import { setupDevToolsUI } from './devtools'

function pascalToCamel(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function getVueFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) return getVueFiles(fullPath)
    if (entry.isFile() && entry.name.endsWith('.vue')) return [fullPath]
    return []
  })
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Enable Nuxt Devtools integration
   *
   * @default true
   */
  devtools: boolean
  /**
   * Component Dir to scan
   *
   * @default ['~/components']
   */
  targetDirs: string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-dynamic-ui',
    configKey: 'nuxtDynamicUi',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    devtools: true,
    targetDirs: ['components'],
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const moduleDir = resolver.resolve('.') // or dirname of import.meta.url
    const outputDir = join(moduleDir, '/runtime/generated')

    const outputFile = join(outputDir, 'components-mapping.ts')

    if (!existsSync(outputDir)) mkdirSync(outputDir)

    // 1️⃣ Collect .vue files
    const files = options.targetDirs.flatMap((dir) => {
      const fullPath = join(nuxt.options.rootDir, dir)
      if (!existsSync(fullPath)) return []
      return getVueFiles(fullPath)
    })

    // 2️⃣ Build component metadata
    const componentData = files.map((filePath) => {
      const { name } = parse(filePath)
      // const relativePathFromRoot = relative(nuxt.options.rootDir, filePath)
      // const importPath = `~/${relativePathFromRoot}`
      const relativePathFromGenerated = relative(outputDir, filePath).replace(/\\/g, '/')
      const importPath = relativePathFromGenerated
      const key = pascalToCamel(name.replace(/Section$/, ''))

      const propsPath = filePath.replace(/\.vue$/, '.props.ts')
      const propsImportPath = importPath.replace(/\.vue$/, '.props')

      return {
        key,
        name,
        vuePath: importPath,
        hasProps: existsSync(propsPath),
        propsImportPath,
      }
    })

    // 3️⃣ Generate the file contents
    const keys = componentData.map((c) => `'${c.key}'`).join(' | ')

    const vueImports = componentData.map((c) => `import ${c.name} from '${c.vuePath}'`).join('\n')

    const propsImports = componentData
      .filter((c) => c.hasProps)
      .map((c) => `import type { ${c.name}Props } from '${c.propsImportPath}'`)
      .join('\n')

    const propsEntries = componentData
      .map((c) => `  ${c.key}: ${c.hasProps ? `${c.name}Props` : 'undefined'};`)
      .join('\n')

    const mappingEntries = componentData.map((c) => `  ${c.key}: ${c.name},`).join('\n')

    const contents = `
      // ⚠️ Auto-generated. Do not edit manually.
      import type { Component } from 'vue'
      ${vueImports}
      ${propsImports}

      export type ComponentsKey = ${keys};

      export type ComponentPropsMap = {
      ${propsEntries}
      }

      export const componentsMapping: Record<ComponentsKey, Component> = {
      ${mappingEntries}
      }
    `

    // 4️⃣ Write to disk
    writeFileSync(outputFile, contents.trimStart())
    console.log(`✔ components-mapping.ts generated in /generated`)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    if (options.devtools) setupDevToolsUI(nuxt, resolver)
  },
})
