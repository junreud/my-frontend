import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Container } from "@/components/common/Container";
import BlogHero from "@/components/BlogPage/BlogHero";
import BlogList from "@/components/BlogPage/BlogList";
import BlogCategories from "@/components/BlogPage/BlogCategories";

export default function BlogPage() {
  return (
    <>
      <Container>
        <Navbar />
      </Container>
      <BlogHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <BlogList />
          </div>
          <div className="lg:col-span-1">
            <BlogCategories />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
