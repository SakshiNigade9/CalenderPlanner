import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Clock3, Users } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend
} from "recharts";
import { supabase } from "../../lib/supabase";

function AnalyticsPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks") // Changed to 'tasks' to stay consistent with your db structure
      .select("*")
      .eq("id", user.id);

    if (!error) setActivities(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
    const channel = supabase.channel("analytics-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchAnalytics)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Memoized Calculations
  const metrics = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === "completed").length;
    const planned = activities.filter(a => a.status === "planned").length;
    const participants = activities.reduce((sum, a) => sum + (a.audience_count || 0), 0);
    
    return { total, completed, planned, participants };
  }, [activities]);

  const pieData = [
    { name: "Completed", value: metrics.completed },
    { name: "Planned", value: metrics.planned },
  ];

  const COLORS = ["#ef4444", "#8b5cf6"];

  // Chart UI components
  const chartStyles = {
    contentStyle: { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' },
    itemStyle: { color: '#f3f4f6' }
  };

  if (loading) return <div className="p-10 text-white font-black">Syncing Neural Data...</div>;

  return (
    <div className="relative space-y-8 pb-20">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/3 w-[450px] h-[450px] bg-red-500/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[350px] h-[350px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Header */}
      <div>
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black text-white mb-2">
          Analytics
        </motion.h1>
        <p className="text-gray-400 text-lg">Realtime activity intelligence dashboard.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnalyticsStatCard title="Total Tasks" value={metrics.total} icon={Activity} />
        <AnalyticsStatCard title="Completed" value={metrics.completed} icon={CheckCircle2} />
        <AnalyticsStatCard title="Planned" value={metrics.planned} icon={Clock3} />
        <AnalyticsStatCard title="Total Reach" value={metrics.participants} icon={Users} />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-8">Status Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...chartStyles} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-8">Activity Flow</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dummyMonthlyData(metrics.total)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#ffffff05'}} {...chartStyles} />
                <Bar dataKey="activities" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Participation Growth */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8">Participation Velocity</h2>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyParticipationData(metrics.participants)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip {...chartStyles} />
              <Line type="monotone" dataKey="participants" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: "#8b5cf6" }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

// Sub-components for cleaner structure
const AnalyticsStatCard = ({ title, value, icon: Icon }) => (
  <div className="relative overflow-hidden rounded-3xl border border-red-500/10 bg-white/5 backdrop-blur-2xl p-6">
    <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest">{title}</p>
        <h2 className="text-3xl font-black text-white">{value}</h2>
      </div>
    </div>
  </div>
);

// Helpers to mix real total into trend lines
const dummyMonthlyData = (total) => [
  { month: "Jan", activities: 4 }, { month: "Feb", activities: 7 },
  { month: "Mar", activities: 5 }, { month: "Apr", activities: 9 },
  { month: "May", activities: total }
];

const dummyParticipationData = (total) => [
  { month: "Jan", participants: 120 }, { month: "Feb", participants: 210 },
  { month: "Mar", participants: 180 }, { month: "Apr", participants: 300 },
  { month: "May", participants: total }
];

export default AnalyticsPage;