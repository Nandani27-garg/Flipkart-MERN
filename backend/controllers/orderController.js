const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');

// Create New Order
exports.newOrder = asyncErrorHandler(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, totalPrice } = req.body;

    if (!shippingInfo || !Array.isArray(orderItems) || !orderItems.length || !paymentInfo || !paymentInfo.id) {
        return next(new ErrorHandler("Incomplete order information", 400));
    }

    const orderExist = await Order.findOne({ "paymentInfo.id": paymentInfo.id });
    if (orderExist) {
        return next(new ErrorHandler("Order Already Placed", 400));
    }

    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) return next(new ErrorHandler("A product in your cart no longer exists", 404));
        if (product.stock < item.quantity) {
            return next(new ErrorHandler(`${product.name} is out of stock for the requested quantity`, 400));
        }
    }

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    try {
        await sendEmail({
            email: req.user.email,
            templateId: process.env.SENDGRID_ORDER_TEMPLATEID,
            data: {
                name: req.user.name,
                shippingInfo,
                orderItems,
                totalPrice,
                oid: order._id,
            }
        });
    } catch (emailError) {
        console.error("Order email failed:", emailError.message);
    }

    res.status(201).json({ success: true, order });
});

// Get Single Order Details
exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) return next(new ErrorHandler("Order Not Found", 404));

    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        return next(new ErrorHandler("You are not authorized to view this order", 403));
    }

    res.status(200).json({ success: true, order });
});

// Get Logged In User Orders
exports.myOrders = asyncErrorHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
});

// Get All Orders --- ADMIN
exports.getAllOrders = asyncErrorHandler(async (req, res) => {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    const totalAmount = orders.reduce((total, order) => total + order.totalPrice, 0);

    res.status(200).json({ success: true, orders, totalAmount });
});

// Update Order Status --- ADMIN
exports.updateOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Order Not Found", 404));

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Already Delivered", 400));
    }

    const allowedStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(req.body.status)) {
        return next(new ErrorHandler("Invalid order status", 400));
    }

    if (req.body.status === "Shipped" && order.orderStatus !== "Shipped") {
        for (const item of order.orderItems) {
            await updateStock(item.product, item.quantity);
        }
        order.shippedAt = Date.now();
    }

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") order.deliveredAt = Date.now();

    await order.save({ validateBeforeSave: false });
    res.status(200).json({ success: true });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    if (!product) throw new Error("Product no longer exists");
    if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
}

// Delete Order --- ADMIN
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Order Not Found", 404));

    await order.deleteOne();
    res.status(200).json({ success: true });
});
