import React from "react";
import LogInHeader from "@/components/LogInPage/LogInHeader";
import  LogInBox from "@/components/LogInPage/LogInBox";

export default function LoginPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <LogInHeader />
      <main className="flex-grow">
        <LogInBox />
      </main>
    </div>
  );
}