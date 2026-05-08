import {
  useEffect,
  useState,
} from "react"

import { supabase }
from "../../lib/supabase"

function PresidentDashboard() {

const [stats, setStats] =
  useState({

    totalTasks: 0,

    completedTasks: 0,

    pendingTasks: 0,

    completionRate: "0%",
})

const [warriors, setWarriors] =
  useState([])

useEffect(() => {

  const fetchStats =
    async () => {

      const {
        data: {
          user
        }
      } =
        await supabase.auth.getUser()

      if (!user) return

      const {
        data: profile
      } = await supabase

        .from("profiles")

        .select("*")

        .eq("id", user.id)

        .single()

      const {
        data: tasks
      } = await supabase

        .from("tasks")

        .select("*")

        .eq(
          "assigned_college_id",
          profile.college_id
        )

      if (!tasks) return

      const totalTasks =
        tasks.length

      const completedTasks =

        tasks.filter(
          (task) =>

            task.status ===
            "completed"
        ).length

      const pendingTasks =

        totalTasks -
        completedTasks

      const completionRate =

        totalTasks > 0

          ? `${Math.round(

              (
                completedTasks
                / totalTasks
              ) * 100

            )}%`

          : "0%"

      setStats({

        totalTasks,

        completedTasks,

        pendingTasks,

        completionRate,
      })
const {
  data: warriorsData
} = await supabase

  .from("profiles")

  .select("*")

  .eq(
    "college_id",
    profile.college_id
  )

  .eq(
    "role",
    "warrior"
  )

if (!warriorsData) return

const warriorsWithStats =

  warriorsData.map(
    (warrior) => {

      const completed =

        tasks.filter(
          (task) =>

            task.assigned_to ===
            warrior.id

            &&

            task.status ===
            "completed"
        ).length

      return {

        name:
          warrior.full_name,

        completed,
      }
    }
  )

setWarriors(
  warriorsWithStats
)

    }

  fetchStats()

}, [])

  return (

    <div className="
      space-y-8
    ">

      <h1 className="
        text-5xl
        font-black
        text-white
      ">
        President Dashboard
      </h1>

      <p className="
        text-gray-400
        text-lg
      ">
        Monitor teams, warriors,
        and task performance.
      </p>

      <div className="
  grid
  grid-cols-4
  gap-6
">

  <div className="
    p-6
    rounded-3xl
    bg-white/5
    border
    border-white/10
  ">

    <h3 className="
      text-gray-400
      text-sm
      mb-2
    ">
      Total Tasks
    </h3>

    <p className="
      text-4xl
      font-black
      text-white
    ">
      {stats.totalTasks}
    </p>

  </div>

  <div className="
    p-6
    rounded-3xl
    bg-green-500/10
    border
    border-green-500/20
  ">

    <h3 className="
      text-green-300
      text-sm
      mb-2
    ">
      Completed
    </h3>

    <p className="
      text-4xl
      font-black
      text-white
    ">
      {stats.completedTasks}
    </p>

  </div>

  <div className="
    p-6
    rounded-3xl
    bg-yellow-500/10
    border
    border-yellow-500/20
  ">

    <h3 className="
      text-yellow-300
      text-sm
      mb-2
    ">
      Pending
    </h3>

    <p className="
      text-4xl
      font-black
      text-white
    ">
      {stats.pendingTasks}
    </p>

  </div>

  <div className="
    p-6
    rounded-3xl
    bg-red-500/10
    border
    border-red-500/20
  ">

    <h3 className="
      text-red-300
      text-sm
      mb-2
    ">
      Completion Rate
    </h3>

    <p className="
      text-4xl
      font-black
      text-white
    ">
      {stats.completionRate}
    </p>

  </div>

</div>

<div className="
  mt-10
  rounded-3xl
  border
  border-white/10
  bg-white/5
  p-8
">

  <h2 className="
    text-3xl
    font-black
    text-white
    mb-8
  ">
    Warrior Performance
  </h2>

<div className="
  space-y-4
">

  {

    warriors

    .sort(
      (a, b) =>
        b.completed -
        a.completed
    )

    .map((warrior) => (

      <div

        key={warrior.name}

        className="
          flex
          items-center
          justify-between
          p-5
          rounded-2xl
          bg-black/20
          border
          border-white/5
        "
      >

        <div>

          <h3 className="
            text-white
            font-semibold
            text-lg
          ">
            {warrior.name}
          </h3>

          <p className="
            text-gray-400
            text-sm
          ">
            {
              warrior.completed
            }
            {" "}
            Tasks Completed
          </p>

        </div>

        <span className={`
          px-4
          py-2
          rounded-full
          text-sm
          font-semibold
          border

          ${
            warrior.completed >= 8

              ? `
                bg-green-500/10
                border-green-500/20
                text-green-300
              `

              : `
                bg-yellow-500/10
                border-yellow-500/20
                text-yellow-300
              `
          }
        `}>

          {

            warrior.completed >= 8

              ? "Excellent"

              : "Average"
          }

        </span>

      </div>
    ))
  }

</div>

</div>

    </div>
  )
}

export default PresidentDashboard