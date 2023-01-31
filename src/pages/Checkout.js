import { useCart } from "react-use-cart";
import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../components/Loading";
import PoyntCollect from "../components/PoyntCollect";
import ProductsTable from "../components/ProductsTable";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, cartTotal, isEmpty, emptyCart } = useCart();
  const [loading, setLoading] = useState(isEmpty ? false : true);

  const onNonce = useCallback(async (nonce, request) => {
    try {
      console.log("NONCE RECEIVED", nonce);

      if (!window.chargeEndpoint) {
        emptyCart();
        return navigate("/success-page");
      }

      console.log('charging...');
  
      const response = await fetch(window.chargeEndpoint, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...nonce,
          amount: Number(request.total.amount) * 100,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      console.log('SUCCESSFUL CHARGE', result);
      
      emptyCart();
      navigate("/success-page");
    } catch(error) {
      throw error;
    }
  }, [navigate]);

  const options = useMemo(() => {
    return {
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
  }, []);

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
