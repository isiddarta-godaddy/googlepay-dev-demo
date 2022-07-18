import React from 'react';
import { Link } from "react-router-dom";
import { useCart } from "react-use-cart";

const ProductItem = ({product}) => {
  const { addItem } = useCart();

  return (
    <div className="flex justify-between items-top rounded-xl shadow-lg p-12 gap-4">
      <div className="basis-3/12">
        <img width="200" height="200" src={product.src} alt={product.name} />
      </div>
      <div className="basis-9/12 text-right flex flex-col justify-between">
        <div>
          <Link to={"/details/" + product.id} className="text-2xl text-sky-600 hover:underline font-bold">
            <h2>{product.name}</h2>
          </Link>
          <p className="pt-2">{product.description}</p>
        </div>
        <div className="flex justify-end items-center">
          <p className="font-bold mr-2 text-xl">{product.price}$</p>
          <button className="bg-green-500 px-16 py-2 rounded-md m-2 text-md" onClick={() => addItem(product)}>Add to cart</button>
        </div>
      </div>
    </div>
  )
};

export default ProductItem;
