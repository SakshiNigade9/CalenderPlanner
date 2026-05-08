import { useEffect, useState } from "react"

import {
  motion,
} from "framer-motion"

import {
  Activity,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts"

import { supabase } from "../../lib/supabase"

function AnalyticsPage() {

  const [activities, setActivities] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  // FETCH USER ACTIVITIES

  const fetchAnalytics =
    async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } =
        await supabase
          .from("activities")
          .select("*")
          .eq("user_id", user.id)

      if (!error) {

        setActivities(data || [])
      }

      setLoading(false)
    }

  // REALTIME

  useEffect(() => {

    fetchAnalytics()

    const channel = supabase
      .channel(
        "analytics-live"
      )

      .on(
        "postgres_changes",

        {
          event: "*",
          schema: "public",
          table: "activities",
        },

        () => {

          fetchAnalytics()
        }
      )

      .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )
    }

  }, [])

  // METRICS

  const totalActivities =
    activities.length

  const completedActivities =
    activities.filter(
      (a) =>
        a.status ===
        "completed"
    ).length

  const plannedActivities =
    activities.filter(
      (a) =>
        a.status ===
        "planned"
    ).length

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

  // PIE CHART

  const pieData = [

    {
      name: "Completed",
      value:
        completedActivities,
    },

    {
      name: "Planned",
      value:
        plannedActivities,
    },
  ]

  const COLORS = [
    "#ef4444",
    "#8b5cf6",
  ]

  // MONTHLY TREND

  const monthlyData = [

    {
      month: "Jan",
      activities: 4,
    },

    {
      month: "Feb",
      activities: 7,
    },

    {
      month: "Mar",
      activities: 5,
    },

    {
      month: "Apr",
      activities: 9,
    },

    {
      month: "May",
      activities:
        totalActivities,
    },
  ]

  const participationTrend = [

  {
    month: "Jan",
    participants: 120,
  },

  {
    month: "Feb",
    participants: 210,
  },

  {
    month: "Mar",
    participants: 180,
  },

  {
    month: "Apr",
    participants: 300,
  },

  {
    month: "May",
    participants:
      totalParticipants || 0,
  },
]

  const statCards = [

    {
      title:
        "Total Activities",

      value:
        totalActivities,

      icon: Activity,
    },

    {
      title:
        "Completed Activities",

      value:
        completedActivities,

      icon: CheckCircle2,
    },

    {
      title:
        "Planned Activities",

      value:
        plannedActivities,

      icon: Clock3,
    },

    {
      title:
        "Total Participants",

      value:
        totalParticipants,

      icon: Users,
    },
  ]

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
        bg-red-500/10
        blur-[160px]
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
        blur-[140px]
        rounded-full
        pointer-events-none
      " />

      {/* Header */}

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
          Analytics
        </motion.h1>

        <p className="
          text-gray-400
          text-lg
        ">
          Realtime activity intelligence dashboard.
        </p>

      </div>

      {/* STAT CARDS */}

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
                relative
                overflow-hidden
                rounded-3xl
                border
                border-red-500/10
                bg-white/5
                backdrop-blur-2xl
                p-6
              "
            >

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
                  w-14
                  h-14
                  rounded-2xl
                  bg-gradient-to-br
                  from-red-500
                  to-pink-500
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

      {/* CHARTS */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-8
      ">

        {/* PIE CHART */}

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
            Activity Status
          </h2>

          <div className="
            h-[320px]
          ">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie

                  data={pieData}

                  dataKey="value"

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
                        COLORS[index]
                      }
                    />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

        {/* BAR CHART */}

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
            Activity Trend
          </h2>

          <div className="
            h-[320px]
          ">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={monthlyData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                />

                <YAxis
                  stroke="#94a3b8"
                />

                <Tooltip />

                <Bar
                  dataKey="activities"
                  fill="#ef4444"
                  radius={[
                    10,
                    10,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

      </div>
{/* LINE CHART */}

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
    Participation Growth
  </h2>

  <div className="
    h-[380px]
  ">

    <ResponsiveContainer
      width="100%"
      height="100%"
    >

      <LineChart
        data={participationTrend}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#334155"
        />

        <XAxis
          dataKey="month"
          stroke="#94a3b8"
        />

        <YAxis
          stroke="#94a3b8"
        />

        <Tooltip />

        <Legend />

        <Line

          type="monotone"

          dataKey="participants"

          stroke="#8b5cf6"

          strokeWidth={4}

          dot={{
            r: 6,
          }}

          activeDot={{
            r: 10,
          }}
        />

      </LineChart>

    </ResponsiveContainer>

  </div>

</motion.div>
      {/* AI INSIGHTS */}

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
          AI Insights
        </h2>

        <div className="
          space-y-5
        ">

          <div className="
            p-6
            rounded-2xl
            bg-[#0f172a]/70
            border
            border-white/5
          ">

            <h3 className="
              text-white
              font-semibold
              mb-2
            ">
              Participation Insight
            </h3>

            <p className="
              text-gray-400
            ">

              Average participation across all activities is

              <span className="
                text-red-400
                font-bold
                mx-2
              ">

                {
                  totalActivities > 0

                    ? Math.round(
                        totalParticipants /
                        totalActivities
                      )

                    : 0
                }

              </span>

              participants per event.

            </p>

          </div>

          <div className="
            p-6
            rounded-2xl
            bg-[#0f172a]/70
            border
            border-white/5
          ">

            <h3 className="
              text-white
              font-semibold
              mb-2
            ">
              Activity Status Analysis
            </h3>

            <p className="
              text-gray-400
            ">

              Currently

              <span className="
                text-yellow-400
                font-bold
                mx-2
              ">
                {plannedActivities}
              </span>

              activities are planned and

              <span className="
                text-green-400
                font-bold
                mx-2
              ">
                {completedActivities}
              </span>

              activities are completed.

            </p>

          </div>

        </div>

      </motion.div>

    </div>
  )
}

export default AnalyticsPage