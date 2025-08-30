
import jwt from "jsonwebtoken"
import User from "../models/User.js";

export const authUser = async (req, res, next) => {
    const {token} = req.cookies;

    if(!token)
        return res.json({success: false, message: "Unauthorized access"})

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        if(tokenDecode.id){
            if(!req.body) req.body = {};
            req.body.userId = tokenDecode.id;
        }else{
            return res.json({success: false, message: "Unauthorized access"})
        }

        next();
    } catch (error) {
        console.log("authUser " + error.message)
        return res.json({success: false, message: error.message})
    }
}


// Check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        const {userId} = req.body;
        const user = await User.findById(userId).select('-password');
        return res.json({success: true, user})
    } catch (error) {
        console.log("isAuth" + error.message)
        return res.json({success: false, message: error.message})
    }
}

// Logout user " /api/user/logout"
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
        })

        return res.json({success: true, message: "User logged out successfully"})

    } catch (error) {
        console.log("logout" + error.message)
        return res.json({success: false, message: error.message})
    }
}