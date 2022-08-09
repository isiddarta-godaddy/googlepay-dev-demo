import { useCart } from "react-use-cart";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from 'react';

import Loading from "../components/Loading";
import PoyntCollect from '../components/PoyntCollect';

import { products } from '../lib/common/data';

const Details = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { emptyCart } = useCart();

  const collectProducts = useMemo(() => {
    return [products.find(item => item.id === Number(params.id))];
  }, [params.id]);

  const product = collectProducts[0];
  const [loading, setLoading] = useState(product ? true : false);

  const onNonce = useCallback(async (nonce, request) => {
    try {
      console.log("NONCE RECEIVED", nonce);
      console.log('charging...');

      console.log(JSON.stringify({ nonce, request }));
  
      const response = await fetch(window.chargeEndpoint, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nonce,
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
      supportCouponCode: true,
      paymentMethods: {
        googlePay: true,
        applePay: true
      }
    };
  }, []);

  useEffect(() => {
    if (!product) {
      navigate("/");
    }
  }, [product, navigate]);

  if (!product) {
    return null;
  }

  return (
    <div className="flex justify-center items-center mt-56">
      <Loading loading={loading}/>
      <div className={`${loading ? 'hidden' : 'flex'} justify-between items-top rounded-xl shadow-lg p-12 gap-4`}>
        <div className="basis-3/12">
          <img width="200" height="200" src={product.src} alt={product.name} />
        </div>
        <div className="basis-9/12 text-right flex flex-col justify-between">
          <div>
            <h2 className="text-2xl text-sky-600 hover:underline font-bold">{product.name}</h2>
            <p className="pt-2">{product.description}</p>
          </div>
          <div className="flex justify-end items-center">
            <p className="font-bold mr-2 text-xl">{product.price}$</p>
            <PoyntCollect
              cartItems={collectProducts}
              cartTotal={product.price}
              setLoading={setLoading}
              options={options}
              collectId="collect"
              onNonce={onNonce}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Details;
