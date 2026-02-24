import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Image
          src="/logo.png"
          alt="Namo APS"
          width={120}
          height={60}
          className="h-auto w-auto"
          priority
        />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
