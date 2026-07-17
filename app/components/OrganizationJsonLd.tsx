import { getSiteUrl } from "@/lib/siteUrl";
import { site } from "@/lib/siteContent";

/** Organization + lokasjon for søk (JSON-LD). */
export function OrganizationJsonLd() {
  const url = getSiteUrl();
  const postalAddress = {
    "@type": "PostalAddress" as const,
    streetAddress: site.address.street,
    postalCode: site.address.postalCode,
    addressLocality: site.address.city,
    addressCountry: "NO",
  };

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: site.name,
        url,
        email: site.email,
        telephone: site.phoneHref.replace("tel:", ""),
        address: postalAddress,
      },
      {
        "@type": "AutoDealer",
        "@id": `${url}/#dealer`,
        name: site.name,
        url,
        parentOrganization: { "@id": `${url}/#organization` },
        address: postalAddress,
        telephone: site.phoneHref.replace("tel:", ""),
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
