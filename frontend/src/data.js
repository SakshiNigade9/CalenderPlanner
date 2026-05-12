export const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Admin", path: "/admin" },
  { label: "Activities", path: "/activities" },
  { label: "Analytics", path: "/analytics" },
  { label: "Reports", path: "/reports" },
  { label: "Settings", path: "/settings" }
];

export const summaryCards = [
  { label: "Total presentations", value: 96, suffix: "", delta: "+12 this week" },
  { label: "People reached", value: 18400, suffix: "", delta: "+2,120 this month" },
  { label: "Active teams", value: 14, suffix: "", delta: "11 on track" },
  { label: "Planning score", value: 91, suffix: "%", delta: "AI optimized" }
];

export const planningStats = [
  { label: "Working days left", value: 46 },
  { label: "Weekend-capable events", value: 18 },
  { label: "Holiday conflicts blocked", value: 7 },
  { label: "Recommended confidence", value: 92 }
];

export const progressRows = [
  { label: "Student presentations", current: 12, total: 14 },
  { label: "Student coverage", current: 2410, total: 2800 },
  { label: "College presentations", current: 96, total: 140 },
  { label: "College people covered", current: 18400, total: 28000 }
];

export const timeline = [
  {
    id: 1,
    day: "Mon",
    date: "May 18",
    type: "Presentation",
    title: "Govt. School Outreach",
    time: "10:00 AM",
    team: "Orbit Team",
    audience: 120,
    location: "Seminar Hall A",
    status: "Priority",
    proof: true
  },
  {
    id: 2,
    day: "Tue",
    date: "May 19",
    type: "Impact Activity",
    title: "Community Visit",
    time: "2:30 PM",
    team: "Catalyst Team",
    audience: 85,
    location: "Sector 4 Center",
    status: "Ready",
    proof: false
  },
  {
    id: 3,
    day: "Thu",
    date: "May 21",
    type: "Presentation",
    title: "Team Review Pitch",
    time: "11:15 AM",
    team: "Northstar Team",
    audience: 70,
    location: "Innovation Lab",
    status: "Locked",
    proof: true
  },
  {
    id: 4,
    day: "Sat",
    date: "May 23",
    type: "Mass Activity",
    title: "Weekend Awareness Drive",
    time: "9:00 AM",
    team: "Orbit Team",
    audience: 320,
    location: "Town Square",
    status: "Weekend",
    proof: false
  }
];

export const leaderboard = [
  { name: "Aarav", team: "Orbit Team", presentations: 12, people: 2410, streak: "8 days" },
  { name: "Diya", team: "Catalyst Team", presentations: 11, people: 2260, streak: "6 days" },
  { name: "Ishaan", team: "Northstar Team", presentations: 10, people: 2015, streak: "6 days" },
  { name: "Meera", team: "Orbit Team", presentations: 10, people: 1980, streak: "5 days" }
];

export const teams = [
  { name: "Orbit Team", lead: "Aarav", completion: 84, presentations: 31, people: 6240, health: "Strong" },
  { name: "Catalyst Team", lead: "Diya", completion: 76, presentations: 27, people: 5510, health: "Stable" },
  { name: "Northstar Team", lead: "Ishaan", completion: 69, presentations: 22, people: 4385, health: "Watch" }
];

export const reports = [
  { title: "Weekly execution brief", status: "Ready", updated: "2 hours ago" },
  { title: "College target summary", status: "Review", updated: "Today" },
  { title: "Student performance export", status: "Draft", updated: "Yesterday" }
];

export const trends = [
  { label: "Week 1", presentations: 12, people: 2200 },
  { label: "Week 2", presentations: 18, people: 4100 },
  { label: "Week 3", presentations: 26, people: 6900 },
  { label: "Week 4", presentations: 40, people: 10100 },
  { label: "Week 5", presentations: 56, people: 13300 },
  { label: "Week 6", presentations: 72, people: 16080 },
  { label: "Week 7", presentations: 96, people: 18400 }
];

export const holidays = ["May 24", "June 6", "June 29"];

export const settingsSeed = {
  notifications: true,
  autoSchedule: true,
  proofRequired: true,
  plannerMode: "Balanced"
};
