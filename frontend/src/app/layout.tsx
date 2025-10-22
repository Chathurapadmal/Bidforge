import "../lib/patchRepeat";
import LayoutClient from "./LayoutClient";
import "./css/globals.css";

export const metadata = { title: "Bidforge" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
