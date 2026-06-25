import { useState } from "react";
import { useForm } from "react-hook-form";
import { SFPromoBar, SFHeader, SFFooter } from "@/components/StorefrontShell";

// ── Types ────────────────────────────────────────────────────────────────────
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

// ── Destination email ────────────────────────────────────────────────────────
const SUPPORT_EMAIL = "support@duskyonder.com";

// ── Placeholder submit handler ───────────────────────────────────────────────
async function submitContactForm(data: ContactFormData): Promise<void> {
  // TODO: Replace with real API call, e.g.:
  //   await trpc.contact.send.mutateAsync({ ...data, to: SUPPORT_EMAIL });
  // All submissions are routed to SUPPORT_EMAIL (support@duskyonder.com).
  await new Promise((resolve) => setTimeout(resolve, 1200));
  console.log("Contact form submitted to", SUPPORT_EMAIL, data);
}

// ── Contact info items ───────────────────────────────────────────────────────
const INFO_ITEMS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
    label: "Location",
    value: "Hong Kong",
    href: undefined,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    label: "Response Time",
    value: "Within 24 hours",
    href: undefined,
  },
];

// ── Main component ───────────────────────────────────────────────────────────
export default function ContactPage() {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({ mode: "onTouched" });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("submitting");
    try {
      await submitContactForm(data);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="contact-page">
      <SFPromoBar />
      <SFHeader darkMode={false} />

      {/* ── Hero ── */}
      <section className="contact-hero">
        <p className="contact-hero-eyebrow">Get in Touch</p>
        <h1 className="contact-hero-title">Contact Us</h1>
        <p className="contact-hero-subtitle">
          Have a question about your order, a collaboration idea, or just want to say hello?<br />
          We'd love to hear from you.
        </p>
      </section>

      {/* ── Body ── */}
      <section className="contact-body">
        <div className="contact-body-inner">

          {/* ── Left: Form ── */}
          <div className="contact-form-col">
            <h2 className="contact-section-title">Send a Message</h2>

            {/* Success banner */}
            {status === "success" && (
              <div className="contact-alert contact-alert--success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Thank you! We'll get back to you within 24–48 hours.</span>
              </div>
            )}

            {/* Error banner */}
            {status === "error" && (
              <div className="contact-alert contact-alert--error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <span>Something went wrong. Please try again or email us directly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="contact-form">
              {/* Name + Email row */}
              <div className="contact-form-row">
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-name">Name</label>
                  <input
                    id="cf-name"
                    type="text"
                    placeholder="Your full name"
                    className={`contact-input${errors.name ? " contact-input--error" : ""}`}
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="contact-error">{errors.name.message}</p>}
                </div>
                <div className="contact-field">
                  <label className="contact-label" htmlFor="cf-email">Email</label>
                  <input
                    id="cf-email"
                    type="email"
                    placeholder="you@example.com"
                    className={`contact-input${errors.email ? " contact-input--error" : ""}`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
                    })}
                  />
                  {errors.email && <p className="contact-error">{errors.email.message}</p>}
                </div>
              </div>

              {/* Subject */}
              <div className="contact-field">
                <label className="contact-label" htmlFor="cf-subject">Subject</label>
                <input
                  id="cf-subject"
                  type="text"
                  placeholder="What is this about?"
                  className={`contact-input${errors.subject ? " contact-input--error" : ""}`}
                  {...register("subject", { required: "Subject is required" })}
                />
                {errors.subject && <p className="contact-error">{errors.subject.message}</p>}
              </div>

              {/* Message */}
              <div className="contact-field">
                <label className="contact-label" htmlFor="cf-message">Message</label>
                <textarea
                  id="cf-message"
                  rows={6}
                  placeholder="Tell us more…"
                  className={`contact-input contact-textarea${errors.message ? " contact-input--error" : ""}`}
                  {...register("message", {
                    required: "Message is required",
                    minLength: { value: 10, message: "Message must be at least 10 characters" },
                  })}
                />
                {errors.message && <p className="contact-error">{errors.message.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="contact-submit-btn"
              >
                {status === "submitting" ? (
                  <>
                    <span className="contact-spinner" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>

          {/* ── Right: Info ── */}
          <div className="contact-info-col">
            <h2 className="contact-section-title">Contact Details</h2>
            <p className="contact-info-intro">
              Our team is here to help with anything — orders, returns, styling advice, or press enquiries.
            </p>

            <ul className="contact-info-list">
              {INFO_ITEMS.map((item) => (
                <li key={item.label} className="contact-info-item">
                  <span className="contact-info-icon">{item.icon}</span>
                  <div>
                    <p className="contact-info-label">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="contact-info-value contact-info-link">
                        {item.value}
                      </a>
                    ) : (
                      <p className="contact-info-value">{item.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="contact-info-divider" />

            <p className="contact-info-note">
              For order-related enquiries, please have your order number ready to help us assist you faster.
            </p>
          </div>

        </div>
      </section>

      {/* ── Legal Entity Section (GMC compliance) ── */}
      <section className="contact-legal">
        <div className="contact-legal-inner">
          <p className="contact-legal-name">HINGTO INTERNATIONAL GROUP CO., LIMITED</p>
          <p className="contact-legal-address">
            164–166 Hennessy Road, Suite 9A, 9/F, Hennessy Plaza, Wan Chai, Hong Kong Island, Hong Kong
          </p>
        </div>
      </section>

      <SFFooter />
    </div>
  );
}
