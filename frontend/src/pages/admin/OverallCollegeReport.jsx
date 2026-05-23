import { useMemo } from "react";

const OverallCollegeReport = () => {

  // AUTO WEEK GENERATOR

  const generateWeeks = () => {

    const startDate = new Date("2025-01-06"); // First Monday

    const today = new Date();

    const allWeeks = [];

    let weekNumber = 1;

    // GENERATE ALL WEEKS

    while (startDate <= today) {

      allWeeks.push({

        week: `Week ${weekNumber}`,

        trainings: Math.floor(Math.random() * 5),

        started: Math.floor(Math.random() * 5),

        completedProject: Math.floor(Math.random() * 15),

        presentations: Math.floor(Math.random() * 600),

        students: Math.floor(Math.random() * 120000),

        massActivities: Math.floor(Math.random() * 20),

        massOutreach: Math.floor(Math.random() * 15000),

        impactActivities: Math.floor(Math.random() * 800),

        impactOutreach: Math.floor(Math.random() * 20000),

        frameChallenges: Math.floor(Math.random() * 10),

        promotion: Math.floor(Math.random() * 3000),

        printMedia: Math.floor(Math.random() * 300),

        antifraud: Math.floor(Math.random() * 60000),

      });

      startDate.setDate(startDate.getDate() + 7);

      weekNumber++;
    }

    // SHOW ONLY FIRST 16 WEEKS

    return allWeeks.slice(0, 16);
  };

  const overallData = useMemo(() => generateWeeks(), []);

  return (

    <div className="bg-[#111827] rounded-2xl border border-pink-500 overflow-hidden mt-10">

      {/* HEADER */}

      <div className="p-6 border-b border-gray-800">

        <h2 className="text-3xl font-black text-white">
          Overall Colleges Weekly Report
        </h2>

        <p className="text-gray-400 mt-2">
          Combined analytics of all colleges
        </p>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full text-white border-collapse">

          <thead className="bg-[#13293D] text-[#5DA9E9]">

            <tr>

              <th className="p-4 border border-[#1E3A5F]">
                Particulars
              </th>

              {overallData.map((week, index) => (

                <th
                  key={index}
                  className="p-4 border border-[#1E3A5F] min-w-[180px]"
                >
                  {week.week}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            <ReportRow
              title="No. of Colleges Completed Trainings"
              keyName="trainings"
              overallData={overallData}
            />

            <ReportRow
              title="No. of Colleges Started Project"
              keyName="started"
              overallData={overallData}
            />

            <ReportRow
              title="No. of Colleges Completed Project"
              keyName="completedProject"
              overallData={overallData}
            />

            <ReportRow
              title="No. of Presentations"
              keyName="presentations"
              overallData={overallData}
            />

            <ReportRow
              title="Student Sensitized"
              keyName="students"
              overallData={overallData}
            />

            <ReportRow
              title="Mass Activities"
              keyName="massActivities"
              overallData={overallData}
            />

            <ReportRow
              title="Mass Outreach"
              keyName="massOutreach"
              overallData={overallData}
            />

            <ReportRow
              title="Impact Activities"
              keyName="impactActivities"
              overallData={overallData}
            />

            <ReportRow
              title="Impact Outreach"
              keyName="impactOutreach"
              overallData={overallData}
            />

            <ReportRow
              title="Frame Challenges"
              keyName="frameChallenges"
              overallData={overallData}
            />

            <ReportRow
              title="#Promotion"
              keyName="promotion"
              overallData={overallData}
            />

            <ReportRow
              title="Print Media Coverage"
              keyName="printMedia"
              overallData={overallData}
            />

            <ReportRow
              title="Antifraud Activation"
              keyName="antifraud"
              overallData={overallData}
            />

          </tbody>

        </table>

      </div>

    </div>
  );
};

// ROW COMPONENT

const ReportRow = ({
  title,
  keyName,
  overallData,
}) => {

  return (

    <tr className="border-b border-[#1E3A5F] hover:bg-[#102840]">

      <td className="p-4 font-semibold text-white border border-[#1E3A5F]">

        {title}

      </td>

      {overallData.map((week, index) => (

        <td
          key={index}
          className="p-4 text-center text-cyan-400 border border-[#1E3A5F]"
        >

          {week[keyName]?.toLocaleString()}

        </td>

      ))}

    </tr>
  );
};

export default OverallCollegeReport;