import dbMySQL from "../config/db.js";
import * as axios from "axios";
export const insertProductsToMerchantCenter = async () => {
  const connection = await dbMySQL.getConnection();
  try {
  } catch (error) {
    console.log(error);
  } finally {
    connection.release(); // Đừng quên release connection
  }
};

export const saveInforUserToDB = async (token, shop) => {
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
        INSERT INTO google_account_token (shop, id, name, picture, email, access_token, refresh_token)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          id = VALUES(id),
          name = VALUES(name),
          picture = VALUES(picture),
          email = VALUES(email),
          access_token = VALUES(access_token),
          refresh_token = VALUES(refresh_token);
      `;

    // Giá trị cho INSERT
    const values = [
      shop,
      data.sub,
      data.name,
      data.picture,
      data.email,
      token,
      "", // refresh_token nếu có thể để trống hoặc điền vào sau
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
