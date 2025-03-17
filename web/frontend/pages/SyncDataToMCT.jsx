import { useState } from "react";
import {
  AppProvider,
  Page,
  Layout,
  Card,
  Text,
  Navigation,
  TextField,
  Button,
  RadioButton,
  Select,
  FormLayout,
  Link,
  Box,
  LegacyStack,
  LegacyCard,
} from "@shopify/polaris";

export default function GMCSettingsPage() {
  // State for form values
  const [email, setEmail] = useState("accofcod1102@gmail.com");
  const [syncFrequency, setSyncFrequency] = useState("weekly");
  const [repeatDay, setRepeatDay] = useState("monday");
  const [syncTime, setSyncTime] = useState("12:00 AM");

  // Options for the repeat dropdown
  const repeatOptions = [
    { label: "Every Monday", value: "monday" },
    { label: "Every Tuesday", value: "tuesday" },
    { label: "Every Wednesday", value: "wednesday" },
    { label: "Every Thursday", value: "thursday" },
    { label: "Every Friday", value: "friday" },
    { label: "Every Saturday", value: "saturday" },
    { label: "Every Sunday", value: "sunday" },
  ];

  return (
    <Page title="Sync to GMC settings">
      <Layout>
        {/* Left sidebar navigation */}
        <Layout.Section variant="oneThird">
          <Card>
            <Box padding="400">
              <Text variant="headingMd" as="h2">
                Menu
              </Text>
              <Box paddingBlockStart="400">
                {/* <Navigation location="/">
                  <Navigation.Section
                    items={[
                      {
                        url: "#",
                        label: "Account & Sync",
                        icon: "person",
                        selected: true,
                      },
                      {
                        url: "#",
                        label: "Product Settings",
                        icon: "products",
                      },
                    ]}
                  />
                </Navigation> */}
              </Box>
            </Box>
          </Card>
        </Layout.Section>

        {/* Main content area */}
        <Layout.Section>
          {/* Account section */}
          <Card>
            <Box padding="400">
              <Text variant="headingMd" as="h2">
                Account
              </Text>

              <Box paddingBlockStart="400">
                <Card>
                  <Box padding="100">
                    <LegacyStack distribution="equalSpacing" alignment="center">
                      <LegacyStack vertical spacing="tight">
                        <Text variant="headingMd" as="h3">
                          Connect your Google account
                        </Text>
                        <Text variant="bodyMd" color="subdued">
                          No account connected
                        </Text>
                      </LegacyStack>
                      <Button primary>Connect</Button>
                    </LegacyStack>
                  </Box>
                </Card>
              </Box>

              <Box paddingBlockStart="400">
                <FormLayout>
                  <TextField
                    label="Notification email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                  />
                </FormLayout>
              </Box>
            </Box>
          </Card>

          {/* Schedule Sync section */}
          <Box paddingBlockStart="400">
            <Card>
              <Box padding="400">
                <Text variant="headingMd" as="h2">
                  Schedule Sync
                </Text>

                <Box paddingBlockStart="400">
                  <Text variant="bodyMd" as="p">
                    Plan your schedule
                  </Text>

                  <Box paddingBlockStart="300">
                    <LegacyStack>
                      <RadioButton
                        label="Daily"
                        checked={syncFrequency === "daily"}
                        id="daily"
                        name="syncFrequency"
                        onChange={() => setSyncFrequency("daily")}
                      />
                      <RadioButton
                        label="Weekly"
                        checked={syncFrequency === "weekly"}
                        id="weekly"
                        name="syncFrequency"
                        onChange={() => setSyncFrequency("weekly")}
                      />
                    </LegacyStack>
                  </Box>
                </Box>

                <Box paddingBlockStart="400">
                  <FormLayout>
                    <FormLayout.Group>
                      <Select
                        label="Repeat"
                        options={repeatOptions}
                        onChange={setRepeatDay}
                        value={repeatDay}
                      />
                      <TextField
                        label="At"
                        value={syncTime}
                        onChange={setSyncTime}
                        type="text"
                      />
                    </FormLayout.Group>
                  </FormLayout>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Learn more section */}
          <Box paddingBlockStart="400">
            <Text variant="bodyMd" as="p">
              Learn more about <Link url="#">Sync to GMC setting</Link>
            </Text>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
