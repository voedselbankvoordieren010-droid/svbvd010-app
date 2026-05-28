const CACHE_NAME = "app-v101";

const STATIC_FILES = [

  "./",
  "./index.html",
  "./manifest.json",
  "./logo-192.png",
  "./logo-512.png",
  "./fullcalendar-core.css",
  "./fullcalendar-daygrid.css"

];

// ======================
// INSTALL
// ======================

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

// ======================
// ACTIVATE
// ======================

self.addEventListener(
  "activate",
  event => {

    console.log(
      "SW ACTIVATE"
    );

    event.waitUntil(

      caches.keys()
        .then(keys => {

          return Promise.all(

            keys.map(key => {

              if (
                key !== CACHE_NAME
              ) {

                console.log(
                  "DELETE CACHE:",
                  key
                );

                return caches.delete(
                  key
                );
              }
            })
          );
        })
    );

    self.clients.claim();
  }
);

// ======================
// FETCH
// ======================

self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;

    // ALLEEN GET REQUESTS
    if (
      request.method !==
      "GET"
    ) {
      return;
    }

    // GEEN SUPABASE CACHE
    if (
      request.url.includes(
        "supabase.co"
      )
    ) {
      return;
    }

    event.respondWith(

      fetch(request)

        .then(response => {

          // ONGELDIGE RESPONSE
          if (
            !response ||
            response.status !== 200
          ) {

            return response;
          }

          // CACHE COPY
          const responseClone =
            response.clone();

          caches.open(
            CACHE_NAME
          )

          .then(cache => {

            cache.put(
              request,
              responseClone
            );
          });

          return response;
        })

        .catch(async () => {

          // CACHE FALLBACK
          const cached =
            await caches.match(
              request
            );

          if (cached) {

            return cached;
          }

          // HTML FALLBACK
          if (
            request.headers.get(
              "accept"
            )?.includes(
              "text/html"
            )
          ) {

            return caches.match(
              "./index.html"
            );
          }
        })
    );
  }
);
