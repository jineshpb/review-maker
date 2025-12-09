import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  UserAvatar,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

const Header = async () => {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-2 px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <span className="text-md font-medium tracking-tight text-primary">
            Review guys
          </span>
        </div>

        <div className="flex items-center gap-2">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default Header;
