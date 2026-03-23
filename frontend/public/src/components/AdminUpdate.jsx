// AdminUpdate.jsx - Simple form without react-hook-form (Test button removed)
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

  // Fetch all problems on component mount
  useEffect(() => {
    fetchAllProblems();
  }, []);

  const fetchAllProblems = async () => {
    try {
      setFetchingProblems(true);
      const response = await axiosClient.get("/problem/getAllProblem");
      console.log("Fetched problems:", response.data);
      setProblems(response.data);
    } catch (err) {
      console.error("Error fetching problems:", err);
      alert(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setFetchingProblems(false);
    }
  };

  // Fetch and load problem data when selected problem changes
  const handleProblemSelect = async (problemId) => {
    if (!problemId) return;
    
    try {
      setLoading(true);
      console.log("Fetching problem with ID:", problemId);
      const response = await axiosClient.get(`/problem/problemById/${problemId}`);
      const problem = response.data;
      console.log("Fetched problem data:", problem);
      
      // Update form data with fetched problem
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle visible test cases
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

  // Handle hidden test cases
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

  // Handle start code changes
  const updateStartCode = (index, value) => {
    const updated = [...formData.startCode];
    updated[index].initialCode = value;
    setFormData(prev => ({
      ...prev,
      startCode: updated
    }));
  };

  // Handle reference solution changes
  const updateReferenceSolution = (index, value) => {
    const updated = [...formData.referenceSolution];
    updated[index].completeCode = value;
    setFormData(prev => ({
      ...prev,
      referenceSolution: updated
    }));
  };

  // Validate form before submission
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
        alert(`Visible test case ${i + 1}: All fields (input, output, explanation) are required`);
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
    for (let i = 0; i < formData.startCode.length; i++) {
      if (!formData.startCode[i].initialCode.trim()) {
        alert(`${formData.startCode[i].language} initial code is required`);
        return false;
      }
    }
    for (let i = 0; i < formData.referenceSolution.length; i++) {
      if (!formData.referenceSolution[i].completeCode.trim()) {
        alert(`${formData.referenceSolution[i].language} reference solution is required`);
        return false;
      }
    }
    return true;
  };

  // Submit form
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    
    if (!selectedProblemId) {
      alert("Please select a problem to update");
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      console.log("Making PUT request to:", `/problem/update/${selectedProblemId}`);
      console.log("Request data:", formData);
      
      const response = await axiosClient.put(`/problem/update/${selectedProblemId}`, formData);
      
      console.log("Update response:", response);
      alert("Problem updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error updating problem:", err);
      console.error("Error response:", err.response);
      alert(err.response?.data?.message || err.response?.data || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-400">
          Admin — Update Problem
        </h1>

        {/* Problem Selection Dropdown */}
        <div className="mb-8 bg-[#111827] p-6 rounded-2xl border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Select Problem to Update</h2>
          
          {fetchingProblems ? (
            <div className="text-center py-4">Loading problems...</div>
          ) : problems.length === 0 ? (
            <div className="text-center py-4 text-red-400">
              No problems found. Create a problem first.
            </div>
          ) : (
            <select
              value={selectedProblemId}
              onChange={(e) => handleProblemSelect(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
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
          <form onSubmit={onSubmit} className="space-y-8">
            {loading ? (
              <div className="text-center py-10">Loading problem data...</div>
            ) : (
              <>
                {/* Basic Information Section */}
                <section className="bg-[#111827] p-6 rounded-2xl border border-gray-700 shadow-xl">
                  <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
                      />
                    </div>

                    <div>
                      <label className="text-sm">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="text-sm">Difficulty</label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div className="w-1/2">
                        <label className="text-sm">Tag</label>
                        <select
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
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
                <section className="bg-[#111827] p-6 rounded-2xl border border-gray-700 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Visible Test Cases</h2>
                    <button
                      type="button"
                      onClick={addVisibleTestCase}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-4 mt-4">
                    {formData.visibleTestCases.length === 0 && (
                      <div className="text-center py-4 text-yellow-400">
                        No visible test cases. Please add at least one.
                      </div>
                    )}
                    {formData.visibleTestCases.map((testCase, i) => (
                      <div key={i} className="p-4 bg-[#0d1628] rounded-xl border border-gray-600">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeVisibleTestCase(i)}
                            className="text-red-400"
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          value={testCase.input}
                          onChange={(e) => updateVisibleTestCase(i, "input", e.target.value)}
                          placeholder="Input"
                          className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600"
                        />

                        <input
                          value={testCase.output}
                          onChange={(e) => updateVisibleTestCase(i, "output", e.target.value)}
                          placeholder="Output"
                          className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600"
                        />

                        <textarea
                          value={testCase.explanation}
                          onChange={(e) => updateVisibleTestCase(i, "explanation", e.target.value)}
                          placeholder="Explanation"
                          className="w-full p-2 rounded bg-[#1a2336] border border-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Hidden Test Cases */}
                <section className="bg-[#111827] p-6 rounded-2xl border border-gray-700 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Hidden Test Cases</h2>
                    <button
                      type="button"
                      onClick={addHiddenTestCase}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-4 mt-4">
                    {formData.hiddenTestCases.length === 0 && (
                      <div className="text-center py-4 text-yellow-400">
                        No hidden test cases. Please add at least one.
                      </div>
                    )}
                    {formData.hiddenTestCases.map((testCase, i) => (
                      <div key={i} className="p-4 bg-[#0d1628] rounded-xl border border-gray-600">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeHiddenTestCase(i)}
                            className="text-red-400"
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          value={testCase.input}
                          onChange={(e) => updateHiddenTestCase(i, "input", e.target.value)}
                          placeholder="Input"
                          className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600"
                        />

                        <input
                          value={testCase.output}
                          onChange={(e) => updateHiddenTestCase(i, "output", e.target.value)}
                          placeholder="Output"
                          className="w-full p-2 rounded bg-[#1a2336] border border-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Code Templates */}
                <section className="bg-[#111827] p-6 rounded-2xl border border-gray-700 shadow-xl">
                  <h2 className="text-2xl font-semibold mb-4">Code Templates</h2>

                  {[0, 1, 2].map((i) => (
                    <div key={i} className="mb-6">
                      <h3 className="text-xl font-medium mb-2">
                        {i === 0 ? "C++" : i === 1 ? "Java" : "JavaScript"}
                      </h3>

                      <textarea
                        value={formData.startCode[i]?.initialCode || ""}
                        onChange={(e) => updateStartCode(i, e.target.value)}
                        rows={5}
                        className="w-full p-3 rounded bg-[#0d1628] border border-gray-600 font-mono mb-2"
                        placeholder="Initial Code"
                      />

                      <textarea
                        value={formData.referenceSolution[i]?.completeCode || ""}
                        onChange={(e) => updateReferenceSolution(i, e.target.value)}
                        rows={5}
                        className="w-full p-3 rounded bg-[#0d1628] border border-gray-600 font-mono"
                        placeholder="Reference Solution"
                      />
                    </div>
                  ))}
                </section>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Updating..." : "Update Problem"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}