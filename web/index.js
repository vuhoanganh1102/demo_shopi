// @ts-check
// @ts-ignore
import { join } from "path";
// @ts-ignore
import { readFileSync } from "fs";
// @ts-ignore
import express from "express";
// @ts-ignore
import serveStatic from "serve-static";
import dotenv from "dotenv";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import dbMySQL from "./config/db.js";
import cors from "cors";
import ProductRouters from "./product/product.routes.js";
dotenv.config();
// @ts-ignore
const PORT = parseInt(
  // @ts-ignore
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  // @ts-ignore
  process.env.NODE_ENV === "production"
    ? // @ts-ignore
      `${process.cwd()}/frontend/dist`
    : // @ts-ignore
      `${process.cwd()}/frontend/`;

const app = express();
// @ts-ignore
// @ts-ignore
app.use(cors());
// Set up Shopify authentication and webhook handling
// @ts-ignore
app.get(shopify.config.auth.path, shopify.auth.begin());
// @ts-ignore
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
// @ts-ignore
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

// @ts-ignore
app.use("/api/*", shopify.validateAuthenticatedSession());

// @ts-ignore
app.use(express.json());

// @ts-ignore
app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

// @ts-ignore
app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

// @ts-ignore
app.get("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    const [rows] = await dbMySQL.query("SELECT * FROM products");
    return res.json(rows);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});
// @ts-ignore
app.use("/api/product", ProductRouters);
// @ts-ignore
app.use(shopify.cspHeaders());
// @ts-ignore
app.use(serveStatic(STATIC_PATH, { index: false }));

// @ts-ignore
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        // @ts-ignore
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

dbMySQL
  .getConnection()
  .then((connection) => {
    console.log("✅ MySQL Database connected successfully!");
    connection.release(); // Giải phóng kết nối

    // Chạy server sau khi kết nối thành công
    // @ts-ignore
    const PORT = process.env.PORT || 5000;
    // @ts-ignore
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MySQL Connection Failed:", error.message);
    // @ts-ignore
    process.exit(1); // Dừng server nếu không kết nối được MySQL
  });
