import { Logo } from "@/components/Logo";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <div className="flex items-center gap-2 p-4">
        <Logo className=" top-4 left-4 text-primary" />
        <span className="text-xl font-bold tracking-tight bg-linear-to-br from-primary to-primary/80 bg-clip-text text-transparent">
          Review Picasso
        </span>
      </div>
      <SignUp />
    </div>
  );
}
