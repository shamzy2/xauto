import { HomeHero } from "./components/HomeHero";
import { HomeServices } from "./components/HomeServices";
import { Menu } from "./components/Menu";
import { SellEnkeltOgTrygt } from "./components/SellEnkeltOgTrygt";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homeBleed}>
      <Menu />
      <HomeHero />
      <HomeServices />
      <SellEnkeltOgTrygt scope="home" />
    </div>
  );
}
