import type { Metadata } from 'next'

import { CartPage } from '@/components/site/CartPage'
import { getContent } from '@/lib/content'

export const metadata: Metadata = { title: 'Tu cesta · LAMS STUDIO' }

export default function Carrito() {
  return <CartPage site={getContent().site} />
}
