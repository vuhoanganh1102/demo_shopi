import { ProductDetailPage } from "../components/page/ProductDetailPage";
import { LayoutProductDetail } from "../components/page/LayoutProductDetail";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function DetailProduct() {
  const { id } = useParams();
  console.log("id", id);
  const [detailer, setDetailer] = useState({});
  const getDetail = async () => {
    try {
      const res = await fetch(`/api/product/${id}`, { method: "GET" });
      const data = await res.json();
      setDetailer(data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getDetail();
  }, [id]);
  return detailer && Object.keys(detailer).length > 0 ? (
    <LayoutProductDetail data={detailer} setData={setDetailer} />
  ) : (
    <p>Loading...</p>
  );
}
