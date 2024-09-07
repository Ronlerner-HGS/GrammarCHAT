import React from "react";
import { redirectToSignIn } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ServerSidebar } from "@/components/server/server-sidebar";

interface ServerPageProps {
  children: React.ReactNode;
  params: { serverId: string };
}

export default async function ServerPage({ children, params }: ServerPageProps) {
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const server = await db.server.findUnique({
    where: {
      id: params.serverId
    }
  });

  if (!server) return redirect("/");

  const isMember = await db.server.findFirst({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  if (!isMember) return redirect("/");

  return (
      <div className="h-full">
        <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
          <ServerSidebar serverId={params.serverId} />
        </div>
        <main className="h-full md:pl-60">{children}</main>
      </div>
  );
}