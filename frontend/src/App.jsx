import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import { useEffect, useState } from "react"

import { supabase } from "./lib/supabase"

import DashboardPage from "./pages/dashboard/DashboardPage"

import ActivitiesPage from "./pages/activities/ActivitiesPage"

import AuthPage from "./pages/auth/AuthPage"

import Sidebar from "./components/navigation/Sidebar"

import AnalyticsPage from "./pages/analytics/AnalyticsPage"

import ReportsPage from "./pages/reports/ReportsPage"

import SettingsPage from "./pages/settings/SettingsPage"

import AdminPage from "./pages/admin/AdminPage"

function App() {

  const [session, setSession] =
    useState(null)

  // CHECK SESSION

  useEffect(() => {

    supabase.auth
      .getSession()

      .then(({ data }) => {

        setSession(
          data.session
        )
      })

    const {

      data: authListener,

    } = supabase.auth.onAuthStateChange(

      (
        _event,
        session
      ) => {

        setSession(session)
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
    element={<DashboardPage />}
  />

  <Route
    path="/activities"
    element={<ActivitiesPage />}
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
    element={<AdminPage />}
/>

</Routes>
        </main>

      </div>

    </BrowserRouter>
  )
}

export default App