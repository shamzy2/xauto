/** Fixed backdrop — white base + CSS film grain (no JS, behind content). */
export function SiteBackdrop() {
  return (
    <div className="siteBackdrop" aria-hidden>
      <div className="siteBackdropBase" />
      <div className="siteBackdropNoise" />
    </div>
  );
}
