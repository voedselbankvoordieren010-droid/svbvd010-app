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

          const visible =
            card.innerText
              .toLowerCase()
              .includes(value);

          card.style.display =
            visible
              ? "block"
              : "none";
        });
    }
  );
}