import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createOrder, verifyPayment, getCurrentUser } from '../services/api';
import './Pricing.css';
import Navbar from './Navbar';

function Pricing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch products and user in parallel
        const [productsData, userData] = await Promise.all([
          getProducts(),
          getCurrentUser().catch(() => ({ success: false })) // Don't fail if user not logged in
        ]);

        setProducts(productsData.products || []);
        if (userData.success) {
          setUser(userData.user);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch initial data', err);
        setError('Unable to load products');
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleBuy = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Create order on backend
      const orderData = await createOrder(productId);
      const { order_id, amount, currency, receipt, key_id } = orderData;

      const options = {
        key: key_id || process.env.REACT_APP_RAZORPAY_KEY_ID, // fallback to env variable
        amount: amount,
        currency: currency,
        name: 'Learnup',
        description: receipt,
        order_id: order_id,
        handler: async function (response) {
          // Verify payment on backend
          try {
            await verifyPayment({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            alert('Payment successful!');
          } catch (verErr) {
            console.error('Verification failed', verErr);
            alert('Payment verification failed');
          }
        },
        prefill: {
          // Optional: add user email if available
          email: '',
          contact: '',
        },
        theme: {
          color: '#764ba2',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error initiating purchase', err);
      alert('Unable to initiate purchase');
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="pricing-loading">Loading products...</div>
      ) : error ? (
        <div className="pricing-error">{error}</div>
      ) : (
        <div className="pricing-container">
          <h2 className="pricing-title">Choose a Plan</h2>
          <div className="pricing-grid">
            {products.map((product) => (
              <div key={product.id} className="pricing-card">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₹{product.amount}</p>
                <button className="buy-button" onClick={() => handleBuy(product.id)}>
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Pricing;
