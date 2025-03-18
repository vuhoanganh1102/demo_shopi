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
import ggCloudRouter from "./gg_cloud/ggCloud.routes.js";
import { google } from "googleapis";
import * as crypto from "crypto";
import session from "express-session";
import { saveInforUserToDB } from "./gg_cloud/ggCloudService.service.js";
import ggCloudRouters from "./gg_cloud/ggCloud.routes.js";
// @ts-ignore
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const sessionSecret = process.env.SESSION_SECRET;
const merchantCenterId = process.env.MECHANT_CENTER_ID;
dotenv.config();

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
  clientID,
  clientSecret,
  "https://attract-lay-compatibility-municipal.trycloudflare.com/api/google/callback"
);

// Access scopes for two non-Sign-In scopes: Read-only Drive activity and Google Calendar.
const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile", // Thông tin cá nhân chi tiết
  "https://www.googleapis.com/auth/userinfo.email", // Email chi tiết
  "https://www.googleapis.com/auth/content", // Quyền quản lý Google Merchant Center
];

// Generate a secure random state value.
const state = crypto.randomBytes(32).toString("hex");
// Store state in the session
// req.session.state = state;

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
// Cấu hình session
app.use(
  session({
    secret: "default-secret", // Thay thế 'your-secret-key' bằng chuỗi bảo mật của bạn
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Đặt `secure: true` nếu dùng HTTPS
  })
);
// @ts-ignore
// @ts-ignore
app.use(cors());
// @ts-ignore
app.use(express.json());
// Set up Shopify authentication and webhook handling
// @ts-ignore
// Route callback từ Google
let userCredential;
app.get(
  "/api/google/callback",
  // passport.authenticate("google", { failureRedirect: "/" }),
  // @ts-ignore
  async (req, res) => {
    const q = req.query;
    console.log(q.state);
    console.log(req.session);
    // @ts-ignore
    const [state, shopifyName] = q.state.split("|"); // Tách state và shopify_name

    // if (!state || !shopifyName) {
    //   console.log("Invalid state format");
    //   return res.status(403).send("Invalid state format");
    // }
    if (q.error) {
      // An error response e.g. error=access_denied
      console.log("Error:" + q.error);
    } else if (!state || !shopifyName) {
      //check state value
      console.log("State mismatch. Possible CSRF attack");
      res.end("State mismatch. Possible CSRF attack");
    } else {
      console.log(q);
      // Get access and refresh tokens (if access_type is offline)
      // @ts-ignore
      let { tokens } = await oauth2Client.getToken(q.code);
      oauth2Client.setCredentials(tokens);
      console.log(tokens);
      /** Save credential to the global variable in case access token was refreshed.
       * ACTION ITEM: In a production app, you likely want to save the refresh token
       *              in a secure persistent database instead. */
      userCredential = tokens;

      // User authorized the request. Now, check which scopes were granted.
      if (tokens.scope.includes("https://www.googleapis.com/auth/content")) {
        // User authorized read-only Drive activity permission.
        // Example of using Google Drive API to list filenames in user's Drive.
        // insertProductsToMerchantCenter(m);
        console.log("yes");
        // try {
        //   const url = `https://shoppingcontent.googleapis.com/content/v2.1/${merchantCenterId}/products`;

        //   const response = await fetch(url, {
        //     method: "GET", // Hoặc 'POST' nếu cần gửi dữ liệu
        //     headers: {
        //       Authorization: `Bearer ${tokens.access_token}`, // Gửi token trong header
        //       "Content-Type": "application/json", // Đảm bảo đúng định dạng dữ liệu
        //     },
        //   });

        //   const data = await response.json();
        //   console.log("Products:", data);
        //   return data;
        // } catch (error) {
        //   console.error("API call error:", error);
        // }
      }
      if (
        tokens.scope.includes(
          "https://www.googleapis.com/auth/userinfo.profile"
        ) &&
        tokens.scope.includes("https://www.googleapis.com/auth/userinfo.email")
      ) {
        // console.log("check", shopifyName);
        // @ts-ignore
        saveInforUserToDB(tokens.access_token, shopifyName);
      }
      return res.send(`<div>Successfull</div>`);
      // res.send("<script>window.close();</script>");
      // Check if user authorized Calendar read permission.
      // if (
      //   tokens.scope.includes(
      //     "https://www.googleapis.com/auth/calendar.readonly"
      //   )
      // ) {
      //   // User authorized Calendar read permission.
      //   // Calling the APIs, etc.
      // } else {
      //   // User didn't authorize Calendar read permission.
      //   // Update UX and application accordingly
      // }
    }
  }
);
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
app.use("/api/gg-route", ggCloudRouters);
// @ts-ignore
app.get("/api/google", (req, res) => {
  // req.session["state"] = state;
  const shopifyName = res.locals.shopify.session.shop;
  // Mã hóa shopifyName vào state hoặc thêm query parameter riêng
  const encodedState = `${state}|${shopifyName}`; // Kết hợp state và shopify_name
  // Generate a url that asks permissions for the Drive activity and Google Calendar scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    /** Pass in the scopes array defined above.
     * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
    // Include the state parameter to reduce the risk of CSRF attacks.
    state: encodedState,
  });
  return res.json(authorizationUrl);
});
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
