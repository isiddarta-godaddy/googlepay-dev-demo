import { useCart } from "react-use-cart";

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProductsTable = () => {
  const { items, cartTotal, removeItem } = useCart();

  return (
   <div className="products-table">
    <h2 className="mt-20 text-left text-lg font-bold">Your order:</h2>
    <table className="border-collapse w-full mx-0 my-auto">
      <thead>
        <tr className="products-table_headers">
          <th className="text-left border border-solid border-slate-400 p-4">Name</th>
          <th className="text-left border border-solid border-slate-400 p-4">Description</th>
          <th className="text-center border border-solid border-slate-400 p-4">Price</th>
          <th className="text-center border border-solid border-slate-400 p-4">Count</th>
          <th className="text-center font-bold border border-solid border-slate-400 p-4">Total price</th>
          <th className="text-right border border-solid border-slate-400 p-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => {
          return (
            <tr className="products-table_item" key={item.id}>
              <td className="text-left border border-solid border-slate-400 p-4">{item.name}</td>
              <td className="text-left border border-solid border-slate-400 p-4">{item.description}</td>
              <td className="text-center border border-solid border-slate-400 p-4">{item.price}$</td>
              <td className="text-center border border-solid border-slate-400 p-4">{item.quantity}</td>
              <td className="text-center font-bold border border-solid border-slate-400 p-4">{item.itemTotal}$</td>
              <td className="text-right border border-solid border-slate-400 p-4 cursor-pointer">
                <FontAwesomeIcon 
                  onClick={() => removeItem(item.id)} 
                  className="fa-lg" 
                  icon={faTimes}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
    <p className="text-right text-2xl font-bold mt-2">Subtotal: <span>{cartTotal}$</span></p>
   </div>
  );
}

export default ProductsTable;
