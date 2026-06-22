export default function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "arrow" | "download" | "linkedin" | "mail" | "spark" | "check" | "menu" | "close";
  className?: string;
}) {
  const paths = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" />,
    linkedin: <path d="M7 9v8M7 6.5v.01M11 17v-4.5a3.5 3.5 0 0 1 7 0V17m-7-5v5" />,
    mail: <path d="m4 6 8 6 8-6M4 5h16v14H4z" />,
    spark: <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Zm7 15 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
