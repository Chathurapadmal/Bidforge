// src/app/register/layout.tsx
export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>; // minimal layout, only register content
}
