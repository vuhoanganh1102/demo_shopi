import {
  Card,
  Page,
  Layout,
  TextContainer,
  Text,
  Button,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { IndexTableWithViewsSearchFilterSorting } from "../components/IndexTableWithViewsSearchFilterSorting";
import React, { useEffect, useState } from "react";
import { ProductPage } from "../components/page/ProductPage";
export default function Products() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [additionalData, setAdditionalData] = useState();
  // useEffect(() => {
  //   getDataFromShopify();
  // }, []);
  const getDataFromShopifySaveToDB = async () => {
    console.log("testing");
    try {
      const res = await fetch("/api/products", { method: "POST" });
      // const result = await res.json();
      // setData(result.data);
    } catch (err) {
      console.log(err);
    }
  };
  const getData = async () => {
    try {
      const res = await fetch("/api/product", { method: "GET" });
      const result = await res.json();
      console.log("result", result);
      setData(result);
      setAdditionalData(result?.additional);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <ProductPage>
      <div style={{ marginBottom: "20px" }}>
        <ButtonGroup>
          {data?.length && (
            <Button onClick={getDataFromShopifySaveToDB}>
              Get data from shopify save to db
            </Button>
          )}

          {/* <Button>Get data</Button> */}
        </ButtonGroup>
      </div>
      <Layout>
        <Layout.Section>
          <IndexTableWithViewsSearchFilterSorting
            data={data}
            additionalData={additionalData}
          />
        </Layout.Section>
      </Layout>
    </ProductPage>
  );
}
