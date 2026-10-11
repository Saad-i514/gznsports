import { webhookHandler } from "../server/payment-http.js";
export default {
  fetch(request) {
    return webhookHandler(request);
  },
};
