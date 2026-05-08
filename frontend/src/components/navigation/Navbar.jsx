import {
  Bell,
  Search,
} from "lucide-react"

import { motion } from "framer-motion"

function Navbar() {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="
        flex
        items-center
        justify-between
        mb-10
      "
    >

      <div>

        <h1 className="text-2xl font-bold text-white">
          Welcome Back 👋
        </h1>

        <p className="text-gray-400 mt-1">
          Monitor activities and AI insights.
        </p>

      </div>

      <div className="flex items-center gap-5">

        <div className="
          flex
          items-center
          gap-3
          bg-[#111827]
          border
          border-red-500/10
          px-4
          py-3
          rounded-2xl
          w-80
        ">

          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Search activities..."
            className="
              bg-transparent
              outline-none
              text-white
              placeholder:text-gray-500
              w-full
            "
          />

        </div>

        <motion.div
          whileHover={{
            scale: 1.08,
          }}
          className="
            w-14
            h-14
            rounded-2xl
            bg-[#111827]
            border
            border-red-500/10
            flex
            items-center
            justify-center
            cursor-pointer
          "
        >

          <Bell
            className="text-red-500"
          />

        </motion.div>

        <motion.div
          whileHover={{
            scale: 1.05,
          }}
          className="
            flex
            items-center
            gap-3
            bg-[#111827]
            border
            border-red-500/10
            px-4
            py-3
            rounded-2xl
            cursor-pointer
          "
        >

          <div className="
            w-10
            h-10
            rounded-full
            bg-red-500
          " />

          <div>

            <h3 className="text-white font-semibold">
              Admin User
            </h3>

            <p className="text-gray-400 text-sm">
              MCA Department
            </p>

          </div>

        </motion.div>

      </div>

    </motion.div>
  )
}

export default Navbar