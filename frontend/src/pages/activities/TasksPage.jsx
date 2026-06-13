import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, MapPin, Users, Search, Filter, Trash2, Pencil, Clock } from "lucide-react";
import AddActivityModal from "../../components/modals/AddActivityModal";
import { supabase } from "../../lib/supabase";

// ─── HELPER: Format ISO date string into readable "DD MMM YYYY, HH:MM AM/PM" ───
function formatSubmissionDate(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function TasksPage() {
  const [submissions, setSubmissions] = useState({});
  const [profile, setProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState("individual");
  const [teamName, setTeamName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedWarrior, setSelectedWarrior] = useState("");

  // FETCH ACTIVITIES & PROFILE
  const fetchActivities = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get Profile for role-based filtering
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(profileData);
    if (profileData?.role !== "warrior") {
  const { data: teamsData } = await supabase
    .from("teams")
    .select("*")
    .eq("college_id", profileData.college_id);

  setTeams(teamsData || []);
}

    let query = supabase
  .from("tasks")
  .select(`
    *,
    teams:assigned_team_id(team_name)
  `);

    if (profileData?.role === "president") {
      query = query.eq("assigned_college_id", profileData.college_id);
    } else if (profileData?.role === "warrior") {

  // GET TEAM IDS
  const { data: memberTeams } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", profileData.id);

  const teamIds =
    memberTeams?.map(t => t.team_id) || [];

  // FETCH:
  // 1. INDIVIDUAL TASKS
  // 2. TEAM TASKS
  query = query.or(
    `assigned_to.eq.${user.id},assigned_team_id.in.(${teamIds.join(",")})`
  );
}

    const { data, error } = await query.order("created_at", { ascending: false });
    if (!error) setActivities(data || []);
    setLoading(false);
  }, []);
  const fetchTasks = fetchActivities;

  useEffect(() => {

    const fetchTeams = async () => {

  const { data, error } = await supabase
    .from("teams")
    .select("*");

  if (error) {
    console.error(error);
  } else {
    setTeams(data || []);
  }
};
    fetchActivities();
    fetchTeams();
    const channel = supabase.channel("activities-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchActivities)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchActivities]);

const handleSubmitTask = async (taskId) => {
  console.log("TASK ID RECEIVED:", taskId);
  try {

const currentSubmission = submissions[taskId];

if (!currentSubmission?.proofFile) {
  toast.error("Please upload proof document");
  return;
}

    const file = currentSubmission?.proofFile;

    const fileExt = file.name.split('.').pop();

    const fileName = `${taskId}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("activity-proofs")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get Public URL
    const { data } = supabase.storage
      .from("activity-proofs")
      .getPublicUrl(fileName);

    const proofUrl = data.publicUrl;

    // ── CHANGE: capture exact submission timestamp ──
    const submissionTimestamp = new Date().toISOString();

const { data: updatedTask, error } = await supabase
  .from("tasks")
  .update({
    status: "submitted",
    remarks: currentSubmission?.remarks,
    proof_url: proofUrl,
    completion_date: submissionTimestamp,   // records when warrior submitted
  })
  .eq("id", taskId)
  .select();

console.log("UPDATED TASK:", updatedTask);
console.log("UPDATE ERROR:", error);

    if (error) throw error;

    toast.success("Proof submitted for approval!");
    

    const { data: presidentTasks } = await supabase
  .from("tasks")
  .select("created_by")
  .eq("id", taskId)
  .single();

if (presidentTasks?.created_by) {

const { data: presidentProfile } = await supabase
  .from("profiles")
  .select("id")
  .eq("id", presidentTasks.created_by)
  .single();

if (presidentProfile?.user_id) {

  await supabase.from("notifications").insert([
    {
      user_id: presidentProfile.user_id,
      message: `New task submission received`,
      type: "task_submission"
    }
  ]);

}

}

setSubmissions(prev => ({
  ...prev,
  [taskId]: {
    remarks: "",
    proofFile: null
  }
}));

    fetchActivities();

  } catch (err) {
    toast.error("Submission failed: " + err.message);
  }
};

  const createTeam = async () => {

  if (!teamName.trim()) {
    toast.error("Enter team name");
    return;
  }

  const { error } = await supabase
    .from("teams")
    .insert([
      {
        name: teamName,
        college_id: profile?.college_id
      }
    ]);

  if (error) {

    toast.error(error.message);

  } else {

    toast.success("Team created!");

    setTeamName("");

    fetchActivities();

  }
};

const addWarriorToTeam = async () => {

  if (!selectedTeam || !selectedWarrior) {
    toast.error("Select both team and warrior");
    return;
  }

  const { error } = await supabase
    .from("team_members")
    .insert([
      {
        team_id: selectedTeam,
        user_id: selectedWarrior
      }
    ]);

  if (error) {

    toast.error(error.message);

  } else {

    toast.success("Warrior added to team!");

  }
};

  // CREATE / UPDATE
  const handleSaveActivity = async (activityData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Not authenticated");

    const payload = {
      title: activityData.title,
      activity_type: "Technical",
      activity_date: activityData.start_date,
      venue: activityData.location,
      audience_count: Number(activityData.participants) || 0,
      deadline: activityData.deadline || null,
assigned_to:
  activityData.assignment_type === "individual"
    ? activityData.assigned_to || user.id
    : null,

assigned_team_id:
  activityData.assignment_type === "team"
    ? activityData.assigned_team_id
    : null,

assignment_type:
  activityData.assignment_type,
      assigned_user_name: activityData.assigned_user_name || "",
      assigned_college_id: profile?.college_id || null,
    };

    const action = editingActivity 
      ? supabase.from("tasks").update(payload).eq("id", editingActivity.id)
      : supabase.from("tasks").insert([{ ...payload, status: "planned", created_by: user.id, user_id: user.id }]);

    const { error } = await action;
    if (error) toast.error("Action failed");
    else {
      toast.success(editingActivity ? "Updated!" : "Created!");
if (!editingActivity) {

  // INDIVIDUAL TASK
  if (payload.assignment_type === "individual") {

    await supabase
      .from("notifications")
      .insert([
        {
          user_id: payload.assigned_to,
          title: "New Task Assigned",
          message: `New task assigned: ${payload.title}`,
          notification_type: "task_assigned"
        }
      ]);

  }

  // TEAM TASK
  if (payload.assignment_type === "team") {

    // GET TEAM MEMBERS
    const { data: members } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", payload.assigned_team_id);

    if (members?.length > 0) {

      const notificationPayload = members.map(member => ({
        user_id: member.user_id,
        title: "New Team Task",
        message: `Team task assigned: ${payload.title}`,
        notification_type: "task_assigned"
      }));

      await supabase
        .from("notifications")
        .insert(notificationPayload);

    }

  }

}
      setIsModalOpen(false);
      setEditingActivity(null);
      fetchActivities();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) {

  setActivities(prev =>
    prev.filter(activity => activity.id !== id)
  );

  toast.success("Deleted");
}
  };

  const updateTaskField = async (activity, updates) => {
    // Optimistic Update
    setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, ...updates } : a));
    const { error } = await supabase.from("tasks").update(updates).eq("id", activity.id);
    if (error) {
      toast.error("Sync failed");
      fetchActivities(); // Rollback
    }
  };

  const filtered = activities.filter(a => {
    const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || a.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 relative pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white mb-2">Activities</h1>
          <p className="text-gray-400 text-lg">Manage campus events and tech trails.</p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-50">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-xl">
          <Search className="text-gray-400" size={20} />
          <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent outline-none text-white w-full" />
        </div>

        <div className="relative bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-xl cursor-pointer" onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3"><Filter size={20} className="text-red-400" /> <span>Filter: {statusFilter}</span></div>
            <motion.div animate={{ rotate: isFilterOpen ? 180 : 0 }}>▼</motion.div>
          </div>
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-20 left-0 w-full bg-[#111827] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100]">
                {["All", "Planned", "Submitted", "Approved", "Rejected"].map(opt => (
                  <button key={opt} onClick={() => setStatusFilter(opt)} className="w-full text-left px-6 py-4 text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors border-b border-white/5 last:border-0">{opt}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* TASK ASSIGNMENT */}
{profile?.role !== "warrior" && (
  <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-3xl font-black text-white">
          Assign New Task
        </h2>

        <p className="text-gray-400 mt-2">
          Create and assign activities to teams.
        </p>
      </div>
    </div>

    <button
    data-testid="assign-task-btn"
      onClick={() => {
        setEditingActivity(null);
        setIsModalOpen(true);
      }}
      className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg shadow-red-500/30 hover:scale-105 transition-all"
    >
      + Assign Task
    </button>
    <div className="mt-6 flex gap-4">

<div className="flex gap-4 mt-6">

  {/* ALL */}
  <button
    onClick={() => setTaskFilter("all")}
    className={`
      px-6 py-3 rounded-2xl font-bold transition-all
      ${
        taskFilter === "all"
          ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/20"
          : "bg-white/5 text-gray-400 hover:bg-white/10"
      }
    `}
  >
    All Tasks
  </button>

  {/* INDIVIDUAL */}
  <button
    onClick={() => setTaskFilter("individual")}
    className={`
      px-6 py-3 rounded-2xl font-bold transition-all
      ${
        taskFilter === "individual"
          ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/20"
          : "bg-white/5 text-gray-400 hover:bg-white/10"
      }
    `}
  >
    Individual Tasks
  </button>

  {/* TEAM */}
  <button
    onClick={() => setTaskFilter("team")}
    className={`
      px-6 py-3 rounded-2xl font-bold transition-all
      ${
        taskFilter === "team"
          ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/20"
          : "bg-white/5 text-gray-400 hover:bg-white/10"
      }
    `}
  >
    Team Tasks
  </button>

</div>

</div>
  </div>
)}

      {/* GRID */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Initializing Neural Feed...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered
  .filter((activity) => {

    if (taskFilter === "all") {
      return true;
    }

    return (
      activity.assignment_type === taskFilter
    );

  })
  .map((activity, index) => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              index={index} 
              onDelete={handleDelete}
              onEdit={(a) => { setEditingActivity(a); setIsModalOpen(true); }}
              onUpdate={updateTaskField}
              isAdmin={profile?.role !== "warrior"}
              submissions={submissions}
              setSubmissions={setSubmissions}
              onSubmit={(id) => handleSubmitTask(id)}
            />
          ))}
        </div>
      )}

      <AddActivityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreateActivity={handleSaveActivity} 
        editingActivity={editingActivity} 
      />
    </div>
  );
}

// SUB-COMPONENT: ACTIVITY CARD
const ActivityCard = ({ activity, index, onDelete, onEdit, onUpdate, isAdmin, submissions, setSubmissions, onSubmit }) => {
  const isOverdue = activity.deadline && new Date(activity.deadline) < new Date() && activity.status !== 'completed';
  const daysLeft = activity.deadline ? Math.ceil((new Date(activity.deadline) - new Date()) / (86400000)) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className={`relative group rounded-3xl border ${isOverdue ? 'border-red-500 shadow-red-500/20' : 'border-white/10'} bg-[#111827] p-7 overflow-hidden`}>
      
      <div className="flex justify-between items-start mb-6">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">{activity.activity_type}</span>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(activity)} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"><Pencil size={16} /></button>
            <button onClick={() => onDelete(activity.id)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 size={16} /></button>
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{activity.title}</h3>
      
      {/* WORKFLOW STATUS */}
<div className="mb-6 flex items-center justify-between">

  <div>
    <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">
      Mission Status
    </p>

    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold
      ${
        activity.status === "approved"
          ? "bg-green-500/10 border-green-500/20 text-green-400"
          : activity.status === "submitted"
          ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
          : activity.status === "rejected"
          ? "bg-red-500/10 border-red-500/20 text-red-400"
          : "bg-blue-500/10 border-blue-500/20 text-blue-400"
      }`}
    >

      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>

{
  activity.status === "approved" ? (
    <span className="text-green-400">
      Completed
    </span>
  ) : activity.status === "submitted" ? (
    <span className="text-yellow-400">
      Pending Review
    </span>
  ) : activity.status === "rejected" ? (
    <span className="text-red-400">
      Rejected
    </span>
  ) : (
    <span className="text-blue-400">
      Assigned
    </span>
  )
}

    </div>
  </div>

</div>

      {/* Meta Info */}
      <div className="space-y-3 text-sm text-gray-400">
        <div className="flex items-center gap-2"><CalendarDays size={16} /> {activity.activity_date}</div>
        <div className="flex items-center gap-2"><MapPin size={16} /> {activity.venue}</div>
        <div className="flex items-center gap-2"><Users size={16} /> {activity.audience_count} participants</div>
        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
          <span className="text-red-400/80 font-medium">

  Assigned: {

    activity.assignment_type === "team"

      ? activity.teams?.team_name || "Team"

      : activity.assigned_user_name || "Warrior"

  }

</span>
          {daysLeft !== null && <span className={`font-bold ${daysLeft < 0 ? 'text-red-500' : 'text-green-500'}`}>{daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}</span>}
        </div>
      </div>

{/* PREMIUM MISSION SUBMISSION UI */}
{!isAdmin && activity.status !== 'completed' && activity.status !== 'approved' && activity.status !== 'submitted' && (

  <div className="mt-4 rounded-2xl border border-pink-500/20 bg-white/[0.03] backdrop-blur-xl p-4">

    {/* HEADER */}
    <div className="flex items-center justify-between mb-4">

      <div>
        <p className="text-[11px] font-black tracking-[0.25em] text-pink-400 uppercase">
          Mission Submission
        </p>

        <h3 className="text-white font-bold text-lg mt-1">
          Upload Completion Proof
        </h3>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-xl">
        ⬆
      </div>

    </div>

    {/* FILE UPLOAD */}
    <label className="group cursor-pointer block">

      <div className="border border-dashed border-pink-500/20 hover:border-pink-400/40 transition-all rounded-xl p-3 bg-black/20">

        <div className="flex flex-col items-center justify-center text-center">

          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-2xl text-pink-400 mb-3">
            📄
          </div>

          <p className="text-white font-semibold">
            Click to Upload Proof
          </p>

          <p className="text-gray-400 text-sm mt-1">
            PDF, Images, Docs, Drive Links
          </p>

          {submissions?.[activity.id]?.proofFile && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
              {submissions[activity.id].proofFile.name}
            </div>
          )}

        </div>

        <input
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) =>
           setSubmissions(prev => ({
  ...prev,
  [activity.id]: {
    ...prev[activity.id],
    proofFile: e.target.files[0]
  }
}))
          }
        />

      </div>

    </label>

    {/* REMARKS */}
    <div className="mt-5">

      <textarea
        rows="2"
        placeholder="Describe your work, add GitHub links, Drive links, completion notes..."
        onChange={(e) =>
          setSubmissions(prev => ({
  ...prev,
  [activity.id]: {
    ...prev[activity.id],
    remarks: e.target.value
  }
}))
        }
        className="w-full rounded-2xl bg-black/20 border border-white/10 focus:border-pink-500/40 outline-none text-white px-5 py-4 placeholder:text-gray-500 resize-none transition-all"
      />

    </div>

    {/* SUBMIT BUTTON */}
    <button
      onClick={() => onSubmit(activity.id)}
      className="mt-5 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 hover:scale-[1.02] transition-all duration-300 text-white font-black tracking-wide py-3 shadow-[0_0_30px_rgba(255,0,128,0.25)]"
    >
      Submit Proof →
    </button>

  </div>
)}

{/* ── CHANGE 1: SUBMITTED STATE — show "awaiting review" + submission timestamp to warrior ── */}
{!isAdmin && activity.status === 'submitted' && (
  <div className="mt-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] backdrop-blur-xl p-4">

    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[11px] font-black tracking-[0.25em] text-yellow-400 uppercase">
          Proof Submitted
        </p>
        <h3 className="text-white font-bold text-base mt-1">
          Awaiting President Review
        </h3>
      </div>
      <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-xl">
        ⏳
      </div>
    </div>

    {/* ── SUBMISSION TIMESTAMP ── */}
    {activity.completion_date && (
      <div className="flex items-center gap-2 mt-3 px-4 py-3 rounded-xl bg-black/20 border border-yellow-500/10">
        <Clock size={14} className="text-yellow-400 shrink-0" />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Submitted On</p>
          <p className="text-yellow-300 text-sm font-semibold">
            {formatSubmissionDate(activity.completion_date)}
          </p>
        </div>
      </div>
    )}

    {activity.proof_url && (
      
        href={activity.proof_url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-all border border-yellow-500/20 text-yellow-400 text-sm font-semibold"
      >
        View Your Submitted Proof →
      </a>
    )}
  </div>
)}

{/* ADMIN REVIEW PANEL */}
{isAdmin && activity.status === "submitted" && (

  <div className="mt-6 rounded-3xl border border-yellow-500/20 bg-yellow-500/[0.04] backdrop-blur-xl p-5">

    {/* HEADER */}
    <div className="flex items-center justify-between mb-5">

      <div>

        <p className="text-[11px] font-black tracking-[0.25em] text-yellow-400 uppercase">
          Pending Approval
        </p>

        <h3 className="text-white font-bold text-lg mt-1">
          Submission Awaiting Review
        </h3>

      </div>

      <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-2xl">
        
      </div>

    </div>

    {/* ── CHANGE 1: SUBMISSION TIMESTAMP visible to Admin/President ── */}
    {activity.completion_date && (
      <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-black/20 border border-yellow-500/10">
        <Clock size={14} className="text-yellow-400 shrink-0" />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Submitted On</p>
          <p className="text-yellow-300 text-sm font-semibold">
            {formatSubmissionDate(activity.completion_date)}
          </p>
        </div>
      </div>
    )}

    {/* REMARKS */}
    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">

      <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">
        Warrior Remarks
      </p>

      <p className="text-gray-300 text-sm leading-relaxed">
        {activity.remarks || "No remarks provided."}
      </p>

    </div>

    {/* ACTIONS */}
    <div className="mt-5 flex flex-wrap gap-3">

      {/* VIEW PROOF */}
      {activity.proof_url && (
        
          href={activity.proof_url}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold hover:bg-blue-500/20 transition-all"
        >
          View Proof
        </a>
      )}

      {/* APPROVE */}
      <button
        onClick={() =>
          onUpdate(activity, {
            status: "approved"
          })
        }
        className="px-5 py-3 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold hover:bg-green-500/20 transition-all"
      >
        Approve
      </button>

      {/* REJECT */}
      <button
        onClick={() => {

          const reason = prompt(
            "Enter rejection reason"
          );

          if (!reason) return;

onUpdate(activity, {
  status: "rejected",
  rejection_reason: reason,
  proof_url: null,
  completion_date: null
});

        }}
        className="px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all"
      >
        Reject
      </button>

    </div>

  </div>

)}
      
      {activity.status === 'approved' && (

  <div className="mt-6 rounded-3xl border border-green-500/20 bg-green-500/[0.05] backdrop-blur-xl p-5">

    {/* HEADER */}
    <div className="flex items-center justify-between mb-5">

      <div>
        <p className="text-[11px] font-black tracking-[0.25em] text-green-400 uppercase">
          Mission Completed
        </p>

        <h3 className="text-white font-bold text-lg mt-1">
          Proof Successfully Verified
        </h3>
      </div>

      <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl text-green-400">
        ✓
      </div>

    </div>

    {/* SUCCESS PANEL */}
    <div className="rounded-2xl border border-green-500/10 bg-black/20 p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-white font-semibold">
            Mission Approved
          </p>

          <p className="text-gray-400 text-sm mt-1">
            President verified your submission successfully.
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-3xl text-green-400">
          🏆
        </div>

      </div>

      {/* ── CHANGE 1: Show submission date on approved card too ── */}
      {activity.completion_date && (
        <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl bg-black/20 border border-green-500/10">
          <Clock size={14} className="text-green-400 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">Submitted On</p>
            <p className="text-green-300 text-sm font-semibold">
              {formatSubmissionDate(activity.completion_date)}
            </p>
          </div>
        </div>
      )}

      {/* VIEW PROOF */}
      {activity.proof_url && (
        
          href={activity.proof_url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-500/10 hover:bg-green-500/20 transition-all border border-green-500/20 text-green-400 font-semibold"
        >
          View Submitted Proof →
        </a>
      )}

    </div>

  </div>
)}

      {activity.status === 'rejected' && (
  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">

    <p className="text-[10px] font-bold text-red-500 uppercase mb-2">
      Rejected
    </p>

    <p className="text-sm text-red-200">
      {activity.rejection_reason || "No feedback provided."}
    </p>

  </div>
)}
    </motion.div>
  );
};

export default TasksPage;
