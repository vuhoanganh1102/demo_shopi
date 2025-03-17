import { Toast, Frame, Page, Button } from "@shopify/polaris";
import { useState, useCallback } from "react";

export function ToastWithActionExample({ title, active, setActive }) {
  //   const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  return (
    <Frame>
      {" "}
      {/* Bọc Toast bên trong Frame */}
      {active && (
        <Toast
          content={title}
          action={{
            content: "Undo",
            onAction: () => {
              console.log("Undo clicked");
              setActive(false);
            },
          }}
          duration={5000}
          onDismiss={toggleActive}
        />
      )}
    </Frame>
  );
}
