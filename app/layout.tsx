import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatStory – WhatsApp Chat Viewer",
  description: "Upload your WhatsApp chat export and view it in a beautiful chat UI. Processed entirely in your browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
