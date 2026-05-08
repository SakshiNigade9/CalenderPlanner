import Sidebar from "../components/navigation/Sidebar"
import Navbar from "../components/navigation/Navbar"

function MainLayout({ children }) {
  return (
    <div className="relative flex min-h-screen bg-[#020617] overflow-hidden">

      {/* Strong Red Glow */}

      <div className="
        absolute
        top-[-150px]
        left-[-150px]
        w-[450px]
        h-[450px]
        bg-red-500/20
        rounded-full
        blur-[120px]
      " />

      {/* Purple Glow */}

      <div className="
        absolute
        bottom-[-200px]
        right-[-200px]
        w-[500px]
        h-[500px]
        bg-purple-500/20
        rounded-full
        blur-[140px]
      " />

      {/* Center Ambient Glow */}

      <div className="
        absolute
        top-[30%]
        left-[35%]
        w-[350px]
        h-[350px]
        bg-pink-500/10
        rounded-full
        blur-[120px]
      " />

      {/* Sidebar */}

      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* Main Content */}

      <main className="
        relative
        z-10
        flex-1
        p-8
        overflow-auto
      ">

        <Navbar />

        {children}

      </main>

    </div>
  )
}

export default MainLayout