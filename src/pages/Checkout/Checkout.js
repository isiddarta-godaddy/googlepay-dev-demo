import { useCart } from "react-use-cart";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../../components/Loading/Loading";
import CartIcon from "../../components/CartIcon/CartIcon";
import PoyntCollect from "../../components/PoyntCollect/PoyntCollect";
import ProductsTable from "../../components/ProductsTable/ProductsTable";

import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, totalItems, isEmpty, emptyCart } = useCart();
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
    <div className="page">
      <Loading loading={loading}/>
      <CartIcon totalItems={totalItems}/>
      {!isEmpty ? (
        <div className={loading ? "disabled" : "active"}>
          <ProductsTable/>
          <div className="collect_wrapper">
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
        <div className={loading ? "disabled" : "active"}>
          <p>No items in the cart:(</p>
        </div>
      )}

    </div>
  );
}

export default Checkout;
