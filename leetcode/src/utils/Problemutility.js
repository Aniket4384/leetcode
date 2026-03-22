const axios = require('axios');
const { Base64 } = require('js-base64');

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63,
        "cpp": 54,
        "python": 71,
        "python3": 71
    }
    return language[lang.toLowerCase()];
}

const submitBatch = async (submissions) => {
    try {
        if (!submissions || submissions.length === 0) {
            throw new Error("No submissions provided");
        }

        // Encode to base64 for better compatibility
        const encodedSubmissions = submissions.map(sub => ({
            language_id: sub.language_id,
            source_code: Base64.encode(sub.source_code),
            stdin: Base64.encode(sub.stdin || ""),
            expected_output: Base64.encode(sub.expected_output || "")
        }));

        const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: { 
                base64_encoded: 'true'
            },
            headers: {
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: { submissions: encodedSubmissions }
        };

        const response = await axios.request(options);
        
        if (!response.data || !Array.isArray(response.data)) {
            throw new Error("Invalid response from Judge0");
        }
        
        return response.data;
        
    } catch (error) {
        console.error("Batch Error:", error.response?.data || error.message);
        throw new Error(`submitBatch failed: ${error.message}`);
    }
};

const submitToken = async (tokens) => {
    try {
        if (!tokens || tokens.length === 0) {
            throw new Error("No tokens provided");
        }

        const options = {
            method: 'GET',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: {
                tokens: tokens.join(","),
                base64_encoded: 'true',
                fields: '*'
            },
            headers: {
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        
        if (!response.data || !response.data.submissions) {
            throw new Error("Invalid response from Judge0");
        }
        
        // Decode base64 fields
        const decodedSubmissions = response.data.submissions.map(sub => ({
            ...sub,
            source_code: sub.source_code ? Base64.decode(sub.source_code) : null,
            stdout: sub.stdout ? Base64.decode(sub.stdout) : null,
            stderr: sub.stderr ? Base64.decode(sub.stderr) : null,
            compile_output: sub.compile_output ? Base64.decode(sub.compile_output) : null,
            message: sub.message ? Base64.decode(sub.message) : null,
            stdin: sub.stdin ? Base64.decode(sub.stdin) : null,
            expected_output: sub.expected_output ? Base64.decode(sub.expected_output) : null
        }));
        
        return { submissions: decodedSubmissions };
        
    } catch (error) {
        console.error("Token Error:", error.response?.data || error.message);
        throw new Error(`submitToken failed: ${error.message}`);
    }
};

const waiting = (timer) => {
    return new Promise((resolve) => setTimeout(resolve, timer));
};

const getSubmissionResults = async (tokens, maxAttempts = 10, delayMs = 2000) => {
    for (let i = 0; i < maxAttempts; i++) {
        const result = await submitToken(tokens);
        
        // ✅ Check if result exists and has submissions
        if (result && result.submissions) {
            const allProcessed = result.submissions.every(sub => sub.status_id > 2);
            
            if (allProcessed) {
                // ✅ Always return submissions array
                return result.submissions;
            }
        }
        
        if (i < maxAttempts - 1) {
            await waiting(delayMs);
        }
    }
    // ✅ Return empty array instead of throwing error
    return [];
};

// Helper function to run single code
const runCode = async (code, language, stdin = "") => {
    const languageId = getLanguageById(language);
    if (!languageId) {
        throw new Error(`Invalid language: ${language}`);
    }
    
    const submissions = [{
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        expected_output: ""
    }];
    
    const batchResult = await submitBatch(submissions);
    const tokens = batchResult.map(r => r.token);
    const results = await getSubmissionResults(tokens);
    
    return results[0];
};

// Helper function to validate solution with test cases
const validateSolution = async (language, code, testCases) => {
    const languageId = getLanguageById(language);
    if (!languageId) {
        throw new Error(`Invalid language: ${language}`);
    }
    
    const submissions = testCases.map(tc => ({
        source_code: code,
        language_id: languageId,
        stdin: tc.input || "",
        expected_output: tc.output || ""
    }));
    
    const batchResult = await submitBatch(submissions);
    const tokens = batchResult.map(r => r.token);
    const results = await getSubmissionResults(tokens);
    
    return results;
};

module.exports = { 
    getLanguageById, 
    submitBatch, 
    submitToken,
    getSubmissionResults,
    runCode,
    validateSolution
};