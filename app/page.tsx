import { Site } from '@/components/site/Site'
import { getContent, getDynamicSections } from '@/lib/content'

export default function Home() {
  const content = getContent()
  const { chatWebhookUrl, ...siteSettings } = content.siteSettings
  // La URL del agente se queda en el servidor: el navegador solo sabe si el chat existe.
  const chatEnabled = content.siteSettings.chatButtonEnabled && Boolean(chatWebhookUrl?.trim())
  return <Site content={{ ...content, siteSettings: { ...siteSettings, chatWebhookUrl: '' } }} dynamic={getDynamicSections()} chatEnabled={chatEnabled} />
}
