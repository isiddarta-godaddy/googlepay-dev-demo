import { useCart } from "react-use-cart";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../components/Loading";
import PoyntCollect from "../components/PoyntCollect";
import ProductsTable from "../components/ProductsTable";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, isEmpty, emptyCart } = useCart();
  const [loading, setLoading] = useState(isEmpty ? false : true);

  const options = {
    requireEmail: true,
    requirePhone: true,
    requireShippingAddress: true,
    supportCouponCode: true,
    paymentMethods: {
      card: true,
      googlePay: true,
      applePay: true
    }
  };

  const onNonce = useCallback((nonce) => {
    emptyCart();
    console.log("NONCE RECEIVED", nonce);
    navigate("/success-page");
  }, [navigate, emptyCart]);

  return (
    <div>
      <div className={loading ? "mt-56" : "mt-0"}>
        <Loading loading={loading}/>
      </div>
      {!isEmpty ? (
        <div className={loading ? "hidden" : "block"}>
          <ProductsTable/>
          <div className="flex justify-center items-center">
            <PoyntCollect
              cartItems={items}
              cartTotal={cartTotal}
              setLoading={setLoading}
              options={options}
              collectId="collect_wallet"
              onNonce={onNonce}
            />
          </div>
        </div>
      ) : (
        <div className={loading ? "hidden" : "block"}>
          <p>No items in the cart:(</p>
        </div>
      )}

    </div>
  );
}

export default Checkout;
