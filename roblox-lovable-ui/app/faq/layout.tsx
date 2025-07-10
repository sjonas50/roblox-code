import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Roblox Code Generator",
  description: "Frequently asked questions about using the Roblox Code Generator to create scripts for your games.",
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}