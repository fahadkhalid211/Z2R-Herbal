export interface PolicySection {
  heading: string;
  highlight?: boolean;
  paragraphs?: string[];
  list?: string[];
}

export interface Policy {
  title: string;
  intro: string;
  sections: PolicySection[];
  closing: string[];
}

export const SHIPPING_POLICY: Policy = {
  title: "Shipping & Delivery",
  intro:
    "At Z2R, we are committed to delivering your favorite hair-care products safely and conveniently to your doorstep.",
  sections: [
    {
      heading: "Delivery Time",
      paragraphs: ["Orders are usually delivered within 3–5 working days, depending on your location."],
    },
    {
      heading: "Shipping Charges",
      paragraphs: [
        "Shipping charges are calculated separately and displayed during checkout. Delivery charges may vary depending on your location and order size.",
      ],
    },
    {
      heading: "Order Processing",
      paragraphs: [
        "Once your order is placed, our team will process and prepare it for dispatch. You will receive an update when your order is shipped.",
      ],
    },
    {
      heading: "Order Tracking",
      paragraphs: [
        "You can track your order through our website using your Order ID to stay updated on its delivery status.",
      ],
    },
    {
      heading: "Delivery Delays",
      paragraphs: [
        "Although we aim to deliver orders within the estimated time, unexpected circumstances, weather conditions, or courier delays may occasionally affect delivery times.",
      ],
    },
    {
      heading: "Incorrect Address or Contact Details",
      paragraphs: [
        "Please ensure that your shipping address and contact number are correct when placing your order to avoid delivery issues.",
      ],
    },
    {
      heading: "Need Assistance?",
      paragraphs: [
        "For any questions or concerns regarding your shipment, feel free to contact our customer support team through WhatsApp or our official social media pages.",
      ],
    },
  ],
  closing: ["Thank you for choosing Z2R. We appreciate your trust in us!"],
};

export const RETURN_POLICY: Policy = {
  title: "Return & Refund Policy",
  intro:
    "At Z2R, customer satisfaction is our top priority. We believe in the quality of our products and want every customer to shop with confidence.",
  sections: [
    {
      heading: "100% Money-Back Guarantee",
      highlight: true,
      paragraphs: [
        "We offer a 100% Money-Back Guarantee if you receive a defective, damaged, faulty, or incorrect product.",
      ],
    },
    {
      heading: "Eligibility for Returns",
      list: [
        "If you receive a damaged or defective product.",
        "If you receive an incorrect product.",
        "If there is any quality-related issue with the product.",
      ],
    },
    {
      heading: "How to Request a Return",
      paragraphs: [
        "Contact our customer support team through WhatsApp or email and share your Order ID along with pictures or videos of the issue.",
      ],
    },
    {
      heading: "Refund Process",
      paragraphs: [
        "Once your return request is reviewed and approved, we will initiate a 100% refund of the product amount.",
      ],
    },
    {
      heading: "Refund Timeline",
      paragraphs: ["Approved refunds will be processed within 5–7 working days."],
    },
    {
      heading: "Our Promise",
      paragraphs: [
        "Your trust matters to us. If there is a genuine fault with our product, we take full responsibility and ensure you receive your money back.",
      ],
    },
  ],
  closing: ["Thank you for trusting Z2R!"],
};

export const PRIVACY_POLICY: Policy = {
  title: "Privacy Policy",
  intro:
    "At Z2R, we respect your privacy and are committed to protecting your personal information. Your trust is important to us, and we ensure that your information is handled responsibly and securely.",
  sections: [
    {
      heading: "Information We Collect",
      paragraphs: ["When you place an order or use our website, we may collect the following information:"],
      list: [
        "Full Name",
        "Contact Number",
        "Email Address",
        "Shipping Address",
        "Order and Purchase Details",
      ],
    },
    {
      heading: "How We Use Your Information",
      paragraphs: ["We use your personal information to:"],
      list: [
        "Process and deliver your orders.",
        "Contact you regarding your purchases.",
        "Provide customer support.",
        "Share important order updates.",
        "Improve our products and shopping experience.",
      ],
    },
    {
      heading: "Protection of Your Information",
      paragraphs: [
        "We take reasonable security measures to protect your personal information against unauthorized access, misuse, or disclosure.",
      ],
    },
    {
      heading: "Sharing of Information",
      paragraphs: [
        "We do not sell or rent your personal information to third parties. We may share necessary details with trusted delivery partners and service providers only when required to process and deliver your orders.",
      ],
    },
    {
      heading: "Cookies",
      paragraphs: [
        "Our website may use cookies to improve your browsing experience, understand website traffic, and enhance website performance.",
      ],
    },
    {
      heading: "Payment Information",
      paragraphs: [
        "Payment information is handled through the available payment methods and their respective service providers. We do not intentionally store sensitive payment details unless required and securely supported by our payment system.",
      ],
    },
    {
      heading: "Your Privacy Rights",
      paragraphs: [
        "You may contact us to request access to, correction of, or deletion of your personal information, subject to applicable legal and operational requirements.",
      ],
    },
    {
      heading: "Contact Us",
      paragraphs: [
        "If you have any questions about our Privacy Policy or how your information is handled, please contact our customer support team.",
      ],
    },
  ],
  closing: [
    "Z2R – Your Trust, Our Responsibility.",
    "We reserve the right to update this Privacy Policy whenever necessary. Any changes will be published on this page.",
  ],
};

export const TERMS: Policy = {
  title: "Terms & Conditions",
  intro:
    "Welcome to Z2R! By accessing and using our website, you agree to the following Terms & Conditions. Please read them carefully before placing an order.",
  sections: [
    {
      heading: "General Terms",
      paragraphs: [
        "By using our website, you confirm that you are providing accurate and complete information when placing an order.",
      ],
    },
    {
      heading: "Product Information",
      paragraphs: [
        "We make every effort to ensure that all product descriptions, images, ingredients, and details are accurate. Minor variations in packaging or appearance may occur.",
      ],
    },
    {
      heading: "Pricing & Payments",
      paragraphs: [
        "All product prices are listed on our website in Pakistani Rupees (PKR). Z2R reserves the right to update product prices without prior notice.",
      ],
    },
    {
      heading: "Orders & Confirmation",
      paragraphs: [
        "All orders are subject to availability and confirmation. We reserve the right to cancel an order in case of incorrect information, pricing errors, or product unavailability.",
      ],
    },
    {
      heading: "Shipping & Delivery",
      paragraphs: [
        "Delivery times and shipping charges are subject to our Shipping & Delivery Policy. Delays may occur due to unforeseen circumstances or courier-related issues.",
      ],
    },
    {
      heading: "Returns & Refunds",
      paragraphs: [
        "All returns, exchanges, and refunds are handled according to our Return & Refund Policy and Exchange Policy.",
      ],
    },
    {
      heading: "Product Usage & Safety",
      paragraphs: [
        "Customers are advised to read product instructions and ingredient details before use. We recommend performing a patch test before applying any hair oil. Individual results may vary.",
      ],
    },
    {
      heading: "Privacy & Security",
      paragraphs: [
        "Your personal information is handled according to our Privacy Policy. We respect your privacy and take reasonable steps to protect your information.",
      ],
    },
    {
      heading: "Intellectual Property",
      paragraphs: [
        "All website content, including logos, brand names, product images, text, and designs, belongs to Z2R and may not be copied or used without prior permission.",
      ],
    },
    {
      heading: "Changes to Terms",
      paragraphs: [
        "Z2R reserves the right to modify or update these Terms & Conditions at any time. Any changes will be published on this page.",
      ],
    },
    {
      heading: "Contact Us",
      paragraphs: [
        "For any questions or concerns regarding these Terms & Conditions, please contact our customer support team through our official WhatsApp or website contact details.",
      ],
    },
  ],
  closing: ["Thank you for choosing Z2R. We appreciate your trust and support!"],
};
