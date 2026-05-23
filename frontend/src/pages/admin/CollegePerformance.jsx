import { useMemo } from "react";

const CollegePerformance = ({ college }) => {

  const generateWeeks = () => {

    const weeks = [];

    for (let i = 1; i <= 10; i++) {
      weeks.push(`Week ${i}`);
    }

    return weeks;
  };

  const allWeeks = useMemo(() => generateWeeks(), []);

  return (
    <div className="space-y-8">

      <div className="bg-[#111827] rounded-2xl border border-pink-500 overflow-hidden">

        <div className="p-6 border-b border-gray-800">

          <h2 className="text-2xl font-bold text-white">
            Execution Plan Overview
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-white border-collapse">

            <thead>

              <tr className="bg-[#13293D] text-[#5DA9E9] uppercase text-sm">

                <th className="p-4 text-left">
                  Week
                </th>

                <th colSpan={3} className="p-4">
                  Presentations
                </th>

                <th colSpan={3} className="p-4">
                  Students Sensitized
                </th>

                <th colSpan={3} className="p-4">
                  Impact Activities
                </th>

                <th colSpan={3} className="p-4">
                  Impact Outreach
                </th>

              </tr>

              <tr className="bg-[#13293D] text-[#5DA9E9] uppercase text-xs">

                <th></th>

                <th>Target</th>
                <th>Done</th>
                <th>+/-</th>

                <th>Target</th>
                <th>Done</th>
                <th>+/-</th>

                <th>Target</th>
                <th>Done</th>
                <th>+/-</th>

                <th>Target</th>
                <th>Done</th>
                <th>+/-</th>

              </tr>

            </thead>

            <tbody>

              {allWeeks.map((week, index) => {

                const weekly =
                  college.weeklyData[index] || {
                    target: 0,
                    completed: 0,
                    students: 0,
                    outreach: 0,
                    impactTarget: 0,
                    impactDone: 0,
                  };

                const pptDiff =
                  weekly.completed - weekly.target;

                return (

                  <tr
                    key={index}
                    className="border-b border-[#1E3A5F]"
                  >

                    <td className="p-4 font-bold">
                      {week}
                    </td>

                    <td className="p-4 text-center">
                      {weekly.target}
                    </td>

                    <td className="p-4 text-center">
                      {weekly.completed}
                    </td>

                    <td
                      className={`p-4 text-center font-bold ${
                        pptDiff >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {pptDiff > 0 ? "+" : ""}
                      {pptDiff}
                    </td>

                    <td className="p-4 text-center">
                      {(weekly.target * 100).toLocaleString()}
                    </td>

                    <td className="p-4 text-center">
                      {weekly.students.toLocaleString()}
                    </td>

                    <td className="p-4 text-center">
                      {(
                        weekly.students -
                        weekly.target * 100
                      ).toLocaleString()}
                    </td>

                    <td className="p-4 text-center">
                      {weekly.impactTarget}
                    </td>

                    <td className="p-4 text-center">
                      {weekly.impactDone}
                    </td>

                    <td className="p-4 text-center">
                      {weekly.impactDone -
                        weekly.impactTarget}
                    </td>

                    <td className="p-4 text-center">
                      {(weekly.target * 20).toLocaleString()}
                    </td>

                    <td className="p-4 text-center">
                      {weekly.outreach.toLocaleString()}
                    </td>

                    <td className="p-4 text-center">
                      {(
                        weekly.outreach -
                        weekly.target * 20
                      ).toLocaleString()}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default CollegePerformance;