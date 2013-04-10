var Controller = (function () {

	var TOOLS = {
		geolocate: 'geolocate',
		layer: 'layer',
		geocode: 'searchPlace'
	}, map;

	/**
	 * [initialize description]
	 */
	function initialize() {
		map = new Map('map');

		map.register('layer:loadStart', handleMapLoadStart);
		map.register('layer:loadEnd', handleMapLoadEnd);
		map.register('map:moved', handleMapMove);

		$('.tool > button').click(handleButtonClick);
		$('#' + TOOLS.geocode + ' input[type="text"]').keyup(handleFormType);

		setTimeout(function () {
			$('h1').addClass('hide');
		}, 5000);

		setInitialMapLocation();
	}

	/**
	 * [setInitialMapLocation description]
	 */
	function setInitialMapLocation() {
		var permaLink = Permalink.parse(document.URL);
		if (permaLink) {
            map.moveTo(permaLink.lonlat, permaLink.zoom);
        } else {
            getCurrentPosition();
        }
	}

	/**
	 * [getCurrentPosition description]
	 */
	function getCurrentPosition() {
		Geolocator.locate(handleGeolocateSuccess, handleGeolocateError, handleGeolocateNoSupport);
	}

	/**
	 * [setLoadingState description]
	 * @param {[type]} state [description]
	 * @param {[type]} tool  [description]
	 */
	function setLoadingState(state, tool) {
		if (state) {
			$('#' + tool + ' button').addClass('loading');
			$('#' + tool + ' .spinner').addClass('loading');
		} else {
			$('#' + tool + ' button').removeClass('loading');
			$('#' + tool + ' .spinner').removeClass('loading');
		}
	}

	/**
	 * [toggleActiveState description]
	 * @param  {[type]} tool [description]
	 */
	function toggleActiveState(tool) {
		$('#' + tool + ' button').toggleClass('active');
		$('#' + tool + ' .content').toggleClass('active');
	}

	/* *********************************************************************
	 * EVENT HANDLERS
	 * *********************************************************************/

	 /**
	 * [handleButtonClick description]
	 * @return {[type]} [description]
	 */
	function handleButtonClick() {
		var toolId = $(this).parent().attr('id');
		if (toolId === TOOLS.geolocate) {
			setLoadingState(true, TOOLS.geolocate);
			getCurrentPosition();
		} else {
			toggleActiveState(toolId);
		}
	}

	/**
	 * [handleFormType description]
	 */
	function handleFormType(event) {
		if (event.keyCode === 13) {
			setLoadingState(true, TOOLS.geocode);
			Geocoder.find($(this).val(), handleGeocodeResults);
		}
	}

	/**
	 * [handleMapLoadStart description]
	 * @return {[type]} [description]
	 */
	function handleMapLoadStart() {
		setLoadingState(true, TOOLS.layer);
	}

	/**
	 * [handleMapLoadEnd description]
	 * @return {[type]} [description]
	 */
	function handleMapLoadEnd() {
		setLoadingState(false, TOOLS.layer);
	}

	/**
	 * [handleMapMove description]
	 * @param  {[type]} mapState [description]
	 * @return {[type]}          [description]
	 */
	function handleMapMove(mapState) {
		Permalink.update(mapState.zoom, mapState.lon, mapState.lat);
	}

	/**
	 * [handleGeolocateSuccess description]
	 * @param  {[type]} position [description]
	 * @return {[type]}          [description]
	 */
	function handleGeolocateSuccess(position) {
		map.moveTo([position.coords.latitude, position.coords.longitude]);
		setLoadingState(false, TOOLS.geolocate);
	}

	/**
	 * [handleGeolocateError description]
	 * @param  {[type]} error [description]
	 * @return {[type]}       [description]
	 */
	function handleGeolocateError(error) {
		setLoadingState(false, TOOLS.geolocate);
		switch (error.code) {
            case error.UNKNOWN_ERROR:
                alert('The location acquisition process failed');
                break;
            case error.PERMISSION_DENIED:
                $(TOOLS.geolocate).hide();
                break;
            case error.POSITION_UNAVAILABLE:
                alert('The position of the device could not be determined. One or more of the location providers used in the location acquisition process reported an internal error that caused the process to fail entirely.');
                break;
            case error.TIMEOUT:
                alert('The location acquisition timed out');
                break;
            }
	}

	/**
	 * [handleGeolocateNoSupport description]
	 */
	function handleGeolocateNoSupport() {
		setLoadingState(false, TOOLS.geolocate);
		$(TOOLS.geolocate).hide();
		alert('Geolocation API is not supported by your browser.');
	}

	/**
	 * [handleGeocodeResults description]
	 * @param  {[type]} results [description]
	 */
	function handleGeocodeResults(results) {
		var linkBase = document.URL.split('#')[0];
		$('#' + TOOLS.geocode + ' ul.resultList').children().remove();
		
		if (results.length > 0) {
            for (var i = 0; i < results.length; i++) {
                var address = results[i];
                var link = linkBase + "#10/" + parseFloat(address.lon) + "/" + parseFloat(address.lat);
                $('#' + TOOLS.geocode + ' ul.resultList').append('<li><a href="' + link + '">' + address.display_name + '</a></li>');
            }
        } else {
            $('#' + TOOLS.geocode + ' ul.resultList').append('<li class="noResult">No results matching your query have been found.</li>');
        }
        

		$('#' + TOOLS.geocode + ' ul.resultList li a').click(handleGeocodeLinkClick);

		setLoadingState(false, TOOLS.geocode);
	}

	/**
	 * [handleGeocodeLinkClick description]
	 */
	function handleGeocodeLinkClick() {
		map.moveTo(Permalink.parse($(this).attr('href')).lonlat);
		return false;
	}

	var controller = function() {};
	controller.prototype.initialize = initialize;
	return new controller();
})();

window.onload = Controller.initialize;