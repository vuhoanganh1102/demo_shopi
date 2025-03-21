"use client";

import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  Button,
  RadioButton,
  Select,
  FormLayout,
  Link,
  Box,
  LegacyStack,
  Avatar,
  Icon,
} from "@shopify/polaris";
import { PersonIcon, ProductIcon } from "@shopify/polaris-icons";
export default function GMCSettingsPage() {
  // State for form values
  const [email, setEmail] = useState();
  const [syncFrequency, setSyncFrequency] = useState("weekly");
  const [repeatDay, setRepeatDay] = useState("monday");
  const [syncTime, setSyncTime] = useState("12:00 AM");
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState("");
  const [merchantCenterId, setMerchantCenterId] = useState("5550049490");
  const [activeView, setActiveView] = useState("account"); // "account" or "product"
  const [productSelection, setProductSelection] = useState("all"); // "all", "include", or "exclude"
  const [picture, setPicture] = useState("");
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

  // Check if user is already connected on page load
  useEffect(() => {
    getUserInfo();
  }, []);

  const getLoginGG = async () => {
    try {
      const res = await fetch("/api/google", { method: "GET" });
      const url = await res?.json();
      window.open(url, "_blank");
      return;
    } catch (err) {
      console.log("err", err);
    }
  };

  const getUserInfo = async () => {
    try {
      const res = await fetch("/api/gg-route/userinfor", { method: "GET" });
      const result = await res.json();
      if (result?.email) {
        setEmail(result.email);
        setUserName(result.name);
        setPicture(result.picture);
        setIsConnected(true);
      }
    } catch (err) {
      console.log(err);
      setIsConnected(false);
    }
  };

  const disconnectAccount = async () => {
    try {
      // Implement your disconnect logic here
      await fetch("/api/gg-route/disconnect", { method: "GET" });
      setIsConnected(false);
      setUserName("");
      setEmail("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleResync = async () => {
    try {
      const res = await fetch("/api/google-sync-mct", { method: "POST" });
      const result = await res.json();
      return result;
    } catch (err) {
      console.log(err);
    }
  };
  const handleResyncFromGGToDb = async () => {
    try {
      const res = await fetch("/api/gg-route/sync-status-from-gg-to-db", {
        method: "GET",
      });
      const result = await res.json();
      return result;
    } catch (err) {
      console.log(err);
    }
  };
  const handlInitialSyncFromGGToDb = async () => {
    try {
      const res = await fetch("/api/initial-google-sync-mct", {
        method: "POST",
      });
      const result = await res.json();
      return result;
    } catch (err) {
      console.log(err);
    }
  };
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
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginBottom: "4px",
                      backgroundColor:
                        activeView === "account" ? "#f1f2f3" : "transparent",
                    }}
                    onClick={() => setActiveView("account")}
                  >
                    <span style={{ marginRight: "12px" }}>
                      <Icon source={PersonIcon} />
                    </span>
                    <span>Account & Sync</span>
                    {activeView === "account" && (
                      <span style={{ marginLeft: "auto" }}>✓</span>
                    )}
                  </li>
                  {email && (
                    <li
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor:
                          activeView === "product" ? "#f1f2f3" : "transparent",
                      }}
                      onClick={() => setActiveView("product")}
                    >
                      <span style={{ marginRight: "12px" }}>
                        <Icon source={ProductIcon} />
                      </span>
                      <span>Product Settings</span>
                      {activeView === "product" && (
                        <span style={{ marginLeft: "auto" }}>✓</span>
                      )}
                    </li>
                  )}
                </ul>
              </Box>
            </Box>
          </Card>
        </Layout.Section>

        {/* Main content area */}
        <Layout.Section>
          {activeView === "account" ? (
            <>
              {/* Account section */}
              <Card>
                <Box padding="400">
                  <Text variant="headingMd" as="h2">
                    Account
                  </Text>

                  <Box paddingBlockStart="400">
                    <Card>
                      <Box padding="400">
                        {isConnected ? (
                          <LegacyStack
                            distribution="equalSpacing"
                            alignment="center"
                          >
                            <LegacyStack spacing="tight" alignment="center">
                              <Avatar
                                customer
                                size="medium"
                                initials={userName.charAt(0)}
                                source={picture ? picture : ""}
                              />
                              <LegacyStack vertical spacing="extraTight">
                                <Text variant="headingMd" as="h3">
                                  {userName}
                                </Text>
                                <Text variant="bodyMd" color="subdued">
                                  {email}
                                </Text>
                              </LegacyStack>
                            </LegacyStack>
                            <Button onClick={disconnectAccount}>
                              Disconnect
                            </Button>
                          </LegacyStack>
                        ) : (
                          <LegacyStack
                            distribution="equalSpacing"
                            alignment="center"
                          >
                            <LegacyStack vertical spacing="tight">
                              <Text variant="headingMd" as="h3">
                                {userName
                                  ? userName
                                  : "Connect your Google account"}
                              </Text>
                              <Text variant="bodyMd" color="subdued">
                                {email ? email : "No account connected"}
                              </Text>
                            </LegacyStack>
                            <Button onClick={getLoginGG} primary>
                              Connect
                            </Button>
                          </LegacyStack>
                        )}
                      </Box>
                    </Card>
                  </Box>

                  <Box paddingBlockStart="400">
                    <FormLayout>
                      <FormLayout.Group>
                        {email && (
                          <TextField
                            label="Select Merchant Center ID"
                            value={merchantCenterId}
                            onChange={setMerchantCenterId}
                          />
                        )}
                        {/* <Select
                          label="Select Merchant Center ID"
                          options={[{ label: "Select", value: "" }]}
                          onChange={setMerchantCenterId}
                          value={merchantCenterId}
                        /> */}
                        <TextField
                          label="Notification email"
                          value="accofcod1102@gmail.com"
                          autoComplete="email"
                        />
                      </FormLayout.Group>
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
            </>
          ) : (
            // Product Settings View
            <Card>
              <Box padding="400">
                <Text variant="headingMd" as="h2">
                  Product Source
                </Text>

                <Box paddingBlockStart="400">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text variant="bodyMd">
                        Total products synced to our system
                      </Text>
                      <div
                        style={{ marginLeft: "8px", display: "inline-flex" }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6ZM9 9C9 8.44772 9.44772 8 10 8C10.5523 8 11 8.44772 11 9V14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14V9Z"
                            fill="#5C5F62"
                          />
                        </svg>
                      </div>
                    </div>
                    <Text variant="bodyMd" fontWeight="semibold">
                      21
                    </Text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <Text variant="bodyMd">
                      Total products will be submitted to GMC
                    </Text>
                    <Text variant="bodyMd" fontWeight="semibold">
                      21
                    </Text>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <Text variant="bodyMd" fontWeight="semibold">
                      Select products
                    </Text>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "24px",
                        alignItems: "center",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="productSelection"
                          value="all"
                          checked={productSelection === "all"}
                          onChange={() => setProductSelection("all")}
                          style={{ marginRight: "8px" }}
                        />
                        <Text variant="bodyMd">All products</Text>
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="productSelection"
                          value="include"
                          checked={productSelection === "include"}
                          onChange={() => setProductSelection("include")}
                          style={{ marginRight: "8px" }}
                        />
                        <Text variant="bodyMd">Include collections</Text>
                      </label>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name="productSelection"
                          value="exclude"
                          checked={productSelection === "exclude"}
                          onChange={() => setProductSelection("exclude")}
                          style={{ marginRight: "8px" }}
                        />
                        <Text variant="bodyMd">Exclude collections</Text>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button onClick={() => handleResync()}>
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ marginRight: "8px" }}
                        >
                          <path
                            d="M3.5 10C3.5 6.41015 6.41015 3.5 10 3.5C12.3069 3.5 14.3554 4.6825 15.4782 6.46832C15.6646 6.76478 16.0391 6.87702 16.3355 6.69061C16.632 6.5042 16.7442 6.12975 16.5578 5.83329C15.2119 3.64607 12.7511 2.25 10 2.25C5.71979 2.25 2.25 5.71979 2.25 10C2.25 11.4354 2.63424 12.7763 3.30301 13.9171L2.03239 13.4229C1.70869 13.3035 1.35176 13.4678 1.23239 13.7915C1.11302 14.1152 1.27731 14.4721 1.60101 14.5915L4.60101 15.5915C4.7282 15.6364 4.86455 15.6401 4.99416 15.6022C5.12377 15.5643 5.24035 15.4865 5.32682 15.3786C5.41329 15.2708 5.46511 15.1379 5.47539 14.9981C5.48567 14.8584 5.45391 14.7187 5.38388 14.5982L4.38388 12.9325C4.22659 12.6328 3.85654 12.5184 3.55688 12.6757C3.25723 12.833 3.14275 13.203 3.30004 13.5027L3.6566 14.0368C3.07004 12.8355 2.75 11.4562 2.75 10H3.5Z"
                            fill="#5C5F62"
                          />
                          <path
                            d="M16.6971 6.08295L17.9677 6.57714C18.2914 6.69651 18.6483 6.53222 18.7677 6.20852C18.8871 5.88482 18.7228 5.52789 18.3991 5.40852L15.3991 4.40852C15.2719 4.36361 15.1356 4.35994 15.006 4.39781C14.8764 4.43568 14.7598 4.51352 14.6733 4.62135C14.5868 4.72918 14.535 4.86211 14.5247 5.00186C14.5144 5.14161 14.5462 5.28131 14.6162 5.40181L15.6162 7.06752C15.7735 7.36718 16.1436 7.48166 16.4432 7.32437C16.7429 7.16708 16.8574 6.79703 16.7001 6.49737L16.3435 5.96327C16.93 7.16461 17.25 8.54387 17.25 10H16.5C16.5 13.5899 13.5899 16.5 10 16.5C7.69323 16.5 5.64481 15.3176 4.52197 13.5319C4.33556 13.2354 3.96111 13.1232 3.66465 13.3096C3.36819 13.496 3.25595 13.8705 3.44236 14.1669C4.78819 16.354 7.24906 17.75 10 17.75C14.2802 17.75 17.75 14.2802 17.75 10C17.75 8.56463 17.3658 7.22373 16.6971 6.08295Z"
                            fill="#5C5F62"
                          />
                        </svg>
                        Re-sync
                      </span>
                    </Button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "10px",
                    }}
                  >
                    <Button onClick={() => handleResyncFromGGToDb()}>
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ marginRight: "8px" }}
                        >
                          <path
                            d="M3.5 10C3.5 6.41015 6.41015 3.5 10 3.5C12.3069 3.5 14.3554 4.6825 15.4782 6.46832C15.6646 6.76478 16.0391 6.87702 16.3355 6.69061C16.632 6.5042 16.7442 6.12975 16.5578 5.83329C15.2119 3.64607 12.7511 2.25 10 2.25C5.71979 2.25 2.25 5.71979 2.25 10C2.25 11.4354 2.63424 12.7763 3.30301 13.9171L2.03239 13.4229C1.70869 13.3035 1.35176 13.4678 1.23239 13.7915C1.11302 14.1152 1.27731 14.4721 1.60101 14.5915L4.60101 15.5915C4.7282 15.6364 4.86455 15.6401 4.99416 15.6022C5.12377 15.5643 5.24035 15.4865 5.32682 15.3786C5.41329 15.2708 5.46511 15.1379 5.47539 14.9981C5.48567 14.8584 5.45391 14.7187 5.38388 14.5982L4.38388 12.9325C4.22659 12.6328 3.85654 12.5184 3.55688 12.6757C3.25723 12.833 3.14275 13.203 3.30004 13.5027L3.6566 14.0368C3.07004 12.8355 2.75 11.4562 2.75 10H3.5Z"
                            fill="#5C5F62"
                          />
                          <path
                            d="M16.6971 6.08295L17.9677 6.57714C18.2914 6.69651 18.6483 6.53222 18.7677 6.20852C18.8871 5.88482 18.7228 5.52789 18.3991 5.40852L15.3991 4.40852C15.2719 4.36361 15.1356 4.35994 15.006 4.39781C14.8764 4.43568 14.7598 4.51352 14.6733 4.62135C14.5868 4.72918 14.535 4.86211 14.5247 5.00186C14.5144 5.14161 14.5462 5.28131 14.6162 5.40181L15.6162 7.06752C15.7735 7.36718 16.1436 7.48166 16.4432 7.32437C16.7429 7.16708 16.8574 6.79703 16.7001 6.49737L16.3435 5.96327C16.93 7.16461 17.25 8.54387 17.25 10H16.5C16.5 13.5899 13.5899 16.5 10 16.5C7.69323 16.5 5.64481 15.3176 4.52197 13.5319C4.33556 13.2354 3.96111 13.1232 3.66465 13.3096C3.36819 13.496 3.25595 13.8705 3.44236 14.1669C4.78819 16.354 7.24906 17.75 10 17.75C14.2802 17.75 17.75 14.2802 17.75 10C17.75 8.56463 17.3658 7.22373 16.6971 6.08295Z"
                            fill="#5C5F62"
                          />
                        </svg>
                        Re-sync product from gg to db
                      </span>
                    </Button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "10px",
                    }}
                  >
                    <Button onClick={() => handlInitialSyncFromGGToDb()}>
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ marginRight: "8px" }}
                        >
                          <path
                            d="M3.5 10C3.5 6.41015 6.41015 3.5 10 3.5C12.3069 3.5 14.3554 4.6825 15.4782 6.46832C15.6646 6.76478 16.0391 6.87702 16.3355 6.69061C16.632 6.5042 16.7442 6.12975 16.5578 5.83329C15.2119 3.64607 12.7511 2.25 10 2.25C5.71979 2.25 2.25 5.71979 2.25 10C2.25 11.4354 2.63424 12.7763 3.30301 13.9171L2.03239 13.4229C1.70869 13.3035 1.35176 13.4678 1.23239 13.7915C1.11302 14.1152 1.27731 14.4721 1.60101 14.5915L4.60101 15.5915C4.7282 15.6364 4.86455 15.6401 4.99416 15.6022C5.12377 15.5643 5.24035 15.4865 5.32682 15.3786C5.41329 15.2708 5.46511 15.1379 5.47539 14.9981C5.48567 14.8584 5.45391 14.7187 5.38388 14.5982L4.38388 12.9325C4.22659 12.6328 3.85654 12.5184 3.55688 12.6757C3.25723 12.833 3.14275 13.203 3.30004 13.5027L3.6566 14.0368C3.07004 12.8355 2.75 11.4562 2.75 10H3.5Z"
                            fill="#5C5F62"
                          />
                          <path
                            d="M16.6971 6.08295L17.9677 6.57714C18.2914 6.69651 18.6483 6.53222 18.7677 6.20852C18.8871 5.88482 18.7228 5.52789 18.3991 5.40852L15.3991 4.40852C15.2719 4.36361 15.1356 4.35994 15.006 4.39781C14.8764 4.43568 14.7598 4.51352 14.6733 4.62135C14.5868 4.72918 14.535 4.86211 14.5247 5.00186C14.5144 5.14161 14.5462 5.28131 14.6162 5.40181L15.6162 7.06752C15.7735 7.36718 16.1436 7.48166 16.4432 7.32437C16.7429 7.16708 16.8574 6.79703 16.7001 6.49737L16.3435 5.96327C16.93 7.16461 17.25 8.54387 17.25 10H16.5C16.5 13.5899 13.5899 16.5 10 16.5C7.69323 16.5 5.64481 15.3176 4.52197 13.5319C4.33556 13.2354 3.96111 13.1232 3.66465 13.3096C3.36819 13.496 3.25595 13.8705 3.44236 14.1669C4.78819 16.354 7.24906 17.75 10 17.75C14.2802 17.75 17.75 14.2802 17.75 10C17.75 8.56463 17.3658 7.22373 16.6971 6.08295Z"
                            fill="#5C5F62"
                          />
                        </svg>
                        Sync data from gg to db (Initial)
                      </span>
                    </Button>
                  </div>
                </Box>
              </Box>
            </Card>
          )}

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
