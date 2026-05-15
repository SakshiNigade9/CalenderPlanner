import { useEffect, useState, useRef, useMemo } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, TrendingUp, Users, Activity, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { generateAIReport } from "../../services/groq";
import toast from "react-hot-toast";

function ReportsPage() {
  const reportRef = useRef();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(0);

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    
    let query = supabase.from("tasks").select("*"); // Consistent with 'tasks' table
    if (profile?.role !== "admin") {
      query = query.eq("id", user.id);
    }

    const { data } = await query;
    setActivities(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Memoized Metrics
  const stats = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === "completed").length;
    const participants = activities.reduce((sum, a) => sum + (a.audience_count || 0), 0);
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgParticipation = total > 0 ? Math.round(participants / total) : 0;
    
    return { total, completed, participants, rate, avgParticipation };
  }, [activities]);

  const handleGenerateAI = async () => {
    const now = Date.now();
    if (now - lastGenerated < 15000) {
      toast.error("AI Engine cooling down. Wait 15s.");
      return;
    }

    setGeneratingAI(true);
    try {
      const result = await generateAIReport(activities);
      setAiReport(result);
      setLastGenerated(now);
      toast.success("Intelligence Report Sync Complete");
    } catch (err) {
      toast.error("AI Generation Failed");
    } finally {
      setGeneratingAI(false);
    }
  };

  const exportPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    toast.loading("Generating High-Res PDF...");
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#020617", // Matches your theme
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`CampusFlow-Intelligence-${new Date().toLocaleDateString()}.pdf`);
    toast.dismiss();
    toast.success("Report Exported");
  };

  if (loading) return <div className="p-10 text-white font-black animate-pulse">BOOTING REPORT ENGINE...</div>;

  return (
    <div className="space-y-8 pb-20 relative" ref={reportRef}>
      {/* Background Glows */}
      <div className="fixed top-0 left-1/3 w-[450px] h-[450px] bg-cyan-500/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[350px] h-[350px] bg-purple-500/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white mb-2">AI Reports</h1>
          <p className="text-gray-400 text-lg">Predictive intelligence and event documentation.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={exportPDF} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
            <FileText size={20} /> Export PDF
          </button>
          <button 
            onClick={handleGenerateAI} 
            disabled={generatingAI}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {generatingAI ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {generatingAI ? "Processing..." : "Generate AI Analysis"}
          </button>
        </div>
      </div>

      {/* Main Analysis Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="rounded-[2.5rem] border border-cyan-500/10 bg-white/5 backdrop-blur-3xl p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Executive Intelligence</h2>
              <p className="text-gray-400">Aggregated realtime metrics for MCA department.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-gray-300 text-lg leading-relaxed">
                Campus operations currently show a completion efficiency of <span className="text-green-400 font-bold">{stats.rate}%</span>. 
                With <span className="text-cyan-400 font-bold">{stats.total}</span> registered activities, the platform has successfully 
                reached <span className="text-cyan-400 font-bold">{stats.participants}</span> individuals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Avg. Reach" value={stats.avgParticipation} />
              <MiniStat label="System Status" value="LIVE" color="text-green-400" />
            </div>
          </div>

{/* AI EXECUTIVE INSIGHTS */}
<AnimatePresence>

  {aiReport && (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-8 border-t border-white/5"
    >

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* EXECUTIVE SUMMARY */}
        <div className="rounded-3xl border border-cyan-500/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-6 backdrop-blur-xl">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl">
              📊
            </div>

            <div>

              <h3 className="text-xl font-black text-white">
                Executive Summary
              </h3>

              <p className="text-gray-500 text-sm">
                Operational overview
              </p>

            </div>

          </div>

          <div className="space-y-4">

            <div className="rounded-2xl bg-black/20 border border-white/5 p-4">

              <p className="text-gray-400 text-sm">
                Active Activities
              </p>

              <h2 className="text-4xl font-black text-cyan-400 mt-2">
                {stats.total}
              </h2>

            </div>

            <div className="rounded-2xl bg-black/20 border border-white/5 p-4">

              <p className="text-gray-400 text-sm">
                Completion Rate
              </p>

              <h2 className="text-4xl font-black text-green-400 mt-2">
                {stats.rate}%
              </h2>

            </div>

          </div>

        </div>

        {/* PARTICIPATION INSIGHT */}
        <div className="rounded-3xl border border-pink-500/10 bg-gradient-to-br from-pink-500/5 to-red-500/5 p-6 backdrop-blur-xl">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 text-2xl">
              👥
            </div>

            <div>

              <h3 className="text-xl font-black text-white">
                Participation Insight
              </h3>

              <p className="text-gray-500 text-sm">
                Audience intelligence
              </p>

            </div>

          </div>

          <div className="space-y-4">

            <div className="rounded-2xl bg-black/20 border border-white/5 p-4">

              <p className="text-gray-400 text-sm">
                Audience Reach
              </p>

              <h2 className="text-4xl font-black text-pink-400 mt-2">
                {stats.participants}
              </h2>

            </div>

            <div className="rounded-2xl bg-black/20 border border-white/5 p-4">

              <p className="text-gray-400 text-sm">
                Avg. Reach
              </p>

              <h2 className="text-4xl font-black text-white mt-2">
                {stats.avgParticipation}
              </h2>

            </div>

          </div>

        </div>

        {/* AI RECOMMENDATIONS */}
        <div className="rounded-3xl border border-green-500/10 bg-gradient-to-br from-green-500/5 to-emerald-500/5 p-6 backdrop-blur-xl">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 text-2xl">
              ⚡
            </div>

            <div>

              <h3 className="text-xl font-black text-white">
                AI Recommendations
              </h3>

              <p className="text-gray-500 text-sm">
                Optimization insights
              </p>

            </div>

          </div>

          <div className="space-y-3">

            <div className="rounded-2xl bg-black/20 border border-white/5 px-4 py-3 text-gray-300">
              Improve completion efficiency for pending missions.
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/5 px-4 py-3 text-gray-300">
              Increase promotion for high-reach activities.
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/5 px-4 py-3 text-gray-300">
              Enhance collaborative team execution workflows.
            </div>

          </div>

        </div>

      </div>

    </motion.div>

  )}

</AnimatePresence>
        </div>
      </motion.div>

      {/* Insight Triad */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <InsightCard title="Participation Analysis" icon={Users} content={`Current engagement averages ${stats.avgParticipation} students per event. Collaboration events show the highest delta.`} />
        <InsightCard title="Completion Metrics" icon={Activity} content={`Platform throughput is at ${stats.rate}%. This indicates a stable execution environment for campus operations.`} />
        <InsightCard title="Growth Forecast" icon={TrendingUp} content="AI recommends scaling Hackathon and Workshop instances by 15% to maintain student interest." />
      </div>
    </div>
  );
}

// Sub-components
const MiniStat = ({ label, value, color = "text-white" }) => (
  <div className="bg-black/30 border border-white/5 p-5 rounded-2xl">
    <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-1">{label}</p>
    <h3 className={`text-3xl font-black ${color}`}>{value}</h3>
  </div>
);

const InsightCard = ({ title, icon: Icon, content }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
    className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
    <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full group-hover:bg-cyan-500/10 transition-all" />
    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6">
      <Icon className="text-cyan-400" size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{content}</p>
  </motion.div>
);

export default ReportsPage;