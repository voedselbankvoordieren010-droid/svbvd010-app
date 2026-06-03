export function initClientSearch() {

  const search =
    document.getElementById(
      "clientSearch"
    );

  if (!search) {
    return;
  }

  search.addEventListener(
    "input",
    e => {

      const value =
        e.target.value
          .toLowerCase()
          .trim();

      document
        .querySelectorAll(
          ".client-card"
        )
        .forEach(card => {

          const searchText = [
            card.dataset.searchName,
            card.dataset.searchEmail,
            card.dataset.searchPhone,
            card.dataset.searchCity,
            card.dataset.searchAddress,
            card.dataset.searchPostal,
            card.dataset.searchStatus,
            card.dataset.searchWarning
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const visible =
            !value || searchText.includes(value);

          card.style.display =
            visible
              ? "block"
              : "none";
        });
    }
  );
}