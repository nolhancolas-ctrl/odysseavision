"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

function revalidateMessages() {
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/activity");
}

function cleanMessageStatus(status: string) {
  if (status === "NEW" || status === "READ" || status === "ARCHIVED") {
    return status;
  }

  return "READ";
}

export async function setContactMessageStatus(
  messageId: string,
  status: string,
) {
  await db.contactMessage.update({
    where: { id: messageId },
    data: {
      status: cleanMessageStatus(status),
    },
  });

  revalidateMessages();
  redirect("/admin/messages");
}

export async function archiveContactMessage(messageId: string) {
  await db.contactMessage.update({
    where: { id: messageId },
    data: {
      status: "ARCHIVED",
    },
  });

  revalidateMessages();
  redirect("/admin/messages?filter=archived");
}

export async function unarchiveContactMessage(messageId: string) {
  await db.contactMessage.update({
    where: { id: messageId },
    data: {
      status: "READ",
    },
  });

  revalidateMessages();
  redirect("/admin/messages");
}

export async function markContactMessageRead(messageId: string) {
  await db.contactMessage.update({
    where: { id: messageId },
    data: {
      status: "READ",
    },
  });

  revalidateMessages();
  redirect("/admin/messages");
}

export async function markContactMessageUnread(messageId: string) {
  await db.contactMessage.update({
    where: { id: messageId },
    data: {
      status: "NEW",
    },
  });

  revalidateMessages();
  redirect("/admin/messages?filter=new");
}
