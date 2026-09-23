import { Site } from '@/components/site/Site'
import { getContent } from '@/lib/content'

export default function Home() {
  return <Site content={getContent()} />
}
