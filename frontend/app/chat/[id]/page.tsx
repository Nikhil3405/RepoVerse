import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatClient from "./chat-client";

interface Props {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: Props) {
  const { userId } = await auth();

  if (!userId) redirect("/");

  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/conversations/repo/${id}`,
    { cache: "no-store" },
  );

  const conv = await res.json();

  const repoId = conv;

  return <ChatClient conversationId={id} repoId={repoId} />;
}
