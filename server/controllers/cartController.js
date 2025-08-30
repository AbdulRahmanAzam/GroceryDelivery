
import User from "../models/User.js";

// update user cart data : api/cart/update
export const updateCart = async (req, res) => {
    try {
        const {userId, cartItems} = req.body;
        await User.findByIdAndUpdate(userId, {cartItems: cartItems});
        res.json({success:true, message: "Cart updated"});
    } catch (error) {
        console.log('Update Cart: ',error.message);
        res.json({success:false, message: "Cart update failed"});
    }
}