"use client";

interface Props {
  src: string;
  trigger?: string;
  size?: number;
}

export default function LordIcon({ src, trigger = "hover", size = 26 }: Props) {
  // Render as a plain element using createElement to avoid TS JSX type issues
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `<lord-icon src="${src}" trigger="${trigger}" style="width:${size}px;height:${size}px;display:block;"></lord-icon>`,
      }}
    />
  );
}
