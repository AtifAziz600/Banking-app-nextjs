"use client";

import { useState } from "react";
import { createSuperadmin, signInSuperadmin } from "@/lib/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const AdminSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCreateSuperadmin = async () => {
    setIsLoading(true);
    setResult("");
    setError("");

    try {
      const response = await createSuperadmin();
      if (response) {
        setResult("Superadmin created successfully! You can now sign in with the credentials below.");
      } else {
        setError("Failed to create superadmin. Check console for details.");
      }
    } catch (err) {
      setError("An error occurred while creating superadmin.");
    }

    setIsLoading(false);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const session = await signInSuperadmin();
      if (session) {
        window.location.href = "/";
      } else {
        setError("Failed to sign in. Make sure superadmin is created first.");
      }
    } catch (err) {
      setError("An error occurred while signing in.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 p-8">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Superadmin Setup</h1>
          <p className="mt-2 text-sm text-gray-600">
            Initialize the superadmin account for your Horizon banking app
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">Superadmin Credentials</h3>
            <div className="mt-2 space-y-1 text-sm text-blue-800">
              <p><span className="font-medium">Email:</span> superadmin@horizon.com</p>
              <p><span className="font-medium">Password:</span> SuperAdmin@123</p>
            </div>
          </div>

          <Button
            onClick={handleCreateSuperadmin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Creating...
              </>
            ) : (
              "Create Superadmin"
            )}
          </Button>

          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            Sign In as Superadmin
          </Button>

          {result && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              {result}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
