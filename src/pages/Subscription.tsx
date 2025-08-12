// Subscription.tsx
import React from "react";
import axios from "axios";
import { buildApiUrl } from "../config/api";

const Subscription: React.FC = () => {
  const startSubscription = async () => {
    try {
      const { data } = await axios.post(buildApiUrl("/api/subscription/create-subscription"));
      const subscriptionId = data.id;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Public Key
        subscription_id: subscriptionId,
        name: "My Service",
        description: "₹1 every 7 days",
        theme: { color: "#3399cc" },
        handler: (response: any) => {
          console.log("Payment successful:", response);
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9876543210",
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Subscribe for ₹1 / 7 days</h1>
      <button
        onClick={startSubscription}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Start Subscription
      </button>
    </div>
  );
};

export default Subscription;
