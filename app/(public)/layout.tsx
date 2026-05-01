import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import LiveChat from "@/components/public/LiveChat";


export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <LiveChat />

    </>
  );
}
