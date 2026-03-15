import type { SVGProps } from "react";

export const Skull = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M8 20v2h8v-2" />
    <path d="M12.5 17.125a4.5 4.5 0 1 0-5 0" />
    <path d="M16 20a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2" />
    <path d="M18 10a6 6 0 0 0-12 0" />
  </svg>
);
