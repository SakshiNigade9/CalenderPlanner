import { useEffect, useState } from "react"

import {
  motion,
} from "framer-motion"

import {
  Settings,
  Save,
  UserCircle2,
} from "lucide-react"

import toast from "react-hot-toast"

import { supabase } from "../../lib/supabase"

function SettingsPage() {

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [profile, setProfile] =
    useState({

      full_name: "",

      username: "",

      department: "",
    })

  // FETCH PROFILE

  const fetchProfile =
    async () => {

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

      if (!error && data) {

        setProfile({

          full_name:
            data.full_name || "",

          username:
            data.username || "",

          department:
            data.department || "",
        })
      }

      setLoading(false)
    }

  useEffect(() => {

    fetchProfile()

  }, [])

  // HANDLE INPUT

  const handleChange = (e) => {

    setProfile({

      ...profile,

      [e.target.name]:
        e.target.value,
    })
  }

  // SAVE PROFILE

  const handleSave =
    async () => {

      setSaving(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {

        toast.error(
          "User not authenticated"
        )

        setSaving(false)

        return
      }

      const { error } =
        await supabase

          .from("profiles")

          .update({

            full_name:
              profile.full_name,

            username:
              profile.username,

            department:
              profile.department,
          })

          .eq(
            "id",
            user.id
          )

      if (error) {

        toast.error(
          "Failed to save settings"
        )

      } else {

        toast.success(
          "Profile updated successfully 🔥"
        )
        window.location.reload()
      }

      setSaving(false)
    }

  return (

    <div className="
      relative
      space-y-8
    ">

      {/* Background Glow */}

      <div className="
        fixed
        top-0
        left-1/3
        w-[450px]
        h-[450px]
        bg-indigo-500/10
        blur-[180px]
        rounded-full
        pointer-events-none
      " />

      <div className="
        fixed
        bottom-0
        right-0
        w-[350px]
        h-[350px]
        bg-purple-500/10
        blur-[160px]
        rounded-full
        pointer-events-none
      " />

      {/* HEADER */}

      <div>

        <motion.h1

          initial={{
            opacity: 0,
            y: -20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          className="
            text-5xl
            font-black
            text-white
            mb-3
          "
        >
          Settings
        </motion.h1>

        <p className="
          text-gray-400
          text-lg
        ">
          Manage your account settings
          and profile information.
        </p>

      </div>

      {/* SETTINGS CARD */}

      <motion.div

        initial={{
          opacity: 0,
          y: 20,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          p-8
          max-w-3xl
        "
      >

        <div className="
          absolute
          top-0
          right-0
          w-32
          h-32
          bg-indigo-500/10
          blur-3xl
          rounded-full
        " />

        <div className="
          relative
          z-10
        ">

          {/* TITLE */}

          <div className="
            flex
            items-center
            gap-4
            mb-8
          ">

            <div className="
              w-16
              h-16
              rounded-2xl
              bg-gradient-to-br
              from-indigo-500
              to-purple-500
              flex
              items-center
              justify-center
            ">

              <Settings
                size={30}
                className="
                  text-white
                "
              />

            </div>

            <div>

              <h2 className="
                text-3xl
                font-bold
                text-white
              ">
                Profile Settings
              </h2>

              <p className="
                text-gray-400
              ">
                Update your personal information
              </p>

            </div>

          </div>

          {/* PROFILE AVATAR */}

          <div className="
            flex
            items-center
            gap-5
            mb-10
          ">

            <div className="
              w-24
              h-24
              rounded-3xl
              bg-gradient-to-br
              from-indigo-500
              to-purple-500
              flex
              items-center
              justify-center
            ">

              <UserCircle2
                size={50}
                className="
                  text-white
                "
              />

            </div>

            <div>

              <h3 className="
                text-2xl
                font-bold
                text-white
                mb-2
              ">

                {
                  profile.full_name
                  || "User"
                }

              </h3>

              <p className="
                text-gray-400
              ">

                @
                {
                  profile.username
                  || "username"
                }

              </p>

            </div>

          </div>

          {/* FORM */}

          <div className="
            space-y-6
          ">

            {/* FULL NAME */}

            <div>

              <label className="
                block
                text-gray-300
                mb-3
                font-medium
              ">
                Full Name
              </label>

              <input
                type="text"

                name="full_name"

                value={
                  profile.full_name
                }

                onChange={
                  handleChange
                }

                placeholder="Enter full name"

                className="
                  w-full
                  px-5
                  py-4
                  rounded-2xl
                  bg-[#0f172a]/80
                  border
                  border-white/10
                  text-white
                  outline-none
                  focus:border-indigo-500/40
                "
              />

            </div>

            {/* USERNAME */}

            <div>

              <label className="
                block
                text-gray-300
                mb-3
                font-medium
              ">
                Username
              </label>

              <input
                type="text"

                name="username"

                value={
                  profile.username
                }

                onChange={
                  handleChange
                }

                placeholder="Enter username"

                className="
                  w-full
                  px-5
                  py-4
                  rounded-2xl
                  bg-[#0f172a]/80
                  border
                  border-white/10
                  text-white
                  outline-none
                  focus:border-indigo-500/40
                "
              />

            </div>

            {/* DEPARTMENT */}

            <div>

              <label className="
                block
                text-gray-300
                mb-3
                font-medium
              ">
                Department
              </label>

              <input
                type="text"

                name="department"

                value={
                  profile.department
                }

                onChange={
                  handleChange
                }

                placeholder="Enter department"

                className="
                  w-full
                  px-5
                  py-4
                  rounded-2xl
                  bg-[#0f172a]/80
                  border
                  border-white/10
                  text-white
                  outline-none
                  focus:border-indigo-500/40
                "
              />

            </div>

            {/* SAVE BUTTON */}

            <motion.button

              whileHover={{
                scale: 1.02,
              }}

              whileTap={{
                scale: 0.97,
              }}

              onClick={
                handleSave
              }

              disabled={saving}

              className="
                w-full
                mt-4
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-indigo-500
                to-purple-500
                text-white
                font-semibold
                text-lg
                shadow-lg
                shadow-indigo-500/20
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <Save size={22} />

              {
                saving

                  ? "Saving..."

                  : "Save Settings"
              }

            </motion.button>

          </div>

        </div>

      </motion.div>

    </div>
  )
}

export default SettingsPage