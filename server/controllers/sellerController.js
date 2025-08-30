import jwt from 'jsonwebtoken';

// Login Seller : api/seller/login

export const sellerLogin = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(email !== process.env.SELLER_EMAIL || password !== process.env.SELLER_PASSWORD){
            return res.json({success: false, message: "Invalid credentials"})
        }

        const sellerToken = jwt.sign({email, password}, process.env.JWT_SECRET_TOKEN, {expiresIn: "1h"})
        res.cookie('sellerToken', sellerToken, {
            httpOnly: true, // prevent javascript to access cookie
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
            maxAge: 1000 * 60 * 60 // 1 hour
        })

        return res.json({success: true, message: "Seller logged in successfully"})
    } catch (error) {
        console.log("sellerLogin" + error.message);
        return res.json({success: false, message: "Internal server error"})
    }
}

// Seller Is Authenticated /api/seller/auth
export const isSellerAuth = async (req,res) => {
    try {
        
        return res.json({success: true});
    } catch (error) {
        console.log("isSellerAuth" + error.message);
        return res.json({success: false, message: "Internal server error"})
    }
}


// Seller Logout /api/seller/logout
export const sellerLogout = async (req, res) => {
    try {

        res.cookie('sellerToken', '', {
            httpOnly: true, // prevent javascript to access cookie
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
            maxAge: 1000 * 60 * 60 // 1 hour
        })

        return res.json({success: true, message: "Seller logged out successfully"})
    } catch (error) {
        console.log("sellerLogout" + error.message);
        return res.json({success: false, message: error.message})
    }
}