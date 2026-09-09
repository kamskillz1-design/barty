import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";

export default function OAuthConsent() {
  return (
    <AuthLayout
      icon={ShieldCheck}
      title="AI client connection unavailable"
      subtitle="This connection feature is being migrated"
    >
      <p className="text-sm text-muted-foreground text-center">
        AI-client authorization is temporarily unavailable while the application
        moves from Base44 to Supabase and a new backend service.
      </p>

      <Button asChild className="w-full h-12 font-medium mt-6">
        <Link to="/">Return to home</Link>
      </Button>
    </AuthLayout>
  );
}
