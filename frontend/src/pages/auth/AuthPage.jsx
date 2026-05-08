import { useState } from "react"

import { motion } from "framer-motion"

import toast from "react-hot-toast"

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
} from "lucide-react"

import { supabase } from "../../lib/supabase"

function AuthPage() {

  const [isLogin, setIsLogin] =
    useState(true)

  const [loading, setLoading] =
    useState(false)

  const [showPassword, setShowPassword] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  // FORM DATA

  const [formData, setFormData] =
    useState({

      fullName: "",

      username: "",

      department: "",

      email: "",

      password: "",

      confirmPassword: "",
    })

  // HANDLE INPUT

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,
    })
  }

  // HANDLE AUTH

  const handleAuth = async (
    e
  ) => {

    e.preventDefault()

    setLoading(true)

    try {

      // VALIDATIONS

      if (!isLogin) {

        if (
          formData.password !==
          formData.confirmPassword
        ) {

          toast.error(
            "Passwords do not match"
          )

          setLoading(false)

          return
        }

        if (
          formData.password.length < 6
        ) {

          toast.error(
            "Password must be at least 6 characters"
          )

          setLoading(false)

          return
        }
      }

      // LOGIN

      if (isLogin) {

        const { error } =
          await supabase.auth.signInWithPassword({

            email:
              formData.email,

            password:
              formData.password,
          })

        if (error) {

          toast.error(
            error.message
          )

        } else {

          toast.success(
            "Welcome back 🚀"
          )
        }

      } else {

        // SIGNUP

        const {

          data,

          error,

        } = await supabase.auth.signUp({

          email:
            formData.email,

          password:
            formData.password,

          options: {

            data: {

              full_name:
                formData.fullName,

              username:
                formData.username,

              department:
                formData.department,
            },
          },
        })

        if (error) {

          toast.error(
            error.message
          )

        } else {

          // INSERT PROFILE

          const user =
            data.user

          if (user) {

            const {
              error: profileError,
            } = await supabase

              .from("profiles")

              .insert([{

                id:
                  user.id,

                full_name:
                  formData.fullName,

                username:
                  formData.username,

                department:
                  formData.department,

                role:
                  "student",
              }])

            if (profileError) {

              console.log(
                profileError
              )
            }
          }

          toast.success(
            "Account created successfully 🔥"
          )

          setIsLogin(true)
        }
      }

    } catch (err) {

      toast.error(
        "Something went wrong"
      )
    }

    setLoading(false)
  }

  return (

    <div className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-[#020617]
      overflow-hidden
      relative
      px-6
    ">

      {/* Background Glow */}

      <div className="
        absolute
        top-0
        left-1/4
        w-[450px]
        h-[450px]
        bg-red-500/20
        blur-[120px]
        rounded-full
      " />

      <div className="
        absolute
        bottom-0
        right-1/4
        w-[450px]
        h-[450px]
        bg-purple-500/20
        blur-[120px]
        rounded-full
      " />

      {/* Auth Card */}

      <motion.div

        initial={{
          opacity: 0,
          y: 40,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.5,
        }}

        className="
          relative
          z-10
          w-full
          max-w-lg
          rounded-[32px]
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          shadow-2xl
          p-10
        "
      >

        {/* Header */}

        <div className="
          text-center
          mb-10
        ">

          <h1 className="
            text-5xl
            font-black
            text-white
            mb-4
          ">
            CampusFlow AI
          </h1>

          <p className="
            text-gray-400
            text-lg
          ">

            {
              isLogin

                ? "Login to continue your intelligent workspace"

                : "Create your futuristic campus account"
            }

          </p>

        </div>

        {/* Tabs */}

        <div className="
          flex
          bg-[#0f172a]/70
          rounded-2xl
          p-2
          mb-8
        ">

          <button

            type="button"

            onClick={() =>
              setIsLogin(true)
            }

            className={`
              flex-1
              py-3
              rounded-xl
              font-semibold
              transition-all
              duration-300

              ${
                isLogin

                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"

                  : "text-gray-400"
              }
            `}
          >
            Login
          </button>

          <button

            type="button"

            onClick={() =>
              setIsLogin(false)
            }

            className={`
              flex-1
              py-3
              rounded-xl
              font-semibold
              transition-all
              duration-300

              ${
                !isLogin

                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"

                  : "text-gray-400"
              }
            `}
          >
            Sign Up
          </button>

        </div>

        {/* Form */}

        <form
          onSubmit={handleAuth}

          className="
            space-y-5
          "
        >

          {/* SIGNUP ONLY */}

          {
            !isLogin && (

              <>

                {/* Full Name */}

                <div className="
                  relative
                ">

                  <User
                    size={20}

                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                    "
                  />

                  <input
                    type="text"

                    name="fullName"

                    required

                    value={
                      formData.fullName
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Full Name"

                    className="
                      w-full
                      pl-12
                      pr-4
                      py-4
                      rounded-2xl
                      bg-[#0f172a]/80
                      border
                      border-white/10
                      text-white
                      outline-none
                      focus:border-red-500/50
                    "
                  />

                </div>

                {/* Username */}

                <div className="
                  relative
                ">

                  <User
                    size={20}

                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                    "
                  />

                  <input
                    type="text"

                    name="username"

                    required

                    value={
                      formData.username
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Username"

                    className="
                      w-full
                      pl-12
                      pr-4
                      py-4
                      rounded-2xl
                      bg-[#0f172a]/80
                      border
                      border-white/10
                      text-white
                      outline-none
                      focus:border-red-500/50
                    "
                  />

                </div>

                {/* Department */}

                <div className="
                  relative
                ">

                  <Building2
                    size={20}

                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                    "
                  />

                  <input
                    type="text"

                    name="department"

                    required

                    value={
                      formData.department
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Department"

                    className="
                      w-full
                      pl-12
                      pr-4
                      py-4
                      rounded-2xl
                      bg-[#0f172a]/80
                      border
                      border-white/10
                      text-white
                      outline-none
                      focus:border-red-500/50
                    "
                  />

                </div>

              </>
            )
          }

          {/* Email */}

          <div className="
            relative
          ">

            <Mail
              size={20}

              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-500
              "
            />

            <input
              type="email"

              name="email"

              required

              value={
                formData.email
              }

              onChange={
                handleChange
              }

              placeholder="Email"

              className="
                w-full
                pl-12
                pr-4
                py-4
                rounded-2xl
                bg-[#0f172a]/80
                border
                border-white/10
                text-white
                outline-none
                focus:border-red-500/50
              "
            />

          </div>

          {/* Password */}

          <div className="
            relative
          ">

            <Lock
              size={20}

              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-500
              "
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }

              name="password"

              required

              value={
                formData.password
              }

              onChange={
                handleChange
              }

              placeholder="Password"

              className="
                w-full
                pl-12
                pr-14
                py-4
                rounded-2xl
                bg-[#0f172a]/80
                border
                border-white/10
                text-white
                outline-none
                focus:border-red-500/50
              "
            />

            <button
              type="button"

              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }

              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            >

              {
                showPassword

                  ? <EyeOff size={20} />

                  : <Eye size={20} />
              }

            </button>

          </div>

          {/* Confirm Password */}

          {
            !isLogin && (

              <div className="
                relative
              ">

                <Lock
                  size={20}

                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  type={
                    showConfirmPassword

                      ? "text"

                      : "password"
                  }

                  name="confirmPassword"

                  required

                  value={
                    formData.confirmPassword
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Confirm Password"

                  className="
                    w-full
                    pl-12
                    pr-14
                    py-4
                    rounded-2xl
                    bg-[#0f172a]/80
                    border
                    border-white/10
                    text-white
                    outline-none
                    focus:border-red-500/50
                  "
                />

                <button
                  type="button"

                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }

                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                >

                  {
                    showConfirmPassword

                      ? <EyeOff size={20} />

                      : <Eye size={20} />
                  }

                </button>

              </div>
            )
          }

          {/* Remember/Forgot */}

          {
            isLogin && (

              <div className="
                flex
                items-center
                justify-between
                text-sm
              ">

                <label className="
                  flex
                  items-center
                  gap-2
                  text-gray-400
                ">

                  <input
                    type="checkbox"

                    className="
                      accent-red-500
                    "
                  />

                  Remember me

                </label>

                <button
                  type="button"

                  className="
                    text-red-400
                    hover:text-red-300
                  "
                >
                  Forgot Password?
                </button>

              </div>
            )
          }

          {/* Submit Button */}

          <motion.button

            whileHover={{
              scale: 1.02,
            }}

            whileTap={{
              scale: 0.97,
            }}

            disabled={loading}

            className="
              w-full
              py-4
              rounded-2xl
              bg-gradient-to-r
              from-red-500
              to-pink-500
              text-white
              font-bold
              text-lg
              shadow-lg
              shadow-red-500/30
            "
          >

            {
              loading

                ? "Please wait..."

                : isLogin

                  ? "Login"

                  : "Create Account"
            }

          </motion.button>

        </form>

      </motion.div>

    </div>
  )
}

export default AuthPage