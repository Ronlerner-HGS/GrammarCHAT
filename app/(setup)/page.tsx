import React from "react";
import { redirect } from "next/navigation";
import { initialProfile } from "@/lib/initial-profile";
import { db } from "@/lib/db";
import { InitialModal } from "@/components/modals/initial-modal";

export default async function SetupPage() {
  const profile = await initialProfile();

  // Type guard to check if profile is the expected object
  if ('id' in profile) {
    const server = await db.server.findFirst({
      where: {
        members: {
          some: {
            profileId: profile.id
          }
        }
      }
    });

    if (server) return redirect(`/servers/${server.id}`);
  } else {
    // Handle the case where profile is not the expected object
    return redirect('/sign-in');
  }

  return <InitialModal />;
}