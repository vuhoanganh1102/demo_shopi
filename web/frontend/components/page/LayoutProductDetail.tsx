import {
  SkeletonPage,
  Layout,
  LegacyCard,
  SkeletonBodyText,
  Grid,
  Box,
  Page,
  InlineGrid,
  BlockStack,
  Card,
  SkeletonDisplayText,
  Bleed,
  Divider,
} from "@shopify/polaris";
import React, { useEffect } from "react";
import { TextFieldExample } from "../TextField";
import { useState } from "react";
import { AutocompleteExample } from "../AutocompleteExample";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  ArchiveIcon,
  DeleteIcon,
  DuplicateIcon,
  InventoryUpdatedIcon,
} from "@shopify/polaris-icons";
import { DropZoneExample } from "../DropZone";
import { SelectOption } from "../SelectOption";
import { IndexTableWithStickyScrollBarExample } from "../IndexTableWithStickyScrollBarExample";
import { useParams } from "react-router-dom";
export function LayoutProductDetail({ data, setData }) {
  // const [upData, setUpData] = useState(data);
  const { id } = useParams();
  const [title, setTiltle] = useState(data?.title);
  const [description, setDescription] = useState(data?.description);
  const [tag, setTag] = useState("Store tag");
  const [type, setType] = useState("Store type");
  const [category, setCategory] = useState(data?.category);
  const [value, setValue] = useState("");
  const [sku, setSku] = useState("SKU");
  const [gram, setGram] = useState("today");
  const [weight, setWeight] = useState("today");
  const [images, setImages] = useState(data?.images || []);
  const [variants, setVariants] = useState(data?.variants);
  //   const [editVariant, setEditVariant] = useState("S");
  //   const [editPrice, setEditPrice] = useState("100");
  //   const [editSku, setEditSku] = useState("SKU");
  //   const [editBarcode, setEditBarcode] = useState("Barcode");
  const [formData, setFormData] = useState({
    title: data?.title || "",
    description: data?.description || "",
    category: data?.category || "",
    images: data?.images || [],
    variants: data?.variants || [],
    // tag: "Store tag",
    // type: "Store type",
    // sku: "SKU",
    // gram: "today",
    // weight: "today",
  });
  const [updateData, setUpdateData] = useState({});
  useEffect(() => {
    formData.title = title;
    formData.description = description;
    formData.category = category;
    formData.images = images;
    formData.variants = variants;
    setUpdateData(getUpdatedFields(data, formData));
  }, [title, images, description, variants, category]);
  // Hàm so sánh dữ liệu cũ và mới, chỉ trả về những trường thay đổi
  const getUpdatedFields = (original, updated) => {
    const changes = {};
    for (const key in updated) {
      console.log(JSON.stringify(original?.[key]));
      console.log(JSON.stringify(updated?.[key]));
      if (JSON.stringify(original?.[key]) !== JSON.stringify(updated?.[key])) {
        changes[key] = updated[key];
      }
    }
    return changes;
  };
  console.log("data", data);
  const SkeletonLabel = (props) => {
    return (
      <Box
        background="bg-fill-tertiary"
        minHeight="1rem"
        maxWidth="5rem"
        borderRadius="base"
        {...props}
      />
    );
  };
  const updateProduct = async () => {
    try {
      const res = await fetch("/api/products/gql", { method: "PUT" });
      const data = await res.json();
      return data;
    } catch (err) {
      throw err;
    }
  };
  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/product/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      // setData(result);
      setData((prevData) => ({
        ...prevData, // Giữ nguyên dữ liệu cũ
        ...updateData, // Cập nhật trường mới
      }));
      console.log("Update successful:", result);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };
  return (
    <Page
      backAction={{ content: "Products", url: "/products" }}
      title="Product"
      secondaryActions={[
        {
          content: "Update Test",
          icon: InventoryUpdatedIcon,
          accessibilityLabel: "Secondary action label",
          onAction: () => handleUpdate(),
        },
        {
          content: "Archive",
          icon: ArchiveIcon,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Archive action"),
        },
        {
          content: "Delete",
          icon: DeleteIcon,
          destructive: true,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Delete action"),
        },
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <InlineGrid columns={{ xs: 1, md: "2fr 1fr" }} gap="400">
        <BlockStack gap="400">
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextFieldExample
                label="Title"
                value={title}
                setValue={setTiltle}
              ></TextFieldExample>
              <div style={{ marginTop: "20px" }}>
                <label>Description</label>
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={setDescription}
                />
              </div>
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <DropZoneExample
                label="Media"
                files={images}
                setFiles={setImages}
              ></DropZoneExample>
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <IndexTableWithStickyScrollBarExample
                label="Variant"
                data={variants}
                setData={setVariants}
              ></IndexTableWithStickyScrollBarExample>
            </BlockStack>
          </Card>
        </BlockStack>
        <BlockStack gap={{ xs: "400", md: "200" }}>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <AutocompleteExample
                label="Tag"
                inputValue={tag}
                setInputValue={setTag}
              ></AutocompleteExample>
              <AutocompleteExample
                label="Type"
                inputValue={type}
                setInputValue={setType}
              ></AutocompleteExample>
              <AutocompleteExample
                label="Category"
                inputValue={category}
                setInputValue={setCategory}
              ></AutocompleteExample>
            </BlockStack>
          </Card>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextFieldExample
                label="SKU"
                value={sku}
                setValue={setSku}
              ></TextFieldExample>
              <SelectOption
                label="Grams"
                selected={gram}
                setSelected={setGram}
              ></SelectOption>
              <SelectOption
                label="Weight"
                selected={weight}
                setSelected={setWeight}
              ></SelectOption>
            </BlockStack>
          </Card>
        </BlockStack>
      </InlineGrid>
    </Page>
  );
}
