// const fonts = '"GD Sherpa", "objektiv-mk2", "Proxima Nova", "Myriad Pro", -apple-system, Helvetica';

const constants = {
  poyntCollect: {
    businessId: "01776564-e3e2-45ea-8f5d-db2440ed4ba8", //DEV
    applicationId: "urn:aid:9c2cc0f7-e2ed-4617-b57c-88dd0b36c3d8", //DEV
    // applicationId: "urn:aid:poynt.net",
    merchantName: "GD Test Merchant",
    country: "US",
    currency: "USD",
    locale: "en-US",
    enableReCaptcha: true,
    reCaptchaOptions: {
      type: "TEXT",
    },
    enableCardOnFile: true,
    cardAgreementOptions: {
      businessName: "GoDaddy",
      businessWebsite: "https://www.godaddy.com/",
      businessPhone: "(555) 555-5555",
    },
    savedCards: [
      {
        id: 1,
        type: "VISA",
        numberLast4: "4412",
        expirationMonth: 12,
        expirationYear: 2024,
        cardHolderFirstName: "Harry",
        cardHolderLastName: "Potter",
      },
      {
        id: 2,
        type: "MAESTRO",
        numberLast4: "0044",
        expirationMonth: 12,
        expirationYear: 2024,
        cardHolderFirstName: "Ron",
        cardHolderLastName: "Weasley",
      },
      {
        id: 3,
        type: "UNIONPAY",
        numberLast4: "0000",
        expirationMonth: 12,
        expirationYear: 2024,
        cardHolderFirstName: "Hermione",
        cardHolderLastName: "Granger",
      },
      {
        id: 4,
        type: "MASTERCARD",
        numberLast4: "5456",
        expirationMonth: 12,
        expirationYear: 2024,
        cardHolderFirstName: "Lord",
        cardHolderLastName: "Voldemort",
      },
    ],
    displayComponents: {
      // showLabels: true,
      labels: true,
      // ecommerceLabels: true,
      // paymentLabel: true,
      zipCode: true,
      firstName: true,
      lastName: true,
      emailAddress: true,
      // address: true,
      // state: true,
      // country: true,
      // phone: true,
      // ecommerceFirstName: true,
      // ecommerceLastName: true,
      // ecommerceEmailAddress: true,
      // ecommerceNotes: true,
      // submitButton: true,
      // submitTokenButton: true,
    },
    additionalFieldsToValidate: ["firstName", "lastName", "emailAddress"],
    style: {
      theme: "ecommerce",
    },
    iFrame: {
      width: "100%",
      height: "425px",
      border: "0px",
    },
    customCss: {
      container: {
        color: "#111",
        "font-family": "Roboto, sans-serif",
        "height": "auto",
        "flex-flow": "row wrap",
        "justify-content": "normal",
        "align-content": "center",
        "margin": "0 auto",
      },
      inputLabel: {
        "color": "#111",
        "display": "block",
        "font-size": "15px",
        "font-weight": "700",
        "line-height": "20px",
        "margin-bottom": "7.5px",
        "margin-top": "5px",
        "text-transform": "capitalize",
        "letter-spacing": "0px",
      },
      "inputDefault": {
        "color": "#111",
        "font-family": "Roboto, sans-serif",
        "font-size": "15px",
        "line-height": "20px",
      },
      sectionLabel: {
        "font-size": "13px",
        "line-height": "18px",
        "font-weight": "500",
        "letter-spacing": "0.5px",
        "color": "#767676",
        "text-transform": "uppercase",
        "margin-top": "15px",
        "margin-bottom": "10px",
        "padding-left": "0px",
        "padding-right": "0px",
      },
      requiredMark: {
        "color": "#ae1302",
        "font-size": "15px",
        "line-height": "20px",
        "margin-left": "3px",
      },
      rowFirstName: {
        "width": "50%",
        "padding-left": "0px",
      },
      rowLastName: {
        "width": "50%",
        "padding-right": "0px",
      },
      rowCardNumber: {
        "width": "75%",
        "padding-left": "0px",
      },
      rowCVV: {
        "width": "35%",
        "padding-left": "0px",
      },
      rowExpiration: {
        "width": "25%",
        "padding-right": "0px",
      },
      rowZip: {
        "width": "65%",
        "padding-right": "0px",
      },
      rowEmailAddress: {
        "width": "100%",
        "margin-bottom": "3px",
        "padding-left": "0px",
        "padding-right": "0px",
      },
      cardOnFile: {
        savedCards: {
          container: {},
          containerCard: {},
          containerNewCard: {},
          cardBox: {},
          cardBoxActive: {},
          cardBoxCheck: {},
          cardBoxCheckmark: {},
          cardBoxLogo: {},
          cardBoxContent: {},
          cardBoxTitle: {},
          cardBoxText: {},
          cardLogo: {},
          addNewCardBox: {},
          addNewCardBoxIcon: {},
          addNewCardBoxText: {},
        }
      },
      // reCaptcha: {
      //   text: {
      //     "font-size": "20px",
      //   }
      // }
    },
  },
};

export default constants;
