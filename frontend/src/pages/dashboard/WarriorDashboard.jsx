import { useEffect, useState } from "react"

import { motion } from "framer-motion"

import {
  CalendarDays,
  MapPin,
  Users,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Target,
} from "lucide-react"

import { supabase } from "../../lib/supabase"

import toast from "react-hot-toast"

import { Toaster } from "react-hot-toast"

function WarriorDashboard() {

  const [activities, setActivities] =
    useState([])

    const [loading, setLoading] =
  useState(true)

  useEffect(() => {

    const fetchActivities =
      async () => {

        setLoading(true)

        const {
          data: { user },
        } =
          await supabase.auth.getUser()

        if (!user) return

        const {
          data,
          error,
        } = await supabase

          .from("tasks")

          .select("*")

          .eq(
            "assigned_to",
            user.id
          )

        if (error) {

          setLoading(false)

          console.log(
            "WARRIOR FETCH ERROR:",
            error
          )

        } else {

          setActivities(
            data || []
          )

          setLoading(false)

        }
      }

    fetchActivities()

  }, [])

  const handleProgressUpdate =
    async (
      activity,
      amount
    ) => {

      const updatedProgress =
        Math.max(
          0,
          Math.min(
            100,
            (
              activity.progress || 0
            ) + amount
          )
        )

      const {
        error
      } = await supabase

        .from("tasks")

        .update({
          progress:
            updatedProgress
        })

        .eq(
          "id",
          activity.id
        )

      if (!error) {

        toast.success(
  "Progress updated"
)

        setActivities(
          (prev) =>

            prev.map(
              (item) =>

                item.id ===
                activity.id

                  ? {
                      ...item,
                      progress:
                        updatedProgress
                    }

                  : item
            )
        )
      }

      else {

  toast.error(
    "Failed to update progress"
  )
}
    }

  const handleStatusToggle =
    async (activity) => {

      const updatedStatus =

        activity.status ===
        "completed"

          ? "planned"

          : "completed"

      const {
        error
      } = await supabase

        .from("tasks")

        .update({
          status:
            updatedStatus
        })

        .eq(
          "id",
          activity.id
        )

      if (!error) {

        toast.success(
  updatedStatus ===
  "completed"

    ? "Task completed"
    : "Task reopened"
)

        setActivities(
          (prev) =>

            prev.map(
              (item) =>

                item.id ===
                activity.id

                  ? {
                      ...item,
                      status:
                        updatedStatus
                    }

                  : item
            )
        )
      }
    }

  const completedTasks =
    activities.filter(
      (item) =>
        item.status ===
        "completed"
    ).length

  const pendingTasks =
    activities.filter(
      (item) =>
        item.status !==
        "completed"
    ).length

  const overdueTasks =
    activities.filter(
      (item) =>

        item.deadline &&

        new Date(item.deadline)
        < new Date()

        &&

        item.status !==
        "completed"
    ).length

  const overallProgress =
    activities.length > 0

      ? Math.round(

          activities.reduce(
            (
              total,
              item
            ) =>

              total +
              (
                item.progress || 0
              ),

            0
          )

          /

          activities.length
        )

      : 0

      const currentDate =

  new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    }
  )

      const focusTask =

  activities.find(
    (task) =>

      task.status !==
      "completed"

      &&

      task.priority ===
      "high"
  )

  ||

  activities.find(
    (task) =>

      task.status !==
      "completed"
  )

  const activityFeed =

  activities
    .slice(0, 5)
    .map((task) => ({

      id: task.id,

      title: task.title,

      status: task.status,

      progress:
        task.progress || 0,

      deadline:
        task.deadline,
    }))

    const upcomingDeadlines =

  activities

    .filter(
      (task) =>

        task.status !==
        "completed"
    )

    .slice(0, 3)

    .map((task) => ({

      ...task,

      daysLeft:

        Math.max(
          0,

          Math.ceil(

            (
              new Date(task.deadline)

              -

              new Date()
            )

            /

            (
              1000 * 60 * 60 * 24
            )
          )
        )
    }))

const monthlyData = [

  {
    week: "Week 1",
    value: 0,
  },

  {
    week: "Week 2",
    value: 0,
  },

  {
    week: "Week 3",
    value: 0,
  },

  {
    week: "Week 4",
    value: 0,
  },
]

activities.forEach((task) => {

  if (!task.deadline) return

  const date =
    new Date(task.deadline)

  const day =
    date.getDate()

  let weekIndex = 0

  if (day <= 7) {

    weekIndex = 0

  } else if (day <= 14) {

    weekIndex = 1

  } else if (day <= 21) {

    weekIndex = 2

  } else {

    weekIndex = 3
  }

  monthlyData[weekIndex].value +=
    task.progress || 0
})

monthlyData.forEach((week) => {

  week.value = Math.min(
    100,
    Math.round(
      week.value /
      Math.max(1, activities.length)
    )
  )
})

const recommendations = []

if (overdueTasks > 0) {

  recommendations.push(
    "You have overdue tasks that require immediate attention."
  )
}

if (pendingTasks > completedTasks) {

  recommendations.push(
    "Pending tasks are higher than completed tasks. Focus on task completion."
  )
}

if (overallProgress >= 70) {

  recommendations.push(
    "Excellent productivity this week. Keep maintaining consistency."
  )
}

if (overallProgress < 40) {

  recommendations.push(
    "Your productivity is below average. Prioritize high-impact activities."
  )
}

const productivityStreak =

  overallProgress >= 70

    ? 12

    : overallProgress >= 40

    ? 7

    : 2

  return (

    <div className="
      space-y-7
    ">

<div className="
  relative
  overflow-hidden
  rounded-[2rem]
  border
  border-pink-500/10
  bg-gradient-to-br
  from-[#111827]
  via-[#1e1b4b]
  to-[#0f172a]
  p-10
">

  <div className="
    absolute
    -top-24
    -right-24
    w-72
    h-72
    bg-pink-500/20
    blur-3xl
    rounded-full
  " />

  <div className="
    relative
    z-10
  ">

    <div className="
      flex
      flex-col
      lg:flex-row
      lg:items-center
      lg:justify-between
      gap-10
    ">

      <div>

        <p className="
          text-pink-400
          font-semibold
          mb-3
        ">
          {currentDate}
        </p>

        <h1 className="
          text-5xl
          lg:text-6xl
          font-black
          text-white
          leading-tight
          mb-5
        ">
          Welcome Back,
          Warrior ⚔️
        </h1>

        <p className="
          text-gray-300
          text-lg
          leading-relaxed
          max-w-2xl
        ">

          {
            overallProgress >= 70

              ? "You're dominating your productivity goals. Keep the momentum alive."

              : overallProgress >= 40

              ? "You're making steady progress. Focus on completing pending tasks."

              : "Your productivity needs attention. Prioritize high-impact activities today."
          }

        </p>

      </div>

      <div className="
        flex
        items-center
        justify-center
      ">

        <div className="
          w-48
          h-48
          rounded-full
          border-[10px]
          border-pink-500/20
          flex
          items-center
          justify-center
          bg-black/20
          backdrop-blur-xl
          shadow-2xl
        ">

          <div className="
            text-center
          ">

            <h2 className="
              text-5xl
              font-black
              text-pink-400
            ">
              {overallProgress}%
            </h2>

            <p className="
              text-gray-400
              mt-2
            ">
              Productivity
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>

      {/* STATS */}

      

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        <div className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-5
          backdrop-blur-xl
          hover:border-pink-500/20
          transition-all
          duration-300
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <div>

              <p className="
                text-gray-400
                text-sm
              ">
                Total Tasks
              </p>

              <h2 className="
                text-4xl
                font-black
                text-white
                mt-2
              ">
                {activities.length}
              </h2>

            </div>

            <Target
              size={40}
              className="
                text-pink-400
              "
            />

          </div>

        </div>

        <div className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-5
          backdrop-blur-xl
          hover:border-pink-500/20
          transition-all
          duration-300
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <div>

              <p className="
                text-gray-400
                text-sm
              ">
                Completed
              </p>

              <h2 className="
                text-4xl
                font-black
                text-green-400
                mt-2
              ">
                {completedTasks}
              </h2>

            </div>

            <CheckCircle2
              size={40}
              className="
                text-green-400
              "
            />

          </div>

        </div>

        <div className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-5
          backdrop-blur-xl
          hover:border-pink-500/20
          transition-all
          duration-300
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <div>

              <p className="
                text-gray-400
                text-sm
              ">
                Pending
              </p>

              <h2 className="
                text-4xl
                font-black
                text-yellow-400
                mt-2
              ">
                {pendingTasks}
              </h2>

            </div>

            <Clock3
              size={40}
              className="
                text-yellow-400
              "
            />

          </div>

        </div>

        <div className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          p-5
          backdrop-blur-xl
          hover:border-pink-500/20
          transition-all
          duration-300
        ">

          <div className="
            flex
            items-center
            justify-between
          ">

            <div>

              <p className="
                text-gray-400
                text-sm
              ">
                Overdue
              </p>

              <h2 className="
                text-4xl
                font-black
                text-red-400
                mt-2
              ">
                {overdueTasks}
              </h2>

            </div>

            <AlertTriangle
              size={40}
              className="
                text-red-400
              "
            />

          </div>

        </div>

      </div>

      {/* OVERALL PROGRESS */}

      <div className="
  rounded-3xl
  border
  border-pink-500/10
  bg-gradient-to-r
  from-pink-500/10
  to-red-500/10
  p-6
  backdrop-blur-xl
">

  <div className="
    flex
    items-center
    justify-between
  ">

    <div>

      <h2 className="
        text-2xl
        font-bold
        text-white
        mb-2
      ">
        AI Productivity Insight
      </h2>

      <p className="
        text-gray-300
      ">

        {
          overallProgress >= 70

            ? "Excellent productivity. Keep maintaining momentum."

            : overallProgress >= 40

            ? "You are progressing steadily. Push harder to complete pending tasks."

            : "Your productivity is currently low. Focus on completing high priority tasks."
        }

      </p>

    </div>

    <div className="
      text-5xl
    ">
      ⚡
    </div>

  </div>

</div>

<div className="
  grid
  grid-cols-1
  xl:grid-cols-3
  gap-8
">

{/* TODAY'S FOCUS */}

{
  focusTask && (

    <div className="
    xl:col-span-2
      rounded-3xl
      border
      border-pink-500/20
      bg-gradient-to-r
      from-[#111827]
      to-[#1e293b]
      p-8
      backdrop-blur-xl
      overflow-hidden
      relative
    ">

      <div className="
        absolute
        -top-20
        -right-20
        w-60
        h-60
        bg-pink-500/10
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
          justify-between
          mb-6
        ">

          <div>

            <p className="
              text-pink-400
              font-semibold
              mb-2
            ">
              TODAY'S FOCUS
            </p>

            <h2 className="
              text-4xl
              font-black
              text-white
            ">
              {focusTask.title}
            </h2>

          </div>

          <div className="
            text-6xl
          ">
            🎯
          </div>

        </div>

        <p className="
          text-gray-300
          leading-relaxed
          mb-6
          max-w-3xl
        ">
          {
            focusTask.description
            || "Stay focused and complete this task efficiently."
          }
        </p>

        <div className="
          flex
          flex-wrap
          gap-4
        ">

          <div className="
            px-5
            py-3
            rounded-2xl
            bg-red-500/10
            border
            border-red-500/20
            text-red-300
          ">
            Priority:
            {" "}
            {focusTask.priority}
          </div>

          <div className="
            px-5
            py-3
            rounded-2xl
            bg-yellow-500/10
            border
            border-yellow-500/20
            text-yellow-300
          ">
            Status:
            {" "}
            {focusTask.status}
          </div>

          <div className="
            px-5
            py-3
            rounded-2xl
            bg-pink-500/10
            border
            border-pink-500/20
            text-pink-300
          ">
            Progress:
            {" "}
            {focusTask.progress || 0}%
          </div>

        </div>

      </div>

    </div>
  )
}

      {/* UPCOMING DEADLINES */}

<div className="
  xl:col-span-1
">

<div className="
  bg-white/5
  border
  border-white/10
  rounded-3xl
  p-8
  backdrop-blur-xl
">
  
  <div className="
    flex
    items-center
    justify-between
    mb-6
  ">
    
    <h2 className="
      text-4xl
      font-black
      text-white
    ">
      Upcoming Deadlines
    </h2>

    <span className="
      text-sm
      text-gray-400
    ">
      Priority Tasks
    </span>

  </div>

  <div className="
    space-y-4
  ">

    {upcomingDeadlines.map((activity) => (

      <div
        key={activity.id}

        className="
          bg-black/20
          border
          border-white/10
          rounded-2xl
          p-5
          hover:border-pink-500/20
          transition-all
          duration-300
        "
      >

        <div className="
          flex
          items-start
          justify-between
          mb-4
        ">

          <h3 className="
            text-2xl
            font-bold
            text-white
          ">
            {activity.title}
          </h3>

          <span className="
            px-4
            py-2
            rounded-full
            text-sm
            font-semibold
            bg-red-500/20
            text-red-300
          ">
            {activity.priority}
          </span>

        </div>

        <p className="
          text-gray-400
          text-lg
          mb-4
        ">
          Deadline: {activity.deadline}
        </p>

        <p className={`
  font-bold
  text-lg

  ${
    activity.daysLeft < 0

      ? "text-red-400"

      : activity.daysLeft === 0

      ? "text-orange-400"

      : activity.daysLeft === 1

      ? "text-yellow-400"

      : activity.daysLeft <= 3

      ? "text-blue-400"

      : "text-green-400"
  }
`}>
  
  {
    activity.daysLeft < 0

      ? "🔴 Overdue"

      : activity.daysLeft === 0

      ? "🟠 Due Today"

      : activity.daysLeft === 1

      ? "🟡 Due Tomorrow"

      : activity.daysLeft <= 3

      ? `🔵 ${activity.daysLeft} Days Left`

      : `🟢 ${activity.daysLeft} Days Left`
  }

</p>

      </div>

    ))}

  </div>

</div>
</div>

</div>

{/* WEEKLY PRODUCTIVITY */}

<div className="
  rounded-3xl
  border
  border-white/10
  bg-white/5
  p-8
  backdrop-blur-xl
">

  <div className="
    flex
    items-center
    justify-between
    mb-8
  ">

    <div>

      <h2 className="
        text-3xl
        font-bold
        text-white
        mb-2
      ">
        Weekly Productivity
      </h2>

      <p className="
        text-gray-400
      ">
        Performance overview for this week
      </p>

    </div>

    <div className="
      text-5xl
    ">
      📊
    </div>

  </div>

  <div className="
    flex
    items-end
    justify-between
    gap-4
    h-72
  ">

    {
      monthlyData.map(
        (
          item,
          index
        ) => (

          <div

            key={item.week}

            className="
              flex
              flex-col
              items-center
              flex-1
            "
          >

            <motion.div

              initial={{
                height: 0
              }}

              animate={{
                height: `${item.value}%`
              }}

              transition={{
                duration: 1,
                delay:
                  index * 0.1,
              }}

              className={`
  w-full
  rounded-t-3xl
  shadow-lg

  ${
    item.value >= 75

      ? `
        bg-gradient-to-t
        from-green-500
        to-emerald-400
      `

      : item.value >= 40

      ? `
        bg-gradient-to-t
        from-yellow-500
        to-orange-400
      `

      : `
        bg-gradient-to-t
        from-red-500
        to-pink-500
      `
  }
`}
            />

            <div className="
              mt-4
              text-gray-400
              font-medium
            ">
              {item.week}
            </div>

          </div>
        )
      )
    }

  </div>

</div>

</div>

  )
  
}
export default WarriorDashboard