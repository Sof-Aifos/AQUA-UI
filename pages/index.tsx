import ChatDisplay from "@/components/ChatDisplay";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const LoginPage = dynamic(() => import("./login"), { ssr: false });

export default function Home() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <LoginPage />;
  return <ChatDisplay />;
}
