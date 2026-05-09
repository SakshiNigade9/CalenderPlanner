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

function TasksPage() {

  const [user, setUser] =
  useState(null)

  const [profile, setProfile] =
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

  const {
  data: profile,
} = await supabase

  .from("profiles")

  .select("*")

  .eq("id", user.id)

  .single()

  setProfile(profile)

  setActivities([])

  setLoading(false)

  return
}

// FETCH PROFILE

const {
  data: profile,
} = await supabase

  .from("profiles")

  .select("*")

  .eq("id", user.id)

  .single()

let query = supabase

  .from("tasks")

  .select("*")

// ADMIN → ALL ACTIVITIES

// ADMIN → ALL TASKS

if (
  profile?.role ===
  "admin"
) {

  // no filtering
}

// PRESIDENT → COLLEGE TASKS

else if (
  profile?.role ===
  "president"
) {

  query = query.eq(
    "college_id",
    profile.college_id
  )
}

// WARRIOR → OWN TASKS

else if (
  profile?.role ===
  "warrior"
) {

  query = query.eq(
    "assigned_to",
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

console.log(
  "LOGGED USER:",
  user.id
)

console.log(
  "FETCHED TASKS:",
  data
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
          table: "tasks",
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

const {
  data: profile,
} = await supabase

  .from("profiles")

  .select("*")

  .eq("id", user.id)

  .single()

const { error } =
  await supabase
    .from("tasks")
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

            priority:
              newActivity.priority || "medium",

            deadline:
              newActivity.deadline || null,

                status:
                  "planned",

                created_by:
                  user.id,

                assigned_to:
                  newActivity.assigned_to || user.id,

                assigned_user_name:
                  newActivity.assigned_user_name || "",  

                assigned_college_id:
                  profile?.college_id || null,

                assigned_team_id:
                  profile?.team_id || null,

                user_id:
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
        .from("tasks")
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
  .from("tasks")
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
      .from("tasks")
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

// UPDATE PROGRESS

const handleProgressUpdate = async (
  activity,
  amount
) => {

  const newProgress =

    Math.min(
      100,

      Math.max(
        0,

        (activity.progress || 0)
        + amount
      )
    )

  const newStatus =

    newProgress === 100

      ? "completed"

      : "planned"

  const { error } =
    await supabase

      .from("tasks")

      .update({

        progress:
          newProgress,

        status:
          newStatus,
      })

      .eq(
        "id",
        activity.id
      )

  if (error) {

    toast.error(
      "Failed to update progress"
    )

  } else {

    setActivities((prev) =>

      prev.map((item) =>

        item.id === activity.id

          ? {

              ...item,

              progress:
                newProgress,

              status:
                newStatus,
            }

          : item
      )
    )

    toast.success(
      `Progress updated to ${newProgress}%`
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

                className={`
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
                  
                  ${
                    activity.deadline &&

                    new Date(activity.deadline)
                    < new Date()

                    &&

                    activity.status !==
                    "completed"

                      ? `
                        border-red-500
                        shadow-red-500/40
                      `

                      : ""
                  }

                `}
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

{
  profile?.role !==
  "warrior" && (

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

  )
}
                
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
                  mb-4
                ">

                <span className={`
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                  border

                   ${
                     activity.priority === "high"

                       ? `
                          bg-red-500/10
                          text-red-300
                          border-red-500/20
                        `

                        : activity.priority === "medium"

                        ? `
                          bg-yellow-500/10
                          text-yellow-300
                          border-yellow-500/20
                        `

                        : `
                          bg-green-500/10
                          text-green-300
                          border-green-500/20
                        `
                    }
                  `}>

                    {activity.priority || "medium"} Priority

                  </span>

                </div>

                {/* Progress Section */}

<div className="
  mb-6
">

  <div className="
    flex
    items-center
    justify-between
    mb-2
  ">

    <span className="
      text-sm
      text-gray-400
    ">
      Progress
    </span>

    <span className="
      text-sm
      text-red-400
      font-semibold
    ">
      {activity.progress || 0}%
    </span>

  </div>

  <div className="
    w-full
    h-3
    rounded-full
    bg-white/10
    overflow-hidden
  ">

    <div

      className="
        h-full
        rounded-full
        bg-gradient-to-r
        from-red-500
        to-pink-500
        transition-all
        duration-500
      "

      style={{
        width: `${
          activity.progress || 0
        }%`
      }}
    />

  </div>

  <div className="
  flex
  items-center
  gap-3
  mt-4
">

  <button

    onClick={() =>
      handleProgressUpdate(
        activity,
        -10
      )
    }

    className="
      px-4
      py-2
      rounded-xl
      bg-white/5
      border
      border-white/10
      text-white
      hover:bg-white/10
      transition
    "
  >
    -10%
  </button>

  <button

    onClick={() =>
      handleProgressUpdate(
        activity,
        10
      )
    }

    className="
      px-4
      py-2
      rounded-xl
      bg-red-500/10
      border
      border-red-500/20
      text-red-300
      hover:bg-red-500/20
      transition
    "
  >
    +10%
  </button>

</div>

<div className="
  mt-4
  p-4
  rounded-2xl
  bg-white/5
  border
  border-white/10
">

  <p className="
    text-sm
    text-gray-300
    leading-relaxed
  ">

    {

      activity.progress >= 100

        ? "✅ AI Insight: Task completed successfully."

        : activity.progress >= 70

        ? "⚡ AI Insight: You're close to completion. Keep momentum high."

        : activity.progress >= 40

        ? "📈 AI Insight: Steady progress detected. Stay consistent."

        : "🚨 AI Insight: You're behind schedule. Increase progress to stay on track."

    }

  </p>

</div>

</div>

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

                  {
  activity.deadline && (

    <div className="
      flex
      items-center
      gap-3
      text-sm
    ">

      <span className="
        text-red-400
        font-semibold
      ">
        Deadline:
      </span>

      <span className="
        text-gray-300
      ">

        {

          Math.ceil(

            (
              new Date(activity.deadline)
              - new Date()
            )

            /

            (
              1000 * 60 * 60 * 24
            )

          ) > 0

            ? `${Math.ceil(

                (
                  new Date(activity.deadline)
                  - new Date()
                )

                /

                (
                  1000 * 60 * 60 * 24
                )

              )} days left`

            : `Overdue by ${Math.abs(

                Math.ceil(

                  (
                    new Date(activity.deadline)
                    - new Date()
                  )

                  /

                  (
                    1000 * 60 * 60 * 24
                  )

                )

              )} days`
        }

      </span>

    </div>
  )
}

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

                  <div className="
                      flex
                      items-center
                      gap-3
                      text-gray-400
                    ">

                  <span className="
                      text-red-400
                      font-semibold
                    ">
                    Assigned To:
                  </span>

                      <span>
                        {activity.assigned_user_name || "Unassigned"}
                      </span>

                    </div>

                    {
  activity.deadline &&

  new Date(activity.deadline)
  < new Date()

  &&

  activity.status !==
  "completed"

  && (

    <div className="
      mt-4
      px-4
      py-3
      rounded-2xl
      bg-red-500/10
      border
      border-red-500/20
      text-red-300
      font-medium
    ">

      🚨 This task is overdue

    </div>
  )
}

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

export default TasksPage