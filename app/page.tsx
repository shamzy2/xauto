import { HomeAbout } from "./components/HomeAbout";
import { HomeHero } from "./components/HomeHero";
import { HomeServices } from "./components/HomeServices";
import { HomeSocialProof } from "./components/HomeSocialProof";
import { Menu } from "./components/Menu";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homeBleed}>
      <Menu />
      <HomeHero />
      <HomeServices />
      <HomeAbout />
      <HomeSocialProof />
    </div>
  );
}
