import { useEffect, useState } from "react"

import {
  motion,
} from "framer-motion"

import {
  Shield,
  Users,
  Activity,
  Crown,
} from "lucide-react"

import toast from "react-hot-toast"

import { supabase } from "../../lib/supabase"

function AdminPage() {

  const [profiles, setProfiles] =
    useState([])

  const [activities, setActivities] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  // FETCH DATA

  const fetchAdminData =
    async () => {

      // GET USER

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // CHECK ROLE

      const {
        data: profile,
      } = await supabase

        .from("profiles")

        .select("role")

        .eq("id", user.id)

        .single()

      if (
        profile?.role !==
        "admin"
      ) {

        toast.error(
          "Access denied"
        )

        return
      }

      // FETCH USERS

      const {
        data: usersData,
      } = await supabase

        .from("profiles")

        .select("*")

      // FETCH ACTIVITIES

      const {
        data: activitiesData,
      } = await supabase

        .from("activities")

        .select("*")

      setProfiles(
        usersData || []
      )

      setActivities(
        activitiesData || []
      )

      setLoading(false)
    }

  useEffect(() => {

    fetchAdminData()

  }, [])

  // CHANGE ROLE

  const toggleRole = async (
    profile
  ) => {

    const newRole =

      profile.role ===
      "admin"

        ? "student"

        : "admin"

    const { error } =
      await supabase

        .from("profiles")

        .update({
          role: newRole,
        })

        .eq(
          "id",
          profile.id
        )

    if (error) {

      toast.error(
        "Failed to update role"
      )

    } else {

      toast.success(
        `Role updated to ${newRole}`
      )

      fetchAdminData()
    }
  }

  // METRICS

  const totalUsers =
    profiles.length

  const totalActivities =
    activities.length

  const totalParticipants =
    activities.reduce(
      (sum, activity) =>

        sum +
        (
          activity.audience_count
          || 0
        ),

      0
    )

  const adminCount =
    profiles.filter(
      (p) =>
        p.role === "admin"
    ).length

  const statCards = [

    {
      title:
        "Platform Users",

      value:
        totalUsers,

      icon: Users,
    },

    {
      title:
        "Total Activities",

      value:
        totalActivities,

      icon: Activity,
    },

    {
      title:
        "Participants",

      value:
        totalParticipants,

      icon: Shield,
    },

    {
      title:
        "Admins",

      value:
        adminCount,

      icon: Crown,
    },
  ]

  return (

    <div className="
      relative
      space-y-8
    ">

      {/* Glow */}

      <div className="
        fixed
        top-0
        left-1/3
        w-[450px]
        h-[450px]
        bg-yellow-500/10
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
          Admin Panel
        </motion.h1>

        <p className="
          text-gray-400
          text-lg
        ">
          Platform management and intelligence center.
        </p>

      </div>

      {/* STATS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        {statCards.map((
          card,
          index
        ) => {

          const Icon =
            card.icon

          return (

            <motion.div

              key={index}

              initial={{
                opacity: 0,
                y: 20,
              }}

              animate={{
                opacity: 1,
                y: 0,
              }}

              transition={{
                delay:
                  index * 0.1,
              }}

              className="
                rounded-3xl
                border
                border-yellow-500/10
                bg-white/5
                backdrop-blur-2xl
                p-6
                relative
                overflow-hidden
              "
            >

              <div className="
                absolute
                top-0
                right-0
                w-24
                h-24
                bg-yellow-500/10
                blur-3xl
                rounded-full
              " />

              <div className="
                relative
                z-10
              ">

                <div className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-gradient-to-br
                  from-yellow-500
                  to-orange-500
                  flex
                  items-center
                  justify-center
                  mb-6
                ">

                  <Icon
                    size={28}
                    className="
                      text-white
                    "
                  />

                </div>

                <p className="
                  text-gray-400
                  text-sm
                  mb-2
                ">
                  {card.title}
                </p>

                <h2 className="
                  text-5xl
                  font-black
                  text-white
                ">
                  {card.value}
                </h2>

              </div>

            </motion.div>
          )
        })}

      </div>

      {/* USERS TABLE */}

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
          rounded-3xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          p-8
        "
      >

        <h2 className="
          text-3xl
          font-bold
          text-white
          mb-8
        ">
          User Management
        </h2>

        <div className="
          overflow-x-auto
        ">

          <table className="
            w-full
          ">

            <thead>

              <tr className="
                border-b
                border-white/10
              ">

                <th className="
                  text-left
                  text-gray-400
                  pb-4
                ">
                  Name
                </th>

                <th className="
                  text-left
                  text-gray-400
                  pb-4
                ">
                  Username
                </th>

                <th className="
                  text-left
                  text-gray-400
                  pb-4
                ">
                  Department
                </th>

                <th className="
                  text-left
                  text-gray-400
                  pb-4
                ">
                  Role
                </th>

                <th className="
                  text-left
                  text-gray-400
                  pb-4
                ">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {profiles.map(
                (profile) => (

                  <tr

                    key={profile.id}

                    className="
                      border-b
                      border-white/5
                    "
                  >

                    <td className="
                      py-5
                      text-white
                    ">

                      {
                        profile.full_name
                      }

                    </td>

                    <td className="
                      py-5
                      text-gray-400
                    ">

                      @
                      {
                        profile.username
                      }

                    </td>

                    <td className="
                      py-5
                      text-gray-400
                    ">

                      {
                        profile.department
                      }

                    </td>

                    <td className="
                      py-5
                    ">

                      <span className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        border

                        ${
                          profile.role ===
                          "admin"

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
                      `}>

                        {
                          profile.role
                        }

                      </span>

                    </td>

                    <td className="
                      py-5
                    ">

                      <button

                        onClick={() =>
                          toggleRole(
                            profile
                          )
                        }

                        className="
                          px-4
                          py-2
                          rounded-xl
                          bg-gradient-to-r
                          from-yellow-500
                          to-orange-500
                          text-white
                          text-sm
                          font-medium
                        "
                      >

                        Toggle Role

                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </motion.div>

    </div>
  )
}

export default AdminPage