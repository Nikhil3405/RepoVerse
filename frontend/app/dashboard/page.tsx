import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ConversationCard from "@/components/conversation-card";
import NewConversationInput from "@/components/new-conversation-input";
import {
  MessageSquare,
  LayoutDashboard,
  Clock,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/header";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const convRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/conversations/${userId}`,
    { cache: "no-store" }
  );
  const conversations = await convRes.json();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header/>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard size={16} />
              <span>Workspace</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold mt-2 tracking-tight">
              Your Codebases
            </h1>

            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Continue a conversation or start a new one.
            </p>
          </div>

          <NewConversationInput userId={userId} />
        </div>

        {/* SECTION */}
        <section className="space-y-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>Recent</span>
              <Badge variant="secondary">
                {conversations.length}
              </Badge>
            </div>
          </div>

          <Separator />

          {conversations.length === 0 ? (
            /* EMPTY STATE */
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">

                <div className="mb-4 rounded-full border p-3">
                  <MessageSquare size={22} />
                </div>

                <h3 className="font-medium text-base">
                  No conversations yet
                </h3>

                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Start by adding a repository above.
                </p>
              </CardContent>
            </Card>
          ) : (
            /* GRID */
            <div className="grid gap-4 sm:grid-cols-2">
              {conversations.map((conv: any) => (
                <ConversationCard
                  key={conv.id}
                  id={conv.id}
                  title={conv.title}
                  updated_at={conv.updated_at}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}