import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axiosClient from '../utility/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { Code, LogOut, Filter, CheckCircle, Circle, ChevronDown, Menu, X, Settings, UserCircle, Shield, LayoutDashboard } from 'lucide-react';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
 
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({ difficulty: 'all', tag: 'all', status: 'all' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };
    fetchProblems();
  }, []);

  // Fetch solved problems when user is available
  useEffect(() => {
    const fetchSolvedProblems = async () => {
      // Wait for auth to complete
      if (authLoading) return;
      
      if (user && user._id) {
        try {
          setLoading(true);
          const { data } = await axiosClient.get('/problem/problemSolvedByUser');
          setSolvedProblems(Array.isArray(data) ? data : data?.solved || []);
        } catch (error) {
          console.error('Error fetching solved problems:', error);
          setSolvedProblems([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchSolvedProblems();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    setSolvedProblems([]);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const handleAdminDashboard = () => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
    setIsDropdownOpen(false);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || (problem.difficulty ?? '').toLowerCase() === filters.difficulty;
    const tagMatch = filters.tag === 'all' || (problem.tags ?? '').toLowerCase() === filters.tag;
    const statusMatch = filters.status === 'all' || (filters.status === 'solved' ? solvedProblems.some(sp => sp._id === problem._id) : true);
    return difficultyMatch && tagMatch && statusMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const solvedCount = solvedProblems.length;
  const totalCount = problems.length;
  const progressPercentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Show loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0b1220] to-[#0c1424] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0b1220] to-[#0c1424] text-gray-100 flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-[#071026]/80 backdrop-blur-md border-b border-[#1f2937] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 group">
              <Code className="w-7 h-7 text-blue-500 group-hover:text-blue-400 transition-colors" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                CodeForge
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Admin Dashboard Button - Only show for admin */}
              {isAdmin && (
                <button
                  onClick={handleAdminDashboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-all duration-200 shadow-lg shadow-purple-600/25"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Panel</span>
                </button>
              )}

              {/* Stats */}
              {user && (
                <div className="flex items-center gap-3 px-3 py-1.5 bg-[#0f1728] rounded-lg border border-[#1f2937]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">
                      <span className="text-emerald-400">{solvedCount}</span>
                      <span className="text-gray-500">/{totalCount}</span>
                    </span>
                  </div>
                  <div className="w-px h-4 bg-[#1f2937]" />
                  <div className="w-24 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 px-3 py-1.5 bg-[#0f1728] rounded-lg border border-[#1f2937] hover:bg-[#131c2c] transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-semibold shadow-lg">
                      {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium">{user.firstName || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.emailId}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 z-50 bg-[#071026] border border-[#1f2937] rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#1f2937] bg-[#0f1728]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-semibold">
                              {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.firstName}</p>
                              <p className="text-xs text-gray-500">{user.emailId}</p>
                              {isAdmin && (
                                <span className="inline-flex items-center gap-1 mt-1 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                                  <Shield className="w-3 h-3" />
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-2">
                          {isAdmin && (
                            <>
                              <button
                                onClick={handleAdminDashboard}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#1f2937] transition-colors flex items-center gap-3"
                              >
                                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                                Admin Dashboard
                              </button>
                              <div className="h-px bg-[#1f2937] my-1" />
                            </>
                          )}
                          <button className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#1f2937] transition-colors flex items-center gap-3">
                            <UserCircle className="w-4 h-4" />
                            Profile
                          </button>
                          <button className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#1f2937] transition-colors flex items-center gap-3">
                            <Settings className="w-4 h-4" />
                            Settings
                          </button>
                          <div className="h-px bg-[#1f2937] my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-[#1f2937] transition-colors flex items-center gap-3"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Sign In
                </NavLink>
              )}
            </div>

            {/* Mobile Menu Button */}
            {user && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-[#0f1728] border border-[#1f2937]"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden border-t border-[#1f2937] bg-[#071026]">
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#1f2937]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-semibold">
                  {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-base">{user.firstName}</p>
                  <p className="text-xs text-gray-500">{user.emailId}</p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
              
              {isAdmin && (
                <button
                  onClick={() => {
                    handleAdminDashboard();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg flex items-center gap-3 border border-purple-500/30"
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  Admin Dashboard
                </button>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Your Progress
                  </span>
                  <span className="font-medium">{solvedCount}/{totalCount}</span>
                </div>
                <div className="w-full h-2 bg-[#1f2937] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#1f2937] rounded-lg flex items-center gap-3">
                  <UserCircle className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-[#1f2937] rounded-lg flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[#1f2937] rounded-lg flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Filters */}
      {problems.length > 0 && (
        <div className="bg-[#071026]/50 backdrop-blur-sm border-b border-[#1f2937] sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="w-4 h-4 text-gray-500" />
              
              <select 
                className="px-3 py-2 bg-[#0f1728] border border-[#1f2937] rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                value={filters.status} 
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">📋 All Problems</option>
                <option value="solved">✅ Solved Problems</option>
              </select>

              <select 
                className="px-3 py-2 bg-[#0f1728] border border-[#1f2937] rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                value={filters.difficulty} 
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <option value="all">🎯 All Difficulties</option>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>

              <select 
                className="px-3 py-2 bg-[#0f1728] border border-[#1f2937] rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                value={filters.tag} 
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              >
                <option value="all">🏷️ All Tags</option>
                <option value="array">📊 Array</option>
                <option value="linkedlist">🔗 Linked List</option>
                <option value="graph">🕸️ Graph</option>
                <option value="dp">🧠 DP</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col md:flex-row">
          <div className="w-full md:w-96 lg:w-[400px] border-r border-[#1f2937] overflow-y-auto bg-[#0b1220]/50">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-500" />
                  Problems List
                  <span className="text-xs text-gray-500 ml-2">({filteredProblems.length})</span>
                </h2>
              </div>

              <div className="space-y-2">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map(problem => (
                    <NavLink 
                      key={problem._id} 
                      to={`/problem/${problem._id}`} 
                      className={({ isActive }) => `
                        block p-4 rounded-xl transition-all duration-200 group
                        ${isActive 
                          ? 'bg-blue-500/10 border-2 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                          : 'bg-[#071226] border border-[#1f2937] hover:border-blue-500/50 hover:bg-[#0f1728] hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                          {problem.title}
                        </h3>
                        {solvedProblems.some(sp => sp._id === problem._id) && (
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty || 'Unknown'}
                        </span>
                        {problem.tags && (
                          <span className="text-xs text-gray-500 bg-[#1f2937] px-2 py-1 rounded-full">
                            {problem.tags}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No problems found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-[#0b1220] to-[#0a0f1a]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 flex items-center justify-center animate-pulse">
                <Code className="w-12 h-12 text-blue-400/60" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-300">Select a Problem</h3>
              <p className="text-gray-500 text-sm">
                Choose a problem from the list to start coding. Your solution will be evaluated and you'll get instant feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
