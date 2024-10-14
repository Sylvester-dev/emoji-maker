import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
      <UserProfile />
    </div>
  );
}
