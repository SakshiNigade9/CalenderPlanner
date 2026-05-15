import Sidebar from "../components/navigation/Sidebar";
import Navbar from "../components/navigation/Navbar";

function MainLayout({ children }) {
  return (
    <div className="relative flex h-screen bg-[#020617] overflow-hidden">
      
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AmbientGlow 
          color="bg-red-500/20" 
          size="w-[450px] h-[450px]" 
          position="-top-[150px] -left-[150px]" 
          blur="blur-[120px]" 
        />
        <AmbientGlow 
          color="bg-purple-500/20" 
          size="w-[500px] h-[500px]" 
          position="-bottom-[200px] -right-[200px]" 
          blur="blur-[140px]" 
        />
        <AmbientGlow 
          color="bg-pink-500/10" 
          size="w-[350px] h-[350px]" 
          position="top-[30%] left-[35%]" 
          blur="blur-[120px]" 
        />
      </div>

      {/* Sidebar Navigation */}
      <aside className="relative z-30 shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Navbar />
          
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Helper component for background ambient glows
 * to keep the main layout code clean.
 */
const AmbientGlow = ({ color, size, position, blur }) => (
  <div className={`absolute rounded-full ${color} ${size} ${position} ${blur}`} />
);

export default MainLayout;