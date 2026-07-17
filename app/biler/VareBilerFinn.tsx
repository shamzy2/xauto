import styles from "./VareBilerFinn.module.css";

const FINN_SRC =
  "https://www.finn.no/pw/search/car-norway?orgId=4829103";

export function VareBilerFinn() {
  return (
    <section
      className={styles.wrap}
      aria-label="Utvalg av biler på FINN.no"
    >
      <iframe
        title="Bilutvalg på FINN.no"
        src={FINN_SRC}
        className={styles.frame}
        allowFullScreen
      />
    </section>
  );
}
