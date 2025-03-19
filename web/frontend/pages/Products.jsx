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
  const [pagination, setPagination] = useState();
  const [synced, setSynced] = useState(false);
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
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Số item mỗi trang, bạn có thể điều chỉnh
  const [searchKeyword, setSearchKeyword] = useState("");
  const getData = async () => {
    const queryString = new URLSearchParams({
      page: currentPage,
      limit: itemsPerPage,
      searchKeyword: searchKeyword,
    }).toString();
    try {
      const res = await fetch(`/api/product?${queryString}`, { method: "GET" });
      const result = await res.json();
      console.log("result", result);
      setData(result?.data);
      setAdditionalData(result?.additional);
      setPagination(result?.pagination);
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
      setSynced((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };

  // Tính toán các giá trị phân trang
  // const totalItems = pagination?.total;
  // const totalPages = Math.ceil(totalItems / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;

  // Hàm xử lý chuyển trang
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pagination?.totalPages));
  };
  useEffect(() => {
    getData();
  }, [currentPage, itemsPerPage, searchKeyword, synced]);

  return (
    // <>
    //   <Button onClick={() => getSyncedData()}>OK</Button>
    // </>
    <ProductPage>
      <div style={{ marginBottom: "20px" }}>
        <ButtonGroup>
          {data?.length && (
            <Button onClick={() => getSyncedData()}>
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
            setData={setData}
            additionalData={additionalData}
            pagination={pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
          />
        </Layout.Section>
      </Layout>
    </ProductPage>
  );
}
