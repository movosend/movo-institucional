import { GamesHub } from "@/components/juegos/hub"
import { parseEventTag } from "@/lib/juegos/event-tag"

export default async function JuegosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { stand } = await searchParams
  return <GamesHub eventTag={parseEventTag(stand)} />
}
