import { useEffect, useState } from 'react';
import axiosClient from '../utility/axiosClient';
import { NavLink } from 'react-router';

const AdminVideo = () => {
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
      console.error(err);
      setError('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;

    try {
      await axiosClient.delete(`/video/delete/${id}`);
      setProblems(prev => prev.filter(problem => problem._id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete problem');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error my-4 bg-white">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Upload & Delete Videos
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="table w-full">
          <thead className="bg-gray-100 text-gray-700">
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
                className="hover:bg-gray-50 transition"
              >
                <th>{index + 1}</th>

                <td className="font-medium text-gray-800">
                  {problem.title}
                </td>

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

                <td>
                  <span className="badge badge-outline">
                    {problem.tags || '—'}
                  </span>
                </td>

                <td>
                  <div className="flex gap-2">
                    <NavLink
                      to={`/admin/upload/${problem._id}`}
                      className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Upload
                    </NavLink>

                    <button
                      onClick={() => handleDelete(problem._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVideo;
