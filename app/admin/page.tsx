import { AdminApp } from '@/components/admin/AdminApp'
import { EditProvider } from '@/components/admin/EditProvider'
import { getContent, getDynamicSections } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · LAMS STUDIO', robots: { index: false, follow: false } }

export default function AdminPage() {
  const content = getContent()
  const dynamicSections = getDynamicSections()
  const dynamicData: Record<string, unknown> = {}
  for (const [id, s] of Object.entries(dynamicSections)) {
    dynamicData[id] = s.data
  }
  return (
    <EditProvider initialData={{ ...content, ...dynamicData }} initialLayout={content.pageLayout} initialTheme={content.theme}>
      <AdminApp />
    </EditProvider>
  )
}
