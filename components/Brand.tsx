import Link from "next/link";

export default function Brand({compact=false}:{compact?:boolean}) {
  return (
    <Link href="/" className={`brand-logo${compact ? " compact" : ""}`} aria-label="RentHub home">
      <img src={compact ? "/brand/renthub-mark.svg" : "/brand/renthub-logo.svg"} alt="RentHub" />
    </Link>
  );
}
