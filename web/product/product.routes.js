import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./product.service.js";

const ProductRouters = express.Router();

// Lấy danh sách sản phẩm
ProductRouters.get("/", async (req, res) => {
  try {
    const productsRaw = await getAllProducts();

    // const products = JSON.parse(productsRaw);
    productsRaw.forEach((element) => {
      element.images = JSON.parse(element.images);
      if (element.images[0].id === null) element.images = [];
    });
    return res.json(productsRaw);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Lấy sản phẩm theo ID
ProductRouters.get("/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (product) {
      product.images = JSON.parse(product.images);
      product.variants = JSON.parse(product.variants);
      if (product.images[0].id === null) product.images = [];
      return res.json(product);
    } else res.status(404).json({ error: "Product not found" });
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
});

// Thêm sản phẩm mới
ProductRouters.post("/", async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock)
      return res.status(400).json({ error: "Missing required fields" });

    const newProduct = await createProduct(name, price, stock);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Error creating product" });
  }
});

// Cập nhật sản phẩm (PATCH)
ProductRouters.patch("/:id", async (req, res) => {
  // console.log(req.body);
  // console.log(req.params.id);
  // const updatedProduct = await updateProduct(req.params.id, req.body);
  // return updatedProduct;
  try {
    console.log(req.body);
    const updateFields = req.body; // Chỉ nhận các trường cần cập nhật
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }
    console.log(req.body);
    const session = res.locals.shopify.session;
    const updatedProduct = await updateProduct(
      req.params.id,
      updateFields,
      session
    );
    return res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "Error updating product" });
  }
});

// Xóa sản phẩm
ProductRouters.delete("/:id", async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
});

export default ProductRouters;
