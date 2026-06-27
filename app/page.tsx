import About from "@/components/About";
import Contact from "@/components/Contact";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Quotes from "@/components/Quotes";
import SellCar from "@/components/SellCar";
import Services from "@/components/Services";
import Trust from "@/components/Trust";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Trust />
        <Services />
        <SellCar />
        <About />
        <Quotes />
        <Contact />
      </main>
    </>
  );
}
