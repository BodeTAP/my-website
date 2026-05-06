import { requireModule } from "@/lib/permissions";
import HostingClient from "./HostingClient";

export default async function AdminHostingPage() {
  await requireModule("hosting");
  return <HostingClient />;
}
