import { checkoutHandler } from "../server/payment-http.js";
export default {
  fetch(request) {
    return checkoutHandler(request);
  },
};
