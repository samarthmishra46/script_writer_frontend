import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';
import { Loader2, Check, AlertCircle } from 'lucide-react';

const SubscriptionCallback: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const location = useLocation();
  const navigate = useNavigate();
  
  const verifyPayment = useCallback(async (orderId: string, paymentId: string, signature: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setVerificationStatus('error');
        setMessage('Authentication required. Please log in again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      
      // Verify the payment with the backend
      const response = await fetch(buildApiUrl('api/subscription/verify-payment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Payment verified successfully
        setVerificationStatus('success');
        setMessage(data.message || 'Payment verified successfully! Your subscription is now active.');
        
        // Update user subscription data in localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = {
          ...userData,
          subscription: {
            plan: 'individual',
            status: 'active',
            updatedAt: new Date().toISOString(),
            isRecurring: true,
            nextBillingDate: data.subscription?.nextBillingDate
          }
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // Clean up pending payment
        localStorage.removeItem('pendingPayment');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        // Payment verification failed
        setVerificationStatus('error');
        setMessage(data.message || 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setVerificationStatus('error');
      setMessage('An error occurred while verifying your payment. Please check your subscription status in your account.');
    }
  }, [navigate, setVerificationStatus, setMessage]);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId');
    const paymentId = queryParams.get('paymentId');
    const signature = queryParams.get('signature');
    
    // If we don't have the necessary parameters, check local storage for pending payment
    if (!orderId || !paymentId || !signature) {
      const pendingPaymentString = localStorage.getItem('pendingPayment');
      if (pendingPaymentString) {
        try {
          const pendingPayment = JSON.parse(pendingPaymentString);
          if (pendingPayment.orderId && pendingPayment.paymentId && pendingPayment.signature) {
            verifyPayment(pendingPayment.orderId, pendingPayment.paymentId, pendingPayment.signature);
          } else {
            setVerificationStatus('error');
            setMessage('Missing payment information. Please check your subscription status in your account.');
          }
        } catch (error) {
          console.error('Error parsing pending payment data:', error);
          setVerificationStatus('error');
          setMessage('Error processing payment data. Please check your subscription status in your account.');
        }
      } else {
        setVerificationStatus('error');
        setMessage('Missing payment information. Please check your subscription status in your account.');
      }
    } else {
      verifyPayment(orderId, paymentId, signature);
    }
  }, [location.search, verifyPayment]);
  
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {verificationStatus === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {verificationStatus === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-gray-500 mt-4">Redirecting you to the dashboard...</p>
          </>
        )}
        
        {verificationStatus === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/subscription')}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Subscription
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCallback;
