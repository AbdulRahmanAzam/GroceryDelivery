import express from "express";
import { uploadImages } from "../configs/multer.js";
import authSeller from "../middlewares/authSeller.js";
import { addProduct, changeStock, productDetails, productList } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/add", uploadImages, authSeller, addProduct);
productRouter.get("/list", productList);
productRouter.get("/id", productDetails);
productRouter.post("/stock", authSeller, changeStock);

export default productRouter;