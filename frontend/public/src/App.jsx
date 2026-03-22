import {  Routes, Route,Navigate } from "react-router";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import Login from "./pages/login";
import {checkAuth} from "./authSlice"
import { useDispatch ,useSelector} from "react-redux";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import Admin from "./pages/Admin";
import ProblemPage from "./pages/ProblemPage";
import AdminDelete from "./components/AdminDelete";
import AdminVideo from "./components/AdminVideo";
import AdminUpload from "./components/AdminUpload";

function App(){
  // check if user is authenticated or not if it is authencated then move directly to homepage
  const{isAuthenticated,user,loading}= useSelector((state)=> state.auth)
  const dispatch = useDispatch();


  useEffect(()=>{
    dispatch(checkAuth())

  },[dispatch])

  if(loading){
    return(
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
    )
  }


  return(
    <>
    <Routes>
          <Route path="/" element={isAuthenticated ?<Homepage></Homepage>:<Navigate to="/signup" />}></Route>
          <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
          <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route>
          <Route path="/admin" element= {<Admin/>}></Route>
          <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
             <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
          <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
           <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />

    </Routes>
    </>
  )
}

export default App;