import type { Channel } from "../lib/data";
import { channels } from "../lib/data";
import { cn } from "../utils/cn";

/* Platform marks — brand colour is information here (it identifies the
   channel at a glance), so it is the one place the UI palette gives way.
   Marks are decorative: the adjacent text carries the name.            */
export default function PlatformMark({
  channel,
  size = 20,
  className,
}: {
  channel: Channel;
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className: cn("shrink-0", className),
    "aria-hidden": true as const,
    focusable: false as const,
  };

  switch (channel) {
    case "google":
      return (
        <svg {...common}>
          <title>{channels.google.label}</title>
          <rect x="9.5" y="2.5" width="5" height="15" rx="2.5" fill="#FBBC04" transform="rotate(-30 12 10)" />
          <rect x="9.5" y="2.5" width="5" height="15" rx="2.5" fill="#4285F4" transform="rotate(30 12 10)" />
          <circle cx="6.2" cy="18.3" r="3.2" fill="#34A853" />
        </svg>
      );
    case "meta":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="11" fill="#0866FF" />
          <path
            d="M5 12c0-2 1.3-3.6 3-3.6 2.2 0 3.2 3.6 4 3.6s1.8-3.6 4-3.6c1.7 0 3 1.6 3 3.6s-1.3 3.6-3 3.6c-2.2 0-3.2-3.6-4-3.6s-1.8 3.6-4 3.6c-1.7 0-3-1.6-3-3.6Z"
            fill="none"
            stroke="#fff"
            strokeWidth="1.7"
          />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="11" fill="#0f0f12" stroke="#3a3a44" />
          <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "reddit":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="11" fill="#FF4500" />
          <ellipse cx="12" cy="13.6" rx="5.6" ry="4" fill="#fff" />
          <circle cx="6.6" cy="12.2" r="1.4" fill="#fff" />
          <circle cx="17.4" cy="12.2" r="1.4" fill="#fff" />
          <circle cx="10" cy="13.2" r="1" fill="#FF4500" />
          <circle cx="14" cy="13.2" r="1" fill="#FF4500" />
          <path d="M12 9.6l1-3.2 2.6.9" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="15.9" cy="7.2" r="1.1" fill="#fff" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <rect x="1" y="1" width="22" height="22" rx="6" fill="#0f0f12" stroke="#3a3a44" />
          <path d="M13.6 5.5v9.2a2.7 2.7 0 1 1-2.7-2.7" fill="none" stroke="#69C9D0" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12.6 6.5v9.2a2.7 2.7 0 1 1-2.7-2.7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12.6 6.5c.4 2.1 1.9 3.4 4 3.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "microsoft":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8.5" height="8.5" fill="#F25022" />
          <rect x="12.5" y="3" width="8.5" height="8.5" fill="#7FBA00" />
          <rect x="3" y="12.5" width="8.5" height="8.5" fill="#00A4EF" />
          <rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#FFB900" />
        </svg>
      );
  }
}
