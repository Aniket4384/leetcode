const {getLanguageById,submitBatch,submitToken, getSubmissionResults, validateSolution} = require("../utils/Problemutility");
const Problem = require("./models/problem");
const Submission = require("./models/submission");
const User = require("./models/user")
const solutionVideo = require("../controllers/models/solutionVideo");
const SolutionVideo = require("../controllers/models/solutionVideo");

const createProblem = async (req, res) => {
    console.log("📝 Creating problem...");
    const { title, description, difficulty, tags,
        visibleTestCases, hiddenTestCases, startCode,
        referenceSolution } = req.body;

    try {
        // Helper to clean test case (remove quotes and fix newlines)
        const cleanTestCase = (tc) => ({
            input: typeof tc.input === 'string' ? tc.input.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n') : String(tc.input || ""),
            output: typeof tc.output === 'string' ? tc.output.replace(/^["']|["']$/g, '').trim() : String(tc.output || ""),
            explanation: tc.explanation || ""
        });
        
        // Clean all test cases
        const cleanVisible = visibleTestCases?.map(cleanTestCase) || [];
        const cleanHidden = hiddenTestCases?.map(cleanTestCase) || [];
        
        if (cleanVisible.length === 0) {
            return res.status(400).json({ message: "At least one visible test case is required" });
        }
        
        // Store problem in DB directly (no validation)
        const userProblem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            visibleTestCases: cleanVisible,
            hiddenTestCases: cleanHidden,
            startCode,
            referenceSolution,
            problemCreator: req.result._id
        });
        
        console.log(`✅ Problem "${title}" created successfully!`);
        res.status(201).json({
            message: "Problem created successfully",
            problem: userProblem
        });
        
    } catch (err) {
        console.error("❌ Create Problem Error:", err);
        res.status(400).json({
            message: err.message || "Failed to create problem"
        });
    }
};

const updateProblem = async (req, res) => {
  console.log("route hit");
  const { id } = req.params;
  const { 
    title, description, difficulty, tags,
    visibleTestCases, hiddenTestCases, startCode,
    referenceSolution, problemCreator 
  } = req.body;
  
  try {
    // Check if id exists
    if (!id) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Check if problem exists
    const DsaProblem = await Problem.findById(id);
    if (!DsaProblem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Validate reference solutions with test cases
    if (referenceSolution && referenceSolution.length > 0 && visibleTestCases && visibleTestCases.length > 0) {
      console.log("Validating reference solutions...");
      
      for (const { language, completeCode } of referenceSolution) {
        const languageId = getLanguageById(language);
        
        if (!languageId) {
          return res.status(400).json({ error: `Invalid language: ${language}` });
        }

        try {
          // Create submissions for visible test cases
          const submissions = visibleTestCases.map((testcase) => ({
            source_code: completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
          }));

          console.log(`Submitting ${submissions.length} test cases for ${language}`);
          
          // Submit batch and get tokens
          const submitResult = await submitBatch(submissions);
          console.log("Submit result:", submitResult);
          
          if (!submitResult || !Array.isArray(submitResult)) {
            throw new Error("Invalid response from submitBatch");
          }
          
          const resultToken = submitResult.map((value) => value.token);
          console.log("Result tokens:", resultToken);
          
          // Wait for results to be ready
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Get test results - FIX: Make sure submitToken handles array of tokens
          let testResult;
          try {
            testResult = await submitToken(resultToken);
            console.log("Test results:", testResult);
          } catch (tokenError) {
            console.error("Error getting test results:", tokenError);
            throw new Error("Failed to retrieve test results");
          }
          
          // Check test results
          if (testResult && Array.isArray(testResult)) {
            for (const test of testResult) {
              if (test.status && test.status.id !== 3) {
                console.log(`Test failed for ${language}:`, test);
                return res.status(400).json({
                  error: `Reference solution for ${language} failed test cases`,
                  status: test.status.description || "Test failed",
                  details: test
                });
              }
            }
          } else {
            console.log("No test results or invalid format");
          }
          
        } catch (validationError) {
          console.error(`Validation error for ${language}:`, validationError);
          return res.status(400).json({
            error: `Failed to validate reference solution for ${language}`,
            details: validationError.message
          });
        }
      }
    }

    // Update the problem
    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        problemCreator
      },
      { runValidators: true, new: true }
    );
    
    console.log("Problem updated successfully");
    res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem: updatedProblem
    });
    
  } catch (err) {
    console.error("Error updating problem:", err);
    res.status(500).json({ 
      error: "Internal server error",
      message: err.message 
    });
  }
};
const deleteProblem = async(req,res)=>{
  const {id} = req.params;
  try{
    if(!id){
      return res.status(400).send("Invalid id")
    }

    const deletedProblem =await  Problem.findByIdAndDelete(id);  // if found return documnt that was deleted
    // if not found return null

    if(!deletedProblem){
      return res.status(404).send("problem is not found")
    }

    res.status(200).send("successfully deleted")

  }
  catch(err){
    res.status(500).send("Error :" +err)

  }

}

const getProblemById = async(req,res)=>{
  const {id} = req.params;
  try{
    if(!id){
      return res.status(400).send("Invalid id")
    }

    const getProblem =await  Problem.findById(id).select(' _id  title description difficulty tags visibleTestCases startCode ');
    // by default sab ko leke ayagga
    // select() allow to select accordingly

    
    if(!getProblem){
      return res.status(404).send("problem is not found")
    }

     const videos = await SolutionVideo.findOne({problemId:id})
     if(videos){
      const responseData = {
        ...getProblem.toObject(),
       secureUrl :videos.secureUrl,
      cloudinaryPublicId : videos.cloudinaryPublicId,
      thumbnailUrl : videos.thumbnailUrl,
      duration :videos.duration,
      }
       return res.status(200).send(responseData)
     }

      res.status(200).send(getProblem)

   

  }
  catch(err){
    res.status(500).send("Error :"+err)

  }

}

const getAllProblem = async(req,res)=>{
  try{
    const getProblem =await  Problem.find({}).select('_id title difficulty');  
    // getProblem->> array 
    // should we show all problems together->>no
    if(getProblem.length==0){
      return res.status(404).send("problem is not found")
    }

    res.status(200).send(getProblem)

  }
  catch(err){
    res.status(500).send("Error :"+err)

  }

}

const  solvedAllProblemByUser = async(req,res)=>{
  try{
    const userId = req.result._id
   const user =  await User.findById(userId).populate({path:"problemSolved", select: "_id title difficulty tags"})
   //populate()->> jisko ya(problemsolved) refer kar raha h uski info leke aao
    const count = req.result.problemSolved.length;
    res.status(200).send(user.problemSolved);
  }
  catch(err){
    res.status(500).send("Error"+err)
  }
}

const submittedProblem = async(req,res)=>{
  try{
    const userId = req.result._id;
    const problemId = req.params.id;
    const ans = await Submission.find({userId,problemId})

    if(ans.length==0){
      res.status(200).send("no submission is present")
    }

    res.status(200).send(ans)

  }
  catch(err){
     res.status(500).send("intenal server error")

  }

}

module.exports = {createProblem,updateProblem,deleteProblem,getProblemById, getAllProblem, solvedAllProblemByUser,submittedProblem};


// const submissions = [
//     {
//       "language_id": 46,
//       "source_code": "echo hello from Bash",
//       stdin:23,
//       expected_output:43,
//     },
//     {
//       "language_id": 123456789,
//       "source_code": "print(\"hello from Python\")"
//     },
//     {
//       "language_id": 72,
//       "source_code": ""
//     }
//   ]