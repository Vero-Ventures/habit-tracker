import React, { useEffect } from 'react';
import { Button } from 'react-native';
import { CardField } from '@stripe/stripe-react-native'; // Import CardField from stripe-react-native to enter credit card info securely
import { initializeStripe, handlePayment} from '../services/PaymentService';
import { useStripe } from '@stripe/stripe-react-native';

const CheckoutScreen = () => {
    useEffect(() => {
        initializeStripe();
    }, []);

    const onSubmit = async () => {
        // Example usage of handlePayment
        const paymentResult = await handlePayment('pm_1Example', 'pi_1Example');
        console.log(paymentResult);
    };

    const handlePaymentPress = async () => {
        //Example payment method ID and payment intent ID - these would be fetched or generated
        const paymentMethodId = 'your_payment_method_id';
        const paymentIntentId = 'your_payment_intent_id';
        const { confirmPayment } = useStripe();
        const result = await confirmPayment(paymentIntentId, {
          type: 'Card',
          paymentMethodId: paymentMethodId,
        });
      
        if (result.error) {
          console.error('Payment Confirmation Error', result.error);
        } else {
          console.log('Payment Successful', result.paymentIntent);
        }
      };
      

    return (
        <>
            <CardField
                postalCodeEnabled={true}
                placeholders={{
                    number: '4242 4242 4242 4242',  // Example placeholder
                }}
                cardStyle={{
                    backgroundColor: '#FFFFFF',
                    textColor: '#000000',
                }}
                style={{
                    width: '100%',
                    height: 50,
                    marginVertical: 20,
                }}
                onCardChange={(cardDetails) => {
                    console.log('Card Details: ', cardDetails);
                }}
            />
            // Commented command uses onSubmit function instead of handlePayment function
            {/* <Button onPress={onSubmit} title="Pay" /> */}
            <Button title="Pay Now" onPress={handlePaymentPress} />
        </>
    );
};

export default CheckoutScreen;
