import { useState } from "react";

export default function CollegeManagementCard() {

  const [collegeName, setCollegeName] = useState("");

  const [teacherName, setTeacherName] = useState("");

  const [email, setEmail] = useState("");

  const [contact, setContact] = useState("");

  const [colleges, setColleges] = useState([]);

  const handleAddCollege = () => {

    if (
      !collegeName ||
      !teacherName ||
      !email ||
      !contact
    ) {
      alert("Please fill all fields");
      return;
    }

    const newCollege = {
      id: Date.now(),
      collegeName,
      teacherName,
      email,
      contact,
    };

    setColleges([...colleges, newCollege]);

    setCollegeName("");
    setTeacherName("");
    setEmail("");
    setContact("");
  };

  return (

    <div className="bg-[#111827] border border-pink-500 rounded-2xl p-6 mt-10">

      <div className="mb-6">

        <h2 className="text-3xl font-black text-white">
          College Management
        </h2>

        <p className="text-gray-400 mt-2">
          Add colleges and teacher coordinators
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <input
          type="text"
          placeholder="College Name"
          value={collegeName}
          onChange={(e) =>
            setCollegeName(e.target.value)
          }
          className="bg-[#0b1120] border border-pink-500/30 text-white rounded-xl px-4 py-3 outline-none"
        />

        <input
          type="text"
          placeholder="Teacher Coordinator"
          value={teacherName}
          onChange={(e) =>
            setTeacherName(e.target.value)
          }
          className="bg-[#0b1120] border border-pink-500/30 text-white rounded-xl px-4 py-3 outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="bg-[#0b1120] border border-pink-500/30 text-white rounded-xl px-4 py-3 outline-none"
        />

        <input
          type="text"
          placeholder="Contact Number"
          value={contact}
          onChange={(e) =>
            setContact(e.target.value)
          }
          className="bg-[#0b1120] border border-pink-500/30 text-white rounded-xl px-4 py-3 outline-none"
        />

      </div>

      <button
        onClick={handleAddCollege}
        className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-xl"
      >
        Add College
      </button>

      <div className="overflow-x-auto mt-10">

        <table className="w-full text-white">

          <thead className="bg-[#13293D] text-[#5DA9E9]">

            <tr>

              <th className="p-4 text-left">
                College
              </th>

              <th className="p-4 text-left">
                Teacher Coordinator
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Contact
              </th>

            </tr>

          </thead>

          <tbody>

            {colleges.map((college) => (

              <tr
                key={college.id}
                className="border-b border-[#1E3A5F] hover:bg-[#102840]"
              >

                <td className="p-4">
                  {college.collegeName}
                </td>

                <td className="p-4">
                  {college.teacherName}
                </td>

                <td className="p-4">
                  {college.email}
                </td>

                <td className="p-4">
                  {college.contact}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}