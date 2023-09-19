import { useDispatch } from "react-redux";
import Button from "../../ui/Button";
import { deleteItem } from "./cartSlice";

function DeleteItem({ pizzaId }) {
  const dispatch = useDispatch();
  function handleDelteItem() {
    dispatch(deleteItem(pizzaId));
  }

  return (
    <Button type="small" onClick={handleDelteItem}>
      Delete
    </Button>
  );
}

export default DeleteItem;
