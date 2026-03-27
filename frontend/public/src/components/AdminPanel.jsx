import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utility/axiosClient";
import { useNavigate } from "react-router";
import { useState } from "react";

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

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
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
    },
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } =
    useFieldArray({ control, name: "visibleTestCases" });

  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } =
    useFieldArray({ control, name: "hiddenTestCases" });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post("/problem/create", data);
      alert("Problem created!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  // Mobile Navigation Tabs
  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'visible', label: 'Visible Tests', icon: '👁️' },
    { id: 'hidden', label: 'Hidden Tests', icon: '🔒' },
    { id: 'code', label: 'Code Templates', icon: '💻' }
  ];

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200 px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-10 text-blue-400">
          Admin — Create New Problem
        </h1>

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          
          {/* Basic Information Section */}
          <section className={`bg-[#111827] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl ${activeSection !== 'basic' && 'sm:block hidden'}`}>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm block mb-2">Title</label>
                <input
                  {...register("title")}
                  className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200 text-sm sm:text-base"
                  placeholder="Enter problem title"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">Title is required</p>}
              </div>

              <div>
                <label className="text-sm block mb-2">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200 text-sm sm:text-base"
                  placeholder="Enter problem description"
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">Description is required</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <label className="text-sm block mb-2">Difficulty</label>
                  <select
                    {...register("difficulty")}
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
                    {...register("tags")}
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
                onClick={() => appendVisible({ input: "", output: "", explanation: "" })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm w-full sm:w-auto"
              >
                + Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {visibleFields.length === 0 && (
                <div className="text-center py-8 text-yellow-400 text-sm">
                  No visible test cases. Click "Add Test Case" to create one.
                </div>
              )}
              {visibleFields.map((field, i) => (
                <div key={field.id} className="p-4 bg-[#0d1628] rounded-xl border border-gray-600">
                  <div className="flex justify-end mb-3">
                    <button
                      type="button"
                      onClick={() => removeVisible(i)}
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    {...register(`visibleTestCases.${i}.input`)}
                    placeholder="Input"
                    className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600 text-sm"
                  />
                  
                  <input
                    {...register(`visibleTestCases.${i}.output`)}
                    placeholder="Output"
                    className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600 text-sm"
                  />

                  <textarea
                    {...register(`visibleTestCases.${i}.explanation`)}
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
                onClick={() => appendHidden({ input: "", output: "" })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm w-full sm:w-auto"
              >
                + Add Hidden Test
              </button>
            </div>

            <div className="space-y-4">
              {hiddenFields.length === 0 && (
                <div className="text-center py-8 text-yellow-400 text-sm">
                  No hidden test cases. Click "Add Hidden Test" to create one.
                </div>
              )}
              {hiddenFields.map((field, i) => (
                <div key={field.id} className="p-4 bg-[#0d1628] rounded-xl border border-gray-600">
                  <div className="flex justify-end mb-3">
                    <button
                      type="button"
                      onClick={() => removeHidden(i)}
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    {...register(`hiddenTestCases.${i}.input`)}
                    placeholder="Input"
                    className="w-full p-2 mb-2 rounded bg-[#1a2336] border border-gray-600 text-sm"
                  />

                  <input
                    {...register(`hiddenTestCases.${i}.output`)}
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
                      {...register(`startCode.${lang.index}.initialCode`)}
                      rows={4}
                      className="w-full p-3 rounded bg-[#0d1628] border border-gray-600 font-mono text-xs sm:text-sm"
                      placeholder={`${lang.name} initial code template`}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Reference Solution</label>
                    <textarea
                      {...register(`referenceSolution.${lang.index}.completeCode`)}
                      rows={4}
                      className="w-full p-3 rounded bg-[#0d1628] border border-gray-600 font-mono text-xs sm:text-sm"
                      placeholder={`${lang.name} reference solution`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-semibold transition-colors">
            Create Problem
          </button>
        </form>
      </div>
    </div>
  );
}