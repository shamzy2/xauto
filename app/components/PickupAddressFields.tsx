"use client";

import { useEffect, useRef, useState } from "react";
import type { PickupAddress } from "@/lib/types/pickupAddress";
import { MapPinIcon } from "./FlowIcons";
import styles from "./PickupAddressFields.module.css";

type AddressSuggestion = {
  id: string;
  street: string;
  postalCode: string;
  city: string;
  municipality: string;
  lat: number;
  lon: number;
};

type Props = {
  address: PickupAddress;
  onChange: (address: PickupAddress) => void;
};

export function PickupAddressFields({ address, onChange }: Props) {
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isConfirmed = Boolean(address.lat && address.lon);

  function formatConfirmedAddress(addr: PickupAddress) {
    const parts = [addr.street, `${addr.postalCode} ${addr.city}`];
    if (addr.municipality) parts.push(addr.municipality);
    return parts.join(" · ");
  }

  const displayValue = isConfirmed
    ? formatConfirmedAddress(address)
    : address.street;

  useEffect(() => {
    const query = address.street.trim();
    if (query.length < 2 || isConfirmed) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const params = new URLSearchParams({ q: query });
        const res = await fetch(`/api/address/search?${params}`);
        if (!res.ok) throw new Error("search_failed");
        const data = (await res.json()) as { suggestions: AddressSuggestion[] };
        if (!cancelled) {
          setSuggestions(data.suggestions);
          setShowSuggestions(data.suggestions.length > 0);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [address.street, isConfirmed]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function selectSuggestion(suggestion: AddressSuggestion) {
    onChange({
      street: suggestion.street,
      postalCode: suggestion.postalCode,
      city: suggestion.city,
      municipality: suggestion.municipality,
      lat: suggestion.lat,
      lon: suggestion.lon,
    });
    setShowSuggestions(false);
    setSuggestions([]);
  }

  function handleStreetChange(value: string) {
    onChange({
      street: value,
      postalCode: "",
      city: "",
      municipality: undefined,
      lat: undefined,
      lon: undefined,
    });
    setShowSuggestions(true);
  }

  return (
    <div className={styles.panel}>
      <div>
        <p className={styles.panelTitle}>Hvor står bilen?</p>
        <p className={styles.panelLead}>
          Søk og velg adressen fra listen. Postnummer og poststed fylles ut
          automatisk.
        </p>
      </div>

      <div ref={containerRef} className={styles.fieldWrap}>
        <label className={styles.label} htmlFor="pickup-street">
          Adresse
        </label>
        <div className={styles.inputWrap}>
          <input
            id="pickup-street"
            className={styles.input}
            value={displayValue}
            onChange={(e) => handleStreetChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Begynn å skrive, f.eks. Rovenveien 125"
            autoComplete="off"
            required
          />
          {searchLoading ? (
            <span className={styles.spinner} aria-hidden />
          ) : null}
        </div>

        {showSuggestions && suggestions.length > 0 ? (
          <ul className={styles.suggestions} role="listbox">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className={styles.suggestionBtn}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <MapPinIcon className={styles.suggestionIcon} />
                  <span className={styles.suggestionText}>
                    <span className={styles.suggestionStreet}>
                      {suggestion.street}
                    </span>
                    <span className={styles.suggestionMeta}>
                      {suggestion.postalCode} {suggestion.city}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
