import { motion } from "framer-motion"

import { useEffect, useState } from "react"

import Tilt from "react-parallax-tilt"

import { supabase } from "../../lib/supabase"

import {
  Activity,
  CalendarDays,
  Users,
  BarChart3,
} from "lucide-react"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

function AdminDashboard() {

  const [activities, setActivities] =
    useState([])

  // FETCH ACTIVITIES

  const fetchActivities = async () => {

    const { data, error } =
      await supabase
        .from("tasks")
        .select("*")

    if (error) {

      console.log(
        "DASHBOARD FETCH ERROR:",
        error
      )

    } else {

      setActivities(data)
    }
  }

  // REALTIME + INITIAL FETCH

  useEffect(() => {

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

  // LIVE CHART DATA

  const monthlyData = {}

  activities.forEach((activity) => {

    const month =
      new Date(
        activity.activity_date
      ).toLocaleString(
        "default",
        {
          month: "short",
        }
      )

    if (!monthlyData[month]) {

      monthlyData[month] = 0
    }

    monthlyData[month] += 1
  })

  const chartData =
    Object.keys(monthlyData).map(
      (month) => ({
        month,
        activities:
          monthlyData[month],
      })
    )

  // ANALYTICS

  const totalParticipants =
    activities.reduce(
      (total, activity) =>
        total +
        (
          activity.audience_count || 0
        ),

      0
    )

  const averageParticipants =

    activities.length > 0

      ? Math.floor(
          totalParticipants /
          activities.length
        )

      : 0

  const plannedActivities =
    activities.filter(
      (activity) =>
        activity.status ===
        "planned"
    ).length

  const completedActivities =
    activities.filter(
      (activity) =>
        activity.status ===
        "completed"
    ).length

  // PIE CHART DATA

  const pieData = [

    {
      name: "Planned",

      value:
        plannedActivities,
    },

    {
      name: "Completed",

      value:
        completedActivities,
    },
  ]

  // BAR CHART DATA

  const barData =
    activities.map(
      (activity) => ({

        name:
          activity.title?.slice(0, 10)
          || "Activity",

        participants:
          activity.audience_count || 0,
      })
    )

  // PIE COLORS

  const COLORS = [
    "#facc15",
    "#22c55e",
  ]

  // STATS

  const totalColleges =

  new Set(

    activities.map(
      (activity) =>

        activity.assigned_college_id
    )

  ).size

const overdueTasks =

  activities.filter(
    (activity) =>

      activity.deadline

      &&

      new Date(
        activity.deadline
      ) < new Date()

      &&

      activity.status !==
      "completed"
  ).length

const totalWarriors =

  new Set(

    activities.map(
      (activity) =>

        activity.assigned_to
    )

  ).size

const totalPresidents =

  new Set(

    activities.map(
      (activity) =>

        activity.created_by
    )

  ).size

  const stats = [
    {
      title: "Total Activities",

      value:
        activities.length,

      icon: Activity,
    },

    {
      title: "Planned Activities",

      value:
        plannedActivities,

      icon: CalendarDays,
    },

    {
      title: "Completed Activities",

      value:
        completedActivities,

      icon: BarChart3,
    },

    {
      title: "Total Participants",

      value:
        totalParticipants,

      icon: Users,
    },

    {
  title: "Total Colleges",

  value:
    totalColleges,

  icon: Activity,
},

{
  title: "Overdue Tasks",

  value:
    overdueTasks,

  icon: CalendarDays,
},

{
  title: "Total Warriors",

  value:
    totalWarriors,

  icon: Users,
},

{
  title: "Active Presidents",

  value:
    totalPresidents,

  icon: BarChart3,
},
  ]

  return (

    <div className="relative">

      {/* Background Glow */}

      <div className="
        absolute
        top-0
        left-1/3
        w-[400px]
        h-[400px]
        bg-red-500/10
        blur-[120px]
        rounded-full
        animate-pulse
      " />

      <div className="
        absolute
        bottom-0
        right-0
        w-[350px]
        h-[350px]
        bg-purple-500/10
        blur-[120px]
        rounded-full
        animate-pulse
      " />

      {/* Header */}

      <div className="
        relative
        z-10
        mb-10
      ">

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
            text-6xl
            font-black
            text-white
            mb-3
            tracking-tight
          "
        >
          Dashboard
        </motion.h1>

        <p className="
          text-gray-400
          text-lg
        ">
          Welcome back to your AI-powered activity intelligence system.
        </p>

      </div>

      {/* Stats */}

      <div className="
        grid
        grid-cols-4
        gap-6
        relative
        z-10
      ">

        {stats.map((item, index) => {

          const Icon = item.icon

          return (

            <Tilt
              glareEnable={true}
              glareMaxOpacity={0.15}
              scale={1.02}
              transitionSpeed={2500}
              key={index}
            >

              <motion.div

                whileHover={{
                  y: -10,
                }}

                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  p-[1px]
                  bg-gradient-to-br
                  from-red-500/30
                  via-purple-500/20
                  to-cyan-500/20
                "
              >

                <div className="
                  relative
                  overflow-hidden
                  bg-[#0b1120]/90
                  backdrop-blur-2xl
                  rounded-3xl
                  p-6
                  border
                  border-white/5
                ">

                  <div className="
                    absolute
                    top-0
                    right-0
                    w-32
                    h-32
                    bg-red-500/10
                    blur-3xl
                    rounded-full
                  " />

                  <div className="
                    flex
                    items-center
                    justify-between
                    mb-8
                  ">

                    <div className="
                      w-16
                      h-16
                      rounded-2xl
                      bg-gradient-to-br
                      from-red-500/20
                      to-purple-500/20
                      flex
                      items-center
                      justify-center
                      border
                      border-white/10
                    ">

                      <Icon
                        size={30}
                        className="
                          text-red-400
                        "
                      />

                    </div>

                  </div>

                  <h2 className="
                    text-gray-400
                    text-sm
                    mb-2
                  ">
                    {item.title}
                  </h2>

                  <p className="
                    text-5xl
                    font-black
                    text-white
                    tracking-tight
                  ">
                    {item.value}
                  </p>

                </div>

              </motion.div>

            </Tilt>
          )
        })}

      </div>

      {/* AI + Feed */}

      <div className="
        grid
        grid-cols-3
        gap-6
        mt-10
        relative
        z-10
      ">

        {/* AI Insights */}

        <motion.div

          whileHover={{
            y: -5,
          }}

          className="
            col-span-2
            rounded-3xl
            p-[1px]
            bg-gradient-to-br
            from-red-500/20
            via-purple-500/10
            to-cyan-500/10
          "
        >

          <div className="
            relative
            overflow-hidden
            bg-[#0b1120]/90
            backdrop-blur-2xl
            rounded-3xl
            p-8
            border
            border-white/5
          ">

            <div className="
              absolute
              top-0
              right-0
              w-64
              h-64
              bg-purple-500/10
              blur-[120px]
              rounded-full
            " />

            <div className="
              relative
              z-10
            ">

              <h2 className="
                text-3xl
                font-bold
                text-white
                mb-3
              ">
                AI Insights
              </h2>

              <p className="
                text-gray-400
                mb-8
              ">
                Smart recommendations generated from activity analytics.
              </p>

              <div className="
                space-y-5
              ">

                <div className="
                  bg-[#0f172a]/80
                  border
                  border-red-500/10
                  rounded-2xl
                  p-6
                  backdrop-blur-xl
                ">

                  <h3 className="
                    text-white
                    font-semibold
                    mb-2
                    text-lg
                  ">
                    Participation Insight
                  </h3>

                  <p className="
                    text-gray-400
                    leading-relaxed
                  ">

                    Average participation across all activities is

                    {" "}

                    <span className="
                      text-red-400
                      font-semibold
                    ">
                      {averageParticipants}
                    </span>

                    {" "}

                    participants per event.

                  </p>

                </div>

                <div className="
                  bg-[#0f172a]/80
                  border
                  border-purple-500/10
                  rounded-2xl
                  p-6
                  backdrop-blur-xl
                ">

                  <h3 className="
                    text-white
                    font-semibold
                    mb-2
                    text-lg
                  ">
                    Activity Status Analysis
                  </h3>

                  <p className="
                    text-gray-400
                    leading-relaxed
                  ">

                    Currently

                    {" "}

                    <span className="
                      text-yellow-400
                      font-semibold
                    ">
                      {plannedActivities}
                    </span>

                    {" "}

                    activities are planned and

                    {" "}

                    <span className="
                      text-green-400
                      font-semibold
                    ">
                      {completedActivities}
                    </span>

                    {" "}

                    activities are completed.

                  </p>

                </div>

              </div>

              <div className="
  bg-[#0f172a]/80
  border
  border-red-500/10
  rounded-2xl
  p-6
  backdrop-blur-xl
">

  <h3 className="
    text-white
    font-semibold
    mb-2
    text-lg
  ">
    Workload Risk Detection
  </h3>

  <p className="
    text-gray-400
    leading-relaxed
  ">

    AI detected

    {" "}

    <span className="
      text-red-400
      font-semibold
    ">
      {overdueTasks}
    </span>

    {" "}

    overdue tasks across the organization.

    Teams with repeated delays should receive workload balancing and deadline restructuring.

  </p>

</div>

            </div>

          </div>

        </motion.div>

        {/* Feed */}

        <motion.div

          whileHover={{
            y: -5,
          }}

          className="
            rounded-3xl
            p-[1px]
            bg-gradient-to-br
            from-red-500/20
            via-purple-500/10
            to-cyan-500/10
          "
        >

          <div className="
            relative
            overflow-hidden
            bg-[#0b1120]/90
            backdrop-blur-2xl
            rounded-3xl
            p-6
            border
            border-white/5
            h-full
          ">

            <div className="
              absolute
              bottom-0
              left-0
              w-40
              h-40
              bg-red-500/10
              blur-[100px]
              rounded-full
            " />

            <div className="
              relative
              z-10
            ">

              <h2 className="
                text-3xl
                font-bold
                text-white
                mb-8
              ">
                Activity Feed
              </h2>

              <div className="
                space-y-6
              ">

                {activities
                  .slice(0, 5)
                  .map((activity) => (

                    <div
                      key={activity.id}

                      className="
                        bg-[#0f172a]/70
                        border
                        border-white/5
                        rounded-2xl
                        p-5
                        backdrop-blur-xl
                      "
                    >

                      <p className="
                        text-white
                        font-semibold
                        text-lg
                        mb-2
                      ">
                        {activity.title}
                      </p>

                      <p className="
                        text-gray-400
                        text-sm
                      ">
                        {activity.activity_date}
                      </p>

                    </div>

                  ))}

              </div>

            </div>

          </div>

        </motion.div>

      </div>

      {/* Main Line Chart */}

      <motion.div

        whileHover={{
          y: -5,
        }}

        className="
          mt-10
          rounded-3xl
          p-[1px]
          bg-gradient-to-br
          from-red-500/20
          via-purple-500/10
          to-cyan-500/10
        "
      >

        <div className="
          relative
          overflow-hidden
          bg-[#0b1120]/90
          backdrop-blur-2xl
          rounded-3xl
          p-8
          border
          border-white/5
        ">

          <div className="
            absolute
            top-0
            right-0
            w-[300px]
            h-[300px]
            bg-purple-500/10
            blur-[120px]
            rounded-full
          " />

          <div className="
            relative
            z-10
          ">

            <div className="
              mb-8
            ">

              <h2 className="
                text-3xl
                font-bold
                text-white
                mb-2
              ">
                Activity Analytics
              </h2>

              <p className="
                text-gray-400
              ">
                Monthly engagement and activity growth trends.
              </p>

            </div>

            <div className="
              h-[400px]
              w-full
            ">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                >

                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="activities"
                    stroke="#ff4d4d"
                    strokeWidth={5}
                    dot={{
                      r: 7,
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 10,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </motion.div>

      {/* Advanced Analytics */}

      <div className="
        grid
        grid-cols-2
        gap-8
        mt-10
      ">

        {/* Pie Chart */}

        <motion.div

          whileHover={{
            y: -5,
          }}

          className="
            rounded-3xl
            p-[1px]
            bg-gradient-to-br
            from-yellow-500/20
            via-green-500/10
            to-cyan-500/10
          "
        >

          <div className="
            bg-[#0b1120]/90
            backdrop-blur-2xl
            rounded-3xl
            p-8
            border
            border-white/5
            h-full
          ">

            <h2 className="
              text-2xl
              font-bold
              text-white
              mb-6
            ">
              Activity Status
            </h2>

            <div className="
              h-[350px]
            ">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >

                    {pieData.map((
                      entry,
                      index
                    ) => (

                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />

                    ))}

                  </Pie>

                  <Tooltip />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </motion.div>

        {/* Bar Chart */}

        <motion.div

          whileHover={{
            y: -5,
          }}

          className="
            rounded-3xl
            p-[1px]
            bg-gradient-to-br
            from-red-500/20
            via-purple-500/10
            to-cyan-500/10
          "
        >

          <div className="
            bg-[#0b1120]/90
            backdrop-blur-2xl
            rounded-3xl
            p-8
            border
            border-white/5
            h-full
          ">

            <h2 className="
              text-2xl
              font-bold
              text-white
              mb-6
            ">
              Participation Analytics
            </h2>

            <div className="
              h-[350px]
            ">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={barData}
                >

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Bar
                    dataKey="participants"
                    fill="#ff4d4d"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </motion.div>

      </div>

    </div>
  )
}

export default AdminDashboard