import { useEffect, useState } from "react"

import toast from "react-hot-toast"

import {
  motion,
  AnimatePresence,
} from "framer-motion"

import {
  CalendarDays,
  MapPin,
  Users,
  Search,
  Filter,
  Trash2,
  Pencil,
} from "lucide-react"

import AddActivityModal from "../../components/modals/AddActivityModal"

import { supabase } from "../../lib/supabase"

function ActivitiesPage() {

  const [user, setUser] =
  useState(null)

  const [isModalOpen, setIsModalOpen] =
    useState(false)

  const [editingActivity, setEditingActivity] =
    useState(null)

  const [activities, setActivities] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [searchTerm, setSearchTerm] =
    useState("")

  const [statusFilter, setStatusFilter] =
    useState("All")

  const [isFilterOpen, setIsFilterOpen] =
    useState(false)

  // FETCH ACTIVITIES

  const fetchActivities = async () => {

      const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {

  setActivities([])

  setLoading(false)

  return
}

// FETCH PROFILE

const {
  data: profile,
} = await supabase

  .from("profiles")

  .select("role")

  .eq("id", user.id)

  .single()

let query = supabase

  .from("activities")

  .select("*")

// ADMIN → ALL ACTIVITIES

if (profile?.role !== "admin") {

  query = query.eq(
    "user_id",
    user.id
  )
}

const {
  data,
  error,
} = await query.order(
  "created_at",
  {
    ascending: false,
  }
)

    if (error) {

      console.log(
        "FETCH ERROR:",
        error
      )

    } else {

      setActivities(data)
    }

    setLoading(false)
  }

  // REALTIME

  useEffect(() => {

    const getUser =
  async () => {

    const {
      data
    } =
      await supabase.auth.getUser()

    setUser(
      data?.user
    )
  }

getUser()

    fetchActivities()

    const channel = supabase
      .channel("activities-realtime")

      .on(
        "postgres_changes",

        {
          event: "*",
          schema: "public",
          table: "activities",
        },

        () => {

          console.log(
            "Activities realtime update"
          )

          fetchActivities()
        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )
    }

  }, [])

  // CREATE

  const handleCreateActivity = async (
    newActivity
  ) => {

    const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {

  toast.error(
    "User not authenticated"
  )

  return
}

const { error } =
  await supabase
    .from("activities")
        .insert([
          {
            title:
              newActivity.title,

            activity_type:
              "Technical",

            activity_date:
              newActivity.date,

            venue:
              newActivity.location,

            audience_count:
              Number(
                newActivity.participants
              ) || 0,

            description:
              newActivity.description || "",

                status:
                  "planned",

                created_by:
                  user.id,
          },
        ])

    if (error) {

      console.log(
        "SUPABASE ERROR:",
        error
      )

      toast.error(
        "Failed to create activity"
      )

    } else {

      fetchActivities()

      toast.success(
        "Activity created successfully"
      )

      setEditingActivity(null)

      setIsModalOpen(false)
    }
  }

  // UPDATE

  const handleUpdateActivity = async (
    updatedActivity
  ) => {

    const { error } =
      await supabase
        .from("activities")
        .update({
          title:
            updatedActivity.title,

          activity_type:
            "Technical",

          activity_date:
            updatedActivity.date,

          venue:
            updatedActivity.location,

          audience_count:
            Number(
              updatedActivity.participants
            ) || 0,

          description:
            updatedActivity.description || "",

          status:
            updatedActivity.status ||
            "planned",
        })

        .eq(
          "id",
          updatedActivity.id
        )

    if (error) {

      console.log(
        "UPDATE ERROR:",
        error
      )

      toast.error(
        "Failed to update activity"
      )

    } else {

      fetchActivities()

      toast.success(
        "Activity updated successfully"
      )

      setEditingActivity(null)

      setIsModalOpen(false)
    }
  }

  // DELETE

  const handleDeleteActivity = async (
    id
  ) => {


    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this activity?"
      )

    if (!confirmDelete) return

    const {
  data,
  error
} =
await supabase
  .from("activities")
  .delete()
  .eq("id", id)

    if (error) {

      console.log(
        "DELETE ERROR:",
        error
      )

      toast.error(
        "Failed to delete activity"
      )

      return

    } 

      fetchActivities()

      toast.success(
        "Activity deleted successfully"
      )
    
  }

// TOGGLE STATUS

const handleStatusToggle = async (
  activity
) => {

  const newStatus =

    activity.status ===
    "planned"

      ? "completed"

      : "planned"

  const { error } =
    await supabase
      .from("activities")
      .update({
        status: newStatus,
      })

      .eq(
        "id",
        activity.id
      )

  if (error) {

    console.log(
      "STATUS UPDATE ERROR:",
      error
    )

    toast.error(
      "Failed to update status"
    )

  } else {

    // INSTANT UI UPDATE

    setActivities((prev) =>

      prev.map((item) =>

        item.id === activity.id

          ? {
              ...item,
              status: newStatus,
            }

          : item
      )
    )

    toast.success(
      `Activity marked as ${newStatus}`
    )
  }
}

  // FILTER

  const filteredActivities =
    activities.filter((activity) => {

      const search =
        searchTerm.toLowerCase()

      const matchesSearch =

        activity.title
          ?.toLowerCase()
          .includes(search)

        ||

        activity.venue
          ?.toLowerCase()
          .includes(search)

        ||

        activity.description
          ?.toLowerCase()
          .includes(search)

      const matchesStatus =

        statusFilter === "All"

        ||

        activity.status ===
        statusFilter.toLowerCase()

      return (
        matchesSearch &&
        matchesStatus
      )
    })

  return (

    <div className="
      space-y-8
      relative
    ">

      {/* Glow */}

      <div className="
        fixed
        top-0
        left-1/3
        w-[500px]
        h-[500px]
        bg-red-500/10
        blur-[180px]
        rounded-full
        pointer-events-none
      " />

      <div className="
        fixed
        bottom-0
        right-0
        w-[400px]
        h-[400px]
        bg-pink-500/10
        blur-[160px]
        rounded-full
        pointer-events-none
      " />

      {/* Header */}

      <div className="
        flex
        items-center
        justify-between
      ">

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
            Activities
          </motion.h1>

          <p className="
            text-gray-400
            text-lg
          ">
            Manage and monitor all campus activities.
          </p>

        </div>

        <motion.button

          whileHover={{
            scale: 1.05,
            boxShadow:
              "0px 0px 40px rgba(255,80,80,0.35)",
          }}

          whileTap={{
            scale: 0.95,
          }}

          onClick={() => {

            setEditingActivity(null)

            setIsModalOpen(true)
          }}

          className="
            relative
            overflow-hidden
            px-6
            py-4
            rounded-2xl
            bg-gradient-to-r
            from-red-500
            to-pink-500
            text-white
            font-semibold
            shadow-lg
            shadow-red-500/30
          "
        >

          <div className="
            absolute
            inset-0
            bg-white/10
            opacity-0
            hover:opacity-100
            transition
          " />

          + Add Activity

        </motion.button>

      </div>

      {/* Search + Filter */}

      <div className="
        relative
        z-50
        grid
        grid-cols-2
        gap-6
      ">

        {/* Search */}

        <div className="
          flex
          items-center
          gap-3
          bg-white/5
          border
          border-white/10
          rounded-2xl
          px-5
          py-4
          backdrop-blur-xl
          shadow-lg
          shadow-black/20
        ">

          <Search className="
            text-gray-400
          " />

          <input
            type="text"

            value={searchTerm}

            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }

            placeholder="Search activities..."

            className="
              bg-transparent
              outline-none
              text-white
              w-full
            "
          />

        </div>

        {/* Filter */}

        <div className="
          relative
          bg-white/5
          border
          border-white/10
          rounded-2xl
          px-5
          py-4
          backdrop-blur-xl
          shadow-lg
          shadow-black/20
        ">

          <button

            onClick={() =>
              setIsFilterOpen(
                !isFilterOpen
              )
            }

            className="
              w-full
              flex
              items-center
              justify-between
              text-white
            "
          >

            <div className="
              flex
              items-center
              gap-3
            ">

              <Filter className="
                text-red-400
              " />

              <span className="
                text-gray-300
              ">
                Filter Status
              </span>

            </div>

            <div className="
              flex
              items-center
              gap-3
            ">

              <span className="
                px-3
                py-1
                rounded-full
                text-sm
                bg-red-500/10
                border
                border-red-500/20
                text-red-300
              ">
                {statusFilter}
              </span>

              <motion.div

                animate={{
                  rotate:
                    isFilterOpen
                      ? 180
                      : 0
                }}

                transition={{
                  duration: 0.25
                }}

                className="
                  text-gray-400
                "
              >
                ▼
              </motion.div>

            </div>

          </button>

          <AnimatePresence>

            {isFilterOpen && (

              <motion.div

                initial={{
                  opacity: 0,
                  y: -10,
                  scale: 0.95,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}

                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.95,
                }}

                transition={{
                  duration: 0.2
                }}

                className="
                  absolute
                  top-20
                  left-0
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#111827]/95
                  backdrop-blur-2xl
                  overflow-hidden
                  z-[999]
                  shadow-2xl
                  shadow-black/50
                "
              >

                {[
                  "All",
                  "planned",
                  "completed",
                ].map((option) => (

                  <button
                    key={option}

                    onClick={() => {

                      setStatusFilter(option)

                      setIsFilterOpen(false)
                    }}

                    className={`
                      w-full
                      text-left
                      px-5
                      py-4
                      transition-all
                      duration-300

                      ${
                        statusFilter === option

                          ? `
                            bg-red-500/10
                            text-red-300
                          `

                          : `
                            text-gray-300
                            hover:bg-white/5
                            hover:text-white
                          `
                      }
                    `}
                  >

                    {option.charAt(0)
                      .toUpperCase() +
                      option.slice(1)}

                  </button>

                ))}

              </motion.div>

            )}

          </AnimatePresence>

        </div>

      </div>

      {/* Loading */}

      {loading && (

        <div className="
          text-center
          text-gray-400
          py-20
          text-xl
        ">
          Loading activities...
        </div>
      )}

      {/* Activities */}

      {!loading && (

        <div className="
          relative
          z-0
          grid
          grid-cols-3
          gap-8
        ">

          {filteredActivities.length === 0 ? (

            <div className="
              col-span-3
              flex
              items-center
              justify-center
              py-24
            ">

              <motion.div

                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}

                animate={{
                  opacity: 1,
                  scale: 1,
                }}

                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-[#111827]/80
                  backdrop-blur-2xl
                  p-12
                  text-center
                  shadow-2xl
                  max-w-xl
                  w-full
                "
              >

                <div className="
                  absolute
                  -top-20
                  left-1/2
                  -translate-x-1/2
                  w-60
                  h-60
                  bg-red-500/10
                  blur-3xl
                  rounded-full
                " />

                <div className="
                  relative
                  z-10
                ">

                  <div className="
                    text-7xl
                    mb-6
                  ">
                    🚀
                  </div>

                  <h2 className="
                    text-3xl
                    font-bold
                    text-white
                    mb-4
                  ">
                    No Activities Found
                  </h2>

                  <p className="
                    text-gray-400
                    mb-8
                    leading-relaxed
                  ">
                    Try adjusting your filters
                    or create a new activity
                    to get started.
                  </p>

                  <motion.button

                    whileHover={{
                      scale: 1.05,
                    }}

                    whileTap={{
                      scale: 0.95,
                    }}

                    onClick={() => {

                      setEditingActivity(null)

                      setIsModalOpen(true)
                    }}

                    className="
                      px-6
                      py-4
                      rounded-2xl
                      bg-gradient-to-r
                      from-red-500
                      to-pink-500
                      text-white
                      font-semibold
                      shadow-lg
                      shadow-red-500/30
                    "
                  >
                    + Create Activity
                  </motion.button>

                </div>

              </motion.div>

            </div>

          ) : (

            filteredActivities.map((
              activity,
              index
            ) => (

              <motion.div
                key={activity.id}

                initial={{
                  opacity: 0,
                  y: 40,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

                transition={{
                  delay:
                    index * 0.12,
                }}

                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}

                className="
                  group
                  relative
                  rounded-3xl
                  border
                  border-red-500/10
                  bg-gradient-to-br
                  from-[#111827]
                  to-[#1e293b]
                  p-7
                  shadow-2xl
                  backdrop-blur-2xl
                "
              >

                <div className="
                  absolute
                  -top-20
                  -right-20
                  w-60
                  h-60
                  bg-red-500/10
                  blur-3xl
                  rounded-full
                  opacity-50
                  group-hover:opacity-100
                  transition
                  duration-500
                " />

                <div className="
                  absolute
                  bottom-0
                  left-0
                  w-full
                  h-[2px]
                  bg-gradient-to-r
                  from-transparent
                  via-red-500
                  to-transparent
                  opacity-0
                  group-hover:opacity-100
                  transition
                  duration-500
                " />

                <div className="
                  flex
                  items-start
                  justify-between
                  mb-6
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <span className="
                      px-4
                      py-2
                      rounded-full
                      text-sm
                      bg-red-500/10
                      text-red-300
                      border
                      border-red-500/20
                      backdrop-blur-xl
                    ">
                      {activity.activity_type}
                    </span>

                    <motion.button

                      whileHover={{
                        scale: 1.05,
                      }}

                      whileTap={{
                        scale: 0.95,
                      }}

                      onClick={() =>
                        handleStatusToggle(
                          activity
                        )
                      }

                      className={`
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-medium
                        backdrop-blur-xl
                        border
                        transition-all
                        duration-300

                        ${
                          activity.status ===
                          "completed"

                            ? `
                              bg-green-500/10
                              text-green-300
                              border-green-500/20
                            `

                            : `
                              bg-yellow-500/10
                              text-yellow-300
                              border-yellow-500/20
                            `
                        }
                      `}
                    >

                      {activity.status}

                    </motion.button>

                  </div>

                  <div className="
                    flex
                    items-center
                  ">

                    <motion.button

                      whileHover={{
                        scale: 1.1,
                      }}

                      whileTap={{
                        scale: 0.9,
                      }}

                      onClick={() => {

                        setEditingActivity(
                          activity
                        )

                        setIsModalOpen(true)
                      }}

                      className="
                        opacity-40
                        group-hover:opacity-100
                        transition-all
                        duration-300
                        w-11
                        h-11
                        rounded-2xl
                        bg-blue-500/10
                        border
                        border-blue-500/20
                        flex
                        items-center
                        justify-center
                        text-blue-400
                        hover:bg-blue-500/20
                        mr-3
                      "
                    >

                      <Pencil size={18} />

                    </motion.button>

                    <motion.button

                      whileHover={{
                        scale: 1.1,
                      }}

                      whileTap={{
                        scale: 0.9,
                      }}

                      onClick={() =>
                        handleDeleteActivity(
                          activity.id
                        )
                      }

                      className="
                        opacity-40
                        group-hover:opacity-100
                        transition-all
                        duration-300
                        w-11
                        h-11
                        rounded-2xl
                        bg-red-500/10
                        border
                        border-red-500/20
                        flex
                        items-center
                        justify-center
                        text-red-400
                        hover:bg-red-500/20
                      "
                    >

                      <Trash2 size={18} />

                    </motion.button>

                  </div>

                </div>

                <h2 className="
                  text-2xl
                  font-bold
                  text-white
                  mb-5
                  leading-snug
                ">
                  {activity.title}
                </h2>

                <div className="
                  space-y-4
                ">

                  <div className="
                    flex
                    items-center
                    gap-3
                    text-gray-400
                  ">
                    <CalendarDays size={18} />

                    <span>
                      {activity.activity_date}
                    </span>

                  </div>

                  <div className="
                    flex
                    items-center
                    gap-3
                    text-gray-400
                  ">
                    <MapPin size={18} />

                    <span>
                      {activity.venue}
                    </span>

                  </div>

                  <div className="
                    flex
                    items-center
                    gap-3
                    text-gray-400
                  ">
                    <Users size={18} />

                    <span>
                      {
                        activity.audience_count
                      }
                      {" "}
                      Participants
                    </span>

                  </div>

                </div>

              </motion.div>

            ))

          )}

        </div>
      )}

      <AddActivityModal
        isOpen={isModalOpen}

        onClose={() => {

          setIsModalOpen(false)

          setEditingActivity(null)
        }}

        onCreateActivity={
          editingActivity
            ? handleUpdateActivity
            : handleCreateActivity
        }

        editingActivity={
          editingActivity
        }
      />

    </div>
  )
}

export default ActivitiesPage