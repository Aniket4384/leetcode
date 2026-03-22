// AdminUpdate.jsx - Fixed version with debugging
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utility/axiosClient";
import { useNavigate } from "react-router";

const problemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.string().min(1),
  
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1),
        explanation: z.string().min(1),
      })
    )
    .min(1),

  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1),
        output: z.string().min(1),
      })
    )
    .min(1),

  startCode: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        initialCode: z.string().min(1),
      })
    )
    .length(3),

  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        completeCode: z.string().min(1),
      })
    )
    .length(3),
});

export default function AdminUpdate() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProblems, setFetchingProblems] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
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
      visibleTestCases: [],
      hiddenTestCases: [],
    },
  });

  const { 
    fields: visibleFields, 
    append: appendVisible, 
    remove: removeVisible 
  } = useFieldArray({ control, name: "visibleTestCases" });

  const { 
    fields: hiddenFields, 
    append: appendHidden, 
    remove: removeHidden 
  } = useFieldArray({ control, name: "hiddenTestCases" });

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
      
      // Format the data to match form structure
      const formattedData = {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        tags: problem.tags,
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
      };
      
      console.log("Formatted data for reset:", formattedData);
      reset(formattedData);
      setSelectedProblemId(problemId);
    } catch (err) {
      console.error("Error fetching problem:", err);
      alert(err.response?.data?.message || "Failed to fetch problem details");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    console.log("onSubmit called with data:", data);
    console.log("Selected Problem ID:", selectedProblemId);
    
    if (!selectedProblemId) {
      alert("Please select a problem to update");
      return;
    }

    try {
      console.log("Making PUT request to:", `/problem/update/${selectedProblemId}`);
      const response = await axiosClient.put(`/problem/update/${selectedProblemId}`, data);
      console.log("Update response:", response);
      console.log("Problem updated successfully!");
      alert("Problem updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error updating problem:", err);
      console.error("Error response:", err.response);
      alert(err.response?.data?.message || err.response?.data || "Something went wrong");
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

        {/* Update Form - Only show when a problem is selected */}
        {selectedProblemId && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                        {...register("title")}
                        className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
                      />
                      {errors.title && (
                        <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm">Description</label>
                      <textarea
                        {...register("description")}
                        rows={4}
                        className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
                      />
                      {errors.description && (
                        <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="text-sm">Difficulty</label>
                        <select
                          {...register("difficulty")}
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
                          {...register("tags")}
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
                      onClick={() => appendVisible({ input: "", output: "", explanation: "" })}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-4 mt-4">
                    {visibleFields.map((field, i) => (
                      <div
                        key={field.id}
                        className="p-4 bg-[#0d1628] rounded-xl border border-gray-600"
                      >
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeVisible(i)}
                            className="text-red-400"
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          {...register(`visibleTestCases.${i}.input`)}
                          placeholder="Input"
                          className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600"
                        />

                        <input
                          {...register(`visibleTestCases.${i}.output`)}
                          placeholder="Output"
                          className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600"
                        />

                        <textarea
                          {...register(`visibleTestCases.${i}.explanation`)}
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
                      onClick={() => appendHidden({ input: "", output: "" })}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-4 mt-4">
                    {hiddenFields.map((field, i) => (
                      <div
                        key={field.id}
                        className="p-4 bg-[#0d1628] rounded-xl border border-gray-600"
                      >
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeHidden(i)}
                            className="text-red-400"
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          {...register(`hiddenTestCases.${i}.input`)}
                          placeholder="Input"
                          className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600"
                        />

                        <input
                          {...register(`hiddenTestCases.${i}.output`)}
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
                        {...register(`startCode.${i}.initialCode`)}
                        rows={5}
                        className="w-full p-3 rounded bg-[#0d1628] border border-gray-600 font-mono mb-2"
                        placeholder="Initial Code"
                      />

                      <textarea
                        {...register(`referenceSolution.${i}.completeCode`)}
                        rows={5}
                        className="w-full p-3 rounded bg-[#0d1628] border border-gray-600 font-mono"
                        placeholder="Reference Solution"
                      />
                    </div>
                  ))}
                </section>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Problem"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}