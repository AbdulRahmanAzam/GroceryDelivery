import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";


// Place Order COD: /api/order/cod
export const placOrderCOD = async (req, res) => {
    try {
        const {userId, items, address} = req.body;
        if(!address || items.length === 0){
            return res.status(400).json({success:false, message: "All fields are required"});
        }

        // calculate amount using items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + (product.offerPrice * item.quantity);
        }, 0);

        // add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({userId, items, amount, address, paymentType: "COD"});
        res.status(201).json({success:true, message: "Order placed successfully"});

    } catch (error) {
        return res.status(500).json({success:false, message: "Place Order: ", error: error.message});
    }
};

// Place Order Stripe : /api/order/stripe
export const placOrderStripe = async (req, res) => {
    try {
        const {userId, items, address} = req.body;
        const { origin } = req.headers;

        if(!address || items.length === 0){
            return res.status(400).json({success:false, message: "All fields are required"});
        }

        let productData = [];

        // calculate amount using items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);

            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            });
            return (await acc) + (product.offerPrice * item.quantity);
        }, 0);

        // add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        const order = await Order.create({userId, items, amount, address, paymentType: "Online"});

        // Stripe Gateway Initialize
        const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

        // create line items for stripe
        const line_items = productData.map(item => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100, // add tax (2%) and convert to cents
                },
                quantity: item.quantity,
            }
        })

        // creat stripe session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        res.status(201).json({success:true, url: session.url});
    } catch (error) {
        return res.status(500).json({success:false, message: "Place Order: ", error: error.message});
    }
};

// stripe webhook to verify payment actions : /stripe
export const stripeWebhook = async (req, res) => {
    // stripe gateway initialize
    const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error) {
        console.log("Stripe Webhook Error: ", error);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    switch(event.type){
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            })

            const {orderId, userId } = session.data[0].metadata;
            // Mark payment as paid
            await Order.findByIdAndUpdate(orderId, {isPaid: true});
            // clear user cart
            await User.findByIdAndUpdate(userId, {cartItems: []});

            console.log("Payment Succeeded");
            break;
        }
        case "payment_intent.payment_failed":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            })

            const {orderId} = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            console.log("Payment Failed and Order Deleted");
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
            break;
    }

    response.json({received: true});
}


// Get Orders by User Id: /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});

        res.json({success:true, orders});
    } catch (error) {
        console.log("Get User Orders: ", error);
        return res.status(500).json({success:false, message: "Get User Orders: ", error: error.message});
    }
};

// Get All Orders (for seller/ Admin): /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});

        res.json({success:true, orders});
    } catch (error) {
        console.log("Get All Orders: ", error);
        return res.status(500).json({success:false, message: "Get All Orders: ", error: error.message});
    }
}