export function initClientTabs() {

  document
    .querySelectorAll(
      ".client-tab-btn"
    )
    .forEach(btn => {

      btn.onclick = () => {

        document
          .querySelectorAll(
            ".client-tab-btn"
          )
          .forEach(b =>
            b.classList.remove(
              "is-active"
            )
          );

        btn.classList.add(
          "is-active"
        );

        document
          .querySelectorAll(
            ".client-tab-panel"
          )
          .forEach(panel =>
            panel.classList.add(
              "hidden"
            )
          );

        const panel =
          document.getElementById(
            btn.dataset.clientTab
          );

        if (panel) {

          panel.classList.remove(
            "hidden"
          );
        }
      };
    });
}