import React, { useEffect, useRef, useState } from "react";

interface CheckoutStrings {
  title: string;
  intro: string;
  billing_monthly: string;
  billing_yearly: string;
  name_label: string;
  name_placeholder: string;
  email_label: string;
  email_placeholder: string;
  submit: string;
  close: string;
  terms: string;
  error_required: string;
  error_generic: string;
  error_network: string;
}

interface PricingCheckoutProps {
  lang: "nl" | "en";
  /** Plan id from src/config/plans.json — the server looks up the price. */
  planId: string;
  planTitle: string;
  buttonLabel: string;
  strings: CheckoutStrings;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PricingCheckout({
  lang,
  planId,
  planTitle,
  buttonLabel,
  strings,
}: PricingCheckoutProps) {
  const [showModal, setShowModal] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const open = () => {
    // Read the monthly/yearly toggle at the moment the modal opens
    const toggleEl = document.getElementById(
      "pricing-toggle",
    ) as HTMLInputElement | null;
    setIsYearly(toggleEl?.checked ?? false);
    setError("");
    setShowModal(true);
  };

  useEffect(() => {
    if (!showModal) return;
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, loading]);

  const handleCheckout = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email.trim())) {
      setError(strings.error_required);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the plan id + interval are sent. The price is decided on the server.
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          planId,
          interval: isYearly ? "year" : "month",
          lang,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(strings.error_generic);
        setLoading(false);
      }
    } catch {
      setError(strings.error_network);
      setLoading(false);
    }
  };

  const titleId = `checkout-title-${planId}`;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="btn btn-primary w-full my-10 block text-center cursor-pointer"
      >
        {buttonLabel}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) setShowModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="bg-light border border-border p-8 rounded-3xl w-full max-w-md shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-text-dark hover:text-white"
              aria-label={strings.close}
              disabled={loading}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 id={titleId} className="text-h5 font-bold mb-2 text-white pr-8">
              {strings.title.replace("{plan}", planTitle)}
            </h3>
            <p className="text-sm text-primary mb-4">
              {isYearly ? strings.billing_yearly : strings.billing_monthly}
            </p>
            <p className="text-sm text-text mb-6">{strings.intro}</p>

            <form onSubmit={handleCheckout} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor={`co-name-${planId}`}
                  className="block text-sm font-medium text-white mb-1"
                >
                  {strings.name_label}
                </label>
                <input
                  id={`co-name-${planId}`}
                  ref={nameRef}
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input w-full rounded-xl border border-border bg-body px-4 py-3 text-white placeholder:text-text-dark focus:border-primary focus:ring-0"
                  placeholder={strings.name_placeholder}
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor={`co-email-${planId}`}
                  className="block text-sm font-medium text-white mb-1"
                >
                  {strings.email_label}
                </label>
                <input
                  id={`co-email-${planId}`}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input w-full rounded-xl border border-border bg-body px-4 py-3 text-white placeholder:text-text-dark focus:border-primary focus:ring-0"
                  placeholder={strings.email_placeholder}
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm mt-2" role="alert">
                  {error}
                </p>
              )}

              <p
                className="text-xs text-text-dark leading-relaxed"
                dangerouslySetInnerHTML={{ __html: strings.terms }}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-2 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  strings.submit
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
