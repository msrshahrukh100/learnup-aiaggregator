import React, { useEffect, useState } from 'react';
import { getProducts, createOrder, verifyPayment } from '../services/api';
import './Pricing.css';
import Navbar from './Navbar';

function Pricing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError('Unable to load products');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleBuy = async (productId) => {
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

  if (loading) return <div className="pricing-loading">Loading products...</div>;
  if (error) return <div className="pricing-error">{error}</div>;

  return (
    <div className="pricing-container">
      <h2 className="pricing-title">Choose a Plan</h2>
      <div className="pricing-grid">
        {products.map((product) => (
          <div key={product.id} className="pricing-card">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <p className="product-price">₹{product.amount / 100}</p>
            <button className="buy-button" onClick={() => handleBuy(product.id)}>
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;
