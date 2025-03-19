// @ts-ignore
import express from "express";
import { getInfor, getStatusProductsFromGG } from "./ggCloudService.service.js";

const ggCloudRouters = express.Router();
const merchantCenterId = process.env.MECHANT_CENTER_ID;
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUrlGG = process.env.REDIRECT_URL_GG;
ggCloudRouters.get("/userinfor", async (req, res) => {
  const session = res.locals.shopify.session;

  try {
    const response = await getInfor(session);
    return res.json(response);
  } catch (err) {
    console.log(err);
  }
});

ggCloudRouters.get("/sync-status-from-gg-to-db", async (req, res) => {
  const session = res.locals.shopify.session;

  try {
    const response = await getStatusProductsFromGG(session, merchantCenterId, {
      clientID,
      clientSecret,
      redirectUrlGG,
    });
    return res.json(response);
  } catch (err) {
    console.log(err);
  }
});
export default ggCloudRouters;
