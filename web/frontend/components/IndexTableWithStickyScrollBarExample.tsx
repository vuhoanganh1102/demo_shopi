import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Text,
  Box,
  BlockStack,
  Badge,
  Thumbnail,
} from "@shopify/polaris";
import React, { useState } from "react";
import { TextFieldExample } from "./TextField";

export function IndexTableWithStickyScrollBarExample({ label, data, setData }) {
  const orders = data.map((item) => ({
    id: item?.id,
    image: item?.title,
    variant: item?.title,
    price: item?.pricing,
    sku: "$24.00",
    barcode: "Point of sale",
  }));

  const resourceName = {
    singular: "data",
    plural: "data",
  };
  const handleEditChange = (index: number, field: string, value: string) => {
    setData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(data);
  // const [editVariants, setEditVariants] = useState(data);
  const rowMarkup = data.map(({ id, image }, index) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={index}
    >
      <IndexTable.Cell>
        <Thumbnail source={image} alt="dd"></Thumbnail>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TextFieldExample
          label=""
          value={data[index].title}
          setValue={(newValue) => handleEditChange(index, "title", newValue)}
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TextFieldExample
          label=""
          value={data[index].pricing}
          setValue={(newValue) => handleEditChange(index, "pricing", newValue)}
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TextFieldExample
          label=""
          value={data[index].sku || "null"}
          setValue={() => {
            console.log("null");
          }}
        />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <TextFieldExample
          label=""
          value={data[index]?.barcode || "null"}
          setValue={() => {
            console.log("null");
          }}
        />
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Box paddingBlockEnd="600">
      <BlockStack gap="200">
        <Text variant="headingSm" as="h6">
          {label}
        </Text>
        <IndexTable
          resourceName={resourceName}
          itemCount={data.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          // onSelectionChange={handleSelectionChange}
          headings={[
            { title: "" },
            { title: "Variants" },
            { title: "Price" },
            {
              //   alignment: "end",
              //   id: "order-count",
              title: "SKU",
            },
            {
              //   alignment: "end",
              //   id: "amount-spent",
              title: "Barcode",
            },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </BlockStack>
    </Box>
  );
}
