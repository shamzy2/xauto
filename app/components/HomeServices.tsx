import warrantyAnimation from "@/public/bilder/lottie/Warranty.json";
import carAnimation from "@/public/bilder/lottie/Car.json";
import certificationAnimation from "@/public/bilder/lottie/Certification.json";
import distanceAnimation from "@/public/bilder/lottie/Distance.json";
import { ServiceLottieIcon } from "./ServiceLottieIcon";
import styles from "./HomeServices.module.css";

type CoreService = {
  title: string;
  tag: string;
  animationData: object;
};

const coreServices: CoreService[] = [
  {
    title: "Bruktbilgaranti",
    tag: "Trygghet etter fabrikkgarantien",
    animationData: warrantyAnimation,
  },
  {
    title: "Innbytte",
    tag: "Uforpliktende tilbud raskt",
    animationData: carAnimation,
  },
  {
    title: "Autoreg-avtale",
    tag: "Omregistrering samme dag",
    animationData: certificationAnimation,
  },
  {
    title: "Transport",
    tag: "Levering når du trenger det",
    animationData: distanceAnimation,
  },
];

export function HomeServices() {
  return (
    <section className={styles.shell} aria-labelledby="services-title">
      <div className={styles.page}>
        <header className={styles.intro}>
          <h2 id="services-title" className={styles.introTitle}>
            Bygget på klarhet og trygghet
          </h2>
        </header>

        <ul className={styles.coreGrid}>
          {coreServices.map((item) => (
            <li key={item.title} className={styles.coreItem}>
              <div className={styles.coreItemInner}>
                <span className={styles.iconWrap} aria-hidden>
                  <ServiceLottieIcon
                    animationData={item.animationData}
                    className={styles.lottieIcon}
                  />
                </span>
                <div className={styles.coreCopy}>
                  <h3 className={styles.coreTitle}>{item.title}</h3>
                  <p className={styles.coreTag}>{item.tag}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
