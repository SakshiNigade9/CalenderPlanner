const CollegeSelector = ({ selectedCollege, setSelectedCollege, colleges }) => {
  return (
    <div className="mb-6">
      <select
        value={selectedCollege}
        onChange={(e) => setSelectedCollege(e.target.value)}
        className="bg-[#111827] border border-pink-500 text-white px-4 py-2 rounded-lg"
      >
        <option value="All">All Colleges</option>

        {colleges.map((college) => (
          <option key={college.id} value={college.name}>
            {college.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CollegeSelector;