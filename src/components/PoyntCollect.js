import $ from 'jquery';
import { useAlert } from 'react-alert';
import Button from 'react-bootstrap-button-loader';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import constants from '../lib/common/constants';
import { availableCouponCodes } from '../lib/common/data';
import { createOrder, buildLineItems, buildTotal, getShippingMethods } from '../lib/helpers/wallet';

const PoyntCollect = ({setLoading, options, collectId, onNonce, cartItems, cartTotal, couponCode}) => {
  const alert = useAlert();
  const collect = useRef();
  const order = useRef();

  const [orderLoaded, setOrderLoaded] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [savedCard, setSavedCard] = useState("");

  const getNonce = async () => {
    setButtonLoading(true);

    if (savedCard) {
      await Promise.resolve(onNonce(savedCard));
      setButtonLoading(false);

      return;
    }
  
    collect.current.getNonce({});
  };

  useEffect(() => {
    order.current = createOrder(cartItems, cartTotal, couponCode);
    setOrderLoaded(true);
  }, [cartItems, cartTotal, couponCode]);

  useLayoutEffect(() => {
    if (!orderLoaded) {
      return;
    }

    if (setLoading) {
      setLoading(true);
    }

    const walletRequest = {
      merchantName: "GoDaddy Merchant",
      country: constants.poyntCollect.country,
      currency: constants.poyntCollect.currency,
      lineItems: buildLineItems(order.current),
      total: buildTotal(order.current),
      requireEmail: options.requireEmail,
      requirePhone: options.requirePhone,
      requireShippingAddress: options.requireShippingAddress,
      supportCouponCode: options.supportCouponCode,
      couponCode: order.current.coupon,
      disableWallets: {
        applePay: !options.paymentMethods?.applePay,
        googlePay: !options.paymentMethods?.googlePay,
      },
    };

    collect.current = new window.TokenizeJs(
      constants.poyntCollect.businessId,
      constants.poyntCollect.applicationId,
      walletRequest
    );

    console.log('current collect instance: ', collect.current);
    window.poyntCollect = collect.current;

    (async () => {
      try {
        const result = await collect.current.supportWalletPayments();

        if (!collect.current) {
          return;
        }

        const paymentMethods = [];

        if (options.paymentMethods?.card) {
          paymentMethods.push("card");
        }

        if (options.paymentMethods?.applePay && result.applePay) {
          paymentMethods.push("apple_pay");
        } else if (options.paymentMethods?.googlePay && result.googlePay) {
          paymentMethods.push("google_pay");
        }

        if (!paymentMethods.length) {
          return setLoading(false);
        }

        collect.current.mount(collectId, document, {
          savedCards: [
            {
              id: 1,
              type: "VISA",
              numberLast4: "4412",
            },
            {
              id: 2,
              type: "MAESTRO",
              numberLast4: "0044",
            },
            {
              id: 3,
              type: "UNIONPAY",
              numberLast4: "0000",
            },
            {
              id: 4,
              type: "MASTERCARD",
              numberLast4: "5456",
            },
          ],
          amount: 2000,
          paymentMethods: paymentMethods,
          iFrame: constants.poyntCollect.iFrame,
          additionalFieldsToValidate: constants.poyntCollect.additionalFieldsToValidate,
          locale: constants.poyntCollect.locale,
          displayComponents: constants.poyntCollect.displayComponents,
          style: constants.poyntCollect.style,
          customCss: constants.poyntCollect.customCss,
          applePayButtonOptions: {
            onClick: () => {
              console.log("ORDER", order.current);

              const update = {
                total: buildTotal(order.current),
                lineItems: buildLineItems(order.current),
                couponCode: { ...order.current.coupon },
              };

              collect.current.startApplePaySession(update);
            },
          },
          googlePayButtonOptions: {
            onClick: () => {
              console.log("ORDER", order.current);

              const update = {
                total: buildTotal(order.current),
                lineItems: buildLineItems(order.current),
                couponCode: { ...order.current.coupon },
              };

              collect.current.startGooglePaySession(update);
            },
          },
          // buttonOptions: {
          //   onClick: (event) => {
          //     console.log("ORDER", order.current);

          //     const update = {
          //       total: buildTotal(order.current),
          //       lineItems: buildLineItems(order.current),
          //       couponCode: { ...order.current.coupon },
          //     };

          //     if (event.source === "apple_pay") {
          //       collect.current.startApplePaySession(update);
          //     } else {
          //       collect.current.startGooglePaySession(update);
          //     }
          //   },
          // },
          enableReCaptcha: true,
          enableCardOnFile: true,
          cardAgreementOptions: {
            businessName: "GoDaddy",
            businessWebsite: "https://www.godaddy.com/",
            businessPhone: "(555) 555-5555",
          },
        });
      } catch(error) {
        console.log(error);
        setLoading(false);
      }
    })();

    collect.current.on("iframe_ready", () => {
      if (setLoading) {
        setLoading(false);
      }
    });

    collect.current.on("iframe_height_change", (event) => {
      console.log("iframe_height_change", event.data.height);
  
      if (event?.data?.height) {
        const iFrame = document.getElementById("poynt-collect-v2-iframe");
        iFrame.style.setProperty("height", event.data.height + 80 + "px");
      }
    });

    collect.current.on("card_on_file_card_select", (event) => {
      console.log("card_on_file_card_select", event.data.cardId);

      setTimeout(() => {
        document.getElementById(collectId + "_button")?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      setSavedCard(event.data.cardId);
    });

    collect.current.on("card_on_file_error", (event) => {
      console.log("card_on_file_error", event);
    });

    collect.current.on("wallet_button_click", (data) => {
      console.log("BUTTON CLICKED! Source: " + data.source);
    });

    if (options.requireShippingAddress) {
      collect.current.on("shipping_address_change", (event) => {
        console.log("shipping_address_change", event);
        order.current.shippingCountry = event.shippingAddress.countryCode;
      
        if (order.current.shippingCountry === "US") {
          order.current.taxRate = 0.1;
        } else {
          order.current.taxRate = 0.3;
        }
      
        const shippingMethods = getShippingMethods(order.current);

        if (!shippingMethods?.length) {
          event.updateWith({
            error: {
              code: "unserviceable_address",
              contactField: "country",
              message: "No shipping methods available for selected shipping address",
            }
          });
        }
      
        const selectedShippingMethod = shippingMethods[0];
        const total = buildTotal(order.current, selectedShippingMethod);
        const lineItems = buildLineItems(order.current, selectedShippingMethod);
  
        const options = {
          lineItems: lineItems,
          shippingMethods: shippingMethods,
          total: total,
        };
      
        event.updateWith(options);
      });
      
      collect.current.on("shipping_method_change", (event) => {
        console.log("shipping_method_change", event);
        const total = buildTotal(order.current, event.shippingMethod);
        const lineItems = buildLineItems(order.current, event.shippingMethod);
        
        const options = {
          lineItems: lineItems,
          total: total
        };
  
        event.updateWith(options);
      });
    }

    if (options.supportCouponCode) {
      collect.current.on("coupon_code_change", (event) => {
        console.log("coupon_code_change", event);
        if (!event.couponCode) {
          order.current.coupon = {
            code: "",
            label: "",
            amount: "0.00",
          }
        } else {
          const couponCode = availableCouponCodes.find(item => item.code === event.couponCode);
  
          if (!couponCode) {
            const options = {
              error: {
                code: "invalid_coupon_code",
                message: "Coupon code " + event.couponCode + " does not exists", 
              }
            };
      
            return event.updateWith(options);
          }
      
          order.current.coupon = couponCode;
        }

        const shippingMethods = walletRequest.requireShippingAddress ? getShippingMethods(order) : null;
        const selectedShippingMethod = walletRequest.requireShippingAddress ? shippingMethods[0] : null;
        const total = buildTotal(order.current, selectedShippingMethod);
        const lineItems = buildLineItems(order.current, selectedShippingMethod);
          
        const options = {
          lineItems: lineItems,
          shippingMethods: shippingMethods,
          couponCode: { ...order.current.coupon },
          total: total,
        };
      
        event.updateWith(options);
      });
    }

    collect.current.on("close_wallet", (event) => {
      console.log('close_wallet', event);
    });

    collect.current.on("payment_authorized", async (event) => {
      if (event.source === "google_pay") {
        console.log("GOOGLE PAY TOKEN RECEIVED", event);
      }

      if (event.source === "apple_pay") {
        console.log("APPLE PAY TOKEN RECEIVED", event);
      }

      try {
        await Promise.resolve(onNonce(event.nonce, walletRequest));
        event.complete();
      } catch(error) {
        event.complete({ error });
      }
    });
    
    collect.current.on("nonce", async (nonce) => {
      try {
        await Promise.resolve(onNonce(nonce, walletRequest));
        setButtonLoading(false);
      } catch(error) {
        setButtonLoading(false);
        console.log(error);
      }
    });

    collect.current.on("error", (event) => {
      let message;

      console.log(event);

      if (event?.data?.message) {
        message = event.data.message;
      }

      if (event?.data?.error?.type === 'invalid_details' || event?.data?.error?.type === 'missing_fields') {
        message = event.data.error.message === 'Missing details' ? 'Enter a card number' : event.data.error.message;
      }

      if (event?.data?.errorType === "invalidEmail" || event?.data?.errorType === "invalidZip") {
        message = event?.data?.error;
      }

      if (message) {
        setButtonLoading(false);

        if ($("#__react-alert__ span").text() === message) {
          return;
        }

        alert.error(message);
      }
    });

    return () => {
      collect.current.unmount(collectId, document);
      collect.current = null;
    };
  }, [
    orderLoaded,
    collectId,
    options.paymentMethods?.card,
    options.paymentMethods?.applePay,
    options.paymentMethods?.googlePay,
    options.requireEmail,
    options.requirePhone,
    options.requireShippingAddress,
    options.supportCouponCode,
    setLoading,
    alert,
    onNonce
  ]);

  const button = (
    <Button 
      className="bg-green-500 px-16 w-full py-2 rounded-md m-2 font-bold text-md order-2 sm:w-auto" 
      loading={buttonLoading} 
      onClick={() => getNonce()}
      id={collectId + "_button"}
    >
      Pay with card
    </Button>
  );

  return ( 
    <div id={collectId} className="poynt-collect flex flex-wrap justify-end max-w-90 collect-wallet:w-full sm:collect-wallet:w-auto">
      {options.paymentMethods?.card ? button : null}
    </div>
  );
};

export default PoyntCollect;
