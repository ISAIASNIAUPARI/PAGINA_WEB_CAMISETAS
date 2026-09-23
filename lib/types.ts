export type Link = { text: string; href: string }

export type SiteData = {
  brand: string
  whatsappLink: string
  whatsappBubbles: string[]
  freeShippingFrom: number
  shippingCost: number
}
export type HeroData = {
  eyebrow: string
  line1: string
  line2: string
  line3: string
  body: string
  ctaPrimary: Link
  ctaSecondary: Link
  scrollHint: string
}
export type MarqueeData = { items: string[] }
export type Product = {
  id: string
  name: string
  code: string
  category: string
  colorName: string
  colorHex: string
  price: number
  chip: string
  image: string
}
export type CollectionData = { eyebrow: string; title: string; titleEm: string; products: Product[] }
export type AboutData = { title: string; titleEm: string; body: string; values: { n: string; name: string; desc: string }[] }
export type Product3dData = {
  eyebrow: string
  title: string
  price: number
  modelUrl: string
  colors: { name: string; hex: string }[]
  sizes: string[]
  note: string
}
export type TestimonialsData = { eyebrow: string; title: string; items: { name: string; text: string }[] }
export type SocialData = {
  eyebrow: string
  title: string
  links: { label: string; href: string; icon: string }[]
  videosEyebrow: string
  videosTitle: string
  videos: { url: string }[]
}
export type NewsletterData = { eyebrow: string; title: string; titleEm: string; body: string }
export type ContactData = {
  eyebrow: string
  title: string
  body: string
  address: string
  whatsapp: string
  email: string
  hours: string
  mapQuery: string
}
export type FooterData = { tagline: string; shippingRegion: string }

export type Content = {
  site: SiteData
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

export type SectionId = keyof Content
