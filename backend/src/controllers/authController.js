import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as authService from "../services/authService.js"


const {JWT_SECRET} = process.env;


const signup = async(req, res) => {
    const {email, password} = req.body;

    const hashPass = await bcrypt.hash(password, 10)

    const newUser = await authService.signup(req.body);

    res.status(201).json({
        username: newUser.username,
        email: newUser.email,
    })
}

const signin = async(req, res) => {
    const {email, password} = req.body;

    const {_id:id} = user;

    const payload = {
        id
    }

    const token = jwt.sign(payload, JWT_SECRET, {expiresIn:"23h"});


    res.json({
        token,
    })
}

export default {
    signup,
    signin,
}