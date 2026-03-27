import { useState, useEffect } from "react";
import axiosClient from "../utility/axiosClient";
import { useNavigate } from "react-router";

export default function AdminUpdate() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProblems, setFetchingProblems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    tags: "array",
    visibleTestCases: [],
    hiddenTestCases: [],
    startCode: [
      { language: "C++", initialCode: "" },
      { language: "Java", initialCode: "" },
      { language: "JavaScript", initialCode: "" },
    ],
    referenceSolution: [
      { language: "C++", completeCode: "" },
      { language: "Java", completeCode: "" },
      { language: "JavaScript", completeCode: "" },
    ],
  });

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'visible', label: 'Visible Tests', icon: '👁️' },
    { id: 'hidden', label: 'Hidden Tests', icon: '🔒' },
    { id: 'code', label: 'Code Templates', icon: '💻' }
  ];

  useEffect(() => {
    fetchAllProblems();
  }, []);

  const fetchAllProblems = async () => {
    try {
      setFetchingProblems(true);
      const response = await axiosClient.get("/problem/getAllProblem");
      setProblems(response.data);
    } catch (err) {
      console.error("Error fetching problems:", err);
      alert(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setFetchingProblems(false);
    }
  };

  const handleProblemSelect = async (problemId) => {
    if (!problemId) return;
    
    try {
      setLoading(true);
      const response = await axiosClient.get(`/problem/problemById/${problemId}`);
      const problem = response.data;
      
      setFormData({
        title: problem.title || "",
        description: problem.description || "",
        difficulty: problem.difficulty || "easy",
        tags: problem.tags || "array",
        visibleTestCases: problem.visibleTestCases || [],
        hiddenTestCases: problem.hiddenTestCases || [],
        startCode: problem.startCode || [
          { language: "C++", initialCode: "" },
          { language: "Java", initialCode: "" },
          { language: "JavaScript", initialCode: "" },
        ],
        referenceSolution: problem.referenceSolution || [
          { language: "C++", completeCode: "" },
          { language: "Java", completeCode: "" },
          { language: "JavaScript", completeCode: "" },
        ],
      });
      
      setSelectedProblemId(problemId);
    } catch (err) {
      console.error("Error fetching problem:", err);
      alert(err.response?.data?.message || "Failed to fetch problem details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addVisibleTestCase = () => {
    setFormData(prev => ({
      ...prev,
      visibleTestCases: [...prev.visibleTestCases, { input: "", output: "", explanation: "" }]
    }));
  };

  const updateVisibleTestCase = (index, field, value) => {
    const updated = [...formData.visibleTestCases];
    updated[index][field] = value;
    setFormData(prev => ({
      ...prev,
      visibleTestCases: updated
    }));
  };

  const removeVisibleTestCase = (index) => {
    const updated = formData.visibleTestCases.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      visibleTestCases: updated
    }));
  };

  const addHiddenTestCase = () => {
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: [...prev.hiddenTestCases, { input: "", output: "" }]
    }));
  };

  const updateHiddenTestCase = (index, field, value) => {
    const updated = [...formData.hiddenTestCases];
    updated[index][field] = value;
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: updated
    }));
  };

  const removeHiddenTestCase = (index) => {
    const updated = formData.hiddenTestCases.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      hiddenTestCases: updated
    }));
  };

  const updateStartCode = (index, value) => {
    const updated = [...formData.startCode];
    updated[index].initialCode = value;
    setFormData(prev => ({
      ...prev,
      startCode: updated
    }));
  };

  const updateReferenceSolution = (index, value) => {
    const updated = [...formData.referenceSolution];
    updated[index].completeCode = value;
    setFormData(prev => ({
      ...prev,
      referenceSolution: updated
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert("Title is required");
      return false;
    }
    if (!formData.description.trim()) {
      alert("Description is required");
      return false;
    }
    if (formData.visibleTestCases.length === 0) {
      alert("At least one visible test case is required");
      return false;
    }
    for (let i = 0; i < formData.visibleTestCases.length; i++) {
      const tc = formData.visibleTestCases[i];
      if (!tc.input.trim() || !tc.output.trim() || !tc.explanation.trim()) {
        alert(`Visible test case ${i + 1}: All fields are required`);
        return false;
      }
    }
    if (formData.hiddenTestCases.length === 0) {
      alert("At least one hidden test case is required");
      return false;
    }
    for (let i = 0; i < formData.hiddenTestCases.length; i++) {
      const tc = formData.hiddenTestCases[i];
      if (!tc.input.trim() || !tc.output.trim()) {
        alert(`Hidden test case ${i + 1}: Both input and output are required`);
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProblemId) {
      alert("Please select a problem to update");
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      await axiosClient.put(`/problem/update/${selectedProblemId}`, formData);
      alert("Problem updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error updating problem:", err);
      alert(err.response?.data?.message || err.response?.data || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200 px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-10 text-blue-400">
          Admin — Update Problem
        </h1>

        {/* Problem Selection */}
        <div className="mb-6 sm:mb-8 bg-[#111827] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Select Problem to Update</h2>
          
          {fetchingProblems ? (
            <div className="text-center py-4 text-gray-400">Loading problems...</div>
          ) : problems.length === 0 ? (
            <div className="text-center py-4 text-red-400">
              No problems found. Create a problem first.
            </div>
          ) : (
            <select
              value={selectedProblemId}
              onChange={(e) => handleProblemSelect(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200 text-sm sm:text-base"
            >
              <option value="">Select a problem...</option>
              {problems.map((problem) => (
                <option key={problem._id} value={problem._id}>
                  {problem.title} - {problem.difficulty}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Update Form */}
        {selectedProblemId && (
          <>
            {/* Mobile Section Navigation */}
            <div className="sm:hidden flex overflow-x-auto mb-4 gap-2 pb-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#111827] text-gray-400'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
              {loading ? (
                <div className="text-center py-10 text-gray-400">Loading problem data...</div>
              ) : (
                <>
                  {/* Basic Information */}
                  <section className={`bg-[#111827] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl ${activeSection !== 'basic' && 'sm:block hidden'}`}>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">Basic Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm block mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="text-sm block mb-2">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200 text-sm sm:text-base"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/2">
                          <label className="text-sm block mb-2">Difficulty</label>
                          <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200 text-sm"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        <div className="w-full sm:w-1/2">
                          <label className="text-sm block mb-2">Tag</label>
                          <select
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200 text-sm"
                          >
                            <option value="array">Array</option>
                            <option value="linkedlist">Linked List</option>
                            <option value="graph">Graph</option>
                            <option value="dp">DP</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Visible Test Cases */}
                  <section className={`bg-[#111827] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl ${activeSection !== 'visible' && 'sm:block hidden'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <h2 className="text-xl sm:text-2xl font-semibold">Visible Test Cases</h2>
                      <button
                        type="button"
                        onClick={addVisibleTestCase}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        + Add Test Case
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.visibleTestCases.length === 0 && (
                        <div className="text-center py-8 text-yellow-400 text-sm">
                          No visible test cases. Click "Add Test Case" to create one.
                        </div>
                      )}
                      {formData.visibleTestCases.map((testCase, i) => (
                        <div key={i} className="p-4 bg-[#0d1628] rounded-xl border border-gray-600">
                          <div className="flex justify-end mb-3">
                            <button
                              type="button"
                              onClick={() => removeVisibleTestCase(i)}
                              className="text-red-400 text-sm"
                            >
                              Remove
                            </button>
                          </div>

                          <input
                            value={testCase.input}
                            onChange={(e) => updateVisibleTestCase(i, "input", e.target.value)}
                            placeholder="Input"
                            className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600 text-sm"
                          />

                          <input
                            value={testCase.output}
                            onChange={(e) => updateVisibleTestCase(i, "output", e.target.value)}
                            placeholder="Output"
                            className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600 text-sm"
                          />

                          <textarea
                            value={testCase.explanation}
                            onChange={(e) => updateVisibleTestCase(i, "explanation", e.target.value)}
                            placeholder="Explanation"
                            rows={2}
                            className="w-full p-2 rounded bg-[#1a2336] border border-gray-600 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Hidden Test Cases */}
                  <section className={`bg-[#111827] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl ${activeSection !== 'hidden' && 'sm:block hidden'}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <h2 className="text-xl sm:text-2xl font-semibold">Hidden Test Cases</h2>
                      <button
                        type="button"
                        onClick={addHiddenTestCase}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm w-full sm:w-auto"
                      >
                        + Add Hidden Test
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.hiddenTestCases.length === 0 && (
                        <div className="text-center py-8 text-yellow-400 text-sm">
                          No hidden test cases. Click "Add Hidden Test" to create one.
                        </div>
                      )}
                      {formData.hiddenTestCases.map((testCase, i) => (
                        <div key={i} className="p-4 bg-[#0d1628] rounded-xl border border-gray-600">
                          <div className="flex justify-end mb-3">
                            <button
                              type="button"
                              onClick={() => removeHiddenTestCase(i)}
                              className="text-red-400 text-sm"
                            >
                              Remove
                            </button>
                          </div>

                          <input
                            value={testCase.input}
                            onChange={(e) => updateHiddenTestCase(i, "input", e.target.value)}
                            placeholder="Input"
                            className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600 text-sm"
                          />

                          <input
                            value={testCase.output}
                            onChange={(e) => updateHiddenTestCase(i, "output", e.target.value)}
                            placeholder="Output"
                            className="w-full p-2 rounded bg-[#1a2336] border border-gray-600 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Code Templates */}
                  <section className={`bg-[#111827] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl ${activeSection !== 'code' && 'sm:block hidden'}`}>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">Code Templates</h2>

                    <div className="space-y-6">
                      {[
                        { name: "C++", index: 0 },
                        { name: "Java", index: 1 },
                        { name: "JavaScript", index: 2 }
                      ].map((lang) => (
                        <div key={lang.index} className="border-t border-gray-700 pt-4 first:border-t-0 first:pt-0">
                          <h3 className="text-lg font-medium mb-2">{lang.name}</h3>

                          <div className="mb-3">
                            <label className="text-sm text-gray-400 block mb-1">Initial Code Template</label>
                            <textarea
                              value={formData.startCode[lang.index]?.initialCode || ""}
                              onChange={(e) => updateStartCode(lang.index, e.target.value)}
                              rows={4}
                              className="w-full p-3 rounded bg-[#0d1628] border border-gray-600 font-mono text-xs sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-sm text-gray-400 block mb-1">Reference Solution</label>
                            <textarea
                              value={formData.referenceSolution[lang.index]?.completeCode || ""}
                              onChange={(e) => updateReferenceSolution(lang.index, e.target.value)}
                              rows={4}
                              className="w-full p-3 rounded bg-[#0d1628] border border-gray-600 font-mono text-xs sm:text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? "Updating..." : "Update Problem"}
                  </button>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}