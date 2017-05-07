Hike Ideas map description
==

Purpose
--
Hike ideas for summer 2017 contains a list of hikes in Metro Vancouver and Squamish. You can filter hikes by difficulty level to help you plan your trip. When you click on the pin or on the list item, you will see an information window. It displays the name of the hike and also a photograph from Flickr.

Installation
--
Dowload the zip and open `index.html` to start browsing the website.

For developers
==

Hike ideas map uses 4 tools:
- Libraries:
 - Knockout.js
 - JQuery
- API's
 - Google API
 - Flickr API

Knockout.js
--
Knockout connects view elements (list, filter, buttons) and the model. Specifically, you will see Knockout application in `function HikeViewModel()`. For instance, hike difficulty levels use Knockout bindings:

*HTML* (`index.html`)
```
<div id="difficulty-level">
    <strong>Difficulty</strong>
    <select data-bind="options: levels,
        optionsCaption: 'Select level...',
        value: selectedDifficultyLevel"></select>
</div>
```
*JavaScript* (`mapbuilder.js`)

```
self.levels = ["Easy", "Medium", "Hard", "Extreme"];
```

JQuery
--
Notable application includes Flickr API requests: `$.getJSON(flickrSearchUrl)`.

Google API
--
Hike map is built using Google Maps API. Hike locations are hard-coded objects in the `hikeList` array. Each object in the `hikeList` has the following parameters:
 - `name`
 - `difficulty`
 - `coords` aka coordinates:
  - `lat` aka latitude
  - `lng` aka longitude

 Hike markers are stored as objects in the `markers` object to allow for referenced marker selection by `name`. Comments are included for each function in the `mapbuilder.js` file.

Markers animate when selected by `hikeMarker.setAnimation(google.maps.Animation.BOUNCE);`. They stop bouncing after 750ms because it looked distracting. In addition, `setCenter` is used to move the market to the center of the map.

An information window is displayed in two instances: if the user clicks on the marker or on the list item. In the mobile version, clicking on the list item will hide the list menu to show the map full-screen.

Flickr API
--

Flickr needs 2 API requests.
1. Flickr uses search `flickr.photos.search` to look up photos by hike `name`. It gives back a list of photos associated with the search.
2. The second request needs to extract photos from the list. Hike Map uses the first `id` from the first request to ask Flickr for a `url` of a specific image size (we use size 4). The template in the infowindow is then replaced with an actual `url`: `contentHtml.replace("%PHOTO_URL%", photoSizes.sizes.size[4].source)`.

As mentioned earlier, JQuery is used to get JSON. If Flickr API fails on the first request, webpage says: "Error searching flickr for photos". If we found photos but could not fetch them in the request, tha map says: "Error fetching photo information".

Interface notes
--
`responsive.css` file contains information for media queries. On tablets and desktop, menu is visible at all time on the left side.
For small screens, the menu takes up full width but can be hidden. It becomes a hamburger icon while the menu slides off the screen to the left. If the user clicks on the list item in mobile view, the menu will also hide. Knockout was used for this function.
