import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// ✅ Create Razorpay Order — No DB save yet
const placeOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "order_rcptid_" + Math.random().toString(36).substring(2),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error creating Razorpay order" });
  }
};

// ✅ Save Order only after payment success
const verifyOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    items,
    amount,
    address, // This should be an object now
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      const newOrder = new orderModel({
        userId,
        items,
        amount,
        address, // 👈 correctly saved as object
        payment: true,
      });

      await newOrder.save();
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      res.json({ success: true, message: "Payment Verified & Order Placed" });
    } catch (err) {
      console.error("DB Save Error:", err);
      res.status(500).json({ success: false, message: "Failed to save order" });
    }
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature. Order not saved." });
  }
};

// ✅ Get orders for a user
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching user orders" });
  }
};

// ✅ List all orders (Admin)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching orders" });
  }
};


// api for updating order status

const updateStatus= async(req,res)=>{
try{
await orderModel.findByIdAndUpdate(req.body.orderId,{status: req.body.status})
res.json({success: true, message: "Status Updated"})
}
catch(error){
console.log(error);
res.json({success: false, message: "Error"})
}
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
