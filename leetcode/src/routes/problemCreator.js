// create a problem
//fetch problem
//update
//delete

const express = require("express")
const problem = require("../controllers/models/problem")
const adminMiddleware = require("../middleware/adminMiddleware")
const userMiddleware =  require("../middleware/userMiddleware")
const {createProblem, updateProblem,deleteProblem, getProblemById ,getAllProblem,solvedAllProblemByUser,submittedProblem} = require("../controllers/userProblem")
const problemRouter = express.Router()
// need admin access
problemRouter.post("/create",adminMiddleware,createProblem)
problemRouter.put("/update/:id",adminMiddleware, updateProblem)
problemRouter.delete("/delete/:id",adminMiddleware, deleteProblem)


// no need of admin access
problemRouter.get("/problemById/:id",adminMiddleware, getProblemById)  // fetch particular problem
// should we send all info to user related to problem
problemRouter.get("/getAllProblem",userMiddleware, getAllProblem)  // fetch all problems
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblemByUser) 
problemRouter.get("/submittedProblem/:id" , userMiddleware ,submittedProblem )
module.exports = problemRouter

// how to get all submission for a particular problem solved by user
// userId , problemid send fetch from submission no indexing fro them
// if there are 20crore submission on leetcode it takes time to find userid and problem
//if there is indexing searching will be easy
// by default id is present are object id , field marked with unique:true
// now we can create index ->>> compound index->> combination of userId and problemid
// to make index of any field marks index:true in schema
//not make all fields index as it takes extra memory
// the query which used many time ->> make them index
// like we are using userid and problemId many time

//C0de#Master!