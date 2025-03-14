import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
// import Routes from "./Routes";
import { Routes, Route } from "react-router-dom";
import { QueryProvider, PolarisProvider } from "./components";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import DetailProduct from "./pages/DetailProduct";
export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  // const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
  //   eager: true,
  // });
  // const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <NavMenu>
            <a href="/">Dashboard</a>
            <a href="/product">Product</a>
            <a href="/detail-product">Detail product</a>
            {/* <a href="/dashboard">{t("NavigationMenu.dashboard")}</a>
            <a href="/feeds">{t("NavigationMenu.feeds")}</a>
            <a href="/generalSettings">{t("NavigationMenu.generalSettings")}</a>
            <a href="/products">{t("NavigationMenu.products")}</a>
            <a href="/diagnosis">{t("NavigationMenu.diagnosis")}</a>
            <a href="/pricingPlan">{t("NavigationMenu.pricingPlan")}</a>
            <a href="/detailProduct/:id">{t("NavigationMenu.detailProduct")}</a> */}
          </NavMenu>
          {/*<Routes pages={pages} /> */}
          <Routes>
            <Route path="" element={<Dashboard />}></Route>
            <Route path="/product" element={<Products />}></Route>
            <Route
              path="/detail-product/:id"
              element={<DetailProduct />}
            ></Route>
            <Route path="" element={<Dashboard />}></Route>
          </Routes>
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
