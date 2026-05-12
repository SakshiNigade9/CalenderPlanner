import {
  holidays,
  leaderboard,
  navItems,
  planningStats,
  progressRows,
  reports,
  settingsSeed,
  summaryCards,
  teams,
  timeline,
  trends
} from "../data";

export async function fetchAppSnapshot() {
  return Promise.resolve({
    navItems,
    summaryCards,
    planningStats,
    progressRows,
    timeline,
    leaderboard,
    teams,
    reports,
    trends,
    holidays,
    settingsSeed
  });
}
