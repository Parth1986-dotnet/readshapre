import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import axios from '../axiosConfig';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ orderId, amount, currency }) {
  const stripe = useStripe();
  const elements = useElements();

  const createIntent = async () => {
    const { data } = await axios.post('/api/payments/intent', { orderId, amount, currency });
    return data.clientSecret;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientSecret = await createIntent();
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.origin + '/order/confirmation' }
    });
    if (error) {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || !elements}>Pay</button>
    </form>
  );
}

export default function CheckoutPage(props) {
  return (
    <Elements stripe={stripePromise} options={{ appearance: {}, loader: 'auto' }}>
      <CheckoutForm {...props} />
    </Elements>
  );
}