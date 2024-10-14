import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

export function AuthButton() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex justify-end p-4">
      {isSignedIn ? (
        <SignOutButton>
          <Button variant="outline">Sign out</Button>
        </SignOutButton>
      ) : (
        <SignInButton mode="modal">
          <Button>Sign in</Button>
        </SignInButton>
      )}
    </div>
  );
}
