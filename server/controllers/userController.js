import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// Register User: /api/user/register
export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body

        if(!name || !email || !password){
            return res.json({success: false, message: "All fields are required"})
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({success: false, message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({name, email, password: hashedPassword})

        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET_TOKEN, {expiresIn: "1h"})

        res.cookie('token', token, {
            httpOnly: true, // prevent javascript to access cookie
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
            maxAge: 1000 * 60 * 60 // 1 hour
        })

        return res.json({success: true, message: "User registered successfully", user: {email: newUser.email, name: newUser.name}})
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: "Internal server error"})
    }
}


// LOGIN USER
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || ! password)
            return res.json({success: false, message: "All fields are required"});


        const existedUser = await User.findOne({email});

        const isMatch = await bcrypt.compare(password, existedUser.password)
        if(!isMatch || !existedUser)  // both in one so that no one knows either email is wrong or password
            return res.json({success: false, message: "Invalid email or password"});


        const token = jwt.sign({id: existedUser._id}, process.env.JWT_SECRET_TOKEN, {expiresIn: "1h"})

        res.cookie('token', token, {
            httpOnly: true, // prevent javascript to access cookie
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
            maxAge: 1000 * 60 * 60 // 1 hour
        })

        return res.json({success: true, message: "User logged in successfully", user: {email: existedUser.email, name: existedUser.name}})

    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: "Internal server error"})
    }
}