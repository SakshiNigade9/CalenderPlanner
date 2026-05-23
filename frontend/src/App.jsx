import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import { useEffect, useState } from "react"

import { supabase } from "./lib/supabase"

import AdminDashboard from "./pages/dashboard/AdminDashboard"
import CollegeManagementPage from "./pages/admin/CollegeManagementPage";

import TasksPage from "./pages/activities/TasksPage"

import AuthPage from "./pages/auth/AuthPage"

import Sidebar from "./components/navigation/Sidebar"

import AnalyticsPage from "./pages/analytics/AnalyticsPage"

import ReportsPage from "./pages/reports/ReportsPage"

import SettingsPage from "./pages/settings/SettingsPage"

import AdminPage from "./pages/admin/AdminPage"

import PresidentDashboard from "./pages/dashboard/PresidentDashboard"

import TeamsPage from "./pages/activities/TeamsPage"

import WarriorDashboard from "./pages/dashboard/WarriorDashboard"

function App() {

  const [session, setSession] =
    useState(null)

  const [profile, setProfile] =
    useState(null)

  // CHECK SESSION

  const fetchProfile =
  async (userId) => {

    const {
      data,
      error,
    } = await supabase

      .from("profiles")

      .select("*")

      .eq("id", userId)

      .single()

    if (!error) {

      setProfile(data)

      console.log(
       "PROFILE:",
         data
      )
    }
  }

  useEffect(() => {

    supabase.auth
      .getSession()

      .then(({ data }) => {

        setSession(
          data.session
        )

        if (data.session?.user) {

  fetchProfile(
    data.session.user.id
  )
}
      })

    const {

      data: authListener,

    } = supabase.auth.onAuthStateChange(

      (
  _event,
  session
) => {

  setSession(session)

  if (session?.user) {

    fetchProfile(
      session.user.id
    )
  }
}
    )

    return () => {

      authListener.subscription.unsubscribe()
    }

  }, [])

  // NOT LOGGED IN

  if (!session) {

    return <AuthPage />
  }

  // LOGGED IN

  return (

    <BrowserRouter>

      <div className="
        flex
        min-h-screen
        bg-[#020617]
        text-white
      ">

        {/* Sidebar */}

        <Sidebar />

        {/* Main Content */}

        <main className="
          flex-1
          p-8
          overflow-y-auto
        ">

          <Routes>

        <Route
  path="/"

  element={

    profile?.role === "admin"

      ? <AdminDashboard />

      : profile?.role === "college_coordinator"

      ? <PresidentDashboard />

      : <WarriorDashboard />
  }
/>

  <Route
    path="/activities"
    element={<TasksPage />}
  />

  <Route
  path="/team-management"
  element={<TeamsPage profile={profile} />}
/>

  <Route
    path="/analytics"
    element={<AnalyticsPage />}
  />

  <Route
    path="/reports"
    element={<ReportsPage />}
  />

  <Route
    path="/settings"
    element={<SettingsPage />}
  />

  <Route
    path="*"
    element={<Navigate to="/" />}
  />

<Route
  path="/admin"

  element={

    profile?.role === "admin"

      ? <AdminPage />

      : <Navigate to="/" />
  }
/>
<Route
  path="/college-management"
  element={<CollegeManagementPage />}
/>
</Routes>
        </main>

      </div>

    </BrowserRouter>
  )
}

export default App