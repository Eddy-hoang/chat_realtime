import express from 'express';
import { signIn, signUp, sigOut } from "../controller/authController.js";


const route =  express.Router();

route.post("/signup", signUp);

route.post("/signin", signIn); 

route.post("/sigout", sigOut);

export default route;