import { TextField } from "@shopify/polaris";
import { useState, useCallback } from "react";

export function TextFieldExample({ label, setValue, value }) {
  const handleChange = useCallback(
    (newValue: string) => setValue(newValue),
    []
  );

  return (
    <TextField
      label={label}
      value={value}
      onChange={handleChange}
      autoComplete="off"
    />
  );
}
