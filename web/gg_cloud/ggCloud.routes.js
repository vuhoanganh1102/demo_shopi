// @ts-ignore
import express from "express";
import { getInfor } from "./ggCloudService.service.js";

const ggCloudRouters = express.Router();

ggCloudRouters.get("/userinfor", async (req, res) => {
  const session = res.locals.shopify.session;

  try {
    const response = await getInfor(session);
    return res.json(response);
  } catch (err) {
    console.log(err);
  }
});
export default ggCloudRouters;
