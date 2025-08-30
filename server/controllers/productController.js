import {v2 as cloudinary} from "cloudinary";
import Product from "../models/Product.js";

// add Product /api/product/add
export const addProduct = async (req, res) => {
    try {
        let productData = JSON.parse(req.body.productData);
        const images = req.files;

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path,
                {resource_type: 'image'});

                return result.secure_url;
            })
        )

        await Product.create({...productData, image: imagesUrl});
        res.status(201).json({success:true, message: "Product added successfully"});
    } catch (error) {
        console.log("Add Product: ", error);
        res.status(500).json({success:false, message: "Product added failed"});
    }
}


// get product /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({success:true, products})
    } catch (error) {
        console.log("Product List: ", error);
        res.status(500).json({success:false, message: "Product list failed"});
    }
}

// GET SINGLE PRODUCT /api/product/:id
export const productDetails = async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        res.json({success:true, product})
    } catch (error) {
        console.log("Product Details: ", error);
        res.status(500).json({success:false, message: "Product details failed"});
    }
}


// CHANGE PRODUCT INSTOCK /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const {id, inStock} = req.body;
        await Product.findByIdAndUpdate(id, {inStock});
        res.json({success:true, message: "Product stock updated"});
    } catch (error) {
        console.log("Change Stock: ", error);
        res.status(500).json({success:false, message: "Product stock update failed"});
    }
}