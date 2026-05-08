import { requireModule } from "@/lib/permissions";
import DevicesClient from "./DevicesClient";

export default async function DevicesPage() {
  await requireModule("ai_settings"); // reuse ai_settings permission for device management

  const hasAccountToken = !!process.env.FONNTE_ACCOUNT_TOKEN;

  return <DevicesClient hasAccountToken={hasAccountToken} />;
}
