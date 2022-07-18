// import React from 'react';
// import GooglePayButton from '@google-pay/button-react';

// const GooglePay = ({color, locale}) => {
//   return (
//     <GooglePayButton
//       buttonColor={color}
//       buttonLocale={locale}
//       environment="TEST"
//       paymentRequest={{
//         apiVersion: 2,
//         apiVersionMinor: 0,
//         allowedPaymentMethods: [
//           {
//             type: 'CARD',
//             parameters: {
//               allowedAuthMethods: ['PAN_ONLY'],
//               allowedCardNetworks: ['MASTERCARD', 'VISA'],
//               billingAddressRequired: true,
//               billingAddressParameters: {
//                 format: 'FULL',
//                 phoneNumberRequired: true,
//               }
//             },
//             tokenizationSpecification: {
//               type: 'PAYMENT_GATEWAY',
//               parameters: {
//                 gateway: 'example',
//                 gatewayMerchantId: 'exampleGatewayMerchantId',
//               },
//             },
//           },
//         ],
//         merchantInfo: {
//           merchantId: '12345678901234567890',
//           merchantName: 'Demo Merchant',
//         },
//         transactionInfo: {
//           totalPriceStatus: 'FINAL',
//           totalPriceLabel: 'Total',
//           totalPrice: '100.00',
//           currencyCode: 'UAH',
//           countryCode: 'UA',
//         },
//         shippingAddressRequired: true,
//         shippingAddressParameters: {
//           allowedCountryCodes: ['US'],
//           phoneNumberRequired: true,
//         },
//         callbackIntents: ['PAYMENT_AUTHORIZATION'],
//       }}
//       onLoadPaymentData={paymentRequest => {
//         console.log('load payment data', paymentRequest);
//       }}
//       onCancel={reason => {
//         console.log('onCancel', reason);
//       }}
//       onClick={event => {
//         console.log('onClick', event);
//       }}
//       onPaymentAuthorized={paymentData => {
//         return new Promise(function(resolve, reject){
//           // handle the response
//           resolve({transactionState: 'SUCCESS'});
//           resolve({
//             transactionState: 'ERROR',
//             error: {
//               intent: 'PAYMENT_AUTHORIZATION',
//               message: 'Insufficient funds',
//               reason: 'PAYMENT_DATA_INVALID'
//             }
//           });
//         });
//       }}
//       onReadyToPayChange={result => {
//         console.log('onReadyToPayChange', result);
//       }}
//     />
//   )
// };

// export default GooglePay;