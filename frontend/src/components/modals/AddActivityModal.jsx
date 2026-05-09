import { useEffect, useState } from "react"

import { supabase } from "../../lib/supabase"

import { motion } from "framer-motion"

import {
  X,
  CalendarDays,
  MapPin,
  Users,
  FileText,
} from "lucide-react"

function AddActivityModal({
  isOpen,
  onClose,
  onCreateActivity,
  editingActivity,
}) {

const [formData, setFormData] = useState({

  id: "",

  title: "",

  date: "",

  participants: "",

  location: "",

  description: "",

  priority: "medium",

  deadline: "",

  assigned_to: "",
})

const [users, setUsers] =
  useState([])

  // PREFILL FORM WHEN EDITING

  useEffect(() => {

    if (editingActivity) {

      setFormData({
        id: editingActivity.id || "",

        title:
          editingActivity.title || "",

        date:
          editingActivity.activity_date || "",

        participants:
          editingActivity.audience_count || "",

        location:
          editingActivity.venue || "",

        description:
          editingActivity.description || "",

        priority:
          editingActivity.priority || "medium",

        deadline:
          editingActivity.deadline || "",  

        assigned_to:
          editingActivity.assigned_to || "",  
      })

    } else {

      setFormData({
        id: "",

        title: "",

        date: "",

       participants: "",

        location: "",

        description: "",

        priority: "medium",

        deadline: "",

        assigned_to: "",
      })
    }

  }, [editingActivity, isOpen])

  useEffect(() => {

  const fetchUsers =
    async () => {

const {
  data: {
    user
  }
} = await supabase.auth.getUser()

if (!user) return

const {
  data: currentProfile
} = await supabase

  .from("profiles")

  .select("*")

  .eq("id", user.id)

  .single()


const {
  data
} = await supabase

  .from("profiles")

  .select("*")

  .eq(
    "role",
    "warrior"
  )

      if (data) {

        setUsers(data)
      }
    }

  fetchUsers()

}, [])

  if (!isOpen) return null

  // HANDLE INPUT

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // HANDLE SUBMIT

  const handleSubmit = () => {

    if (
      !formData.title ||
      !formData.date ||
      !formData.location
    ) {

      alert(
        "Please fill all required fields"
      )

      return
    }

const activityData = {

  ...formData,

  assigned_user_name:

    users.find(
      (u) =>
        u.id ===
        formData.assigned_to
    )?.full_name || "",

  category: "Technical",

  status: "planned",
}

    // SEND DATA TO PARENT

    onCreateActivity(activityData)
  }

  return (

    <div className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/60
      backdrop-blur-md
    ">

      <motion.div

        initial={{
          opacity: 0,
          scale: 0.8,
          y: 50,
        }}

        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}

        transition={{
          duration: 0.3,
        }}

className="
  relative
  w-full
  max-w-3xl
  max-h-[90vh]
  overflow-y-auto
  overflow-x-hidden
  custom-scrollbar
  scrollbar-thin
  scrollbar-thumb-red-500/20
  scrollbar-track-transparent
  rounded-3xl
  border
  border-white/10
  bg-gradient-to-br
  from-[#111827]
  to-[#1e293b]
  p-8
  shadow-2xl
"
      >

        {/* Glow */}

        <div className="
          absolute
          top-0
          right-0
          w-72
          h-72
          bg-red-500/10
          blur-3xl
          rounded-full
        " />

        {/* Header */}

        <div className="
          relative
          z-10
          flex
          items-center
          justify-between
          mb-8
        ">

          <div>

            <h2 className="
              text-4xl
              font-black
              text-white
              mb-2
            ">

              {editingActivity
                ? "Edit Activity"
                : "Add Activity"}

            </h2>

            <p className="text-gray-400">

              {editingActivity
                ? "Update your activity details."
                : "Create and manage new campus events."}

            </p>

          </div>

          <button
            onClick={onClose}
            className="
              w-12
              h-12
              rounded-2xl
              bg-white/5
              border
              border-white/10
              flex
              items-center
              justify-center
              text-gray-400
              hover:text-white
              transition
            "
          >
            <X />
          </button>

        </div>

        {/* Form */}

        <div className="
          relative
          z-10
          grid
          grid-cols-2
          gap-6
        ">

          {/* Activity Name */}

          <div className="col-span-2">

            <label className="
              block
              text-gray-300
              mb-3
            ">
              Activity Name
            </label>

            <div className="
              flex
              items-center
              gap-3
              bg-black/20
              border
              border-white/10
              rounded-2xl
              px-5
              py-4
            ">

              <FileText className="text-red-400" />

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter activity name..."
                className="
                  bg-transparent
                  outline-none
                  text-white
                  w-full
                "
              />

            </div>

          </div>

          {/* Date */}

          <div>

            <label className="
              block
              text-gray-300
              mb-3
            ">
              Event Date
            </label>

            <div className="
              flex
              items-center
              gap-3
              bg-black/20
              border
              border-white/10
              rounded-2xl
              px-5
              py-4
            ">

              <CalendarDays className="text-red-400" />

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="
                  bg-transparent
                  outline-none
                  text-white
                  w-full
                "
              />

            </div>

          </div>

          {/* Participants */}

          <div>

            <label className="
              block
              text-gray-300
              mb-3
            ">
              Participants
            </label>

            <div className="
              flex
              items-center
              gap-3
              bg-black/20
              border
              border-white/10
              rounded-2xl
              px-5
              py-4
            ">

              <Users className="text-red-400" />

              <input
                type="number"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                placeholder="No. of participants"
                className="
                  bg-transparent
                  outline-none
                  text-white
                  w-full
                "
              />

            </div>

          </div>

{/* Priority */}

<div>

  <label className="
    block
    text-gray-300
    mb-3
  ">
    Priority
  </label>

  <select

    name="priority"

    value={formData.priority}

    onChange={handleChange}

    className="
      w-full
      bg-black/20
      border
      border-white/10
      rounded-2xl
      px-5
      py-4
      text-white
      outline-none
    "
  >

    <option value="low">
      Low
    </option>

    <option value="medium">
      Medium
    </option>

    <option value="high">
      High
    </option>

  </select>

</div>

{/* Deadline */}

<div>

  <label className="
    block
    text-gray-300
    mb-3
  ">
    Deadline
  </label>

  <input

    type="datetime-local"

    name="deadline"

    value={formData.deadline}

    onChange={handleChange}

    className="
      w-full
      bg-black/20
      border
      border-white/10
      rounded-2xl
      px-5
      py-4
      text-white
      outline-none
    "
  />

</div>

{/* Assign Warrior */}

<div className="col-span-2">

  <label className="
    block
    text-gray-300
    mb-3
  ">
    Assign Warrior
  </label>

  <select

    name="assigned_to"

    value={formData.assigned_to}

    onChange={handleChange}

    className="
      w-full
      bg-black/20
      border
      border-white/10
      rounded-2xl
      px-5
      py-4
      text-white
      appearance-none
      outline-none
    "
  >

    <option
  value=""
  className="
    bg-[#111827]
    text-white
  "
>
      Select Warrior
    </option>

{
  users

    .filter((user) =>
      user.role === "warrior"
    )

    .map((user) => (

        <option
          key={user.id}
          value={user.id}

          className="
          bg-[#111827]
          text-white"
        >

          {user.full_name}
          {" "}
          (
          {user.role}
          )

        </option>
      ))
    }

  </select>

</div>

          {/* Location */}

          <div className="col-span-2">

            <label className="
              block
              text-gray-300
              mb-3
            ">
              Location
            </label>

            <div className="
              flex
              items-center
              gap-3
              bg-black/20
              border
              border-white/10
              rounded-2xl
              px-5
              py-4
            ">

              <MapPin className="text-red-400" />

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location..."
                className="
                  bg-transparent
                  outline-none
                  text-white
                  w-full
                "
              />

            </div>

          </div>

          {/* Description */}

          <div className="col-span-2">

            <label className="
              block
              text-gray-300
              mb-3
            ">
              Description
            </label>

            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the activity..."
              className="
                w-full
                bg-black/20
                border
                border-white/10
                rounded-2xl
                px-5
                py-4
                text-white
                outline-none
                resize-none
              "
            />

          </div>

        </div>

        {/* Footer */}

        <div className="
          relative
          z-10
          flex
          justify-end
          gap-4
          mt-10
        ">

          <button
            onClick={onClose}
            className="
              px-6
              py-4
              rounded-2xl
              border
              border-white/10
              text-gray-300
              hover:bg-white/5
              transition
            "
          >
            Cancel
          </button>

          <motion.button

            whileHover={{
              scale: 1.05,
            }}

            whileTap={{
              scale: 0.95,
            }}

            onClick={handleSubmit}

            className="
              px-8
              py-4
              rounded-2xl
              bg-gradient-to-r
              from-red-500
              to-pink-500
              text-white
              font-semibold
              shadow-lg
              shadow-red-500/20
            "
          >

            {editingActivity
              ? "Update Activity"
              : "Create Activity"}

          </motion.button>

        </div>

      </motion.div>

    </div>
  )
}

export default AddActivityModal