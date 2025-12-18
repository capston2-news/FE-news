import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import MainLayout from "./Content/MainLayout";

export default function HomePage() {
  return (
    <>
      <Header />

      {/* skip link for accessibility */}
      <a href="#main" className="sr-only focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 p-2 rounded-md">Bỏ qua tới nội dung chính</a>

      <MainLayout />
      <Footer />
    </>
  );
}
