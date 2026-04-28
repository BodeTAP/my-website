import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profil Saya</h1>
        <p className="text-blue-200/50 text-sm mt-1">
          Kelola informasi akun dan foto profil Anda.
        </p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
