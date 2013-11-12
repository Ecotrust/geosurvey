angular.module('askApp').service('storage', function() {

	var saveState = function (state) {
		localStorage.setItem('hapifis-' + state.user.username, JSON.stringify(state));
		localStorage.setItem('hapifis', JSON.stringify({ currentUser: state.user.username }));
	};

	var getState = function (username) {
		return JSON.parse(localStorage.getItem('hapifis-' + username));
	};

	var clearCache = function () {
		var keys = Object.keys(localStorage);
		_.each(keys, function (key) {
			if (/^hapifi/.test(key)) {
				localStorage.removeItem(key);
			}
		});
	}

	var getCurrentUser = function () {
		return JSON.parse(localStorage.getItem('hapifis')).currentUser;
	}

	return {
		saveState: saveState,
		getState: getState,
		clearCache: clearCache,
		getCurrentUser: getCurrentUser
	};
});