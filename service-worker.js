const preCacheName = "pre-cache-pra",
	// listado de archivos estáticos para añadir a la cache (css, scripts, imagenes,....)

    preCacheFiles = [
        "/",
        "/index.html",
        "/css/styles.css",
        "/js/main.js"
    ];


self.addEventListener("install", event => {
    console.log("installing precached files");
    caches.open(preCacheName).then(function (cache) {
        return cache.addAll(preCacheFiles);
    });
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (!response) {
                //fall back to the network fetch
                return fetch(event.request);
            }
            return response;
        })
    )
});
