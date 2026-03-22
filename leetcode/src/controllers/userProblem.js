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

const updateProblem  = async(req,res)=>{
  const {id} =  req.params
 const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator
    } = req.body;
  try{
    // frontend sa data ayaga uska check kro shai h ya nhi

    if(!id){
        return res.status(400).send("Invalid id")
      }

      const DsaProblem = await Problem.findById(id)
      if(!DsaProblem){
        return res.status(404).send("Id not present")
      }
    for(const{language,completeCode} of referenceSolution){

        const languageId = getLanguageById(language);
          
       
        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value)=> value.token);


       const testResult = await submitToken(resultToken);


       for(const test of testResult){
        if(test.status_id!=3){
         return res.status(400).send(test.status_id);
        }
       }

      }

      const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true}) // update ma validator by default nhi chalata isliya true kiya
      // new document retrun kardena --> new:true
      res.status(200).send(newProblem)

  }
  catch(err){
    res.status(404).send("Error : " +err)

  }

}

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