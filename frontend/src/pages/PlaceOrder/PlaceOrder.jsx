import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url, user } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    const orderItems = food_list
      .filter(item => item && cartItems[item._id] > 0)
      .map(item => ({
        name: item.name,
        price: item.price,
        quantity: cartItems[item._id]
      }));

const fullAddress = {
  firstName: data.firstName,
  lastName: data.lastName,
  email: data.email,
  street: data.street,
  city: data.city,
  state: data.state,
  zipcode: data.zipcode,
  country: data.country,
  phone: data.phone
};
    const totalAmount = getTotalCartAmount() + 2;

    try {
      const res = await axios.post(`${url}/api/order/place`, { amount: totalAmount }, {
        headers: { token }
      });

      const response = res.data;

      if (!response.success) {
        alert("Razorpay order creation failed");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.amount,
        currency: "INR",
        name: "Food Delivery App",
        description: "Order Payment",
        order_id: response.razorpayOrderId,
        handler: async function (payment) {
          try {
            await axios.post(`${url}/api/order/verify`, {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
              userId: user._id,
              items: orderItems,
              amount: totalAmount,
              address: fullAddress
            }, {
              headers: { token }
            });

            window.location.href = `/myorders`;
          } catch (err) {
            console.error("Payment verification failed", err);
            window.location.href = `/`;
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
        },
        theme: { color: "#3399cc" }
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (errResp) {
        console.warn("Payment Failed:", errResp.error);
        window.location.href = `/`;
      });

      rzp.open();
    } catch (err) {
      console.error("Error placing order", err);
      alert("Something went wrong");
    }
  };

  const navigate= useNavigate();

useEffect(()=>{
if(!token){
navigate('/cart');
}
else if(getTotalCartAmount===0){
  navigate('/cart');
}
  },[token])

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' required />
          <input name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' required />
        </div>
        <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' required />
        <input name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' required />
        <div className="multi-fields">
          <input name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' required />
          <input name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' required />
        </div>
        <div className="multi-fields">
          <input name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' required />
          <input name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' required />
        </div>
        <input name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' required />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
