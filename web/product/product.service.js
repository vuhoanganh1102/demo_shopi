import dbMySQL from "../config/db.js";
import shopify from "../shopify.js";
// Lấy tất cả sản phẩm
export const getAllProducts = async () => {
  try {
    const [rows] = await dbMySQL.query(`SELECT 
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
  GROUP BY p.id;`);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (id) => {
  try {
    const [rows] = await dbMySQL.query(
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

      variants.forEach((variant) => {
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
      });

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
    console.log("eee1");
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
  const data = await client.request(
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

// const getDbFromShopifyToDB = async () => {
//   try {
//     const data =
//   } catch (err) {
//     console.log(err);
//   }
// };
