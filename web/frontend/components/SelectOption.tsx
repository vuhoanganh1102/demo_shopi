import { Select } from "@shopify/polaris";
import { useState, useCallback } from "react";

export function SelectOption({ label, selected, setSelected }) {
  const handleSelectChange = useCallback(
    (value: string) => setSelected(value),
    []
  );

  const options = [
    { label: "0", value: "0" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 days", value: "lastWeek" },
  ];

  return (
    <Select
      label={label}
      options={options}
      onChange={handleSelectChange}
      value={selected}
    />
  );
}
