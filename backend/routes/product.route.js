const express = require("express");
const { createProduct, deleteProduct, getAllProducts, updateProduct } = require("../controllers/product.controller.js");

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;