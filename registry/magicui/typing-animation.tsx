"use client";

import type {ElementType, HTMLAttributes} from "react";

import {useEffect, useMemo, useState} from "react";

type TypingAnimationProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDelay?: number;
  delay?: number;
  loop?: boolean;
  showCursor?: boolean;
};

export function TypingAnimation({
  as: Component = "span",
  words,
  typeSpeed = 90,
  deleteSpeed = 55,
  pauseDelay = 1200,
  delay = 150,
  loop = false,
  showCursor = true,
  className,
  ...props
}: TypingAnimationProps) {
  const safeWords = useMemo(() => words.filter(Boolean), [words]);
  const [wordIndex, setWordIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = window.setTimeout(() => setHasStarted(true), delay);
    return () => window.clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted || safeWords.length === 0) return;

    const currentWord = safeWords[wordIndex] ?? "";
    const isComplete = characterIndex === currentWord.length;
    const isEmpty = characterIndex === 0;
    const isLastWord = wordIndex === safeWords.length - 1;

    if (!loop && isLastWord && isComplete && !isDeleting) return;

    let timeout = isDeleting ? deleteSpeed : typeSpeed;

    if (isComplete && !isDeleting) timeout = pauseDelay;
    if (isEmpty && isDeleting) timeout = 220;

    const timer = window.setTimeout(() => {
      if (isComplete && !isDeleting) {
        setIsDeleting(true);
        return;
      }

      if (isEmpty && isDeleting) {
        setIsDeleting(false);
        setWordIndex((index) => (index + 1) % safeWords.length);
        return;
      }

      setCharacterIndex((index) => index + (isDeleting ? -1 : 1));
    }, timeout);

    return () => window.clearTimeout(timer);
  }, [
    characterIndex,
    deleteSpeed,
    hasStarted,
    isDeleting,
    loop,
    pauseDelay,
    safeWords,
    typeSpeed,
    wordIndex,
  ]);

  const currentWord = safeWords[wordIndex] ?? "";

  return (
    <Component
      className={className}
      aria-label={safeWords.join(" and ")}
      {...props}
    >
      <span aria-hidden="true">{currentWord.slice(0, characterIndex)}</span>
      {showCursor ? (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block animate-pulse text-current"
        >
          |
        </span>
      ) : null}
    </Component>
  );
}
