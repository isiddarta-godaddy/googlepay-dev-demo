//Products
export const products = [
  {
    id: 1,
    name: "Apple",
    description: "An apple is an edible fruit produced by an apple tree (Malus domestica)",
    price: 10,
    src: "/images/apple.jpeg",
  },
  {
    id: 2,
    name: "Lemon",
    description: "The lemon (Citrus limon) is a species of small evergreen tree in the flowering plant family Rutaceae, native to Asia",
    price: 15,
    src: "/images/lemon.webp",
  },
  {
    id: 3,
    name: "Orange",
    description: "An orange is a fruit of various citrus species in the family Rutaceae",
    price: 20,
    src: "/images/orange.jpeg",
  },
  {
    id: 4,
    name: "Jabuticaba",
    description: "Plinia cauliflora, the Brazilian grapetree, jaboticaba or jabuticaba, is a tree in the family Myrtaceae",
    price: 100,
    src: "/images/jabuticaba.png",
  }
];

//Shipping methods
export const defaultShippingMethods = {
  US: [{
    id: "free",
    label: "Free Shipping",
    detail: "(5-business days) Free shipping for 5-business day",
    amount: "0.00",
  },
  {
    id: "ground_ship",
    label: "Ground Shipping",
    detail: "(3-business days) Ground shipping fulfilled by GoDaddy",
    amount: "2.00",
  },
  {
    id: "express",
    label: "Express Shipping",
    detail: "(2-business days) Express shipping fulfilled by FedEx",
    amount: "5.00",
  }],
  US_FREE: [{
    id: "free",
    label: "Free Shipping (coupon)",
    detail: "(5-business days) Free shipping for 5-business day",
    amount: "0.00",
  },
  {
    id: "ground_ship",
    label: "Ground Shipping (coupon)",
    detail: "(3-business days) Ground shipping fulfilled by GoDaddy",
    amount: "0.00",
  },
  {
    id: "express",
    label: "Express Shipping (coupon)",
    detail: "(2-business days) Express shipping fulfilled by FedEx",
    amount: "0.00",
  }],
  OTHER: [{
    id: "usps",
    label: "International Shipping",
    detail: "(10-business days) International shipping for 10-business day by USPS",
    amount: "20.00",
  },
  {
    id: "fedex_intl",
    label: "FedEx Intl Shipping",
    detail: "(5-business days) FedEx International express shipping",
    amount: "50.00",
  }],
  OTHER_FREE: [{
    id: "usps",
    label: "International Shipping (coupon)",
    detail: "(10-business days) International shipping for 10-business day by USPS",
    amount: "0.00",
  },
  {
    id: "fedex_intl",
    label: "FedEx Intl Shipping (coupon)",
    detail: "(5-business days) FedEx International express shipping",
    amount: "0.00",
  }],
};

//Available coupon codes to apply
export const availableCouponCodes = [
  {
    code: "free",
    label: "Free Shipping",
    amount: "0.00",
  },
  {
    code: "discount10",
    label: "10$ discount",
    amount: "-10.00",
  }
];
