import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utility/axiosClient";
import ChatAi from "../components/ChatAi";
import Editorials from '../components/Editorials';
import { Play, Send, Code2, FileText, BookOpen, Lightbulb, MessageSquare, History, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, MemoryStick, Terminal, Eye, Menu, X } from 'lucide-react';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [isTestCasesExpanded, setIsTestCasesExpanded] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const editorRef = useRef(null);
  let {problemId} = useParams();

  const { handleSubmit } = useForm();
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get code template from problem data
  const getCodeTemplate = () => {
    if (problem && problem.startCode && problem.startCode.length > 0) {
      const template = problem.startCode.find(sc => {
        if (sc.language === "c++" && selectedLanguage === 'cpp') return true;
        if (sc.language === "java" && selectedLanguage === 'java') return true;
        if (sc.language === "javascript" && selectedLanguage === 'javascript') return true;
        return false;
      });
      
      if (template && template.initialCode) {
        return template.initialCode;
      }
    }
    
    // Default fallback - simple template
    const fallbackTemplates = {
      javascript: '// Write your solution here\n\n',
      java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}'
    };
    
    return fallbackTemplates[selectedLanguage] || '// Write your code here';
  };

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);
        
        // ✅ Only set initial code, no other pre-filled solutions
        if (response.data.startCode && response.data.startCode.length > 0) {
          const template = response.data.startCode.find(sc => {
            if (sc.language === "c++" && selectedLanguage === 'cpp') return true;
            if (sc.language === "java" && selectedLanguage === 'java') return true;
            if (sc.language === "javascript" && selectedLanguage === 'javascript') return true;
            return false;
          });
          
          if (template && template.initialCode) {
            setCode(template.initialCode);
          } else {
            setCode(getCodeTemplate());
          }
        } else {
          setCode(getCodeTemplate());
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Fetch submissions when submissions tab is active
  useEffect(() => {
    if (activeLeftTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeLeftTab]);

  // Update code when language changes - from problem's startCode
  useEffect(() => {
    if (problem && problem.startCode && problem.startCode.length > 0) {
      const template = problem.startCode.find(sc => {
        if (sc.language === "c++" && selectedLanguage === 'cpp') return true;
        if (sc.language === "java" && selectedLanguage === 'java') return true;
        if (sc.language === "javascript" && selectedLanguage === 'javascript') return true;
        return false;
      });
      
      if (template && template.initialCode) {
        setCode(template.initialCode);
      } else {
        setCode(getCodeTemplate());
      }
    } else {
      setCode(getCodeTemplate());
    }
  }, [selectedLanguage, problem]);

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
      
      let submissionsData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          submissionsData = response.data;
        } else if (response.data.submissions && Array.isArray(response.data.submissions)) {
          submissionsData = response.data.submissions;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          submissionsData = response.data.data;
        } else if (typeof response.data === 'object') {
          submissionsData = [response.data];
        }
      }
      
      submissionsData.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || 0);
        const dateB = new Date(b.submittedAt || b.createdAt || 0);
        return dateB - dateA;
      });
      
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      const result = {
        ...response.data,
        testCases: Array.isArray(response.data.testCases) 
          ? response.data.testCases 
          : Array.isArray(response.data.test_cases) 
            ? response.data.test_cases 
            : Array.isArray(response.data.results) 
              ? response.data.results 
              : []
      };
      
      setRunResult(result);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: error.response?.data?.message || 'Internal server error',
        testCases: []
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      let submissionData = response.data;
      if (response.data && response.data.data) {
        submissionData = response.data.data;
      }
      
      const result = {
        accepted: submissionData.status === 'Accepted' || submissionData.accepted === true,
        status: submissionData.status || submissionData.result || 'Submitted',
        message: submissionData.message || 'Submission successful!',
        runtime: submissionData.runtime || submissionData.time,
        memory: submissionData.memory || submissionData.memory_used,
        passedTestCases: submissionData.passedTestCases || submissionData.passed_test_cases || 0,
        totalTestCases: submissionData.totalTestCases || submissionData.total_test_cases || 0,
        submissionId: submissionData.submissionId || submissionData.id || submissionData._id || `sub_${Date.now()}`
      };
      
      setSubmitResult(result);
      await fetchSubmissions();
      setActiveLeftTab('submissions');
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      
      let errorMessage = 'Submission failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      const errorResult = {
        accepted: false,
        status: 'Error',
        error: errorMessage,
        passedTestCases: 0,
        totalTestCases: 0
      };
      
      setSubmitResult(errorResult);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-500 bg-emerald-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'hard': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-500/20 text-gray-300';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('accepted')) return 'bg-emerald-500/20 text-emerald-400';
    if (statusLower.includes('wrong')) return 'bg-red-500/20 text-red-400';
    if (statusLower.includes('time')) return 'bg-yellow-500/20 text-yellow-400';
    if (statusLower.includes('error')) return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-gray-300';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Recent';
    }
  };

  const handleViewCode = (submissionCode) => {
    if (submissionCode) {
      setCode(submissionCode);
      setActiveRightTab('code');
    }
  };

  const handleResetCode = () => {
    setCode(getCodeTemplate());
  };

  // Mobile menu tabs
  const leftTabs = [
    { id: 'description', icon: FileText, label: 'Description' },
    { id: 'editorial', icon: BookOpen, label: 'Editorial' },
    { id: 'solutions', icon: Lightbulb, label: 'Solutions' },
    { id: 'submissions', icon: History, label: 'Submissions' },
    { id: 'chatAI', icon: MessageSquare, label: 'AI Assistant' }
  ];

  const rightTabs = [
    { id: 'code', icon: Code2, label: 'Code' },
    { id: 'testcase', icon: Terminal, label: 'Test Cases' },
    { id: 'result', icon: CheckCircle, label: 'Result' }
  ];

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
          <h1 className="text-lg font-bold truncate flex-1">{problem?.title || 'Problem'}</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 bg-slate-800 border-b border-slate-700 z-50 shadow-xl">
            <div className="grid grid-cols-2 gap-1 p-2">
              {leftTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeLeftTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-slate-700'
                  }`}
                  onClick={() => {
                    setActiveLeftTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area - Single Column for Mobile */}
        <div className="flex-1 overflow-y-auto">
          {/* Problem Content */}
          <div className="p-4">
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div className="animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <h1 className="text-xl font-bold text-white">{problem.title}</h1>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        {problem.tags}
                      </span>
                    </div>

                    <div className="prose prose-invert max-w-none text-sm">
                      <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                        {problem.description}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-blue-400" />
                        Examples:
                      </h3>
                      <div className="space-y-3">
                        {problem?.visibleTestCases && problem.visibleTestCases.length > 0 ? (
                          problem.visibleTestCases.map((example, index) => (
                            <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                              <div className="bg-slate-800 px-3 py-2 border-b border-slate-700">
                                <h4 className="font-semibold text-xs">Example {index + 1}</h4>
                              </div>
                              <div className="p-3 space-y-1 text-xs font-mono">
                                <div><span className="text-blue-400">Input:</span> {example.input || 'No input'}</div>
                                <div><span className="text-emerald-400">Output:</span> {example.output || 'No output'}</div>
                                {example.explanation && (
                                  <div><span className="text-yellow-400">Explanation:</span> {example.explanation}</div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-center py-6 text-sm">No examples available for this problem.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <Editorials secureUrl={problem.secureUrl} thumbnailUrl={problem.secureUrl} duration={problem.duration} />
                )}

                {activeLeftTab === 'solutions' && (
                  <div>
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      Reference Solutions
                    </h2>
                    <div className="space-y-4">
                      {problem.referenceSolution && problem.referenceSolution.length > 0 ? (
                        problem.referenceSolution.map((solution, index) => (
                          <div key={index} className="border border-slate-700 rounded-lg overflow-hidden">
                            <div className="bg-slate-800 px-3 py-2 flex justify-between items-center">
                              <h3 className="font-semibold text-sm">{problem.title} - {solution?.language || 'Unknown'}</h3>
                              <button 
                                className="text-xs text-blue-400 hover:text-blue-300"
                                onClick={() => {
                                  setCode(solution?.completeCode || '');
                                  setSelectedLanguage(solution?.language === 'cpp' ? 'cpp' : solution?.language === 'java' ? 'java' : 'javascript');
                                  setActiveRightTab('code');
                                }}
                              >
                                Use this code
                              </button>
                            </div>
                            <div className="p-3 bg-slate-900/50">
                              <pre className="text-xs overflow-x-auto">
                                <code className="text-gray-300">{solution?.completeCode?.substring(0, 200) || 'No code available'}{solution?.completeCode?.length > 200 ? '...' : ''}</code>
                              </pre>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-6 text-sm">Solutions will be available after you solve the problem.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <History className="w-4 h-4 text-blue-400" />
                        Submissions
                      </h2>
                      <button 
                        className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg"
                        onClick={fetchSubmissions}
                        disabled={loadingSubmissions}
                      >
                        {loadingSubmissions ? (
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Refresh'
                        )}
                      </button>
                    </div>
                    
                    {loadingSubmissions ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : submissions.length > 0 ? (
                      <div className="space-y-2">
                        {submissions.map((submission, index) => (
                          <div key={submission._id || submission.submissionId || index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                {submission.status?.toLowerCase().includes('accepted') ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400" />
                                )}
                                <div>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                    {submission.status || 'Pending'}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">{formatDate(submission.submittedAt || submission.createdAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-400">{submission.language?.toUpperCase() || 'N/A'}</span>
                                {submission.code && (
                                  <button
                                    className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded"
                                    onClick={() => handleViewCode(submission.code)}
                                  >
                                    View Code
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No submissions yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeLeftTab === 'chatAI' && (
                  <ChatAi problem={problem} />
                )}
              </>
            )}
          </div>

          {/* Code Editor Section - Always visible at bottom for mobile */}
          <div className="border-t border-slate-700 bg-slate-900">
            {/* Code Tabs */}
            <div className="flex border-b border-slate-700 bg-slate-800/50 px-2 gap-1 overflow-x-auto">
              {rightTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                    activeRightTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400'
                  }`}
                  onClick={() => setActiveRightTab(tab.id)}
                >
                  <tab.icon className="w-3 h-3" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Content */}
            <div className="h-80 flex flex-col">
              {activeRightTab === 'code' && (
                <>
                  <div className="flex flex-wrap gap-2 p-3 border-b border-slate-700">
                    <div className="flex gap-1 flex-wrap">
                      {[
                        { id: 'javascript', name: 'JS', icon: '🟨' },
                        { id: 'java', name: 'Java', icon: '☕' },
                        { id: 'cpp', name: 'C++', icon: '⚙️' }
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            selectedLanguage === lang.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-gray-300'
                          }`}
                          onClick={() => handleLanguageChange(lang.id)}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                    <button
                      className="px-2 py-1 text-xs bg-slate-700 rounded-lg"
                      onClick={handleResetCode}
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language={getLanguageForMonaco(selectedLanguage)}
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      options={{
                        fontSize: fontSize,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                      }}
                    />
                  </div>
                  <div className="p-3 border-t border-slate-700 flex gap-2">
                    <button
                      className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        loading ? 'bg-gray-600' : 'bg-slate-700'
                      }`}
                      onClick={handleRun}
                      disabled={loading}
                    >
                      <Play className="w-3 h-3" />
                      Run
                    </button>
                    <button
                      className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        loading ? 'bg-gray-600' : 'bg-blue-600'
                      }`}
                      onClick={handleSubmitCode}
                      disabled={loading}
                    >
                      <Send className="w-3 h-3" />
                      Submit
                    </button>
                  </div>
                </>
              )}

              {activeRightTab === 'testcase' && (
                <div className="flex-1 overflow-y-auto p-3">
                  {runResult ? (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg text-sm ${
                        runResult.success ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          {runResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="font-medium">
                            {runResult.success ? 'All tests passed!' : runResult.error || 'Execution Failed'}
                          </span>
                        </div>
                      </div>
                      {runResult.testCases && runResult.testCases.length > 0 && (
                        <div className="space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-xs">
                              <div className="space-y-1">
                                <div><span className="text-blue-400">Input:</span> {tc.stdin || tc.input || 'N/A'}</div>
                                <div><span className="text-emerald-400">Expected:</span> {tc.expected_output || tc.expectedOutput || 'N/A'}</div>
                                <div><span className="text-yellow-400">Output:</span> {tc.stdout || tc.output || 'N/A'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Click "Run" to test</p>
                    </div>
                  )}
                </div>
              )}

              {activeRightTab === 'result' && (
                <div className="flex-1 overflow-y-auto p-3">
                  {submitResult ? (
                    <div className={`p-3 rounded-lg text-sm ${
                      submitResult.accepted ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {submitResult.accepted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-medium">{submitResult.status || (submitResult.accepted ? 'Accepted' : 'Failed')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Test Cases: {submitResult.passedTestCases || 0}/{submitResult.totalTestCases || 0}</div>
                        <div>Runtime: {submitResult.runtime ? `${submitResult.runtime} ms` : 'N/A'}</div>
                        <div>Memory: {submitResult.memory ? `${submitResult.memory} KB` : 'N/A'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Click "Submit" to evaluate</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view (original layout with improvements)
  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-slate-700 bg-slate-900/50">
        {/* Left Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50 px-4 gap-1 overflow-x-auto">
          {leftTabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeLeftTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
              onClick={() => setActiveLeftTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="animate-fadeIn">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      {problem.tags}
                    </span>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-blue-400" />
                      Examples:
                    </h3>
                    <div className="space-y-4">
                      {problem?.visibleTestCases && problem.visibleTestCases.length > 0 ? (
                        problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
                              <h4 className="font-semibold text-sm">Example {index + 1}</h4>
                            </div>
                            <div className="p-4 space-y-2 text-sm font-mono">
                              <div><span className="text-blue-400">Input:</span> {example.input || 'No input'}</div>
                              <div><span className="text-emerald-400">Output:</span> {example.output || 'No output'}</div>
                              {example.explanation && (
                                <div><span className="text-yellow-400">Explanation:</span> {example.explanation}</div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-8">No examples available for this problem.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="animate-fadeIn">
                  <Editorials secureUrl={problem.secureUrl} thumbnailUrl={problem.secureUrl} duration={problem.duration} />
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="animate-fadeIn">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Reference Solutions
                  </h2>
                  <div className="space-y-6">
                    {problem.referenceSolution && problem.referenceSolution.length > 0 ? (
                      problem.referenceSolution.map((solution, index) => (
                        <div key={index} className="border border-slate-700 rounded-lg overflow-hidden">
                          <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                            <h3 className="font-semibold">{problem.title} - {solution?.language || 'Unknown'}</h3>
                            <button 
                              className="text-xs text-blue-400 hover:text-blue-300"
                              onClick={() => {
                                setCode(solution?.completeCode || '');
                                setSelectedLanguage(solution?.language === 'cpp' ? 'cpp' : solution?.language === 'java' ? 'java' : 'javascript');
                                setActiveRightTab('code');
                              }}
                            >
                              Use this code
                            </button>
                          </div>
                          <div className="p-4 bg-slate-900/50">
                            <pre className="text-sm overflow-x-auto">
                              <code className="text-gray-300">{solution?.completeCode || 'No code available'}</code>
                            </pre>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">Solutions will be available after you solve the problem.</p>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-400" />
                      Submission History
                    </h2>
                    <div className="flex gap-2">
                      <button 
                        className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        onClick={fetchSubmissions}
                        disabled={loadingSubmissions}
                      >
                        {loadingSubmissions ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Refresh'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {loadingSubmissions ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-400">Loading submissions...</span>
                    </div>
                  ) : submissions.length > 0 ? (
                    <div className="space-y-3">
                      {submissions.map((submission, index) => (
                        <div key={submission._id || submission.submissionId || index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-all">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              {submission.status?.toLowerCase().includes('accepted') ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                              )}
                              <div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                  {submission.status || 'Pending'}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(submission.submittedAt || submission.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-400">{submission.language?.toUpperCase() || 'N/A'}</span>
                              {submission.runtime && (
                                <span className="flex items-center gap-1 text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  {submission.runtime} ms
                                </span>
                              )}
                              {submission.memory && (
                                <span className="flex items-center gap-1 text-gray-400">
                                  <MemoryStick className="w-3 h-3" />
                                  {submission.memory} KB
                                </span>
                              )}
                              {submission.code && (
                                <button
                                  className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                                  onClick={() => handleViewCode(submission.code)}
                                >
                                  <Eye className="w-3 h-3 inline mr-1" />
                                  View Code
                                </button>
                              )}
                            </div>
                          </div>
                          {submission.error && (
                            <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                              {submission.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-5xl mb-4">📝</div>
                      <p className="text-lg font-medium">No submissions yet</p>
                      <p className="text-sm mt-2">Submit your solution to see it here!</p>
                      <button 
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                        onClick={() => {
                          setActiveRightTab('code');
                          setActiveLeftTab('description');
                        }}
                      >
                        Go to Code Editor
                      </button>
                    </div>
                  )}
                </div>
              )}
              {activeLeftTab === 'chatAI' && (
                <div className="animate-fadeIn">
                  <ChatAi problem={problem} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col bg-slate-900">
        {/* Right Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50 px-4 gap-1 overflow-x-auto">
          {rightTabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeRightTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
              onClick={() => setActiveRightTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector and Controls */}
              <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/30 flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
                    { id: 'java', name: 'Java', icon: '☕' },
                    { id: 'cpp', name: 'C++', icon: '⚙️' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedLanguage === lang.id
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                      onClick={() => handleLanguageChange(lang.id)}
                    >
                      <span className="mr-2">{lang.icon}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    onClick={handleResetCode}
                    title="Reset to template"
                  >
                    Reset Code
                  </button>
                  <div className="flex items-center gap-2 px-2 bg-slate-700 rounded-lg">
                    <span className="text-xs text-gray-400">Font</span>
                    <button
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-600 rounded"
                      onClick={() => setFontSize(Math.max(10, fontSize - 2))}
                    >
                      A-
                    </button>
                    <span className="text-sm min-w-[3ch] text-center">{fontSize}</span>
                    <button
                      className="w-6 h-6 flex items-center justify-center hover:bg-slate-600 rounded"
                      onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    >
                      A+
                    </button>
                  </div>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: fontSize,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-700 flex justify-between bg-slate-800/30 flex-wrap gap-3">
                <div className="text-sm text-gray-500">
                  Problem ID: {problemId}
                </div>
                <div className="flex gap-3">
                  <button
                    className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    <Play className="w-4 h-4" />
                    Run Code
                  </button>
                  <button
                    className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25'
                    }`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    <Send className="w-4 h-4" />
                    Submit Solution
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  Test Results
                </h3>
                {runResult && runResult.testCases && runResult.testCases.length > 0 && (
                  <button
                    className="text-sm text-gray-400 hover:text-gray-200"
                    onClick={() => setIsTestCasesExpanded(!isTestCasesExpanded)}
                  >
                    {isTestCasesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {runResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    runResult.success ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      {runResult.success ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <h4 className="font-bold">
                        {runResult.success ? 'All test cases passed!' : runResult.error || 'Execution Failed'}
                      </h4>
                    </div>
                    {runResult.runtime && (
                      <div className="text-sm text-gray-300 mb-2">
                        ⚡ Runtime: {runResult.runtime} sec
                      </div>
                    )}
                    {runResult.memory && (
                      <div className="text-sm text-gray-300 mb-4">
                        💾 Memory: {runResult.memory} KB
                      </div>
                    )}
                  </div>

                  {runResult.testCases && runResult.testCases.length > 0 && isTestCasesExpanded && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-400">Detailed Results:</h4>
                      {runResult.testCases.map((tc, i) => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                          <div className="font-mono text-xs space-y-1">
                            <div><span className="text-blue-400">Input:</span> {tc.stdin || tc.input || 'No input'}</div>
                            <div><span className="text-emerald-400">Expected:</span> {tc.expected_output || tc.expectedOutput || 'No expected output'}</div>
                            <div><span className="text-yellow-400">Output:</span> {tc.stdout || tc.output || 'No output'}</div>
                            <div className={tc.status_id === 3 ? 'text-emerald-400' : 'text-red-400'}>
                              {tc.status_id === 3 ? '✓ Passed' : '✗ Failed'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Run Code" to test your solution</p>
                  <p className="text-sm mt-2">Test cases will appear here</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Submission Result
              </h3>
              {submitResult ? (
                <div className="space-y-4">
                  <div className={`p-6 rounded-lg ${
                    submitResult.accepted ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {submitResult.accepted ? (
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-400" />
                      )}
                      <div>
                        <h4 className="text-xl font-bold">
                          {submitResult.status || (submitResult.accepted ? 'Accepted' : 'Failed')}
                        </h4>
                        {submitResult.message && (
                          <p className="text-sm mt-1 text-gray-400">{submitResult.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-700">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Test Cases Passed</p>
                        <p className="text-lg font-semibold">
                          {submitResult.passedTestCases || 0}/{submitResult.totalTestCases || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Runtime</p>
                        <p className="text-lg font-semibold">{submitResult.runtime ? `${submitResult.runtime} ms` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Memory Usage</p>
                        <p className="text-lg font-semibold">{submitResult.memory ? `${submitResult.memory} KB` : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Submission ID</p>
                        <p className="text-sm font-mono truncate">{submitResult.submissionId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    onClick={() => setActiveLeftTab('submissions')}
                  >
                    <History className="w-4 h-4" />
                    View All Submissions
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Submit Solution" to submit your code</p>
                  <p className="text-sm mt-2">Your submission will be evaluated</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
