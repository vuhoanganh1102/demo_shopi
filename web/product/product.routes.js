import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getDbFromShopifyToDB,
  deleteItemsCheckBox,
} from "./product.service.js";

const ProductRouters = express.Router();

// Lấy danh sách sản phẩm
ProductRouters.get("/", async (req, res) => {
  try {
    // Lấy page và limit từ query parameters, nếu không có thì dùng giá trị mặc định
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const keyword = req.query.searchKeyword;
    // Gọi service với các tham số phân trang
    const result = await getAllProducts(page, limit, keyword);

    // Xử lý dữ liệu images như trước
    result.products.forEach((element) => {
      element.images = element.images ? JSON.parse(element.images) : [];
      if (element.images[0]?.id === null) element.images = [];
    });

    // Trả về response với dữ liệu phân trang
    return res.json({
      data: result.products,
      pagination: {
        total: result.total,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        limit: limit,
      },
    });
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

// synced products
ProductRouters.put("/sync-products", async (req, res) => {
  const session = res.locals.shopify.session;
  console.log(session);
  // Mảng sản phẩm từ request
  try {
    // if (Object.keys(products).length === 0) {
    //   return res.status(400).json({ error: "No fields provided for update" });
    // }

    const synceddProducts = await getDbFromShopifyToDB(session);
    return res.json(synceddProducts);
  } catch (error) {
    res.status(500).json({ error: "Error updating product" });
  }
});

// synced products
ProductRouters.put("/delete-items-check-box", async (req, res) => {
  const session = res.locals.shopify.session;
  const productIds = req.body;
  console.log(productIds);
  // Mảng sản phẩm từ request
  try {
    // if (Object.keys(products).length === 0) {
    //   return res.status(400).json({ error: "No fields provided for update" });
    // }

    const synceddProducts = await deleteItemsCheckBox(session, productIds);
    return res.json(synceddProducts);
  } catch (error) {
    res.status(500).json({ error: "Error updating product" });
  }
});

export default ProductRouters;
