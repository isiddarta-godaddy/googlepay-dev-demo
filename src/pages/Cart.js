import { useCart } from "react-use-cart";
import { useState, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";

import Loading from '../components/Loading';
import PoyntCollect from '../components/PoyntCollect';
import ProductsTable from '../components/ProductsTable';

const Cart = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { items, cartTotal, isEmpty, emptyCart } = useCart();

  const onNonce = useCallback((nonce) => {
    emptyCart();
    console.log("NONCE RECEIVED", nonce);
    navigate("/success-page");
  }, [navigate, emptyCart]);

  const options = {
    requireEmail: true,
    requirePhone: true,
    requireShippingAddress: true,
    paymentMethods: {
      googlePay: true,
      applePay: true
    }
  };

  return (
    <div className="page">
      <div className={loading ? "mt-56" : "mt-0"}>
        <Loading loading={loading}/>
      </div>
      {!isEmpty ? (
        <div className={loading ? 'hidden' : 'block'}>
          <ProductsTable/>
          <div className="flex flex-col justify-end items-center mt-12 sm:flex-row sm:items-end">
            <div>
              <Link to="/checkout">
                <button type="button" className="bg-green-500 px-16 py-2 rounded-md m-2 font-bold text-md">Go to checkout</button>
              </Link>
            </div>
            <PoyntCollect
              cartItems={items}
              cartTotal={cartTotal}
              setLoading={setLoading}
              options={options}
              collectId="collect"
              onNonce={onNonce}
            />
          </div>
        </div>
      ) : (
        <div className={loading ? "hidden" : "block mt-32 text-center"}>
          <p>No items here:(</p>
        </div>
      )}
    </div>
  );
}

export default Cart;
