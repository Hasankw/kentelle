"use client";

const messages = [
  "Free shipping on orders over $80 AUD",
  "✦",
  "Cruelty-free · Vegan · Made for Australian skin",
  "✦",
  "Clinically tested formulas — real results in 4 weeks",
  "✦",
  "Try the Kentelle Skin Quiz for personalised recommendations",
  "✦",
  "Free shipping on orders over $80 AUD",
  "✦",
  "Cruelty-free · Vegan · Made for Australian skin",
  "✦",
  "Clinically tested formulas — real results in 4 weeks",
  "✦",
  "Try the Kentelle Skin Quiz for personalised recommendations",
  "✦",
];

export default function AnnouncementBar() {
  return (
    <div
      className="text-brand-navy text-xs py-2 overflow-hidden relative"
      style={{
        background:
          "linear-gradient(90deg, rgba(226,137,153,1) 0%, rgba(226,137,153,1) 15%, rgba(232,240,242,1) 50%, rgba(57,205,153,1) 86%)",
      }}
    >
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
        {messages.map((msg, i) => (
          <span key={i} className="font-body font-semibold tracking-wider px-6">
            {msg}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
