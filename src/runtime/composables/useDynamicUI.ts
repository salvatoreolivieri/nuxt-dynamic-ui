import type { ComponentEntry } from '../../types'
import {
  componentsMapping,
  type ComponentPropsMap,
  type ComponentsKey,
} from '../generated/components-mapping'

/**
 * Simple deterministic hash function for strings
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // convert to 32bit integer
  }

  return `id_${Math.abs(hash)}`
}

/**
 * Composable that provides methods for dynamically creating UI components.
 */
export function useDynamicUI() {
  /**
   * Generates a new component entry.
   *
   * @template K - A valid component key from `ComponentsKey`.
   * @param {K} key - The key corresponding to the component to generate.
   * @param {ComponentPropsMap[K]} props - The props to pass to the component.
   * @returns {ComponentEntry} A fully formed component entry with unique ID.
   */
  const generateComponent = <K extends ComponentsKey>(
    key: K,
    {
      props,
      connector,
    }: {
      connector?: (() => ComponentPropsMap[K] | undefined) | ComponentPropsMap[K]
      props?: ComponentPropsMap[K]
    } = {}
  ): ComponentEntry => {
    if (!props && connector) {
      props = typeof connector === 'function' ? connector() : connector
    }

    // Deterministic ID based on key + props
    const id = hashString(key + JSON.stringify(props ?? {}))

    return {
      component: componentsMapping[key],
      props,
      id,
    }
  }

  return {
    generateComponent,
  }
}
