import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import store from "../../store";
import { formatCurrency } from "../../utils/helpers";
import { fetchAddress } from "../user/userSlice";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formError = useActionData();

  const {
    username,
    address,
    position,
    error: errorAddress,
    status: statusAddress,
  } = useSelector((state) => state.user);
  const isAddressLoading = statusAddress === "loading";
  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);

  const dispatch = useDispatch();

  const priorityPrice = withPriority ? Math.round(totalCartPrice * 0.2) : 0;
  const totalPrice = totalCartPrice + priorityPrice;

  if (!cart.length) return <EmptyCart />;

  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Let's go!</h2>

      <Form method="POST" action="/order/new">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input
            className="input flex-grow"
            type="text"
            name="customer"
            defaultValue={username}
            required
          />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="flex-grow">
            <input type="tel" name="phone" required className="input w-full" />
            {formError?.phone && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-sm text-red-700">
                {formError.phone}
              </p>
            )}
          </div>
        </div>

        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Address</label>
          <div className="flex-grow">
            <input
              className="input w-full"
              type="text"
              name="address"
              defaultValue={address}
              disabled={isAddressLoading}
              required
            />
            {statusAddress === "error" && (
              <p className="mt-2 rounded-md bg-red-100 p-2 text-sm text-red-700">
                {errorAddress}
              </p>
            )}
          </div>
          {!position.latitude && !position.longitude && (
            <span className="absolute right-[3px] top-[34px] z-50 sm:right-[3px] sm:top-[3px] md:right-[5px] md:top-[5px]">
              <Button
                type="small"
                disabled={isAddressLoading}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
              >
                get position
              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input
            type="checkbox"
            name="priority"
            id="priority"
            className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">
            Want to yo give your order priority?
          </label>
        </div>

        <div>
          <Button disabled={isSubmitting || isAddressLoading} type="primary">
            {isSubmitting
              ? "Placing order..."
              : `Order now for ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
        <input type="hidden" name="cart" value={JSON.stringify(cart)} />
        <input
          type="hidden"
          name="position"
          value={
            position.latitude && position.longitude
              ? `${position.latitude},${position.longitude}`
              : ""
          }
        />
      </Form>
    </div>
  );
}

export async function action({ request }) {
  //reads the request body and return a promise with FormData object
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // reconstruct the result from the form
  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === "true",
  };

  // validate the phone number before creating order
  const errors = {};
  if (!isValidPhone(order.phone)) {
    errors.phone = "Please enter valid phone number";
  }
  if (Object.keys(errors).length > 0) return errors;

  // if there is no error, create a new order and redirect
  const createdOrder = await createOrder(order);

  store.dispatch(clearCart());

  return redirect(`/order/${createdOrder.id}`);
}

export default CreateOrder;
