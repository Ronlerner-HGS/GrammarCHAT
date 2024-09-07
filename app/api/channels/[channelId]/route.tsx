import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    if (!serverId)
      return new NextResponse("Server ID Missing", { status: 400 });
    if (!params.channelId)
      return new NextResponse("Channel ID Missing", { status: 400 });

    const { name, type } = await req.json();
    if (!name || !type || name === "general")
      return new NextResponse("Name / Type cannot be empty or general", {
        status: 400
      });

    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const isMember = await db.member.findFirst({
      where: {
        serverId: server.id,
        profileId: profile.id,
        role: {
          in: [MemberRole.ADMIN, MemberRole.MODERATOR],
        },
      },
    });

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("[CHANNEL_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
    req: Request,
    { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    if (!serverId)
      return new NextResponse("Server ID Missing", { status: 400 });
    if (!params.channelId)
      return new NextResponse("Channel ID Missing", { status: 400 });

    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
    });

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const isMember = await db.member.findFirst({
      where: {
        serverId: server.id,
        profileId: profile.id,
        role: {
          in: [MemberRole.ADMIN, MemberRole.MODERATOR],
        },
      },
    });

    if (!isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedServer = await db.server.update({
      where: {
        id: serverId,
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
          },
        },
      },
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("[CHANNEL_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}