import { Routes, Route, Link, BrowserRouter as Router } from "react-router-dom";
import { useCart } from "react-use-cart";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Details from "./pages/Details";
import Checkout from "./pages/Checkout";
import SuccessPage from "./pages/SuccessPage";

import CartIcon from './components/CartIcon';

import "./lib/bundle-with-recaptcha";

window.chargeEndpoint = 'https://35ed-78-137-2-160.ngrok.io/collect/charge';

function App() {
  const { totalItems } = useCart();

  return (
    <Router>
      <div className="relative flex justify-center items-center">
        <Link to="/">
          <h1 className="text-3xl font-bold hover:underline">GD Happy Merchant</h1>
        </Link>
        <div className="absolute top-0 right-2 text-2xl text-purple-600 hover:text-purple-900">
          <CartIcon totalItems={totalItems}/>
        </div>
      </div>
      <div className="font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/details/:id" element={<Details />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout /> } />
          <Route path="/success-page" element={<SuccessPage /> } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
