// These will contain the map, and all markers and their info windows.
var map, markers = {},
    infowindows = [];

// knockout VM
function HikeViewModel() {
    var self = this;

    // Hamburger icon menu toggling
    self.menuVisible = ko.observable(false);

    self.openMenu = function() {
        self.menuVisible(true);
    };

    self.closeMenu = function() {
        self.menuVisible(false);
    };

    // Filter levels
    self.levels = ["Easy", "Medium", "Hard", "Extreme"];

    // hike data, our "model"
    self.hikeList = [{
            name: "Elsay Lake",
            difficulty: "Extreme",
            distance: 20,
            coords: {
                lat: 49.415956,
                lng: -122.932207
            }
        },
        {
            name: "Lindsay Lake Loop",
            difficulty: "Hard",
            distance: 10,
            coords: {
                lat: 49.346459,
                lng: -122.826283
            }
        },
        {
            name: "Eagle Bluffs",
            difficulty: "Easy",
            distance: 5,
            coords: {
                lat: 49.387072,
                lng: -123.211685
            }
        },
        {
            name: "Elk Mountain",
            difficulty: "Medium",
            distance: 5,
            coords: {
                lat: 49.114344,
                lng: -121.807145
            }
        },
        {
            name: "Murrin Provincial Park",
            difficulty: "Easy",
            coords: {
                lat: 49.646566,
                lng: -123.209304
            }
        },
        {
            name: "Mount Cheam Peak",
            difficulty: "Medium",
            coords: {
                lat: 49.186288,
                lng: -121.682589
            }
        },
        {
            name: "Howe Sound Crest trail",
            difficulty: "Hard",
            coords: {
                lat: 49.456665,
                lng: -123.188288
            }
        }
    ];

    // user selection
    self.selectedDifficultyLevel = ko.observable();

    // creates a marker, and its info window after downloading a photo from
    // flickr search api
    self.getMarkerInfoContent = function(hikeName, callback) {
        // info window template
        var contentHtml = "<h2>" + hikeName + "</h2>";
        contentHtml += "<div class='hikePhotos'>";
        contentHtml += "<img src='%PHOTO_URL%' />";
        contentHtml += "</div>";

        // api urls
        var flickrSearchUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=947cf5b151371e5150e63b4d589c58fb&text=" + hikeName + "&format=json&nojsoncallback=1";

        var flickrPhotoByIdUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=947cf5b151371e5150e63b4d589c58fb&photo_id=PHOTO_ID&format=json&nojsoncallback=1";

        // download list of photos matching hike name
        // todo better error reporting. right now it's just alert box
        $.getJSON(flickrSearchUrl)
            .done(function(data) {
                // we'll use first photo out of the list
                var photo1 = data.photos.photo[0];

                // now we need to find photo's url by id
                $.getJSON(flickrPhotoByIdUrl.replace("PHOTO_ID", photo1.id))
                    .done(function(photoSizes) {
                        callback(
                            contentHtml.replace("%PHOTO_URL%", photoSizes.sizes.size[4].source)
                        );
                    })

                    .fail(function() {
                        alert("Error fetching photo information");
                    });
            })

            .fail(function() {
                alert("Error searching flickr for photos");
            });
    };

    self.createMarker = function(coords, hikeName) {
        // create marker
        var marker = new google.maps.Marker({
            position: coords,
            map: map
        });

        // this function will be called once we finished downloading images
        // from flickr api. it will create an info window, and add click listeners
        // for the marker which open the info window
        var createInfoContentAfterDownloadImages = function(infoContent) {
            var infowindow = new google.maps.InfoWindow({
                content: infoContent
            });

            // we need to keep track of infowindows, so that we can close them
            infowindows.push(infowindow);

            // when marker is clicked, display its infowindow
            marker.addListener('click', function() {
                // but first, hide all infowindows
                for (var i = 0; i < infowindows.length; i++) {
                    infowindows[i].close();
                }
                infowindow.open(map, this);

                // make it bouncy
                self.bouncMarker(this);
            });
        };

        self.getMarkerInfoContent(hikeName, createInfoContentAfterDownloadImages);

        return marker;
    };

    self.openHike = function(hike) {
        // close menu if on mobile viewport
        var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        if (width <= 580) {
            self.menuVisible(false);
        }

        // find our marker for this hike
        var hikeMarker = markers[hike.name];

        // center the map to marker's position
        map.setCenter(hikeMarker.getPosition());

        // make it bouncy
        self.bouncMarker(hikeMarker);

        // 'click' on the marker
        var markerEvent = new google.maps.event.trigger(hikeMarker, 'click');
    };

    // helper function to bounce the provided marker
    self.bouncMarker = function (marker) {
        // make it bouncy
        marker.setAnimation(google.maps.Animation.BOUNCE);

        // stop bouncing after one bounce, which takes about 750ms
        setTimeout(function() {
            marker.setAnimation(null);
        }, 750);
    }

    // helper function
    // sets the "map" object on each marker
    // to hide a marker, we need to set its "map" to null
    self.setMapOnMarkers = function(map, markersMap) {
        var ms = Object.values(markersMap);
        for (var i = 0; i < ms.length; i++) {
            ms[i].setMap(map);
        }
    };

    // this is the list that is actually displayed on the screen
    // this also controls which map markers are displayed
    self.filteredHikeList = ko.computed(function() {
        var filtered = [];
        var hike;

        for (var i = 0; i < self.hikeList.length; i++) {
            hike = self.hikeList[i];
            if (self.selectedDifficultyLevel() === undefined || hike.difficulty === self.selectedDifficultyLevel()) {
                filtered.push(hike);
            }
        }

        // Hide all markers first.
        self.setMapOnMarkers(null, markers);

        // Display markers for each hike in 'filtered' array.
        for (var j = 0; j < filtered.length; j++) {
            hike = filtered[j];

            // Show marker if we already created it before.
            if (markers[hike.name]) {
                markers[hike.name].setMap(map);

                // If we didn't create a marker before, create it and show.
                // And place it into our markers list.
            } else {
                markers[hike.name] = self.createMarker(filtered[j].coords, hike.name);
            }
        }

        return filtered;
    });
}

function initMap() {
    var northShore = {
        lat: 49.343056,
        lng: -122.801406
    };
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: northShore
    });

    ko.applyBindings(new HikeViewModel());
}

// Global function which Google API will call in case of auth errors.
// See https://developers.google.com/maps/documentation/javascript/events#auth-errors
function gm_authFailure() {
    alert("Google Maps failed to load due to an authentication failure");
}

function mapError() {
    alert("General error loading a map");
}
