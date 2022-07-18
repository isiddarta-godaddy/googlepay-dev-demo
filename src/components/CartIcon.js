import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const CartIcon = ({totalItems}) => {
  return (
    <Link to="/cart" className="relative inline-flex hover:no-underline">
      <FontAwesomeIcon className="fa-lg" icon={faShoppingCart} />
      <span className="absolute flex justify-center items-center text-sm bottom-5 left-6 w-4 h-4 text-white bg-green-600 rounded-full">
        {totalItems}
      </span>
    </Link>
  );
};

export default CartIcon;
