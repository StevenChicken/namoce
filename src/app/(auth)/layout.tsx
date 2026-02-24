import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-namo-cyan/5 px-4 py-8">
      <div className="mb-10 flex flex-col items-center gap-2">
        <Image
          src="/logo.png"
          alt="Namo APS"
          width={160}
          height={80}
          className="h-auto w-auto"
          priority
        />
        <p className="text-sm tracking-wide text-namo-muted">
          Piattaforma volontari
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
