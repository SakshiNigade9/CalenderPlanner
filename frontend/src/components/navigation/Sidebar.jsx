import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Settings,
  Activity,
  LogOut,
  UserCircle2,
  Crown,
} from "lucide-react"

import { motion } from "framer-motion"

import {
  Link,
  useLocation,
} from "react-router-dom"

import {
  useEffect,
  useState,
} from "react"

import toast from "react-hot-toast"

import { supabase } from "../../lib/supabase"

function Sidebar() {

  const location = useLocation()

  const [profile, setProfile] =
    useState(null)
  const [loadingProfile, setLoadingProfile] =
    useState(true)

  // FETCH PROFILE

useEffect(() => {

  const fetchProfile = async () => {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const {
      data,
      error,
    } = await supabase

      .from("profiles")

      .select("*")

      .eq("id", user.id)

      .single()

    if (!error) {

      setProfile(data)
    }

    setLoadingProfile(false)
  }

  fetchProfile()

  // REALTIME PROFILE LISTENER

  const channel = supabase

    .channel("profile-realtime")

    .on(
      "postgres_changes",

      {
        event: "*",
        schema: "public",
        table: "profiles",
      },

      () => {

        fetchProfile()
      }
    )

    .subscribe()

  return () => {

    supabase.removeChannel(
      channel
    )
  }

}, [])

  // LOGOUT

  const handleLogout = async () => {

    const { error } =
      await supabase.auth.signOut()

    if (error) {

      toast.error(
        "Logout failed"
      )

    } else {

      toast.success(
        "Logged out successfully"
      )
    }
  }

  const menuItems = [

    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },

    {
      title: "Activities",
      icon: Activity,
      path: "/activities",
    },

    {
      title: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },

    {
      title: "Reports",
      icon: FileText,
      path: "/reports",
    },

    {
      title: "Admin",
      icon: Crown,
      path: "/admin",
    },

    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ]

  return (

    <motion.div

      initial={{
        x: -80,
        opacity: 0,
      }}

      animate={{
        x: 0,
        opacity: 1,
      }}

      transition={{
        duration: 0.5,
      }}

      className="
        w-72
        min-h-screen
        bg-[#0b1120]/90
        backdrop-blur-2xl
        border-r
        border-white/5
        relative
        z-20
        flex
        flex-col
        justify-between
      "
    >

      {/* Sidebar Glow */}

      <div className="
        absolute
        top-0
        left-0
        w-40
        h-40
        bg-red-500/10
        blur-[100px]
        rounded-full
      " />

      <div className="
        p-6
        relative
        z-10
      ">

        {/* Logo */}

        <div className="
          mb-12
        ">

          <h1 className="
            text-3xl
            font-black
            text-white
            tracking-tight
          ">
            CampusFlow AI
          </h1>

          <p className="
            text-gray-400
            text-sm
            mt-2
          ">
            Futuristic Academic Intelligence
          </p>

        </div>

        {/* USER CARD */}

        <div className="
          mb-10
          rounded-3xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-xl
          p-5
          relative
          overflow-hidden
        ">

          <div className="
            absolute
            top-0
            right-0
            w-24
            h-24
            bg-red-500/10
            blur-3xl
            rounded-full
          " />

          <div className="
            relative
            z-10
          ">

            <div className="
              flex
              items-center
              gap-4
              mb-4
            ">

              <div className="
                w-14
                h-14
                rounded-2xl
                bg-gradient-to-br
                from-red-500
                to-pink-500
                flex
                items-center
                justify-center
              ">

                <UserCircle2
                  size={30}
                  className="
                    text-white
                  "
                />

              </div>

              <div>

                <h2 className="
                  text-white
                  font-bold
                  text-lg
                ">

                  {
                    loadingProfile

                      ? "Loading..."

                      : profile?.full_name
                        || "User"
                  }

                </h2>

                <p className="
                  text-gray-400
                  text-sm
                ">
                  @
                  {
                    loadingProfile

                      ? "loading"

                      : profile?.username
                        || "username"
                  }
                </p>

              </div>

            </div>

            <div className="
              flex
              items-center
              justify-between
            ">

              <span className="
                text-xs
                text-gray-400
              ">

                {
                  profile?.department
                  || "Department"
                }

              </span>

              <span
                className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  border

                  ${
                    profile?.role === "admin"

                      ? `
                        bg-yellow-500/20
                        text-yellow-300
                        border-yellow-500/20
                      `

                      : `
                        bg-red-500/20
                        text-red-300
                        border-red-500/20
                      `
                  }
                `}
              >

                {
                loadingProfile

                  ? "..."

                  : profile?.role === "admin"

                    ? "ADMIN"

                    : "STUDENT"
              }

              </span>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="
          space-y-4
        ">

          {
  menuItems

    .filter((item) => {

      if (
        item.title === "Admin"
      ) {

        return (
          profile?.role ===
          "admin"
        )
      }

      return true
    })

    .map((
            item,
            index
          ) => {

            const Icon =
              item.icon

            const isActive =
              location.pathname ===
              item.path

            return (

              <Link
                to={item.path}
                key={index}
              >

                <motion.div

                  whileHover={{
                    x: 6,
                    scale: 1.02,
                  }}

                  className={`
                    relative
                    group
                    flex
                    items-center
                    gap-4
                    p-4
                    rounded-2xl
                    cursor-pointer
                    transition-all
                    duration-300
                    overflow-hidden

                    ${
                      isActive

                        ? `
                          bg-gradient-to-r
                          from-red-500/20
                          to-purple-500/10
                          border
                          border-red-500/20
                        `

                        : `
                          hover:bg-white/5
                          border
                          border-transparent
                        `
                    }
                  `}
                >

                  {/* Active Glow */}

                  {
                    isActive && (

                      <div className="
                        absolute
                        inset-0
                        bg-red-500/5
                        blur-2xl
                      " />
                    )
                  }

                  <Icon

                    size={22}

                    className={`
                      relative
                      z-10
                      transition

                      ${
                        isActive

                          ? "text-red-400"

                          : "text-gray-400 group-hover:text-white"
                      }
                    `}
                  />

                  <span className={`
                    relative
                    z-10
                    font-medium

                    ${
                      isActive

                        ? "text-white"

                        : "text-gray-300 group-hover:text-white"
                    }
                  `}>

                    {item.title}

                  </span>

                </motion.div>

              </Link>
            )
          })}

        </nav>

      </div>

      {/* LOGOUT */}

      <div className="
        p-6
        relative
        z-10
      ">

        <motion.button

          whileHover={{
            scale: 1.02,
          }}

          whileTap={{
            scale: 0.97,
          }}

          onClick={
            handleLogout
          }

          className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            py-4
            rounded-2xl
            bg-gradient-to-r
            from-red-500
            to-pink-500
            text-white
            font-semibold
            shadow-lg
            shadow-red-500/20
          "
        >

          <LogOut size={20} />

          Logout

        </motion.button>

      </div>

    </motion.div>
  )
}

export default Sidebar