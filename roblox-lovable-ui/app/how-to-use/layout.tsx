import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Use - Roblox Code Generator",
  description: "Learn how to use the Roblox Code Generator with step-by-step tutorials, examples, and pro tips.",
};

export default function HowToUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}