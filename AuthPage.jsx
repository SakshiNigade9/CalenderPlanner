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
  const [profileImage, setProfileImage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Upload image to Supabase storage
  const uploadProfileImage = async (userId) => {
    if (!profileImage) return null;

    const fileName = `${userId}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, profileImage);

    if (error) throw error;

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ✅ Forgot password
  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Enter your email first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      {
        redirectTo: "http://localhost:5173/reset-password",
      }
    );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent 📩");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // VALIDATION (signup only)
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
      }

      // LOGIN
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success("Welcome back, Warrior ⚔️");
      }

      // SIGNUP
      else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: "http://localhost:5173/login",
            data: {
              full_name: formData.fullName,
              username: formData.username,
              department: formData.department,
            },
          },
        });

        if (error) throw error;

        // Create profile + upload image
        if (data.user) {
          const imageUrl = await uploadProfileImage(data.user.id);

          await supabase.from("profiles").insert([
            {
              id: data.user.id,
              full_name: formData.fullName,
              username: formData.username,
              department: formData.department,
              role: "warrior",
              avatar_url: imageUrl,
            },
          ]);
        }

        toast.success("Check your email to verify account 📩");
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

      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/20 blur-[130px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 blur-[130px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl p-10 shadow-2xl"
      >

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white">
            CampusFlow AI
          </h1>
          <p className="text-gray-400">
            {isLogin ? "Login to your workspace" : "Join the network"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8">
          {["Login", "Sign Up"].map((tab) => {
            const active = (tab === "Login") === isLogin;

            return (
              <button
                key={tab}
                onClick={() => setIsLogin(tab === "Login")}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleAuth} className="space-y-4">

          {/* SIGNUP FIELDS */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div className="space-y-4">

                <AuthInput
                  icon={<User size={20} />}
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                />

                <AuthInput
                  icon={<User size={20} />}
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />

                <AuthInput
                  icon={<Building2 size={20} />}
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleChange}
                />

                {/* PROFILE IMAGE */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files[0])}
                  className="w-full text-white bg-black/30 border border-white/10 rounded-2xl p-3"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* EMAIL */}
          <AuthInput
            icon={<Mail size={20} />}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          {/* PASSWORD */}
          <AuthInput
            icon={<Lock size={20} />}
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            isPassword
            showPassword={showPassword}
            togglePassword={() => setShowPassword(!showPassword)}
          />

          {/* CONFIRM PASSWORD */}
          {!isLogin && (
            <AuthInput
              icon={<Lock size={20} />}
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          )}

          {/* FORGOT PASSWORD */}
          {isLogin && (
            <div
              onClick={handleForgotPassword}
              className="text-right text-sm text-red-400 cursor-pointer hover:text-red-300"
            >
              Forgot Password?
            </div>
          )}

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black"
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Create Account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* INPUT COMPONENT */
const AuthInput = ({
  icon,
  isPassword,
  showPassword,
  togglePassword,
  ...props
}) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
      {icon}
    </div>

    <input
      {...props}
      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-black/30 border border-white/10 text-white"
      required
    />

    {isPassword && (
      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </button>
    )}
  </div>
);

export default AuthPage;