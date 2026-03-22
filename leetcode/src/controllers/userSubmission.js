const Problem = require("./models/problem");
const Submission = require("./models/submission");
const {
  getLanguageById,
  submitBatch,
  submitToken,
  getSubmissionResults, // Add this for better polling
} = require("../utils/Problemutility");

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        if (!userId || !code || !language || !problemId) {
            return res.status(400).json({ error: "Some fields missing" });
        }

        if (language === 'cpp') {
            language = 'c++';
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
            return res.status(400).json({ error: "No hidden test cases available" });
        }

        // Create submission record
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            testCasesPassed: 0,
            status: "pending",
            testCasesTotal: problem.hiddenTestCases.length,
        });

        const languageId = getLanguageById(language);
        if (!languageId) {
            return res.status(400).json({ error: "Invalid language" });
        }

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input || "",
            expected_output: testcase.output || "",
        }));

        const submitResult = await submitBatch(submissions);
        
        if (!submitResult || !Array.isArray(submitResult)) {
            throw new Error("Invalid batch response");
        }
        
        const resultToken = submitResult.map((value) => value.token);
        const testResults = await getSubmissionResults(resultToken);
        
        if (!testResults || !Array.isArray(testResults)) {
            throw new Error("Invalid results format");
        }
        
        if (testResults.length === 0) {
            throw new Error("No results received");
        }

        // Process results
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errorMessage = null;
        
        for (const test of testResults) {
            if (test.status_id === 3) {
                testCasesPassed++;
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                status = "wrong";
                errorMessage = test.compile_output || test.stderr || test.message || test.status?.description;
                break;
            }
        }

        // Update submission
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        await submittedResult.save();

        // Update user's solved problems
        if (status === "accepted" && !req.result.problemSolved.includes(problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }
        
        res.status(201).json({
            success: status === "accepted",
            accepted: status === "accepted",
            passedTestCases: testCasesPassed,
            totalTestCases: problem.hiddenTestCases.length,
            runtime: runtime.toFixed(3) + 's',
            memory: memory + 'KB',
            error: errorMessage,
            status: status,
            submissionId: submittedResult._id
        });
        
    } catch (err) {
        console.error("Submit error:", err);
        res.status(500).json({ error: err.message || "Failed to submit code" });
    }
};

const runCode = async (req, res) => {
    try {
        console.log("=== RUN CODE START ===");
        
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;

        console.log("Problem ID:", problemId);
        console.log("Language:", language);
        console.log("Code length:", code?.length);

        if (!userId || !code || !language || !problemId) {
            return res.status(400).json({ error: "Some fields missing" });
        }

        if (language === 'cpp') {
            language = 'c++';
        }
        
        const problem = await Problem.findById(problemId);
        console.log("Problem found:", problem ? "Yes" : "No");
        
        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        if (!problem.visibleTestCases || problem.visibleTestCases.length === 0) {
            return res.status(400).json({ error: "No visible test cases available" });
        }

        console.log("Test cases count:", problem.visibleTestCases.length);

        const languageId = getLanguageById(language);
        console.log("Language ID:", languageId);
        
        if (!languageId) {
            return res.status(400).json({ error: "Invalid language" });
        }

        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input || "",
            expected_output: testcase.output || "",
        }));

        console.log("Submitting to Judge0...");
        const submitResult = await submitBatch(submissions);
        console.log("Submit result:", submitResult);
        
        if (!submitResult || !Array.isArray(submitResult)) {
            console.error("Invalid submitResult:", submitResult);
            return res.status(500).json({ error: "Invalid batch response" });
        }
        
        const resultToken = submitResult.map((value) => value.token);
        console.log("Tokens:", resultToken);
        
        console.log("Getting results...");
        const testResults = await getSubmissionResults(resultToken);
        console.log("Test results TYPE:", typeof testResults);
        console.log("Test results IS ARRAY:", Array.isArray(testResults));
        console.log("Test results:", JSON.stringify(testResults, null, 2));
        
        // ✅ CRITICAL FIX - Check and convert
        let resultsArray = [];
        
        if (testResults && Array.isArray(testResults)) {
            resultsArray = testResults;
        } else if (testResults && testResults.submissions && Array.isArray(testResults.submissions)) {
            resultsArray = testResults.submissions;
        } else if (testResults && typeof testResults === 'object') {
            // Try to extract any array
            for (let key in testResults) {
                if (Array.isArray(testResults[key])) {
                    resultsArray = testResults[key];
                    break;
                }
            }
        }
        
        console.log("Final results array length:", resultsArray.length);
        
        if (resultsArray.length === 0) {
            return res.status(500).json({ 
                error: "No results received from Judge0",
                debug: { testResults, resultToken }
            });
        }

        // Process results
        let allPassed = true;
        let runtime = 0;
        let memory = 0;
        const processedTestCases = [];
        
        for (let i = 0; i < resultsArray.length; i++) {
            const test = resultsArray[i];
            const testCase = problem.visibleTestCases[i];
            const passed = test.status_id === 3;
            
            if (!passed) allPassed = false;
            
            if (passed) {
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            }
            
            processedTestCases.push({
                testCase: i + 1,
                input: testCase?.input || "",
                expected: testCase?.output || "",
                output: test.stdout || "",
                error: test.compile_output || test.stderr || test.message,
                status: test.status?.description,
                status_id: test.status_id,
                passed: passed,
                time: test.time,
                memory: test.memory
            });
        }

        console.log("=== RUN CODE END ===");
        
        res.status(200).json({
            success: allPassed,
            message: allPassed ? "All test cases passed!" : `${processedTestCases.filter(tc => tc.passed).length}/${processedTestCases.length} test cases passed`,
            testCases: processedTestCases,
            summary: {
                passed: processedTestCases.filter(tc => tc.passed).length,
                total: processedTestCases.length,
                runtime: runtime.toFixed(3) + 's',
                memory: memory + 'KB'
            }
        });
        
    } catch (err) {
        console.error("Run code error:", err);
        res.status(500).json({ error: err.message || "Failed to run code" });
    }
};

module.exports = { submitCode, runCode };