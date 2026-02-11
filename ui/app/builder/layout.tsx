export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white">
      {children}
    </div>
  )
}
