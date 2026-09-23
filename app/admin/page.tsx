import { AdminApp } from '@/components/admin/AdminApp'
import { getContent } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · LAMS STUDIO', robots: { index: false } }

export default function AdminPage() {
  return <AdminApp initial={getContent()} />
}
