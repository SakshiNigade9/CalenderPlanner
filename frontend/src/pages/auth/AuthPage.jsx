import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User, Building2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

const initialFormState = {
  fullName: "",
  username: "",
  department: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Welcome back, Warrior ⚔️");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              username: formData.username,
              department: formData.department,
            },
          },
        });

        if (error) throw error;

        // Create Profile Entry
        if (data.user) {
          await supabase.from("profiles").insert([{
            id: data.user.id,
            full_name: formData.fullName,
            username: formData.username,
            department: formData.department,
            role: "warrior",
          }]);
        }
        toast.success("Account created successfully 🔥");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative px-6 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/20 blur-[130px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 blur-[130px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl p-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">CampusFlow AI</h1>
          <p className="text-gray-400">{isLogin ? "Login to your intelligent workspace" : "Join the futuristic campus network"}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8">
          {["Login", "Sign Up"].map((tab) => {
            const active = (tab === "Login") === isLogin;
            return (
              <button
                key={tab}
                onClick={() => setIsLogin(tab === "Login")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${active ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                <AuthInput icon={<User size={20} />} name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
                <AuthInput icon={<User size={20} />} name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
                <AuthInput icon={<Building2 size={20} />} name="department" placeholder="Department (e.g. MCA)" value={formData.department} onChange={handleChange} />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthInput icon={<Mail size={20} />} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} data-testid="email-input" />
          
          <AuthInput 
            icon={<Lock size={20} />} 
            type={showPassword ? "text" : "password"} 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange}
            togglePassword={() => setShowPassword(!showPassword)}
            isPassword
            showPassword={showPassword}
            data-testid="password-input"
          />

          {!isLogin && (
            <AuthInput icon={<Lock size={20} />} type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
          )}

          {isLogin && (
            <div className="flex justify-end text-sm">
              <button type="button" className="text-red-400 hover:text-red-300 transition-colors">Forgot Password?</button>
            </div>
          )}

          <motion.button
            data-testid="login-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-lg shadow-xl shadow-red-500/20 disabled:opacity-50 transition-all"
          >
            {loading ? "Syncing..." : isLogin ? "Login" : "Create Account"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

// Helper component for cleaner inputs
const AuthInput = ({ icon, isPassword, showPassword, togglePassword, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-400 transition-colors">
      {icon}
    </div>
    <input
      {...props}
      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-black/30 border border-white/10 text-white outline-none focus:border-red-500/50 transition-all placeholder:text-gray-600"
      required
    />
    {isPassword && (
      <button type="button" onClick={togglePassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    )}
  </div>
);

export default AuthPage;