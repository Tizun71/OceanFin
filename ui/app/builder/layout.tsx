import "reactflow/dist/style.css"

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-white">
      {children}
    </div>
  )
}
