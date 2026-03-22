import axios from "axios"
const axiosClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials : true, // inform browser to attch cookie with it
  headers: {'Content-Type': 'application/json'}
});

export default axiosClient


// ya banana sa hame baar baar req karte time url nhi dena padega