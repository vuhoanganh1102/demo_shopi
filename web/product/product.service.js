import dbMySQL from "../config/db.js";
import shopify from "../shopify.js";
// Lấy tất cả sản phẩm
export const getAllProducts = async (
  page = 1,
  limit = 10,
  keyword = "",
  filterStatus = ""
) => {
  const connection = await dbMySQL.getConnection();
  console.log(keyword);
  try {
    const offset = (page - 1) * limit;

    // Điều kiện tìm kiếm nếu có keyword
    let searchCondition = "";
    // searchCondition = keyword ? searchCondition + "AND p.title LIKE ? " : "";
    searchCondition = filterStatus
      ? searchCondition + "AND p.gg_category_status = ?"
      : "";
    const searchValue = [`%${keyword}%`];
    // keyword ? searchValue.push(`%${keyword}%`) : [];
    filterStatus ? searchValue.push(filterStatus) : [];
    // Query lấy danh sách sản phẩm có phân trang + tìm kiếm
    console.log(searchCondition);
    console.log(searchValue);
    const [rows] = await connection.query(
      `
      SELECT 
        p.id AS id,
        p.title AS title,
        p.description AS description,
        p.vendor AS vendor,
        p.pricing AS pricing,
        p.quantity AS quantity,
        p.product_status AS productStatus,
        p.category AS category,
        p.created_at AS createdAt,
        p.update_at AS updatedAt,
        p.user_id AS userId,
        p.gg_category_status AS ggCategoryStatus,
        CONCAT(
          '[', 
          GROUP_CONCAT(
            JSON_OBJECT(
              'id', pm.id, 
              'url', pm.url, 
              'type', pm.type
            )
          ),
          ']'
        ) AS images
      FROM xipat_init.products p
      LEFT JOIN xipat_init.product_media pm ON pm.product_id = p.id
      WHERE 1=1 AND p.title LIKE ? ${searchCondition}
      GROUP BY p.id
      LIMIT ? OFFSET ?
      `,
      [...searchValue, limit, offset] // Bind params để tránh SQL Injection
    );

    // Query để lấy tổng số sản phẩm (áp dụng tìm kiếm nếu có)
    const [totalRows, statusCounts] = await Promise.all([
      connection.query(
        `
      SELECT COUNT(*) as total 
      FROM xipat_init.products p
      WHERE 1=1 ${searchCondition}
      `, // Bind params cho câu query này
        [...searchValue]
      ),
      connection.query(
        `
      SELECT
        SUM(CASE WHEN p.gg_category_status = 'pending' THEN 1 ELSE 0 END) AS pendingCount,
        SUM(CASE WHEN p.gg_category_status = 'disapproved' THEN 1 ELSE 0 END) AS disapprovedCount,
        SUM(CASE WHEN p.gg_category_status = 'approved' THEN 1 ELSE 0 END) AS approvedCount,
        SUM(1) AS totalCount
      FROM xipat_init.products p
    
      ` // Bind params cho câu query này
      ),
    ]);

    return {
      data: rows,
      total: totalRows[0][0].total,
      currentPage: page,
      totalPages: Math.ceil(totalRows[0][0].total / limit),
      pendingCount: statusCounts[0][0].pendingCount, // Đếm sản phẩm có trạng thái 'pending'
      disapprovedCount: statusCounts[0][0].disapprovedCount, // Đếm sản phẩm có trạng thái 'disapproved'
      approvedCount: statusCounts[0][0].approvedCount,
      totalCount: statusCounts[0][0].totalCount,
    };
  } catch (error) {
    console.log(error);
  } finally {
    connection.release(); // Đừng quên release connection
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  const connection = await dbMySQL.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT 
    p.id AS id,
    p.title AS title,
    p.description AS description,
    p.vendor AS vendor,
    p.pricing AS pricing,
    p.quantity AS quantity,
    p.product_status AS productStatus,
    p.category AS category,
    p.created_at AS createdAt,
    p.update_at AS updatedAt,
    p.user_id AS userId,
    p.gg_category_status AS ggCategoryStatus,
    CONCAT(
      '[', 
      GROUP_CONCAT(DISTINCT
        JSON_OBJECT(
          'id', pm.id, 
          'url', pm.url, 
          'type', pm.type
        )
      ),
      ']'
    ) AS images,
  CONCAT(
      '[', 
      GROUP_CONCAT(DISTINCT
        JSON_OBJECT(
          'id', v.id, 
          'title', v.title, 
          'pricing', v.pricing,
          'image',v.url,
          'inventoryQuantity',v.inventory_quantity,
          'oldInventoryQuantity',v.old_inventory_quantity,
          'option1',v.option_1,
          'option1',v.option_2,
          'option1',v.option_3
        )
      ),
      ']'
    ) AS variants
  FROM xipat_init.products p
  LEFT JOIN xipat_init.product_media pm ON pm.product_id = p.id 
  LEFT JOIN xipat_init.variants v ON v.product_id = p.id
  WHERE p.id = ?
  GROUP BY p.id;`,
      [id]
    );
    // await getProductsFromGraphql();
    console.log("check", rows[0]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Thêm sản phẩm mới
export const createProduct = async (name, price, stock) => {
  try {
    const [result] = await dbMySQL.query(
      "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
      [name, price, stock]
    );
    return { id: result.insertId, name, price, stock };
  } catch (error) {
    throw error;
  }
};

// Cập nhật sản phẩm với transaction
export const updateProduct = async (id, updateFields, session) => {
  const connection = await dbMySQL.getConnection();
  try {
    await connection.beginTransaction();

    const { variants, images, ...productFields } = updateFields;

    // Cập nhật bảng products nếu có dữ liệu
    if (Object.keys(productFields).length > 0) {
      const fields = Object.keys(productFields)
        .map((field) => `${field} = ?`)
        .join(", ");
      const values = Object.values(productFields);
      await connection.query(
        `UPDATE xipat_init.products SET ${fields} WHERE id = ?`,
        [...values, id]
      );
    }
    console.log("eee");
    // Cập nhật bảng variants bằng WHEN IF
    if (variants && variants?.length) {
      const variantIds = variants.map((v) => v.id);
      const cases = {
        title: [],
        pricing: [],
        image: [],
        inventory_quantity: [],
        old_inventory_quantity: [],
        option_1: [],
        option_2: [],
        option_3: [],
      };

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        cases.title.push(`WHEN id = ${variant.id} THEN '${variant.title}'`);
        cases.pricing.push(`WHEN id = ${variant.id} THEN ${variant.pricing}`);
        cases.image.push(`WHEN id = ${variant.id} THEN '${variant.image}'`);
        cases.inventory_quantity.push(
          `WHEN id = ${variant.id} THEN ${variant.inventoryQuantity || 0}`
        );
        cases.old_inventory_quantity.push(
          `WHEN id = ${variant.id} THEN ${variant.oldInventoryQuantity || 0}`
        );
        cases.option_1.push(
          `WHEN id = ${variant.id} THEN '${variant.option1 || null}'`
        );
        cases.option_2.push(
          `WHEN id = ${variant.id} THEN '${variant.option2 || null}'`
        );
        cases.option_3.push(
          `WHEN id = ${variant.id} THEN '${variant.option3 || null}'`
        );

        const upsertItemGGquery = `
        SELECT id
         FROM xipat_init.upsert_items_to_google
         WHERE product_id = ? AND shop = ? AND chanel = ? AND variant_id = ?
         LIMIT 1;
       `;

        const upsertItemGGQb = await connection.query(upsertItemGGquery, [
          id,
          session.shop,
          2,
          variant.id,
        ]);
        // Kiểm tra kết quả
        if (upsertItemGGQb[0].length > 0) {
          const item = upsertItemGGQb[0];
          // Câu lệnh SQL raw query để cập nhật dữ liệu
          const query = `
     UPDATE upsert_items_to_google
     SET  status = ?
     WHERE id = ?;
   `;

          // Thực thi raw query với tham số từ request body
          await connection.query(query, [1, item.id]);
        } else {
          console.log("checl insert gg mc");
          const insertGGQuery = `INSERT INTO upsert_items_to_google (product_id, shop, chanel, status,variant_id)
           VALUES (?, ?, ?, ?,?)`;

          await connection.query(insertGGQuery, [
            id,
            session.shop,
            2,
            1,
            variant.id,
          ]);
        }
      }

      const updateVariantsQuery = `
        UPDATE xipat_init.variants
        SET 
          title = CASE ${cases.title.join(" ")} ELSE title END,
          pricing = CASE ${cases.pricing.join(" ")} ELSE pricing END,
          url = CASE ${cases.image.join(" ")} ELSE url END,
          inventory_quantity = CASE ${cases.inventory_quantity.join(
            " "
          )} ELSE inventory_quantity END,
          old_inventory_quantity = CASE ${cases.old_inventory_quantity.join(
            " "
          )} ELSE old_inventory_quantity END,
          option_1 = CASE ${cases.option_1.join(" ")} ELSE option_1 END,
          option_2 = CASE ${cases.option_2.join(" ")} ELSE option_2 END,
          option_3 = CASE ${cases.option_3.join(" ")} ELSE option_3 END
        WHERE id IN (${variantIds.join(", ")});
      `;
      console.log("queryvariants", updateVariantsQuery);
      await connection.query(updateVariantsQuery);
    }

    // Cập nhật bảng product_media bằng WHEN IF
    if (images && images?.length) {
      const mediaIds = images.map((m) => m.id);
      const mediaCases = {
        url: [],
        type: [],
      };

      images.forEach((image) => {
        mediaCases.url.push(`WHEN id = ${image.id} THEN '${image.url}'`);
        mediaCases.type.push(`WHEN id = ${image.id} THEN '${image.type}'`);
      });

      const updateMediaQuery = `
        UPDATE xipat_init.product_media
        SET 
          url = CASE ${mediaCases.url.join(" ")} ELSE url END,
          type = CASE ${mediaCases.type.join(" ")} ELSE type END
        WHERE id IN (${mediaIds.join(", ")});
      `;
      console.log("querymedia", updateMediaQuery);
      await connection.query(updateMediaQuery);
    }

    // update to shopify
    console.log(`eee1 ${id}`, updateFields);
    let variables = { input: {} };
    const updateMediaGraphql = [];
    if (id) variables["input"]["id"] = `gid://shopify/Product/${id}`;
    if (updateFields?.title) variables["input"]["title"] = updateFields.title;
    if (updateFields?.description)
      variables["input"]["descriptionHtml"] = updateFields.description;
    if (updateFields?.category)
      variables["input"]["category"] = updateFields.category;
    if (updateFields?.images) {
      updateFields?.images.forEach((e) =>
        updateMediaGraphql.push({
          originalSource: e.url,
          alt: `${updateFields?.title}:image`,
          mediaContentType: "IMAGE",
        })
      );
      variables["media"] = updateMediaGraphql;
    }

    const variantVariables = {
      productId: `gid://shopify/Product/${id}`,
      variants: [],
    };
    if (updateFields?.variants?.length) {
      updateFields?.variants.forEach((e) => {
        variantVariables.variants.push({
          id: `gid://shopify/ProductVariant/${e.id}`,
          price: e.pricing,
        });
      });
      const [updateProductGraph, updateVariantProductGraph] = await Promise.all(
        [
          funcUpdateMediaGraphql(variables, session),
          funcUpdateVariantProductGraph(variantVariables, session),
        ]
      );
    } else {
      await funcUpdateMediaGraphql(variables, session);
    }

    // await funcUpdateMediaGraphql(variables, session);
    await connection.commit();
    console.log("variables", variables);
    return { id, ...updateFields };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id) => {
  try {
    await dbMySQL.query("DELETE FROM products WHERE id = ?", [id]);
    return { message: "Product deleted successfully" };
  } catch (error) {
    throw error;
  }
};

const funcUpdateMediaGraphql = async (variables, session) => {
  const client = new shopify.api.clients.Graphql({ session });
  try {
    const response = await client.query({
      data: {
        query: `mutation UpdateProductWithNewMedia($input: ProductInput!, $media: [CreateMediaInput!]) {
          productUpdate(input: $input, media: $media) {
            product {
              id
            }
            userErrors {
              field
              message
            }
          }
        }`,
        variables,
      },
    });

    // Kiểm tra lỗi từ userErrors của GraphQL
    if (response?.data?.productUpdate?.userErrors?.length > 0) {
      console.error(
        "GraphQL User Errors:",
        response.data.productUpdate.userErrors
      );
      throw new Error("GraphQL user error occurred");
    }

    return response;
  } catch (error) {
    console.error("GraphQL Error:", error);
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Status:", error.response.status);
    }
    throw error;
  }
};

const funcUpdateVariantProductGraph = async (variables, session) => {
  const client = new shopify.api.clients.Graphql({ session });
  return await client.query({
    data: {
      query: `mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        product {
          id
        }
        productVariants {
          id
          metafields(first: 2) {
            edges {
              node {
                namespace
                key
                value
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
      variables,
    },
  });
};
const getProductsFromGraphql = async (session) => {
  const client = new shopify.api.clients.Graphql({ session });
  const data = await client.query(
    `query {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }`
  );
  return data;
};

export const getDbFromShopifyToDB = async (session) => {
  const connection = await dbMySQL.getConnection();
  // Hàm upsert để insert hoặc update sản phẩm
  const [cursorlastProductRaw, userRaw] = await Promise.all([
    connection.query(
      `SELECT sync.cursor FROM  xipat_init.sync_data_from_shopify_to_app sync
      WHERE sync.shop = ? ORDER BY sync.created_at DESC LIMIT 1;`,
      [session?.shop]
    ),
    connection.query(
      `SELECT smt.id FROM  xipat_init.shopify_member_token smt
      WHERE smt.shop = ?;`,
      [session?.shop]
    ),
  ]);
  const lastCursor = cursorlastProductRaw[0]?.cursor;
  const useId = userRaw[0][0]?.id;

  const client = new shopify.api.clients.Graphql({ session });
  // ${lastCursor ? :", after:" +  }
  const productsGraph = await client.request(
    ` query {
    products(first: 100 ${lastCursor ? `, after: "${lastCursor}"` : ""}) {
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
`
  );
  const products = await productsGraph.data.products.edges;
  // console.log(products);

  try {
    let newLastCursor;
    await connection.beginTransaction(); // Bắt đầu transaction
    for (let i = 0; i < products.length; i++) {
      const product = products[i].node;
      if (i === products.length - 1) {
        newLastCursor = products[i].cursor;

        await connection.query(
          `INSERT INTO xipat_init.sync_data_from_shopify_to_app (\`cursor\`, shop)
           VALUES (?, ?)`,
          [newLastCursor, session.shop]
        );
      }

      await connection.query(
        `INSERT INTO xipat_init.products (id, title, description, category, vendor, inventory, quantity, product_status, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         title = VALUES(title), description = VALUES(description), category = VALUES(category),
         vendor = VALUES(vendor), inventory = VALUES(inventory), quantity = VALUES(quantity),
         product_status = VALUES(product_status), user_id = VALUES(user_id);`,
        [
          Number(stringSplitId(product.id)), // id
          product.title, // title
          product.description, // description
          product?.category?.fullName || "", // category
          product.vendor, // vendor
          product.totalInventory, // inventory
          product.quantity || 0, // quantity
          product.status, // product_status
          useId, // user_id
        ]
      );
      if (product?.media?.edges.length > 0) {
        for (const e of product?.media.edges) {
          if (e.node?.preview?.image?.url) {
            await connection.query(
              `INSERT INTO xipat_init.product_media (id, url, product_id)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE
           url = VALUES(url), product_id = VALUES(product_id)`,
              [
                Number(stringSplitId(e.node.id)),
                e.node?.preview?.image?.url || null,
                Number(stringSplitId(product.id)),
              ]
            );
          }
        }
      }
      if (product?.variants?.edges.length > 0) {
        for (const e of product?.variants?.edges) {
          await connection.query(
            `INSERT INTO xipat_init.variants (id, title, pricing, inventory_quantity,product_id)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           title = VALUES(title), pricing = VALUES(pricing), inventory_quantity = VALUES(inventory_quantity), product_id=VALUES(product_id);`,
            [
              Number(stringSplitId(e.node.id)), // id của variant
              e.node.title, // title của product
              Number(e.node.price), // pricing có thể là product description hoặc một giá trị khác tuỳ theo logic của bạn
              e.node.inventoryQuantity, // inventoryQuantity từ variant
              Number(stringSplitId(product.id)),
            ]
          );
        }
      }
      await connection.commit(); // Commit nếu mọi thứ thành công
    }
    return products;
  } catch (error) {
    await connection.rollback(); // Rollback nếu có lỗi
    console.error("Lỗi upsert sản phẩm:", error);
  } finally {
    connection.release();
  }
};

const stringSplitId = (str) => {
  const parts = str.split("/");
  const id = parts[parts.length - 1]; // Lấy phần tử cuối cùng của mảng
  return id;
};

export const deleteItemsCheckBox = async (session, productIds) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error("Invalid productIds. Must be a non-empty array.");
  }
  const client = new shopify.api.clients.Graphql({ session });
  const connection = await dbMySQL.getConnection();
  try {
    await connection.beginTransaction(); // Bắt đầu transaction để đảm bảo tất cả hoặc không có gì bị xóa

    // Xóa tất cả product_media dựa vào product_id
    await connection.query(
      `DELETE FROM xipat_init.product_media WHERE product_id IN (?)`,
      [productIds]
    );

    // Xóa tất cả variants dựa vào product_id
    await connection.query(
      `DELETE FROM xipat_init.variants WHERE product_id IN (?)`,
      [productIds]
    );

    // Xóa tất cả products dựa vào id
    await connection.query(`DELETE FROM xipat_init.products WHERE id IN (?)`, [
      productIds,
    ]);

    await connection.commit(); // Xác nhận transaction
    for (const productId of productIds) {
      const data = await client.query({
        data: `mutation {
          productDelete(input: {id: "gid://shopify/Product/${productId}"}) {
            deletedProductId
            userErrors {
              field
              message
            }
          }
        }`,
      });
    }
    return {
      success: true,
      message: "Deleted products and related data successfully.",
    };
  } catch (error) {
    await connection.rollback(); // Quay lại nếu có lỗi
    throw error;
  } finally {
    connection.release(); // Giải phóng connection
  }
};
