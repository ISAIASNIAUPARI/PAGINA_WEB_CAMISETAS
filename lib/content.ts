import site from '@/content/site.json'
import hero from '@/content/hero.json'
import marquee from '@/content/marquee.json'
import collection from '@/content/collection.json'
import about from '@/content/about.json'
import product3d from '@/content/product3d.json'
import testimonials from '@/content/testimonials.json'
import social from '@/content/social.json'
import newsletter from '@/content/newsletter.json'
import contact from '@/content/contact.json'
import footer from '@/content/footer.json'

import type { Content, SectionId } from './types'

export const SECTION_IDS: SectionId[] = [
  'site', 'hero', 'marquee', 'collection', 'about', 'product3d',
  'testimonials', 'social', 'newsletter', 'contact', 'footer',
]

export function getContent(): Content {
  return { site, hero, marquee, collection, about, product3d, testimonials, social, newsletter, contact, footer } as Content
}

export function isSectionId(id: string): id is SectionId {
  return (SECTION_IDS as string[]).includes(id)
}

export function sectionFilePath(id: SectionId) {
  return `content/${id}.json`
}
