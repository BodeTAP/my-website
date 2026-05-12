import { redirect } from "next/navigation";

export default function DevicesSettingsRedirect() {
  redirect("/admin/settings?tab=broadcast&section=waDevices");
}
