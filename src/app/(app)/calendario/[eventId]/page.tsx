import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function CalendarioEventRedirect({ params }: PageProps) {
  const { eventId } = await params
  redirect(`/calendario_del_volontario/${eventId}`)
}
