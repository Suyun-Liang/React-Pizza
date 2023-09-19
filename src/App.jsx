import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Home from "./ui/Home";
import AppLayout from "./ui/AppLayout";
import Error from "./ui/Error";

import CreateUser from "./features/user/CreateUser";
import Menu, { loader as menuLoader } from "./features/menu/Menu";
import CreateOrder, {
  action as createOrderAction,
} from "./features/order/CreateOrder";
import Order, { loader as orderLoader } from "./features/order/Order";
import { action as orderAction } from "./features/order/UpdateOrder";
import Cart from "./features/cart/Cart";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "/menu",
        element: <Menu />,
        loader: menuLoader,
        errorElement: <Error />,
      },
      { path: "/user", element: <CreateUser /> },
      {
        path: "/order/:orderId",
        element: <Order />,
        loader: orderLoader,
        action: orderAction,
        errorElement: <Error />,
      },
      {
        path: "/order/new",
        element: <CreateOrder />,
        action: createOrderAction,
      },
      { path: "/cart", element: <Cart /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
