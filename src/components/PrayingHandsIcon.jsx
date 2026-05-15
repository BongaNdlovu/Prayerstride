export default function PrayingHandsIcon({ size = 24, className = "", strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9.2 3.4c1.1 1.8 1.65 3.55 1.65 5.25v8.1c0 1.35-.72 2.6-1.9 3.28l-1.05.6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.8 3.4c-1.1 1.8-1.65 3.55-1.65 5.25v8.1c0 1.35.72 2.6 1.9 3.28l1.05.6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.6 7.9 5.9 12c-.5.76-.6 1.72-.28 2.56l1.55 4.02"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4 7.9 18.1 12c.5.76.6 1.72.28 2.56l-1.55 4.02"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.9 9.2 9.3 11.9M13.1 9.2l1.6 2.7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}