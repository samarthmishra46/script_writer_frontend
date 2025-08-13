// src/contexts/OrderTimerContext.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface OrderTimerContextType {
  timeLeft: number;
}

const OrderTimerContext = createContext<OrderTimerContextType | undefined>(
  undefined
);

// --- MODIFIED LOGIC STARTS HERE ---

// This function runs once when the component first loads.
const getInitialTimeLeft = () => {
  // 1. Try to get a saved expiration time from localStorage.
  const storedExpiration = localStorage.getItem("timerExpiration");

  if (storedExpiration) {
    const expirationTime = parseInt(storedExpiration, 10);
    const remainingTime = Math.round((expirationTime - Date.now()) / 1000);

    // 2. If time is still left, return it.
    if (remainingTime > 0) {
      return remainingTime;
    }
  }

  // 3. If no timer is saved or it has expired, create a NEW 5-minute timer.
  const newExpirationTime = Date.now() + 600 * 1000; // 600 seconds = 10 minutes
  localStorage.setItem("timerExpiration", newExpirationTime.toString());
  return 300;
};

// --- MODIFIED LOGIC ENDS HERE ---

export const OrderTimerProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state using our new function.
  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

  useEffect(() => {
    // If the timer runs out, clear the stored value.
    if (timeLeft <= 0) {
      localStorage.removeItem("timerExpiration");
      return;
    }

    // This interval will tick down the time every second.
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup function to avoid memory leaks.
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const value = { timeLeft };

  return (
    <OrderTimerContext.Provider value={value}>
      {children}
    </OrderTimerContext.Provider>
  );
};

export const useOrderTimerContext = (): OrderTimerContextType => {
  const context = useContext(OrderTimerContext);
  if (context === undefined) {
    throw new Error(
      "useOrderTimerContext must be used within an OrderTimerProvider"
    );
  }
  return context;
};