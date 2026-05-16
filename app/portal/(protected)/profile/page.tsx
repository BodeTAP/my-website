import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientInvoiceDesign } from "@/lib/invoiceDesign";
import { prisma } from "@/lib/prisma";
import { getClientProposalDesign } from "@/lib/proposalDesign";
import ProfileForm from "./ProfileForm";
import { FadeUp } from "@/components/public/motion";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/portal/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { client: true },
  });
  if (!user) redirect("/portal/login");

  const profile = {
    name:         user.name,
    email:        user.email,
    image:        user.image,
    businessName: user.client?.businessName ?? "",
    phone:        user.client?.phone ?? "",
    address:      user.client?.address ?? "",
  };
  const [proposalDesign, invoiceDesign] = user.client
    ? await Promise.all([
        getClientProposalDesign(user.client.id),
        getClientInvoiceDesign(user.client.id),
      ])
    : [null, null] as const;
  const brandKit = {
    logoUrl: proposalDesign?.logoUrl ?? invoiceDesign?.logoUrl ?? null,
    primaryColor: proposalDesign?.primaryColor ?? invoiceDesign?.primaryColor ?? "#1e40af",
    accentColor: proposalDesign?.accentColor ?? invoiceDesign?.accentColor ?? "#0d9488",
    fontStyle: proposalDesign?.fontStyle ?? invoiceDesign?.fontStyle ?? "sans",
  };

  return (
    <div>
      <FadeUp className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profil Saya</h1>
        <p className="text-blue-200/50 text-sm mt-1">
          Kelola informasi akun dan foto profil Anda.
        </p>
      </FadeUp>
      <FadeUp delay={0.15}>
        <ProfileForm profile={profile} brandKit={brandKit} />
      </FadeUp>
    </div>
  );
}
