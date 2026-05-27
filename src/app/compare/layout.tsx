import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why ProductPixl — compare listing tools",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
