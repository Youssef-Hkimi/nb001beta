import type { CSSProperties } from "react";

const VERIFIED_BADGE_MASK = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgoJPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9IiMwMGM0ZmYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTIxLjAwNyA4LjI3QzIyLjE5NCA5LjEyNSAyMyAxMC40NSAyMyAxMnMtLjgwNiAyLjg3Ni0xLjk5MyAzLjczYy4yNCAxLjQ0Mi0uMTM0IDIuOTU4LTEuMjI3IDQuMDVjLTEuMDk1IDEuMDk1LTIuNjEgMS40NTktNC4wNDYgMS4yMjVDMTQuODgzIDIyLjE5NiAxMy41NDYgMjMgMTIgMjNjLTEuNTUgMC0yLjg3OC0uODA3LTMuNzMxLTEuOTk2Yy0xLjQzOC4yMzUtMi45NTQtLjEyOC00LjA1LTEuMjI0Yy0xLjA5NS0xLjA5NS0xLjQ1OS0yLjYxMS0xLjIxNy00LjA1QzEuODE2IDE0Ljg3NyAxIDEzLjU1MSAxIDEycy44MTYtMi44NzggMi4wMDItMy43M2MtLjI0Mi0xLjQzOS4xMjItMi45NTUgMS4yMTgtNC4wNWMxLjA5My0xLjA5NCAyLjYxLTEuNDY3IDQuMDU3LTEuMjI3QzkuMTI1IDEuODA0IDEwLjQ1MyAxIDEyIDFjMS41NDUgMCAyLjg4LjgwMyAzLjczMiAxLjk5M2MxLjQ0Mi0uMjQgMi45NTYuMTM1IDQuMDQ4IDEuMjI3czEuNDY4IDIuNjA4IDEuMjI3IDQuMDVtLTQuNDI2LS4wODRhMSAxIDAgMCAxIC4yMzMgMS4zOTVsLTUgN2ExIDEgMCAwIDEtMS41MjEuMTI2bC0zLTNhMSAxIDAgMCAxIDEuNDE0LTEuNDE0bDIuMTY1IDIuMTY1bDQuMzE0LTYuMDRhMSAxIDAgMCAxIDEuMzk1LS4yMzIiIGNsaXAtcnVsZT0iZXZlbm9kZCIgLz4KPC9zdmc+Cg==";

export function VerifiedBadgeIcon({ className = "size-5 text-[#00c4ff]", label }: { className?: string; label?: string }) {
  const style = {
    backgroundColor: "#00c4ff",
    WebkitMaskImage: `url("${VERIFIED_BADGE_MASK}")`,
    maskImage: `url("${VERIFIED_BADGE_MASK}")`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  } as CSSProperties;

  return <span aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} className={`inline-block shrink-0 ${className}`} style={style} />;
}
