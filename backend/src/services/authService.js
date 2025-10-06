import User from "../models/User";


export const signup = data => User.create(data);

