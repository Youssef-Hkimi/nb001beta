"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Button>, "onPress"> & {
  href: string;
  target?: "_blank" | "_self";
};

export function LinkButton({ href, target = "_self", children, ...props }: Props) {
  const router = useRouter();

  return (
    <Button
      {...props}
      onPress={() => {
        if (target === "_blank") {
          window.open(href, "_blank", "noopener,noreferrer");
          return;
        }
        if (href.startsWith("#")) {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
          return;
        }
        router.push(href);
      }}
    >
      {children}
    </Button>
  );
}
