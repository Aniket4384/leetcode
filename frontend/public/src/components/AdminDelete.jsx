import { useEffect, useState } from 'react';
import axiosClient from '../utility/axiosClient';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;

    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      setError('Failed to delete problem');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-base-300">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error my-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-300 text-base-content p-6">
      <div className="container mx-auto">

        <h1 className="text-3xl font-bold mb-6">Delete Problems</h1>

        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="table w-full bg-base-200">
            <thead className="bg-base-100">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {problems.map((problem, index) => (
                <tr
                  key={problem._id}
                  className="hover:bg-base-100 transition-colors"
                >
                  <th>{index + 1}</th>

                  <td>{problem.title}</td>

                  <td>
                    <span
                      className={`badge ${
                        problem.difficulty === 'Easy'
                          ? 'badge-success'
                          : problem.difficulty === 'Medium'
                          ? 'badge-warning'
                          : 'badge-error'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>

                  {/* ✅ TAGS FIXED */}
                  <td className="space-x-1">
                    {Array.isArray(problem.tags) && problem.tags.length > 0 ? (
                      problem.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="badge badge-outline badge-sm"
                        >
                          {tag}
                        </span>
                      ))
                    ) : typeof problem.tags === 'string' && problem.tags ? (
                      <span className="badge badge-outline badge-sm">
                        {problem.tags}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No tags
                      </span>
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() => handleDelete(problem._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDelete;
