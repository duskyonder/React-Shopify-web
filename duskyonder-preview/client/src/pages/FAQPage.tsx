import { useState } from "react";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";
import "@/styles/faq.css";

// ── Parsed FAQ data from https://www.duskyonder.com/pages/faq ────────────────
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What should I do if I receive a defective or incorrect item?",
        answer:
          "We sincerely apologize that you received a flawed or incorrect item. If you received the item less than 21 days ago, please email us at support@duskyonder.com and we will find a solution for you. Please note that issues such as wear and tear, change of mind, sizing problems, or misuse are not covered under warranty.",
      },
      {
        question: "How can I cancel my order?",
        answer:
          "For further assistance, please contact support@duskyonder.com. Please ensure you provide your email address at checkout.",
      },
      {
        question: "How can I exchange an item?",
        answer:
          "We currently do not offer exchange services. You will need to return the item you wish to exchange and place a new order.",
      },
      {
        question: "What should I do if I didn't follow Duskyonder's return process?",
        answer:
          "Items returned through other methods are your responsibility, and we cannot guarantee proper handling. If you used a different shipping label, please email us the tracking number and we will do our best to track it. We need to inspect the return at our warehouse before issuing a refund or store credit.",
      },
      {
        question: "Do I need to pay taxes?",
        answer:
          "For applicable countries, duties and taxes will be automatically calculated and displayed at checkout.",
      },
      {
        question: "How long does a refund take?",
        answer:
          "Refunds may take up to 10 business days to process after the package is marked as delivered. You will receive an email notification once the refund is completed. If you haven't received your refund after 10 business days, please contact us at support@duskyonder.com.",
      },
      {
        question: "Can I receive store credit after returning an item?",
        answer:
          "If your return complies with our policy, we will issue store credit in the form of a gift card. The gift card will be emailed to the address associated with your original order. You can inquire by emailing support@duskyonder.com.",
      },
    ],
  },
  {
    title: "Shipping & Tracking",
    items: [
      {
        question: "Do you ship internationally?",
        answer:
          "We offer worldwide shipping. For orders below the free-shipping threshold or to check shipping fees, please refer to our Shipping Policy on the website or email support@duskyonder.com.",
      },
      {
        question: "How long does it take to ship my order?",
        answer:
          "Orders placed on business days (Monday to Friday, excluding public holidays) will be shipped within 1–3 business days. Orders placed on weekends or holidays will begin processing on the next business day. Estimated delivery times do not include processing time.",
      },
      {
        question: "How long will it take to receive my order?",
        answer:
          "Delivery times vary depending on your location, ranging from 5 to 30 days. For estimated delivery times in your region, please refer to the shipping details on our website. Deliveries are not made on non-business days.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your package is shipped, you will receive an email with tracking information. If you haven't received this email, please contact us at support@duskyonder.com to check your package status.",
      },
      {
        question: "Why hasn't my order arrived within the estimated time?",
        answer:
          "Shipping times are estimates and may be affected by third-party services. Duskyonder is not responsible for circumstances beyond our control, such as carrier delays.",
      },
      {
        question: "What should I do if my package is lost or stolen?",
        answer:
          "If your package is suspected to be lost, please contact us at support@duskyonder.com within 10 calendar days of the estimated delivery date. We will assist in filing a claim with the carrier or arranging a reshipment.",
      },
      {
        question: "How can I modify my order?",
        answer:
          "Once an order is submitted, it almost immediately enters the warehouse processing phase. To ensure fast delivery, no changes can be made at this stage. Please contact us immediately at support@duskyonder.com to cancel the order. Otherwise, you may return or exchange the item after delivery.",
      },
    ],
  },
  {
    title: "Payments & Promotions",
    items: [
      {
        question: "Why was my payment declined or failed?",
        answer:
          "Please ensure you've entered your card and account information correctly. If you're still experiencing issues, we recommend contacting your card issuer. Alternatively, you can reach out to us at support@duskyonder.com.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept Credit/Debit Cards (Visa, Mastercard, Amex, JCB, UnionPay) and Digital Wallets (Apple Pay, Google Pay). Your card information is processed securely — Dusk Yonder does not store any personal payment details.",
      },
      {
        question: "If I return an item, will my discount still apply?",
        answer:
          "Our discount codes are for one-time use only. If you return an item purchased with a discount code, the code cannot be reused, and all points earned from that purchase will be deducted.",
      },
    ],
  },
  {
    title: "Products & Inventory",
    items: [
      {
        question: "How can I confirm my size?",
        answer:
          "Please refer to the size chart on our website, which includes detailed measurement standards. If you still have questions, contact our team with your weight, height, bust, waist, and hip measurements along with the item name or product number at support@duskyonder.com. We will recommend the appropriate size within 24 hours.",
      },
      {
        question: "The style, size, or colour I want is out of stock. When will it be restocked?",
        answer:
          "To check the restock timeline for a specific item, please refer to the product description on our website. For further confirmation about inventory, feel free to contact us at support@duskyonder.com.",
      },
    ],
  },
];

// ── Accordion item ────────────────────────────────────────────────────────────
function AccordionItem({ item, isOpen, onToggle }: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="faq-question-text">{item.question}</span>
        <span className="faq-chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div className="faq-answer-wrap">
        <div className="faq-answer">{item.answer}</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FAQPage() {
  // Track open item per category: Map<categoryIndex, itemIndex | null>
  const [openMap, setOpenMap] = useState<Record<number, number | null>>({});

  function toggle(catIdx: number, itemIdx: number) {
    setOpenMap((prev) => ({
      ...prev,
      [catIdx]: prev[catIdx] === itemIdx ? null : itemIdx,
    }));
  }

  return (
    <div className="faq-page">
      <SFPromoBar />
      <SFHeader />

      {/* Hero */}
      <section className="faq-hero">
        <p className="faq-hero-label">Help Centre</p>
        <h1 className="faq-hero-title">Frequently Asked Questions</h1>
        <p className="faq-hero-sub">
          Can't find what you're looking for?{" "}
          <a href="/contact" className="faq-hero-link">Contact us</a> and we'll
          get back to you within 24 hours.
        </p>
      </section>

      {/* FAQ categories */}
      <main className="faq-body">
        <div className="faq-body-inner">
          {FAQ_DATA.map((cat, catIdx) => (
            <section key={catIdx} className="faq-category">
              <h2 className="faq-category-title">{cat.title}</h2>
              <div className="faq-list">
                {cat.items.map((item, itemIdx) => (
                  <AccordionItem
                    key={itemIdx}
                    item={item}
                    isOpen={openMap[catIdx] === itemIdx}
                    onToggle={() => toggle(catIdx, itemIdx)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* CTA */}
      <section className="faq-cta">
        <div className="faq-cta-inner">
          <p className="faq-cta-text">Still have questions?</p>
          <a href="/contact" className="faq-cta-btn">Get in Touch</a>
        </div>
      </section>

      <SFFooter />
    </div>
  );
}
