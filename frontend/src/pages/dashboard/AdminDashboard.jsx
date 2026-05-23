import ExportButtons from "../admin/ExportButtons";

import { useEffect, useState, useMemo } from "react";

import { motion } from "framer-motion";

import Tilt from "react-parallax-tilt";

import { supabase } from "../../lib/supabase";

import {
  Activity,
  CalendarDays,
  Users,
  BarChart3,
  ShieldAlert,
  School,
  Swords,
  UserCheck,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { colleges } from "../../data/collegeData";

import CollegeSelector from "../admin/CollegeSelector";

import OverallAnalytics from "../admin/OverallAnalytics";

import CollegePerformance from "../admin/CollegePerformance";

import OverallCollegeReport from "../admin/OverallCollegeReport";

function AdminDashboard() {

  const [activities, setActivities] = useState([]);

  const [profiles, setProfiles] = useState([]);

  const [loading, setLoading] = useState(true);

  // SELECTED COLLEGE

  const [selectedCollege, setSelectedCollege] =
    useState("All");

  const selectedCollegeData = colleges.find(
    (college) => college.name === selectedCollege
  );

  // FETCH DATA

  const fetchDashboardData = async () => {

    try {

      const [tasksRes, profilesRes] =
        await Promise.all([
          supabase.from("tasks").select("*"),
          supabase.from("profiles").select("*"),
        ]);

      if (tasksRes.data) {
        setActivities(tasksRes.data);
      }

      if (profilesRes.data) {
        setProfiles(profilesRes.data);
      }

    } catch (error) {

      console.error("Dashboard Error:", error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchDashboardData();

  }, []);

  // ANALYTICS

  const dataStore = useMemo(() => {

    const totalParticipants = activities.reduce(
      (sum, act) => sum + (act.audience_count || 0),
      0
    );

    const planned = activities.filter(
      (a) => a.status === "planned"
    ).length;

    const completed = activities.filter(
      (a) => a.status === "completed"
    ).length;

    const overdue = activities.filter(
      (a) =>
        a.deadline &&
        new Date(a.deadline) < new Date() &&
        a.status !== "completed"
    ).length;

    const collegesCount = new Set(
      activities.map((a) => a.assigned_college_id)
    ).size;

    const warriors = profiles.filter(
      (p) => p.role === "warrior"
    ).length;

    const presidents = profiles.filter(
      (p) => p.role === "president"
    ).length;

    // BAR CHART DATA

    const barData = activities.slice(0, 6).map((a) => ({
      name:
        a.title?.length > 12
          ? a.title.slice(0, 12) + "..."
          : a.title,

      participants: a.audience_count || 0,
    }));

    return {
      totalParticipants,
      planned,
      completed,
      overdue,
      collegesCount,
      warriors,
      presidents,
      barData,
    };

  }, [activities, profiles]);

  const COLORS = ["#ec4899", "#22c55e"];

  const chartStyle = {
    contentStyle: {
      backgroundColor: "#0b1120",
      border: "1px solid #1e293b",
      borderRadius: "16px",
    },
    itemStyle: {
      color: "#fff",
    },
  };

  // LOADING

  if (loading) {

    return (
      <div className="p-10 text-white text-3xl font-black">
        Loading Dashboard...
      </div>
    );
  }

  return (

    <div className="relative space-y-10 pb-20">

      {/* BACKGROUND */}

      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* HEADER */}

      <div className="relative z-10">

        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-6xl font-black text-white tracking-tight mb-2"
        >
          Dashboard
        </motion.h1>

        <p className="text-gray-400 text-lg">
          AI-powered centralized activity intelligence.
        </p>

      </div>

      {/* OVERALL ANALYTICS */}

      <OverallAnalytics />
      

     {/* COLLEGE SELECTOR */}

<CollegeSelector
  selectedCollege={selectedCollege}
  setSelectedCollege={setSelectedCollege}
  colleges={colleges}
/>

{/* CONDITIONAL TABLES */}

{selectedCollege === "All" ? (

  <>
    
    {/* OVERALL EXPORT */}

    <ExportButtons
      type="overall"
    />

    {/* OVERALL REPORT TABLE */}

    <OverallCollegeReport />

  </>

) : (

  <>
    
    {/* SINGLE COLLEGE EXPORT */}

    <ExportButtons
      college={selectedCollegeData}
      type="single"
    />

    {/* SINGLE COLLEGE TABLE */}

    <CollegePerformance
      college={selectedCollegeData}
    />

  </>

)}

      {/* STATS GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <DashboardStat
          title="Total Activities"
          value={activities.length}
          icon={Activity}
        />

        <DashboardStat
          title="Planned"
          value={dataStore.planned}
          icon={CalendarDays}
        />

        <DashboardStat
          title="Completed"
          value={dataStore.completed}
          icon={BarChart3}
        />

        <DashboardStat
          title="Total Reach"
          value={dataStore.totalParticipants}
          icon={Users}
        />

        <DashboardStat
          title="Colleges"
          value={dataStore.collegesCount}
          icon={School}
        />

        <DashboardStat
          title="Overdue"
          value={dataStore.overdue}
          icon={ShieldAlert}
        />

        <DashboardStat
          title="Warriors"
          value={dataStore.warriors}
          icon={Swords}
        />

        <DashboardStat
          title="Admins"
          value={dataStore.presidents}
          icon={UserCheck}
        />

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* PIE CHART */}

        <ChartWrapper title="Activity Status Distribution">

          <ResponsiveContainer width="100%" height={350}>

            <PieChart>

              <Pie
                data={[
                  {
                    name: "Planned",
                    value: dataStore.planned,
                  },
                  {
                    name: "Completed",
                    value: dataStore.completed,
                  },
                ]}
                dataKey="value"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
              >

                {COLORS.map((color, i) => (

                  <Cell key={i} fill={color} />

                ))}

              </Pie>

              <Tooltip {...chartStyle} />

            </PieChart>

          </ResponsiveContainer>

        </ChartWrapper>

        {/* BAR CHART */}

        <ChartWrapper title="Top Participation Feed">

          <ResponsiveContainer width="100%" height={350}>

            <BarChart data={dataStore.barData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#475569"
              />

              <YAxis stroke="#475569" />

              <Tooltip {...chartStyle} />

              <Bar
                dataKey="participants"
                fill="#ec4899"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </ChartWrapper>

      </div>

    </div>
  );
}

// STAT CARD

const DashboardStat = ({
  title,
  value,
  icon: Icon,
}) => (

  <Tilt
    scale={1.03}
    transitionSpeed={2500}
    glareEnable
    glareMaxOpacity={0.1}
  >

    <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-pink-500/30 via-transparent to-purple-500/20">

      <div className="bg-[#0b1120]/90 rounded-[23px] p-6 border border-white/5 backdrop-blur-2xl">

        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6">

          <Icon
            size={28}
            className="text-pink-400"
          />

        </div>

        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">

          {title}

        </p>

        <p className="text-5xl font-black text-white">

          {value}

        </p>

      </div>

    </div>

  </Tilt>
);

// CHART WRAPPER

const ChartWrapper = ({
  title,
  children,
}) => (

  <div className="p-[1px] rounded-[32px] bg-gradient-to-br from-white/10 to-transparent">

    <div className="bg-[#0b1120]/90 rounded-[31px] p-8 border border-white/5 backdrop-blur-3xl">

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-white">

          {title}

        </h2>

      </div>

      {children}

    </div>

  </div>
);

export default AdminDashboard;