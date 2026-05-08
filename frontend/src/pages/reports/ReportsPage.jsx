import {
  useEffect,
  useState,
  useRef,
} from "react"

import jsPDF from "jspdf"

import html2canvas from "html2canvas"

import {
  motion,
} from "framer-motion"

import {
  FileText,
  Sparkles,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react"

import { supabase } from "../../lib/supabase"

import {
  generateAIReport,
} from "../../services/groq"

function ReportsPage() {

  const [activities, setActivities] =
    useState([])

  const [loading, setLoading] =
    useState(true)
    const reportRef = useRef()

  const [aiReport, setAiReport] =
  useState("")

const [generatingAI, setGeneratingAI] =
  useState(false)

const [lastGenerated, setLastGenerated] =
  useState(0)

  // FETCH ACTIVITIES

  const fetchReports =
    async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // GET PROFILE

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
      } = await query

      setActivities(data || [])

      setLoading(false)
    }

  useEffect(() => {

    fetchReports()

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

  const completionRate =

    totalActivities > 0

      ? Math.round(
          (
            completedActivities /
            totalActivities
          ) * 100
        )

      : 0

  // AI INSIGHTS

  const aiInsights = [

    {
      title:
        "Participation Analysis",

      icon: Users,

      insight: `
        Campus engagement currently averages
        ${
          totalActivities > 0

            ? Math.round(
                totalParticipants /
                totalActivities
              )

            : 0
        }
        participants per activity.
        Technical and collaborative activities
        appear to attract the highest engagement.
      `,
    },

    {
      title:
        "Completion Intelligence",

      icon: Activity,

      insight: `
        The activity completion rate is currently
        ${completionRate}%.
        Higher completion rates indicate
        effective planning and execution across
        academic operations.
      `,
    },

    {
      title:
        "Growth Recommendation",

      icon: TrendingUp,

      insight: `
        AI analysis recommends increasing
        workshops, hackathons, and collaborative
        events to further improve participation
        trends and student engagement metrics.
      `,
    },
  ]
const handleGenerateAI =
  async () => {

    const now = Date.now()

    if (
      now - lastGenerated < 15000
    ) {

      alert(
        "Please wait a few seconds before generating again."
      )

      return
    }

    setGeneratingAI(true)

    const result =
      await generateAIReport(
        activities
      )

    setAiReport(result)

    setLastGenerated(now)

    setGeneratingAI(false)
  }
const exportPDF = async () => {

  // WAIT FOR UI RENDER

  await new Promise(
    (resolve) =>

      setTimeout(
        resolve,
        1000
      )
  )

  const element =
    reportRef.current

  if (!element) return

  const canvas =
    await html2canvas(
      element,
      {
        scale: 2,
      }
    )

  const imgData =
    canvas.toDataURL(
      "image/png"
    )

  const pdf =
    new jsPDF(
      "p",
      "mm",
      "a4"
    )

  const pdfWidth =
    pdf.internal.pageSize.getWidth()

  const pdfHeight =
    (
      canvas.height *
      pdfWidth
    ) / canvas.width

  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    pdfWidth,
    pdfHeight
  )

  pdf.save(
    "CampusFlow-AI-Report.pdf"
  )
}

  return (

    <div
  ref={reportRef}

  className="
    relative
    space-y-8
  "
>

      {/* Background Glow */}

      <div className="
        fixed
        top-0
        left-1/3
        w-[450px]
        h-[450px]
        bg-cyan-500/10
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
          AI Reports
        </motion.h1>

        <p className="
          text-gray-400
          text-lg
        ">
          AI-powered campus intelligence
          and reporting system.
        </p>

</div>
<div className="
  flex
  items-center
  gap-4
">

<motion.button

  whileHover={{
    scale: 1.03,
  }}

  whileTap={{
    scale: 0.96,
  }}

  onClick={exportPDF}

  className="
    px-6
    py-4
    rounded-2xl
    bg-gradient-to-r
    from-cyan-500
    to-blue-500
    text-white
    font-semibold
    shadow-lg
    shadow-cyan-500/20
    flex
    items-center
    gap-3
  "
>

  <FileText size={22} />

  Export PDF
    </motion.button>
  <motion.button

  whileHover={{
    scale: 1.03,
  }}

  whileTap={{
    scale: 0.96,
  }}

  onClick={handleGenerateAI}

  className="
    px-6
    py-4
    rounded-2xl
    bg-gradient-to-r
    from-purple-500
    to-pink-500
    text-white
    font-semibold
    shadow-lg
    shadow-purple-500/20
    flex
    items-center
    gap-3
  "
>

  <Sparkles size={22} />

  {
    generatingAI

      ? "Generating..."

      : "Generate AI Analysis"
  }

</motion.button>

</div>

</div>

      {/* AI SUMMARY */}

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
          border-cyan-500/10
          bg-white/5
          backdrop-blur-2xl
          p-8
        "
      >

        <div className="
          absolute
          top-0
          right-0
          w-32
          h-32
          bg-cyan-500/10
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
            mb-6
          ">

            <div className="
              w-16
              h-16
              rounded-2xl
              bg-gradient-to-br
              from-cyan-500
              to-blue-500
              flex
              items-center
              justify-center
            ">

              <Sparkles
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
                AI Executive Summary
              </h2>

              <p className="
                text-gray-400
              ">
                Generated using realtime
                activity intelligence
              </p>

            </div>

          </div>

          <div className="
            space-y-4
            text-gray-300
            leading-relaxed
            text-lg
          ">

            <p>
              Current campus operations
              indicate strong participation
              across academic activities.
              The platform has recorded
              <span className="
                text-cyan-400
                font-bold
                mx-2
              ">
                {totalActivities}
              </span>

              total activities with

              <span className="
                text-cyan-400
                font-bold
                mx-2
              ">
                {totalParticipants}
              </span>

              participants overall.
            </p>

            <p>
              AI analysis shows a completion
              efficiency of

              <span className="
                text-green-400
                font-bold
                mx-2
              ">
                {completionRate}%
              </span>

              indicating stable execution
              quality and event management.
            </p>

            <p>
              Recommendation:
              Continue expanding collaborative,
              technical, and innovation-focused
              activities to maximize student
              engagement and platform growth.
            </p>

          </div>

        </div>
        {
  aiReport && (

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
        mt-8
        rounded-3xl
        border
        border-purple-500/20
        bg-[#0f172a]/80
        p-6
        whitespace-pre-wrap
        text-gray-300
        leading-relaxed
      "
    >

      <div className="
        flex
        items-center
        gap-3
        mb-5
      ">

        <Sparkles
          className="
            text-purple-400
          "
        />

        <h3 className="
          text-2xl
          font-bold
          text-white
        ">
          AI Analysis
        </h3>

      </div>

      <div className="
  space-y-6
">

  {
    aiReport
      ?.split("**")
      ?.map(
        (
          section,
          index
        ) => {

          const isHeading =
            index % 2 !== 0

          return isHeading ? (

            <h3

              key={index}

              className="
                text-2xl
                font-bold
                text-cyan-400
                mt-6
              "
            >
              {section}
            </h3>

          ) : (

            <p

              key={index}

              className="
                text-gray-300
                leading-relaxed
                text-lg
              "
            >
              {section}
            </p>
          )
        }
      )
  }

</div>

    </motion.div>
  )
}

      </motion.div>

      {/* AI INSIGHTS */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-6
      ">

        {aiInsights.map((
          insight,
          index
        ) => {

          const Icon =
            insight.icon

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
                border-white/10
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
                bg-cyan-500/10
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
                  from-cyan-500
                  to-blue-500
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

                <h3 className="
                  text-2xl
                  font-bold
                  text-white
                  mb-4
                ">
                  {insight.title}
                </h3>

                <p className="
                  text-gray-400
                  leading-relaxed
                ">
                  {insight.insight}
                </p>

              </div>

            </motion.div>
          )
        })}

      </div>

      {/* REPORT STATUS */}

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

        <div className="
          flex
          items-center
          gap-4
          mb-6
        ">

          <div className="
            w-14
            h-14
            rounded-2xl
            bg-gradient-to-br
            from-cyan-500
            to-blue-500
            flex
            items-center
            justify-center
          ">

            <FileText
              size={28}
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
              Report Engine
            </h2>

            <p className="
              text-gray-400
            ">
              AI reporting infrastructure active
            </p>

          </div>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
        ">

          <div className="
            rounded-2xl
            bg-[#0f172a]/70
            border
            border-white/5
            p-6
          ">

            <p className="
              text-gray-400
              mb-2
            ">
              Reports Generated
            </p>

            <h3 className="
              text-5xl
              font-black
              text-white
            ">
              24
            </h3>

          </div>

          <div className="
            rounded-2xl
            bg-[#0f172a]/70
            border
            border-white/5
            p-6
          ">

            <p className="
              text-gray-400
              mb-2
            ">
              AI Confidence
            </p>

            <h3 className="
              text-5xl
              font-black
              text-cyan-400
            ">
              96%
            </h3>

          </div>

          <div className="
            rounded-2xl
            bg-[#0f172a]/70
            border
            border-white/5
            p-6
          ">

            <p className="
              text-gray-400
              mb-2
            ">
              System Status
            </p>

            <h3 className="
              text-5xl
              font-black
              text-green-400
            ">
              LIVE
            </h3>

          </div>

        </div>

      </motion.div>

    </div>
  )
}

export default ReportsPage