import { Page, LegacyCard } from "@shopify/polaris";
// import { ArrowDownIcon } from '@shopify/polaris-icons';
// import { ArrowDownMinor } from "@shopify/polaris-icons";
import React from "react";
// import Products from "../../pages/Products";

export function ProductDetailPage({ children }: { children: React.ReactNode }) {
  return (
    <Page
      backAction={{
        content: "Products",
        url: "https://admin.shopify.com/store/initalstore/apps/hoang-anh-dev",
      }}
      title="Product Detail"
      subtitle="Fetch "
      secondaryActions={[{ content: "Download" }]}
    >
      {/* <LegaaccyCard title="Credit card" sectioned>
        <p>Credit card information</p>
      </LegacyCard> */}
      {children}
    </Page>
  );
}
