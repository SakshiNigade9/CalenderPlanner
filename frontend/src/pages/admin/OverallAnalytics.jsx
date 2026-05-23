import { colleges } from "../../data/collegeData";

const OverallAnalytics = () => {

  const totalColleges = colleges.length;

  const totalActivities = colleges.reduce(
    (sum, college) => sum + college.totalActivities,
    0
  );

  const totalReach = colleges.reduce(
    (sum, college) => sum + college.totalReach,
    0
  );

  const avgCompletion =
    colleges.reduce((sum, college) => sum + college.completion, 0) /
    colleges.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

      <div className="bg-[#111827] p-6 rounded-2xl border border-pink-500">
        <h3 className="text-gray-400">Total Colleges</h3>
        <h1 className="text-4xl font-bold text-white mt-2">
          {totalColleges}
        </h1>
      </div>

      <div className="bg-[#111827] p-6 rounded-2xl border border-pink-500">
        <h3 className="text-gray-400">Activities</h3>
        <h1 className="text-4xl font-bold text-white mt-2">
          {totalActivities}
        </h1>
      </div>

      <div className="bg-[#111827] p-6 rounded-2xl border border-pink-500">
        <h3 className="text-gray-400">Total Reach</h3>
        <h1 className="text-4xl font-bold text-white mt-2">
          {totalReach}
        </h1>
      </div>

      <div className="bg-[#111827] p-6 rounded-2xl border border-pink-500">
        <h3 className="text-gray-400">Completion %</h3>
        <h1 className="text-4xl font-bold text-white mt-2">
          {avgCompletion.toFixed(0)}%
        </h1>
      </div>

    </div>
  );
};

export default OverallAnalytics;