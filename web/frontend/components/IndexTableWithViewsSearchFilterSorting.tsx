import {
  TextField,
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  ChoiceList,
  RangeSlider,
  Badge,
  useBreakpoints,
  Thumbnail,
  Button,
  Pagination,
} from "@shopify/polaris";
import type { IndexFiltersProps, TabProps } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { ProductPage } from "./page/ProductPage";
import { useNavigate } from "react-router-dom";
import { ToastWithActionExample } from "./ToastWithActionExample";

export function IndexTableWithViewsSearchFilterSorting({
  data,
  setData,
  additionalData,
  pagination,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  handlePrevious,
  handleNext,
  searchKeyword,
  setSearchKeyword,
  setFilterStatus,
}) {
  console.log("data", data);
  const [all, setAll] = useState(data?.length || 0);
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const [itemStrings, setItemStrings] = useState<string[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    if (data) {
      setItemStrings([
        `All (${additionalData?.total})`,
        `Approved (${additionalData?.approvedCount || 0})`,
        `Disapproved (${additionalData?.disapprovedCount || 0})`,
        `In queue (${additionalData?.pendingCount || 0})`,
      ]);
    }
  }, [data]); // Chạy lại khi `data` thay đổi

  const deleteView = (index: number) => {
    const newItemStrings = [...itemStrings];
    newItemStrings.splice(index, 1);
    setItemStrings(newItemStrings);
    setSelected(0);
  };

  const duplicateView = async (name: string) => {
    setItemStrings([...itemStrings, name]);
    setSelected(itemStrings.length);
    await sleep(1);
    return true;
  };
  const remakeItemString = (status: string) => {
    const data = status.toLowerCase().split(" ");
    let result = data[0];
    if (data[0] === "all") result = "";
    if (data[0] === "in") result = "pending";
    return result;
  };
  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {
      setFilterStatus(remakeItemString(item));
    },
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : [
            {
              type: "rename",
              onAction: () => {},
              onPrimaryAction: async (value: string): Promise<boolean> => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.content;
                });
                await sleep(1);
                setItemStrings(newItemsStrings);
                return true;
              },
            },
            {
              type: "duplicate",
              onPrimaryAction: async (value: string): Promise<boolean> => {
                await sleep(1);
                duplicateView(value);
                return true;
              },
            },
            {
              type: "edit",
            },
            {
              type: "delete",
              onPrimaryAction: async () => {
                await sleep(1);
                deleteView(index);
                return true;
              },
            },
          ],
  }));
  const [selected, setSelected] = useState(0);
  const onCreateNewView = async (value: string) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
    return true;
  };
  const sortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "Order", value: "order asc", directionLabel: "Ascending" },
    { label: "Order", value: "order desc", directionLabel: "Descending" },
    { label: "Customer", value: "customer asc", directionLabel: "A-Z" },
    { label: "Customer", value: "customer desc", directionLabel: "Z-A" },
    { label: "Date", value: "date asc", directionLabel: "A-Z" },
    { label: "Date", value: "date desc", directionLabel: "Z-A" },
    { label: "Total", value: "total asc", directionLabel: "Ascending" },
    { label: "Total", value: "total desc", directionLabel: "Descending" },
  ];
  const [sortSelected, setSortSelected] = useState(["order asc"]);
  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => {};

  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };

  const primaryAction: IndexFiltersProps["primaryAction"] =
    selected === 0
      ? {
          type: "save-as",
          onAction: onCreateNewView,
          disabled: false,
          loading: false,
        }
      : {
          type: "save",
          onAction: onHandleSave,
          disabled: false,
          loading: false,
        };
  const [accountStatus, setAccountStatus] = useState<string[] | undefined>(
    undefined
  );
  const [moneySpent, setMoneySpent] = useState<[number, number] | undefined>(
    undefined
  );
  const [taggedWith, setTaggedWith] = useState("");
  // const [queryValue, setQueryValue] = useState("ff");

  const handleAccountStatusChange = useCallback(
    (value: string[]) => setAccountStatus(value),
    []
  );
  const handleMoneySpentChange = useCallback(
    (value: [number, number]) => setMoneySpent(value),
    []
  );
  const handleTaggedWithChange = useCallback(
    (value: string) => setTaggedWith(value),
    []
  );
  const handleFiltersQueryChange = useCallback((value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  }, []);
  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    []
  );
  const handleMoneySpentRemove = useCallback(
    () => setMoneySpent(undefined),
    []
  );
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setSearchKeyword(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

  const onClickDetail = (id: number) => {
    navigate(`/detail-product/${id}`);
  };
  const filters = [
    {
      key: "accountStatus",
      label: "Account status",
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            { label: "Enabled", value: "enabled" },
            { label: "Not invited", value: "not invited" },
            { label: "Invited", value: "invited" },
            { label: "Declined", value: "declined" },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "taggedWith",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "moneySpent",
      label: "Money spent",
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },
  ];

  const appliedFilters: IndexFiltersProps["appliedFilters"] = [];
  if (accountStatus && !isEmpty(accountStatus)) {
    const key = "accountStatus";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, accountStatus),
      onRemove: handleAccountStatusRemove,
    });
  }
  if (moneySpent) {
    const key = "moneySpent";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, moneySpent),
      onRemove: handleMoneySpentRemove,
    });
  }
  if (!isEmpty(taggedWith)) {
    const key = "taggedWith";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, taggedWith),
      onRemove: handleTaggedWithRemove,
    });
  }
  // console.log(data);
  const formatDate = (params: Date) => {
    const date = new Date(params);
    return date
      .toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // 24-hour format
      })
      .replace(",", "");

    // Output: "02-16-2025 13:50:43"
  };
  const orders = data.map((item, index) => {
    return {
      id: item.id,
      product: item?.title || "",
      imageUrl: !item?.images ? "" : item?.images[0]?.url,
      ggProductCategory: item?.ggCategoryStatus || "pending",
      lastUpdate: formatDate(item?.updatedAt) || "",
    };
  });

  const resourceName = {
    singular: "order",
    plural: "orders",
  };
  const [toast, SetToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const handleDeleteItems = async () => {
    try {
      const res = await fetch("/api/product/delete-items-check-box", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // Cần thêm
        },
        body: JSON.stringify(selectedResources),
      });
      const result = await res?.json();
      const newData = data.filter(
        (item: any) => !selectedResources.includes(item.id)
      );
      setData(newData);
      selectedResources.length = 0;
      SetToast(true); // Bật Toast
      setToastMessage(result.message);

      return true;
    } catch (err) {
      console.log(err);
    }
  };
  // Define bulk actions
  const bulkActions = [
    {
      content: "Bulk edit",
      onAction: () => {
        console.log("Bulk edit for:", selectedResources);
        // Implement your bulk edit logic here
      },
    },
    {
      content: "Set as draft",
      onAction: () => {
        console.log("Set as draft for:", selectedResources);
        // Implement your set as draft logic here
      },
    },
    {
      content: "Delete",
      destructive: true,
      onAction: () => {
        handleDeleteItems();
        console.log("Delete items:", selectedResources);
        // Implement your delete logic here
      },
    },
  ];

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);

  const rowMarkup = orders.map(
    (
      { id, product, imageUrl, lastUpdate, ggProductCategory, submition },
      index
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index} // Cập nhật position dựa trên startIndex
      >
        <IndexTable.Cell>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Thumbnail source={imageUrl} alt="test"></Thumbnail>
            <div style={{ marginLeft: "10px" }}>
              <Text as="p">{product}</Text>
            </div>
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {" "}
          {ggProductCategory === "disapproved" ? (
            <Badge tone="critical">disapproved</Badge>
          ) : ggProductCategory === "pending" ? (
            <Badge>In queue</Badge>
          ) : ggProductCategory === "approved" ? (
            <Badge tone="attention">approved</Badge>
          ) : (
            ""
          )}
        </IndexTable.Cell>
        <IndexTable.Cell>{lastUpdate}</IndexTable.Cell>
        <IndexTable.Cell>
          <Button onClick={() => onClickDetail(id)}> Detail</Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <LegacyCard>
      {toast && (
        <ToastWithActionExample
          title={toastMessage}
          active={toast}
          setActive={SetToast}
        />
      )}
      <IndexFilters
        sortOptions={sortOptions}
        sortSelected={sortSelected}
        queryValue={searchKeyword}
        queryPlaceholder="Searching in all"
        onQueryChange={handleFiltersQueryChange}
        onQueryClear={() => setSearchKeyword("")}
        onSort={setSortSelected}
        primaryAction={primaryAction}
        cancelAction={{
          onAction: onHandleCancel,
          disabled: false,
          loading: false,
        }}
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        canCreateNewView
        onCreateNewView={onCreateNewView}
        filters={filters}
        appliedFilters={appliedFilters}
        onClearAll={handleFiltersClearAll}
        mode={mode}
        setMode={setMode}
      />
      <IndexTable
        condensed={useBreakpoints().smDown}
        // resourceName={resourceName}
        itemCount={orders.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        bulkActions={bulkActions}
        onSelectionChange={handleSelectionChange}
        headings={[
          {
            id: "product",
            title: (
              <Text as={"dd"} fontWeight="bold">
                Product
              </Text>
            ),
          },
          {
            id: "ggProductCategory",
            title: (
              <Text as={"dd"} fontWeight="bold">
                Google product category
              </Text>
            ),
          },
          {
            id: "lastUpdate",
            title: (
              <Text as={"dd"} fontWeight="bold">
                Last update
              </Text>
            ),
          },
          { title: "" },
          // {title: 'Payment status'},
          // {title: 'Fulfillment status'},
        ]}
      >
        {rowMarkup}
      </IndexTable>
      {/* Thêm Pagination component */}
      {pagination?.total > itemsPerPage && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "16px 0",
            width: "100%",
          }}
        >
          <Pagination
            hasPrevious={currentPage > 1}
            onPrevious={() => handlePrevious()}
            hasNext={currentPage < pagination?.total}
            onNext={() => handleNext()}
            label={`Page ${currentPage} of ${pagination?.totalPages}`}
          />
        </div>
      )}
    </LegacyCard>
  );

  function disambiguateLabel(key: string, value: string | any[]): string {
    switch (key) {
      case "moneySpent":
        return `Money spent is between $${value[0]} and $${value[1]}`;
      case "taggedWith":
        return `Tagged with ${value}`;
      case "accountStatus":
        return (value as string[]).map((val) => `Customer ${val}`).join(", ");
      default:
        return value as string;
    }
  }

  function isEmpty(value: string | string[]): boolean {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }
}
