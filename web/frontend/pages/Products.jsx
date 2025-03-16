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
  const getSyncedData = async () => {
    try {
      const res = await fetch("/api/product/sync-products", { method: "PUT" });
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
  const getLogginGG = async () => {
    try {
      window.open(
        "https://c4ae-58-187-12-32.ngrok-free.app/auth/google",
        "_blank"
      );

      return;
    } catch (err) {
      console.log("err", err);
    }
  };
  return (
    <>
      <Button onClick={() => getSyncedData()}>OK</Button>
    </>
    // <ProductPage>
    //   <div style={{ marginBottom: "20px" }}>
    //     <ButtonGroup>
    //       {data?.length && (
    //         <Button onClick={getDataFromShopifySaveToDB}>
    //           Get data from shopify save to db
    //         </Button>
    //       )}

    //       {/* <Button>Get data</Button> */}
    //     </ButtonGroup>
    //   </div>
    //   <Layout>
    //     <Layout.Section>
    //       <IndexTableWithViewsSearchFilterSorting
    //         data={data}
    //         additionalData={additionalData}
    //       />
    //     </Layout.Section>
    //   </Layout>
    // </ProductPage>
  );
}
