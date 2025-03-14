import {
  Banner,
  DropZone,
  LegacyStack,
  List,
  Thumbnail,
  Text,
  LegacyCard,
  Button,
  MediaCard,
  Icon,
} from "@shopify/polaris";
import React, { useCallback, useState } from "react";
import { DeleteIcon } from "@shopify/polaris-icons";
interface MyFile {
  id: string; // ID duy nhất (có thể dùng UUID)
  name: string; // Tên file
  size: number; // Kích thước file (bytes)
  type: string; // Loại file (MIME type)
  url?: string; // URL nếu có (ví dụ: link preview ảnh)
}
export function DropZoneExample({ label, files, setFiles }) {
  // const [files, setFiles] = useState<File[]>(media);
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const hasError = rejectedFiles.length > 0;

  const handleDrop = useCallback(
    (_droppedFiles: [], acceptedFiles: [], rejectedFiles: []) => {
      setFiles((files) => [...files, ...acceptedFiles]);
      setRejectedFiles(rejectedFiles);
    },
    []
  );
  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);
  console.log("files", files);
  console.log("rejectedFiles", rejectedFiles);

  const fileUpload = !files.length && <DropZone.FileUpload />;
  const uploadedFiles = files.length > 0 && (
    <LegacyStack vertical>
      {files.map((file, index) => (
        <LegacyStack alignment="center" key={index}>
          <div style={{ position: "relative", width: "100%" }}>
            <div
              style={{ zIndex: 5, position: "absolute", cursor: "pointer" }}
              onClick={() => handleRemove(index)}
            >
              <Icon source={DeleteIcon}></Icon>
            </div>
            <div style={{ zIndex: 1 }}>
              <Thumbnail
                size="large"
                alt={file?.name || ""}
                source={file?.url || window.URL.createObjectURL(file)}
              />
            </div>
            <div>
              {file.name}{" "}
              {file?.name && (
                <Text variant="bodySm" as="p">
                  {file.size} bytes
                </Text>
              )}
            </div>
          </div>
        </LegacyStack>
      ))}
    </LegacyStack>
  );

  const errorMessage = hasError && (
    <Banner title="The following images couldn’t be uploaded:" tone="critical">
      <List type="bullet">
        {rejectedFiles.map((file, index) => (
          <List.Item key={index}>
            {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );
  return (
    <>
      <LegacyStack vertical>
        {errorMessage}
        <DropZone
          label={
            <Text variant="headingSm" as="h6">
              {label}
            </Text>
          }
          accept="image/*"
          type="image"
          onDrop={handleDrop}
        >
          {uploadedFiles}
          {fileUpload}
        </DropZone>
      </LegacyStack>
    </>
  );
}
