import dbMySQL from "../config/db.js";

import { google } from "googleapis";
import shopify from "../shopify.js";

export const insertProductsToMerchantCenter = async () => {
  const connection = await dbMySQL.getConnection();
  try {
  } catch (error) {
    console.log(error);
  } finally {
    connection.release(); // Đừng quên release connection
  }
};

export const saveInforUserToDB = async (
  token,
  shop,
  refresh_token,
  expireIn
) => {
  const connection = await dbMySQL.getConnection();
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      }
    );

    // Kiểm tra nếu response là hợp lệ
    if (!response.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    const data = await response.json(); // Sử dụng .json() để lấy data từ response
    // console.log(data);
    // console.log(shop);
    // Sử dụng câu lệnh INSERT ... ON DUPLICATE KEY UPDATE
    const query = `
        INSERT INTO google_account_token (shop, id, name, picture, email, access_token, refresh_token, expire_in)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          id = VALUES(id),
          name = VALUES(name),
          picture = VALUES(picture),
          email = VALUES(email),
          access_token = VALUES(access_token),
          refresh_token = VALUES(refresh_token),
          expire_in = VALUES(expire_in);
      `;

    // Giá trị cho INSERT
    const values = [
      shop,
      data.sub,
      data.name,
      data.picture,
      data.email,
      token, // refresh_token nếu có thể để trống hoặc điền vào sau
      refresh_token || "",
      expireIn,
    ];

    // Thực thi câu lệnh query
    const [result] = await connection.query(query, values);

    console.log("Data inserted or updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error in saving or updating data:", error);
  } finally {
    connection.release(); // Giải phóng kết nối
  }
};

export const getInfor = async (session) => {
  const connection = await dbMySQL.getConnection();
  const shop = session.shop;
  try {
    const selectQuery = `
    SELECT name, picture, email FROM google_account_token WHERE shop = ?  LIMIT 1;
  `;
    const [result] = await connection.query(selectQuery, [shop]);
    return result[0];
  } catch (error) {
    console.log(error);
  } finally {
    connection.release(); // Đừng quên release connection
  }
};
const dataTest = {
  node: {
    id: "gid://shopify/Product/10102141419807",
    title: "tiktok tét",
    category: {
      id: "gid://shopify/TaxonomyCategory/el-4-8-5",
      fullName:
        "Electronics > Communications > Telephony > Mobile & Smart Phones",
    },
    createdAt: "2025-03-19T02:24:21Z",
    description: "đâsdas",
    descriptionHtml: "<p>đâsdas</p>",
    media: {
      edges: [
        {
          node: {
            id: "gid://shopify/MediaImage/53450774151455",
            mediaContentType: "IMAGE",
            status: "READY",
            originalSource: {
              url: "https://shopify-shop-assets.storage.googleapis.com/s/files/1/d/81eb/0916/8086/6591/files/download_1_1acbcb20-efea-487c-973b-0b05111d6d97.jpg?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=merchant-assets%40shopify-tiers.iam.gserviceaccount.com%2F20250319%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20250319T030458Z&X-Goog-Expires=300&X-Goog-SignedHeaders=host&X-Goog-Signature=0c2f3e56522177d1791fdfd37728873352c49aa08318083381d45f7c15801f828ae2698cdfb31d7cf8561824d823d27c1caa1cc51c46898b5875b96d41def5d6f806f4dba259b6c199f0ee9e722e506059ec2c5ef267505d608b460db99d469fe605dfff3e887b44194963cc351319f6930010d5027edc0a27988e76b106e30105934b9ae7634036740a04a52a976e2d0f5033662f2ce6fcbb718cf2aeb6e44eb6ae7f69a5c3fb5bbcc5814edcdf97e59e0737af9f0cb03dd14c8b2b1b19122072b9205d80d8df63f34a5e4152400332ae88214f90b46a04a88e5b20cb0ee7dfeab38e8474975d6413d5ddba3f7b029645f9cf78eb2c1a55b1343ec93733f00e",
            },
          },
        },
      ],
    },
    onlineStoreUrl: null,
    status: "ACTIVE",
    totalInventory: 0,
    options: [
      {
        name: "Title",
        values: ["Default Title"],
      },
    ],
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/50746503201055",
            price: "0",
            barcode: "",
            inventoryQuantity: 0,
            displayName: "tiktok tét - Default Title",
            title: "Default Title",
            taxCode: "",
            __typename: "ProductVariant",
            sku: "",
          },
        },
      ],
    },
    vendor: "initalStore",
    handle: "tiktok-tet",
  },
  cursor:
    "eyJsYXN0X2lkIjoxMDEwMjE0MTQxOTgwNywibGFzdF92YWx1ZSI6IjEwMTAyMTQxNDE5ODA3In0=",
};
export const syncDataWithGMC = async (session) => {
  const connection = await dbMySQL.getConnection();
  const client = new shopify.api.clients.Graphql({ session });
  try {
    await connection.beginTransaction();

    await connection.commit();
  } catch (err) {
    console.log(err);
  } finally {
    connection.release();
  }
};
export const parseShopifyProductToGMC = (
  shopifyProduct,
  shopDomain,
  language = "vi",
  country = "VN"
) => {
  const productNode = shopifyProduct;

  // Xác định availability dựa trên totalInventory
  const availability =
    productNode?.totalInventory > 0 ? "in stock" : "out of stock";

  // Tạo link nếu onlineStoreUrl là null
  const productLink =
    productNode?.onlineStoreUrl ||
    `https://${shopDomain}/products/${productNode?.handle}`;

  // Lấy URL ảnh đầu tiên (nếu có)
  const imageLink = productNode?.media.edges[0]?.node.originalSource.url || "";

  // Tạo object tương thích với GMC
  const gmcProduct = {
    offerId: productNode?.variants.edges[0].node.id.replace(
      "gid://shopify/ProductVariant/",
      ""
    ), // Loại bỏ prefix
    title: productNode.title,
    description: productNode.description,
    link: `${productLink}?country=${country}&currency=VND&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic`, // Thêm UTM tracking
    imageLink: imageLink,
    contentLanguage: language,
    targetCountry: country,
    channel: "online",
    availability: availability,
    price: {
      value: productNode.variants.edges[0].node.price,
      currency: "VND", // Có thể lấy từ config nếu cần
    },
    brand: productNode.vendor,
    googleProductCategory:
      productNode.category?.fullName ||
      "Food, Beverages & Tobacco > Food Items", // Fallback nếu không có category
    shippingWeight: {
      value: 0, // Giá trị mặc định, có thể thêm logic lấy từ Shopify nếu có
      unit: "kg",
    },
  };

  return gmcProduct;
};

export const getValidAuthClient = async (shop, envVar) => {
  const [rows] = await dbMySQL.query(
    "SELECT access_token, refresh_token, expire_in FROM google_account_token WHERE shop = ?",
    [shop]
  );
  const tokenData = rows[0];

  const authClient = new google.auth.OAuth2(
    envVar.clientID,
    envVar.clientSecret,
    envVar.redirectUrlGG
  );

  // Kiểm tra token còn hiệu lực không
  const now = new Date();

  // Set access_token hiện tại
  authClient.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null, // Có thể null nếu không có
  });
  console.log(new Date(Number(tokenData.expire_in)));
  if (new Date(Number(tokenData.expire_in)) > now) {
    // Set access_token hiện tại
    return authClient;
  } else if (tokenData.refresh_token) {
    // Token hết hạn, làm mới bằng refresh_token
    const { credentials } = await authClient.refreshAccessToken();
    const newAccessToken = credentials.access_token;
    const timestamp = new Date().getTime();
    // Cập nhật DB với token mới

    await dbMySQL.query(
      "UPDATE google_account_token SET access_token = ?, expire_in = ? WHERE shop = ?",
      [newAccessToken, `${timestamp + 3600 * 1000}`, shop] // Giả sử TTL là 1 giờ
    );
    console.log("tokenData");
    authClient.setCredentials({ access_token: newAccessToken });
    return authClient;
  } else {
    throw new Error("No valid refresh token available");
  }
};

// Sử dụng
export const insertProductToGMC = async (session, merchantCenterId, envVar) => {
  const authClient = await getValidAuthClient(session.shop, envVar);
  const content = await google.content({ version: "v2.1", auth: authClient });
  const productMcts = await fetchAndParseShopifyProducts(session, 100);
  console.log("o-tek");
  const result = [];
  if (productMcts?.length) {
    for (let i = 0; i < productMcts.length; i++) {
      for (let x = 0; x < productMcts[i].length; x++) {
        const respone = await content.products.insert({
          merchantId: merchantCenterId,
          requestBody: productMcts[i][x],
        });
        const data = respone?.data;
        result.push(data);
      }
    }
  }

  // const data = await content.products.list({ merchantId: merchantCenterId });
  // const url = `https://shoppingcontent.googleapis.com/content/v2.1/${merchantCenterId}/products`;

  // const respone = await fetch(url, {
  //   method: "GET",
  //   headers: {
  //     Authorization: `Bearer ${authClient}`,
  //     "Content-Type": "application/json",
  //   },

  //   // body: JSON.stringify(parseShopifyProductToGMC(dataTest.node, session.shop)),
  // });
  // const result = await respone?.data;
  console.log("true");

  return { successfull: result };
  //   const response = console.log("Product inserted:", response.data);
};

// Hàm lấy danh sách sản phẩm từ Shopify và parse sang GMC
export async function insertShopifyProductsToGMC(
  merchantCenterId,
  envVar,
  session,
  limit = 100
) {
  const connection = await dbMySQL.getConnection();
  const authClient = await getValidAuthClient(session.shop, envVar);
  const content = await google.content({ version: "v2.1", auth: authClient });
  const client = new shopify.api.clients.Graphql({ session });
  try {
    const query = `
      query {
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              category {
                id
                fullName
              }
              createdAt
              description
              descriptionHtml
              media(first: 100) {
                edges {
                  node {
                    id
                    mediaContentType
                    status
                    preview{
                      image{
                        id
                        url
                      }
                    }
                  }
                }
              }
              onlineStoreUrl
              status
              totalInventory
              options {
                name
                values
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    price
                    barcode
                    inventoryQuantity
                    displayName
                    title
                    taxCode
                    __typename
                    sku
                  }
                }
              }
              vendor
              handle
            }
            cursor
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;

    const response = await client.request(query);
    const checkIdQuery = `SELECT product_id AS productId, variant_id AS variantId from xipat_init.upsert_items_to_google
  WHERE shop = ? AND status = ? AND chanel = ? ;`;
    const updateCheckIdQuery = `UPDATE xipat_init.upsert_items_to_google SET status = 2 WHERE product_id = ? AND variant_id = ? AND chanel = 2 ;`;
    const checkIdQb = await connection.query(checkIdQuery, [
      session.shop,
      1,
      2,
    ]);
    const productCheckIds = [];
    const variantCheckIds = [];
    checkIdQb[0].forEach((e) => {
      productCheckIds.push(e.productId);
      variantCheckIds.push(e.variantId);
    });
    console.log(checkIdQb[0]);
    const products = response.data.products.edges.map((edge) => edge.node);
    const result = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      const productId = stringSplitId(product.id);
      if (productCheckIds.includes(productId)) {
        for (let y = 0; y < product.variants.edges.length; y++) {
          console.log("check");
          const variantEdge = product.variants.edges[y];
          const variantId = stringSplitId(variantEdge.node.id);
          if (variantCheckIds.includes(variantId)) {
            const toGMCdata = createMerchantCenterProduct(product, variantEdge);
            const respone = await content.products.insert({
              merchantId: merchantCenterId,
              requestBody: toGMCdata,
            });
            const data = respone?.data;
            result.push(data);
            await connection.query(updateCheckIdQuery, [productId, variantId]);
          }
        }
      }
    }
    // const products = newDatas.map((e) => e.node);
    // Parse tất cả sản phẩm sang định dạng GMC
    // const gmcProducts = [];
    // for (let i = 0; i < products.length; i++) {
    //   // if (products[i]?.variants)
    //   //   products[i].variants.edges.forEach((e) => {
    //   //     e.node;
    //   //   });
    //   gmcProducts.push(products)
    // }

    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
const newDatas = [
  {
    node: {
      id: "gid://shopify/Product/10102141419807",
      title: "tiktok tét",
      category: {
        id: "gid://shopify/TaxonomyCategory/el-4-8-5",
        fullName:
          "Electronics > Communications > Telephony > Mobile & Smart Phones",
      },
      createdAt: "2025-03-19T02:24:21Z",
      description: "đâsdas",
      descriptionHtml: "<p>đâsdas</p>",
      media: {
        edges: [
          {
            node: {
              id: "gid://shopify/MediaImage/53450774151455",
              mediaContentType: "IMAGE",
              status: "READY",
              preview: {
                image: {
                  id: "gid://shopify/ImageSource/53480744878367",
                  url: "https://cdn.shopify.com/s/files/1/0916/8086/6591/files/download_1_1acbcb20-efea-487c-973b-0b05111d6d97.jpg?v=1742351057",
                },
              },
            },
          },
        ],
      },
      onlineStoreUrl: null,
      status: "ACTIVE",
      totalInventory: 0,
      options: [
        {
          name: "Title",
          values: ["Default Title"],
        },
      ],
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/50746503201055",
              price: "0",
              barcode: "",
              inventoryQuantity: 0,
              displayName: "tiktok tét - Default Title",
              title: "Default Title",
              taxCode: "",
              __typename: "ProductVariant",
              sku: "",
            },
          },
        ],
      },
      vendor: "initalStore",
      handle: "tiktok-tet",
    },
    cursor:
      "eyJsYXN0X2lkIjoxMDEwMjE0MTQxOTgwNywibGFzdF92YWx1ZSI6IjEwMTAyMTQxNDE5ODA3In0=",
  },
];
function createMerchantCenterProduct(product, variantEdge) {
  const variant = variantEdge.node;
  const imageUrl = product.media.edges[0]?.node?.preview?.image?.url || "";
  const productId = stringSplitId(product.id);
  const variantId = stringSplitId(variant.id);

  return {
    kind: "content#product",
    id: `online:vi:VN:shopify_VN_${productId}_${variantId}`,
    offerId: `shopify_VN_${productId}_${variantId}`,
    title: `${
      variant.title === "Default Title"
        ? product.title
        : `${product.title} ${variant.title}`
    }`, // Use variant title here
    description: product.description || "",
    link:
      product.onlineStoreUrl ||
      `https://initalstore.myshopify.com/products/${product.handle}?variant=${variantId}&country=VN&currency=VND&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic`,
    imageLink: imageUrl,
    contentLanguage: "vi",
    targetCountry: "VN",
    feedLabel: "VN",
    channel: "online",
    availability: variant.inventoryQuantity ? "in stock" : "out of stock",
    brand: product.vendor,
    googleProductCategory: product?.category?.fullName || "Null Type", // This can be modified
    price: {
      value: variant.price || 10000, // Use variant price here
      currency: "VND",
    },
    sellOnGoogleQuantity: variant.inventoryQuantity,
    shippingWeight: {
      value: 1, // Modify if needed
      unit: "kg",
    },
  };
}
function createMerchantCenterProducts(shopifyProducts) {
  return shopifyProducts.map((product) => {
    return product.variants.edges.map((variantEdge) => {
      const variant = variantEdge.node;
      const imageUrl = product.media.edges[0]?.node?.preview?.image?.url || "";
      const productId = stringSplitId(product.id);
      const variantId = stringSplitId(variant.id);

      return {
        kind: "content#product",
        id: `online:vi:VN:shopify_VN_${productId}_${variantId}`,
        offerId: `shopify_VN_${productId}_${variantId}`,
        title: `${
          variant.title === "Default Title"
            ? product.title
            : `${product.title} ${variant.title}`
        }`, // Use variant title here
        description: product.description || "",
        link:
          product.onlineStoreUrl ||
          `https://initalstore.myshopify.com/products/${product.handle}?variant=${variantId}&country=VN&currency=VND&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic`,
        imageLink: imageUrl,
        contentLanguage: "vi",
        targetCountry: "VN",
        feedLabel: "VN",
        channel: "online",
        availability: variant.inventoryQuantity ? "in stock" : "out of stock",
        brand: product.vendor,
        googleProductCategory: product?.category?.fullName || "Null Type", // This can be modified
        price: {
          value: variant.price || 10000, // Use variant price here
          currency: "VND",
        },
        sellOnGoogleQuantity: variant.inventoryQuantity,
        shippingWeight: {
          value: 1, // Modify if needed
          unit: "kg",
        },
      };
    });
  });
}
const stringSplitId = (str) => {
  const parts = str.split("/");
  const id = parts[parts.length - 1]; // Lấy phần tử cuối cùng của mảng
  return id;
};
const stringSplitId2 = (str) => {
  const parts = str.split("_");
  const id = parts[2]; // Lấy phần tử cuối cùng của mảng
  return id;
};

export const getStatusProductsFromGG = async (
  session,
  merchantCenterId,
  envVar
) => {
  try {
    const authClient = await getValidAuthClient(session.shop, envVar);
    const content = await google.content({ version: "v2.1", auth: authClient });
    const productStatus = await content.productstatuses.list({
      merchantId: merchantCenterId,
    });
    const result = await productStatus.data.resources;
    // Tạo mảng các id và status để sử dụng trong câu lệnh SQL
    const ids = result.map((item) => Number(stringSplitId2(item.productId)));
    const statuses = {};
    result.forEach((item) => {
      statuses[Number(stringSplitId2(item.productId))] =
        item?.destinationStatuses[0].status;
    });

    /// Tạo câu lệnh SQL với CASE WHEN để cập nhật gg_category_status
    const query = `
UPDATE products
SET gg_category_status = CASE
  ${ids.map((id, index) => `WHEN id = ? THEN ?`).join(" ")}
  ELSE gg_category_status
END
WHERE id IN (${ids.map(() => "?").join(", ")});
`;

    // Giải thích:
    // Kiểm tra câu lệnh SQL sinh ra

    // Thực thi câu lệnh SQL
    const values = [
      ...ids.flatMap((id) => [id, statuses[id]]), // Thêm các tham số cho CASE WHEN
      ...ids, // Thêm các giá trị cho WHERE IN
    ];

    await dbMySQL.query(query, values);
    console.log(statuses);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const logoutAccount = async (session) => {
  try {
    await dbMySQL.query(`DELETE FROM google_account_token WHERE shop = ?;`, [
      session.shop,
    ]);
    return { successfull: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
