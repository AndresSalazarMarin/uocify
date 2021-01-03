window.onload = () => {
	'use strict';

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./service-worker.js').then(function(reg) {
			if (reg.installing) {
				console.log('Service worker installing');
			} else if (reg.waiting) {
				console.log('Service worker installed');
			} else if (reg.active) {
				console.log('Service worker active');
			}

		}).catch(function(error) {
	        // registration failed
	        console.log('Registration failed with ' + error);
	    });
	}
}

$(document).ready( function () {
	// Constante para petición y no inhabilite la por CORS al solicitar información a la API
	// const corsUrl = "https://cors-anywhere.herokuapp.com/";
	const corsUrl = "https://thingproxy.freeboard.io/fetch/";

	// Función para regresar en la navegación de la PWA
	function back (e) {
		e.preventDefault();
		$('#search').val('');
		loadHome();
	}

	// Función para renderizar la lista de reproducción
	function renderTracks(tracks) {
		let allTracks = '';
		tracks.forEach( element => {
    		allTracks += `
    			<tr>
					<td><img class="img-song" src="${element.album.cover_small}" alt=""></td>
					<td>${element.title}</td>
					<td>${element.artist.name}</td>
					<td>${element.album.title}</td>
					<td><span class="text-muted">${secondsToString(element.duration)}</span></td>
				</tr>`;
    	});
    	return allTracks;
	}

	// Función para renderizar el grid de los artistas
	function renderArtists(artists) {
		let allArtists = '';
		artists.forEach( element => {
    		allArtists += `
    			<div class="col-12 col-md-2 text-center mb-3">
					<img class="img-fluid border rounded-circle" src="${element.picture_medium}" alt="">
					<p class="weight-700 mt-2 mb-0 more-dots">${element.name}</p>
					<small class="text-muted">${element.nb_fan} fans</small>
				</div>`;
    	});
    	return allArtists;
	}

	// Función para renderizar el grid de los albumes
	function renderAlbums(albums) {
		let allAlbums = '';
		albums.forEach( element => {
    		allAlbums += `
    			<div class="col-12 col-md-2 mb-3">
					<img class="img-fluid border" src="${element.cover_medium}" alt="">
					<p class="weight-700 mt-2 mb-0 more-dots">${element.title}</p>
					<small class="text-muted">${element.artist.name}</small>
				</div>`;
    	});
    	return allAlbums;
	}

	// Función para dar formato a la duración del track - MM:SS
	function secondsToString(seconds) {
    	var minute = Math.floor((seconds / 60) % 60);
    	minute = (minute < 10)? '0' + minute : minute;
    	var second = seconds % 60;
    	second = (second < 10)? '0' + second : second;
    	return minute + ':' + second;
    }

    // Conexión a API Deezer para busqueda de tracks
	function getTracks( query ) {
		$.get(`https://api.deezer.com/search/track?q=${query}`, function (data) {
			var tracks = data.data;

	    	$('#nb_tracks').html( tracks.length );
	    	$('#songs').html( renderTracks(tracks) );
	    	$('#all-songs').html( renderTracks(tracks.slice(0, 6)) );

	    	$('#loading-songs').attr('style', 'display: none!important');
	    });
	}

	// Conexión a API Deezer para busqueda de artistas
	function getArtists( query ) {
		$.get(`https://api.deezer.com/search/artist?q=${query}`, function (data) {
	    	var artists = data.data;

			$('#qt-artists').html( artists.length );
			$('#artists').html( renderArtists(artists) );
			$('#all-artists').html( renderArtists(artists.slice(0, 6)) );

			$('#loading-artists').attr('style', 'display: none!important');
	    });
	}

	// Conexión a API Deezer para busqueda de albumes
	function getAlbums( query ) {
		$.get(`https://api.deezer.com/search/album?q=${query}`, function (data) {
			var albums = data.data;

			$('#qt-albumes').html(albums.length);
	    	$('#albumes').html( renderAlbums(albums) );
			$('#all-albumes').html( renderAlbums(albums.slice(0,6)) );

			$('#loading-albums').attr('style', 'display: none!important');
	    });
	}

	// Función que captura el campo de busqueda y lo envia por parametro a las conexiones de busqueda de API Deezer
	function searchResults (e) {
		e.preventDefault();
		var html = "";
		var query = $('#search').val();

		html = `
			<div class="container mt-4">
				<div class="row">
					<div class="col-12">
						<a href="#" class="btn back"><i class="fa fa-chevron-left"></i> Volver</a>
					</div>
				</div>
				<div class="row">
					<div class="col-12">
						<!-- Titulo Página -->
						<h2 class="weight-900">Resultados de <span class="text-muted" id="search-word">${query}</span></h2>
					</div>
				</div>
				<div class="row bg-white mt-3 py-3 position-relative">
					<div class="col-12" id="all-results">
						<nav>
							<!-- Tabs (Todo, Canciones, Álbumes, Artistas) -->
							<div class="nav nav-tabs" id="nav-tab" role="tablist">
								<a class="nav-link active" id="nav-all-tab" data-toggle="tab" href="#nav-all" role="tab" aria-controls="nav-all" aria-selected="true">
									<span>Todo</span>
								</a>
								<a class="nav-link" id="nav-songs-tab" data-toggle="tab" href="#nav-songs" role="tab" aria-controls="nav-songs" aria-selected="false">
									<span>Canciones</span>
								</a>
								<a class="nav-link" id="nav-albums-tab" data-toggle="tab" href="#nav-albums" role="tab" aria-controls="nav-albums" aria-selected="false">
									<span>Álbumes</span>
								</a>
								<a class="nav-link" id="nav-artists-tab" data-toggle="tab" href="#nav-artists" role="tab" aria-controls="nav-artists" aria-selected="false">
									<span>Artistas</span>
								</a>
							</div>
						</nav>
						<div class="tab-content px-3 py-5" id="nav-tabContent">
							<!-- Panel Todo -->
							<div class="tab-pane fade show active" id="nav-all" role="tabpanel" aria-labelledby="nav-all-tab">
								<!-- Sección Canciones -->
								<div>
									<h6 class="weight-900 mb-3">Canciones <i class="fa fa-chevron-right"></i></h6>
									<div class="table-responsive">
										<table class="table table-hover">
											<tbody id="all-songs">
												<div class="col-12 d-flex justify-content-center" id="loading-songs">
													<img src="images/loading.gif" alt="">
												</div>
											</tbody>
										</table>
									</div>
								</div>
								<!-- Sección Álbumes -->
								<div class="py-4">
									<h6 class="weight-900 mb-3">Álbumes <i class="fa fa-chevron-right"></i></h6>
									<div class="container-fluid">
										<div class="row" id="all-albumes">
											<div class="col-12 d-flex justify-content-center" id="loading-albums">
												<img src="images/loading.gif" alt="">
											</div>
										</div>
									</div>
								</div>
								<!-- Sección Artistas -->
								<div class="py-4">
									<h6 class="weight-900 mb-3">Artistas <i class="fa fa-chevron-right"></i></h6>
									<div class="container-fluid">
										<div class="row" id="all-artists">
											<div class="col-12 d-flex justify-content-center" id="loading-artists">
												<img src="images/loading.gif" alt="">
											</div>
										</div>
									</div>
								</div>
							</div>
							<!-- Fin Panel Todo -->

							<!-- Panel Canciones -->
							<div class="tab-pane fade" id="nav-songs" role="tabpanel" aria-labelledby="nav-songs-tab">
								<div>
									<h4 class="weight-900 mb-3"><span id="nb_tracks"></span> canciones</h4>
									<div class="table-responsive">
										<table class="table table-stripped">
											<thead>
												<tr>
													<th></th>
													<th><small class="weight-600 text-uppercase">Canción</small></th>
													<th><small class="weight-600 text-uppercase">Artista</small></th>
													<th><small class="weight-600 text-uppercase">Álbum</small></th>
													<th><small class="weight-600 text-uppercase">D.</small></th>
												</tr>
											</thead>
											<tbody id="songs">
											</tbody>
										</table>
									</div>
								</div>
							</div>
							<!-- Fin Panel Canciones -->

							<!-- Panel Álbumes -->
							<div class="tab-pane fade" id="nav-albums" role="tabpanel" aria-labelledby="nav-albums-tab">
								<div class="py-1">
									<h4 class="weight-900 mb-3"><span id="qt-albumes"></span> álbumes</h4>
									<div class="container-fluid">
										<div class="row" id="albumes">
										</div>
									</div>
								</div>
							</div>
							<!-- Fin Panel Álbumes -->

							<!-- Panel Artistas -->
							<div class="tab-pane fade" id="nav-artists" role="tabpanel" aria-labelledby="nav-artists-tab">
								<div class="py-1">
									<h4 class="weight-900 mb-3"><span id="qt-artists"></span> artistas</h4>
									<div class="container-fluid">
										<div class="row" id="artists">
										</div>
									</div>
								</div>
							</div>
							<!-- Fin Panel Artistas -->
						</div>
					</div>
				</div>
			</div>
		`;

		$('#main').html(html);

		$('#all-results').css('display', 'block');

		getTracks(query);
		getArtists(query);
		getAlbums(query);
	}

	// Función que se carga si hay click en alguna de las playlist del home, hace petición a API Deezer y muestra la lista de reproducción
	function loadPlaylist (e) {
		e.preventDefault();
		$('#loading-song').attr('style', 'display: flex!important');
		var album = $(this).data('show');
		var html = `
			<div class="container mt-4">
				<div class="row">
					<div class="col-12">
						<a href="#" class="btn back"><i class="fa fa-chevron-left"></i> Volver</a>
					</div>
				</div>
				<div class="row">
					<div class="col-12">
						<div class="d-flex mb-4 align-items-end flex-wrap">
							<div class="pr-3 py-3">
								<img class="img-fluid" src="${album.picture_medium}" >
							</div>
							<div class="pl-3 py-3">
								<span class="text-uppercase">${album.type}</span>
								<h1 class="mt-3 mt-md-5 mb-3 font-weight-bold">${album.title}</h1>
								<p class="font-weight-bold m-0 p-0">${album.user.name}</p>
							</div>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="col-12" id="nav-songs">
						<div>
							<h4 class="weight-900 mb-3"><span id="nb_tracks">${album.nb_tracks}</span> canciones</h4>
							<div class="table-responsive">
								<table class="table table-stripped">
									<thead>
										<tr>
											<th></th>
											<th><small class="weight-600 text-uppercase">Canción</small></th>
											<th><small class="weight-600 text-uppercase">Artista</small></th>
											<th><small class="weight-600 text-uppercase">Álbum</small></th>
											<th><small class="weight-600 text-uppercase">Duración</small></th>
										</tr>
									</thead>
									<tbody id="songs">
										<div class="col-12 d-flex justify-content-center" id="loading-song">
											<img src="images/loading.gif" alt="">
										</div>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
		$('#main').html(html);

		$.get(``+album.tracklist, function (data) {
			var result = '';
			result = renderTracks(data.data);
			$('#songs').html(result);
			$('#loading-song').attr('style', 'display: none!important');
	    });
	}

	// Función para cargar el contenido de Inicio
	function loadHome() {
		var html = `<div class="container mt-4 slide-up">
				<div class="row">
					<div class="col-12">
						<div class="d-flex flex-column justify-content-center align-items-center">
							<img class="img-fluid logo-home" src="images/logos/uocify_icon.svg" alt="">
							<h1 class="text-center font-weight-bold">¿En busca de música?</h1>
							<p class="text-center">Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed, fugiat unde alias tempore assumenda doloribus iusto quisquam illum officia deleniti voluptate neque, aperiam praesentium aliquid nulla sunt, quaerat delectus natus?</p>
						</div>
					</div>
				</div>
			</div>`;
		var result = "";
		$.get(`https://api.deezer.com/chart/0/playlists`, function (data) {
			$('#loading').attr('style', 'display: none!important');
			result = `<div class="container mt-4 slide-up" id="albums-home">
						<div class="row">`;
			$.each(data.data, function (key, album) {
				result += `
					<div class="col-6 col-sm-4 col-md-3 mb-3">
						<a href="#" class="each-album" data-show='${JSON.stringify(album)}'>
							<img class="img-fluid" src="${album.picture_medium}" alt="">
							<p class="weight-700 mt-2 mb-0 more-dots text-center">${album.title}</p>
						</a>
					</div>`;
			});
			result += `</div>
					</div>`;
			html += result;
			$('#main').html(html);
			$('.each-album').on('click', loadPlaylist);
	    });
	}

	// var animated = $('.slide-up');

	// animated.addEventListener('animationend', () => {
	// 	animated.removeClass('slide-up');
	// });

	// Captura de evento click en elementos con la clase .back
	$(document).on('click', '.back', back);

	// Captura del submit que hace el formulario para que no se recargue la página, usa la función searchResults() para continuar con la ejecución
	$('#search-form').on( 'submit', function (e) {
		searchResults(e);
	});

	// Captura de click al logo del menú con clase .link-home, se puede utilizar en otros casos
	$('.link-home').click( function (e) {
		e.preventDefault();
		$('#search').val('');
		loadHome();
	});

	// Ejecución inicial de la aplciación
	loadHome();
});