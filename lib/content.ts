import fs from 'node:fs'
import path from 'node:path'

import about from '@/content/about.json'
import collection from '@/content/collection.json'
import contact from '@/content/contact.json'
import footer from '@/content/footer.json'
import hero from '@/content/hero.json'
import marquee from '@/content/marquee.json'
import newsletter from '@/content/newsletter.json'
import pageLayout from '@/content/pageLayout.json'
import product3d from '@/content/product3d.json'
import siteSettings from '@/content/siteSettings.json'
import social from '@/content/social.json'
import testimonials from '@/content/testimonials.json'
import theme from '@/content/theme.json'

import type { Content, DynamicSectionType, PageLayout } from './types'

/** Mapa sectionId -> ruta del archivo en el repo, usado por /api/admin/save. */
export const CONTENT_FILES: Record<keyof Content, string> = {
  siteSettings: 'content/siteSettings.json',
  theme: 'content/theme.json',
  pageLayout: 'content/pageLayout.json',
  hero: 'content/hero.json',
  marquee: 'content/marquee.json',
  collection: 'content/collection.json',
  about: 'content/about.json',
  product3d: 'content/product3d.json',
  testimonials: 'content/testimonials.json',
  social: 'content/social.json',
  newsletter: 'content/newsletter.json',
  contact: 'content/contact.json',
  footer: 'content/footer.json',
}

export function getContent(): Content {
  return {
    siteSettings, theme, pageLayout, hero, marquee, collection, about, product3d, testimonials, social, newsletter, contact, footer,
  } as Content
}

/** Ruta del archivo para cualquier sectionId — base o dinámica (plantilla). */
export function sectionFilePath(sectionId: string): string {
  return (CONTENT_FILES as Record<string, string>)[sectionId] ?? `content/sections/${sectionId}.json`
}

/** Un id válido de sección dinámica: solo minúsculas, números y guiones. */
export function isSafeSectionId(id: string) {
  return /^[a-z0-9-]{1,80}$/.test(id)
}

export type DynamicSections = Record<string, { type: DynamicSectionType; data: unknown }>

/**
 * Lee content/sections/*.json del disco (server-only). Las secciones
 * dinámicas las crea el cliente desde /admin, así que no se conocen al compilar.
 */
export function getDynamicSections(): DynamicSections {
  const dir = path.join(process.cwd(), 'content', 'sections')
  const result: DynamicSections = {}
  if (!fs.existsSync(dir)) return result
  for (const entry of (pageLayout as PageLayout).sections.filter((s) => s.type)) {
    const filePath = path.join(dir, `${entry.id}.json`)
    if (!fs.existsSync(filePath)) continue
    try {
      result[entry.id] = { type: entry.type as DynamicSectionType, data: JSON.parse(fs.readFileSync(filePath, 'utf-8')) }
    } catch {
      // Sección ilegible: se omite en vez de romper toda la página.
    }
  }
  return result
}
