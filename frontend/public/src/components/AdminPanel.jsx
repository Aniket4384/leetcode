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

export default function AdminPanel() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-400">
          Admin — Create New Problem
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

         
          <section className="bg-[#111827] p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">

              <div>
                <label className="text-sm">Title</label>
                <input
                  {...register("title")}
                  className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
                />
              </div>

              <div>
                <label className="text-sm">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-[#0d1628] border border-gray-600 text-gray-200"
                />
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

          {/* HIDDEN TEST CASES */}
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

          <button className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-semibold">
            Create Problem
          </button>
        </form>
      </div>
    </div>
  );
}
