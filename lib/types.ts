export type ImageRef = { url: string; alt?: string; focalX?: number; focalY?: number }

import type { TextColors, TextSize, TextSizes, TextWeights } from './text-colors'

export type { TextColors, TextSize, TextSizes, TextWeights }

export type ThemeColorChoice = 'primary' | 'secondary' | 'accent'
export type ButtonHrefType = 'anchor' | 'url' | 'whatsapp' | 'phone'

export type ButtonRef = {
  id: string
  text: string
  href: string
  hrefType: ButtonHrefType
  /** Posición libre (%, 0-100) dentro de la sección — independientes entre vistas. */
  desktopX?: number
  desktopY?: number
  mobileX?: number
  mobileY?: number
  color?: ThemeColorChoice
}

/**
 * Un aviso de la burbuja. `enabled: false` lo deja en el listado del panel
 * pero fuera de la rotación del sitio público: apagar un mensaje no obliga a
 * borrarlo y volver a escribirlo.
 */
export type ChatNotification = { text: string; enabled: boolean }

/** Acepta el formato viejo (`string[]`) y el nuevo. Un string suelto se da
 *  por activo: así estaba antes, y apagarlo en la migración sería cambiarle
 *  el sitio al cliente sin que lo pidiera. */
export function normalizeChatNotifications(raw: unknown): ChatNotification[] {
  if (!Array.isArray(raw)) return []
  return raw.map((n) =>
    typeof n === 'string'
      ? { text: n, enabled: true }
      : { text: String((n as ChatNotification)?.text ?? ''), enabled: (n as ChatNotification)?.enabled !== false }
  )
}


// ---- Contenido de LAMS STUDIO ----

/** Estilos por texto de una sección (color/tamaño/grosor, Fase E). */
export type TextStyles = { textColors?: TextColors; textSizes?: TextSizes; textWeights?: TextWeights }

export type SiteSettings = {
  brand: string
  freeShippingFrom: number
  shippingCost: number
  /** Botón flotante de WhatsApp: a dónde redirige (link wa.link / wa.me o número). */
  whatsappEnabled: boolean
  whatsappLink: string
  whatsappNotifications: (string | ChatNotification)[]
  whatsappIntervalSec?: number
  /** Asistente de chat (n8n). La URL nunca baja al navegador público. */
  chatButtonEnabled: boolean
  chatWebhookUrl: string
  chatTitle: string
  chatWelcome: string
  chatPlaceholder: string
}

export type Theme = { colorPrimary: string; colorSecondary: string; colorAccent: string }

export type SectionLayoutEntry = {
  id: string
  label: string
  visible: boolean
  /** Solo presente en secciones dinámicas creadas desde plantilla. */
  type?: DynamicSectionType
}
export type PageLayout = { sections: SectionLayoutEntry[] }

export type HeroSlide = { id: string; image: ImageRef; name: string; detail: string; price: number }
export type HeroData = TextStyles & {
  eyebrow: string
  line1: string
  line2: string
  line3: string
  body: string
  buttons: ButtonRef[]
  scrollHint: string
  slides: HeroSlide[]
}
export type MarqueeData = TextStyles & { items: string[] }
export type Product = {
  id: string
  name: string
  code: string
  category: string
  colorName: string
  colorHex: string
  price: number
  chip: string
  image: ImageRef
}
export type CollectionData = TextStyles & { eyebrow: string; title: string; titleEm: string; products: Product[] }
export type AboutData = TextStyles & { title: string; titleEm: string; body: string; values: { id: string; n: string; name: string; desc: string }[] }
export type Product3dData = TextStyles & {
  eyebrow: string
  title: string
  price: number
  modelUrl: string
  colors: { name: string; hex: string }[]
  sizes: string[]
  note: string
}
export type TestimonialsData = TextStyles & { eyebrow: string; title: string; items: { id: string; name: string; text: string }[] }
export type SocialLink = { id: string; label: string; href: string; icon: string }
export type SocialData = TextStyles & {
  eyebrow: string
  title: string
  links: SocialLink[]
  videosEyebrow: string
  videosTitle: string
  videos: { id: string; url: string }[]
}
export type NewsletterData = TextStyles & { eyebrow: string; title: string; titleEm: string; body: string }
export type ContactData = TextStyles & {
  eyebrow: string
  title: string
  body: string
  address: string
  whatsapp: string
  email: string
  hours: string
  mapQuery: string
}
export type FooterData = TextStyles & { tagline: string; shippingRegion: string }

export type Content = {
  siteSettings: SiteSettings
  theme: Theme
  pageLayout: PageLayout
  hero: HeroData
  marquee: MarqueeData
  collection: CollectionData
  about: AboutData
  product3d: Product3dData
  testimonials: TestimonialsData
  social: SocialData
  newsletter: NewsletterData
  contact: ContactData
  footer: FooterData
}

/** Secciones base (no se pueden borrar desde "Organizar página"). */
export const BASE_SECTION_IDS = ['hero', 'collection', 'about', 'product3d', 'testimonials', 'social', 'newsletter', 'contact'] as const

// ---- Secciones dinámicas desde plantilla (Fase D, Parte 3) ----

export type DynamicSectionType = 'cta-banner' | 'menu-grid' | 'text-block' | 'photo-gallery' | 'faq'

export const DYNAMIC_SECTION_LABELS: Record<DynamicSectionType, string> = {
  'cta-banner': 'Llamada a la acción',
  'menu-grid': 'Tarjetas con precio',
  'text-block': 'Bloque de texto',
  'photo-gallery': 'Galería de fotos',
  faq: 'Preguntas frecuentes',
}

export type CtaBannerData = {
  subtitle: string
  heading: string
  body: string
  backgroundImage: ImageRef | null
  backgroundColor?: ThemeColorChoice
  buttons: ButtonRef[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type MenuGridItem = { id: string; image: ImageRef | null; name: string; price: string; description: string }
export type MenuGridData = {
  subtitle: string
  heading: string
  backgroundColor?: ThemeColorChoice
  items: MenuGridItem[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

/**
 * Un párrafo nace SIEMPRE con id estable: los overrides de color y tamaño se
 * guardan por esa clave, así que sin id se guardarían por posición y se
 * desplazarían al reordenar o borrar (ver Parte 6 de la nota 20 del cerebro).
 *
 * El contenido antiguo guardaba `string[]` pelado. `normalizeParagraphs()` lo
 * convierte al vuelo usando el ÍNDICE como id ("0", "1", …), que es justo la
 * clave con la que se guardaron sus overrides: así el estilo ya aplicado no se
 * pierde en la migración. Los párrafos nuevos usan un uuid.
 */
export type TextBlockParagraph = { id: string; text: string }

/** Id de párrafo nuevo. No se reutiliza `newButtonId()` de lib/buttons.ts
 *  porque ese módulo ya importa de acá y se armaría un ciclo. */
export function newParagraphId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function normalizeParagraphs(raw: unknown): TextBlockParagraph[] {
  if (!Array.isArray(raw)) return []
  return raw.map((p, i) =>
    typeof p === 'string'
      ? { id: String(i), text: p }
      : { id: String((p as TextBlockParagraph)?.id ?? i), text: String((p as TextBlockParagraph)?.text ?? '') }
  )
}

export type TextBlockData = {
  subtitle: string
  heading: string
  /** Puede venir como `string[]` del contenido antiguo: normalizar al leer. */
  paragraphs: TextBlockParagraph[] | string[]
  image: ImageRef | null
  backgroundColor?: ThemeColorChoice
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type PhotoGalleryItem = { id: string; image: ImageRef; caption: string }
export type PhotoGalleryData = {
  subtitle: string
  heading: string
  backgroundColor?: ThemeColorChoice
  photos: PhotoGalleryItem[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export type FaqItem = { id: string; question: string; answer: string }
export type FaqData = {
  subtitle: string
  heading: string
  backgroundColor?: ThemeColorChoice
  items: FaqItem[]
  /** Overrides por texto de esta sección (ver lib/text-colors.ts). */
  textColors?: TextColors
  textSizes?: TextSizes
  textWeights?: TextWeights
}

export function emptySectionData(type: DynamicSectionType): unknown {
  switch (type) {
    case 'cta-banner':
      return { subtitle: '', heading: '', body: '', backgroundImage: null, buttons: [] } satisfies CtaBannerData
    case 'menu-grid':
      return { subtitle: '', heading: '', items: [] } satisfies MenuGridData
    case 'text-block':
      return { subtitle: '', heading: '', paragraphs: [{ id: newParagraphId(), text: '' }], image: null } satisfies TextBlockData
    case 'photo-gallery':
      return { subtitle: '', heading: '', photos: [] } satisfies PhotoGalleryData
    case 'faq':
      return { subtitle: '', heading: '', items: [] } satisfies FaqData
  }
}
