import React from "react";
import LogInNavbar from "@/components/LogInPage/LogInHeader";
import  LogInBox from "@/components/LogInPage/LogInBox";

export default function LoginPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LogInNavbar />
      <main className="flex-grow">
        <LogInBox />
      </main>
    </div>
  );
}