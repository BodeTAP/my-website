import { requireModule } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import DevicesClient from "./DevicesClient";

export default async function DevicesPage() {
  await requireModule("ai_settings");

  const hasAccountToken = !!process.env.FONNTE_ACCOUNT_TOKEN;

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: ["fonnte_api_key", "fonnte_api_keys"] } },
  });
  const settingsMap = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const initialApiKey  = settingsMap["fonnte_api_key"]  ?? "";
  const initialApiKeys = settingsMap["fonnte_api_keys"] ?? "";

  return (
    <DevicesClient
      hasAccountToken={hasAccountToken}
      initialApiKey={initialApiKey}
      initialApiKeys={initialApiKeys}
    />
  );
}
