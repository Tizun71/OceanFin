import Sidebar from "./components/Sidebar"
import Canvas from "./components/Canvas"
import ConfigPanel from "./components/ConfigPanel"

export default function BuilderPage() {
  return (
    <div className="flex flex-1 h-full mt-16">
      
      <div className="w-[260px] border-r border-neutral-800 bg-neutral-900">
        <Sidebar />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Canvas />
      </div>

      <div className="w-[360px] border-l border-neutral-800 bg-neutral-900">
        <ConfigPanel />
      </div>

    </div>
  )
}
