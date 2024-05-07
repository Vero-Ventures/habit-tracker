import { initStripe } from '@stripe/stripe-react-native';
import { useStripe } from '@stripe/stripe-react-native';

const publishableKey = 'pk_test_51PCOhVKV9eTtyARpJXFmNodQEPjtVYgDm6VyeFXmMUgWx1047bvdaDkfZeKoMHEF3hoqKBjLATDue6dF5a5JqHTs00sanjaOtO';

export const initializeStripe = async () => {
  await initStripe({
    publishableKey,
    //merchantIdentifier: 'merchant.identifier', // optional, used for Apple Pay
  });
};

export const handlePayment = async (paymentMethodId, paymentIntentId) => {
    const { confirmPayment } = useStripe(); // uses stripe made method called confirmPayment
  
    const paymentResult = await confirmPayment(paymentIntentId, {
      type: 'Card',
      paymentMethodId: paymentMethodId,
    });
  
    return paymentResult;
  };
