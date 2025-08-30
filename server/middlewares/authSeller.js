import jwt from "jsonwebtoken"

const authSeller = async (req, res, next) => {
    const {sellerToken} = req.cookies;
    if(!sellerToken)
        return res.json({success: false, message: "Unauthorized access"})

    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET_TOKEN)
        if(tokenDecode.email === process.env.SELLER_EMAIL && tokenDecode.password === process.env.SELLER_PASSWORD){
            next();
        } else {
            return res.json({success: false, message: "Unauthorized access"})
        }
    } catch (error) {
        console.log("authSeller" + error.message);
        return res.json({success: false, message: "Unauthorized access"})
    }
}

export default authSeller;