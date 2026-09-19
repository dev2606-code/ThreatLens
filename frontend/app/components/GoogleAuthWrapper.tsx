"use client";

import { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

type GoogleAuthWrapperProps = {
  children: ReactNode;
};

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function GoogleAuthWrapper({
  children,
}: GoogleAuthWrapperProps) {
  if (!GOOGLE_CLIENT_ID) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}