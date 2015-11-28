var consts = require('./consts.js');

function Gallery() {
	var self = this;	
	var gallery = document.getElementById('gallery');
	var firstLoad = true;
	var loadingLock = false;
	var nextPageToken;

	gallery.onscroll = function() { requestAnimationFrame(evaluteLoadingGallery); };

	var evaluteLoadingGallery = function() {
		var galleryInnerHeight = window.getComputedStyle(gallery, null).getPropertyValue("height");
		galleryInnerHeight = galleryInnerHeight.slice(0, galleryInnerHeight.length-2);
		galleryInnerHeight = parseInt(galleryInnerHeight);
		
		if ( !loadingLock && gallery.scrollTop + galleryInnerHeight >= gallery.children[0].scrollHeight ) {
			loadAdditionals();
		}
	};

	var loadAdditionals = function() {
		if (nextPageToken === '') {
			// no more items to load.
			return;
		}

		self.loadGalleryItems();
	};

	this.showGallery = function() {
		if(firstLoad) {
			firstLoad = false;
			this.loadGalleryItems();
		}
		gallery.className = 'layer layer--gallery is-visible';
	};

	this.hideGallery = function() {
		gallery.className = 'layer layer--gallery';
	};

	this.loadGalleryItems = function() {
		loadingLock = true;

		var request = new XMLHttpRequest();
		var url = consts.SERVER_URL+'/list';
		if(nextPageToken) {
			url += '?token=' + nextPageToken;
		}

		request.open('GET', url, true);
		
		request.onload = function() {
			loadingLock = false;
			var data;

			// try to parse response.
			try{
				data = JSON.parse(request.response);
			} catch(e) {
				console.log(e);
				return;
			}

			nextPageToken = data.nextPageToken;

			// Add items to gallery.
			var ul = document.getElementById('galleryItems');

			for(var i = 0; i < data.images.length; i++){
				var imageId = data.images[i];

				var li = document.createElement("li");
				
				var image = document.createElement('img');
				// image.src = 'https://console.developers.google.com/m/cloudstorage/b/dominoz/o/images/' + imageId;
				image.src = 'http://domino.roilipman.com/images/' + imageId;
				li.appendChild(image);

				li.onclick = function(id) {
					return function() { app.load(id) };
				}(imageId);

				ul.appendChild(li);
			}
		}

		request.onerror = function(err) {
			loadingLock = false;
	  		console.log(err);
	  	}

		request.send();
	};	
}

module.exports = new Gallery();