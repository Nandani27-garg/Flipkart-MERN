const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');

// Get All Products
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
    const resultPerPage = Math.min(Number(req.query.limit) || 12, 48);
    const productsCount = await Product.countDocuments();

    const searchFeature = new SearchFeatures(Product.find(), req.query)
        .search()
        .filter()
        .sort();

    let products = await searchFeature.query.clone();
    const filteredProductsCount = products.length;

    searchFeature.pagination(resultPerPage);
    products = await searchFeature.query.clone();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

// Get All Products --- Product Sliders
exports.getProducts = asyncErrorHandler(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 }).limit(24);
    res.status(200).json({ success: true, products });
});

// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({ success: true, product });
});

// Get All Products --- ADMIN
exports.getAdminProducts = asyncErrorHandler(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
});

// Create Product --- ADMIN
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    let images = req.body.images || [];
    if (typeof images === "string") images = [images];

    if (!images.length) {
        return next(new ErrorHandler("Please upload at least one product image", 400));
    }

    if (!req.body.logo) {
        return next(new ErrorHandler("Please upload a brand logo", 400));
    }

    const imagesLink = [];
    for (const image of images) {
        const result = await cloudinary.v2.uploader.upload(image, { folder: "products" });
        imagesLink.push({ public_id: result.public_id, url: result.secure_url });
    }

    const result = await cloudinary.v2.uploader.upload(req.body.logo, { folder: "brands" });

    req.body.brand = {
        name: req.body.brandname,
        logo: { public_id: result.public_id, url: result.secure_url }
    };
    req.body.images = imagesLink;
    req.body.user = req.user.id;

    let specifications = req.body.specifications || [];
    if (!Array.isArray(specifications)) specifications = [specifications];
    req.body.specifications = specifications
        .filter(Boolean)
        .map((s) => typeof s === "string" ? JSON.parse(s) : s);

    const product = await Product.create(req.body);

    res.status(201).json({ success: true, product });
});

// Update Product --- ADMIN
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    if (req.body.images !== undefined) {
        let images = req.body.images;
        if (typeof images === "string") images = [images];
        if (!Array.isArray(images) || !images.length) {
            return next(new ErrorHandler("Please keep at least one product image", 400));
        }

        for (const image of product.images) {
            if (image.public_id) await cloudinary.v2.uploader.destroy(image.public_id);
        }

        const imagesLink = [];
        for (const image of images) {
            const result = await cloudinary.v2.uploader.upload(image, { folder: "products" });
            imagesLink.push({ public_id: result.public_id, url: result.secure_url });
        }
        req.body.images = imagesLink;
    }

    if (req.body.logo) {
        if (product.brand?.logo?.public_id) {
            await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
        }

        const result = await cloudinary.v2.uploader.upload(req.body.logo, { folder: "brands" });
        req.body.brand = {
            name: req.body.brandname || product.brand.name,
            logo: { public_id: result.public_id, url: result.secure_url }
        };
    } else if (req.body.brandname) {
        req.body.brand = { ...product.brand.toObject(), name: req.body.brandname };
    }

    if (req.body.specifications !== undefined) {
        let specifications = req.body.specifications;
        if (!Array.isArray(specifications)) specifications = [specifications];
        req.body.specifications = specifications
            .filter(Boolean)
            .map((s) => typeof s === "string" ? JSON.parse(s) : s);
    }

    req.body.user = req.user.id;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, product });
});

// Delete Product --- ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    for (const image of product.images) {
        if (image.public_id) await cloudinary.v2.uploader.destroy(image.public_id);
    }

    if (product.brand?.logo?.public_id) {
        await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
    }

    await product.deleteOne();
    res.status(200).json({ success: true });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    if (!rating || !comment?.trim()) {
        return next(new ErrorHandler("Rating and review are required", 400));
    }

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment: comment.trim(),
    };

    const existingReview = product.reviews.find(
        (item) => item.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
        existingReview.rating = review.rating;
        existingReview.comment = review.comment;
    } else {
        product.reviews.push(review);
    }

    product.numOfReviews = product.reviews.length;
    product.ratings = product.reviews.length
        ? product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length
        : 0;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({ success: true });
});

// Get All Reviews of Product
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    res.status(200).json({ success: true, reviews: product.reviews });
});

// Delete Reviews
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    const reviews = product.reviews.filter(
        (review) => review._id.toString() !== req.query.id.toString()
    );

    product.reviews = reviews;
    product.numOfReviews = reviews.length;
    product.ratings = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({ success: true });
});
