import type { CSSProperties } from "react";

export function IconifyIcon({ icon, className = "size-5", label }: {
  icon: `${string}:${string}`;
  className?: string;
  label?: string;
}) {
  const [prefix, name] = icon.split(":");
  const url = `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg`;
  const style = {
    WebkitMaskImage: `url("${url}")`,
    maskImage: `url("${url}")`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  } as CSSProperties;

  return <span aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined} className={`inline-block shrink-0 bg-current ${className}`} style={style} />;
}
