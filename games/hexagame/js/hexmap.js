HEXA.hexmap = (function () {
	var // Libs
		parms = HEXA.parms,
		utils = HEXA.utils,
		dict = HEXA.dictionary,

		gameEl,
		boardWrapperEl,
		boardEl,
		
		tiles = [],

		vowelsCount,
		
		rose = [
			{ x: -1,	y: -1,	dir: 'NW' },
			{ x: -1,	y:  0,	dir: 'SW' },
			{ x:  0,	y: -1,	dir:  'N' },
			{ x:  0,	y:  1,	dir:  'S' },
			{ x:  1,	y: -1,	dir: 'NE' },
			{ x:  1,	y:  0,	dir: 'SE' }
		];

	function init () {
		var x,
			y,
			el,
			offsetY,
			distanceX = Math.round(parms.tileWidth / 4) * 3,
			distanceY = parms.tileHeight,
			tile,
			special,
			vowels = dict.getVowels().join(''),
			countQ = 0,
			level = HEXA.scoreboard.getLevel();
		
		gameEl = $.id('game');
		boardWrapperEl = $.id('boardwrapper');
		boardEl = $.id('board');

		vowelsCount = 0;

		utils.bind(window, 'orientationchange', orientationChange);

		// Create the board
		for ( x = 0; x < parms.mapWidth; x++ ) {
			tiles[x] = [];

			offsetY = x % 2 ? Math.round(parms.tileHeight / 2) : 0;

			for ( y = 0; y < parms.mapHeight; y++ ) {
				el = utils.create('div');

				tile = {};
				tile.el = el;
				tile.special = false;
				if ( !special ) {
					special = utils.rnd(parms.mapWidth * parms.mapHeight) + 1;
					if ( special == 1 ) {
						tile.special = special;
						special = true;
					} else if ( special == 2 && level > 2 ) {
						tile.special = special;
						special = true;
					} else if ( special == 3 && level > 4 ) {
						tile.special = special;
						special = true;
					} else if ( special == 4 && level > 6 ) {
						tile.special = special;
						special = true;
					} else {
						special = false;
					}
				}

				tile.variant = tile.special ? tile.special + 3 : utils.rnd(1, 3);
				tile.letter = !utils.rnd(Math.round(parms.mapWidth * parms.mapHeight * 1.7)) ? 63 : dict.getLetter();	// Question mark tile

				tiles[x][y] = tile;

				el.className = 'tile variant' + tile.variant;
				el.style.opacity = '0';
				if ( !('dataset' in el) ) el.dataset = {};
				el.dataset.x = x;
				el.dataset.y = y;
				el.style.left = x * distanceX + 'px';
				el.style.top = y * distanceY + offsetY + 'px';

				boardEl.appendChild(el);
			}
		}

		// Check for triplicates
		for ( x = 0; x < parms.mapWidth; x++ ) {
			for ( y = 0; y < parms.mapHeight; y++) {
				// Almost all Qs must have an U
				if ( tiles[x][y].letter == 81 && countQ % 2 === 0 ) {
					checkQ(x, y);
					countQ++;
				}

				while ( checkDuplicates(x, y) ) {
					tiles[x][y].letter = dict.getLetter();
				}
				tiles[x][y].el.innerHTML = String.fromCharCode(tiles[x][y].letter);
				if ( tiles[x][y].el.innerHTML != '?' && vowels.match(tiles[x][y].el.innerHTML) ) vowelsCount++;
			}
		}

		HEXA.hexmap.tiles = tiles;
	}


	/**
	*
	* Clear and Redraw the board
	*
	*/
	function redraw (onCompletion) {
		var x, y,
			vowels = dict.getVowels().join(''),
			countQ = 0,
			special = false,
			level = HEXA.scoreboard.getLevel();

		vowelsCount = 0;

		for ( x = 0; x < parms.mapWidth; x++ ) {
			for ( y = 0; y < parms.mapHeight; y++) {
				tiles[x][y].el.style.opacity = '0';

				tiles[x][y].special = false;
				if ( !special ) {
					special = utils.rnd(parms.mapWidth * parms.mapHeight) + 1;
					if ( special == 1 ) {
						tiles[x][y].special = special;
						special = true;
					} else if ( special == 2 && level > 2 ) {
						tiles[x][y].special = special;
						special = true;
					} else if ( special == 3 && level > 4 ) {
						tiles[x][y].special = special;
						special = true;
					} else {
						special = false;
					}
				}

				tiles[x][y].variant = tiles[x][y].special ? tiles[x][y].special + 3 : utils.rnd(1, 3);
				tiles[x][y].letter = !utils.rnd(Math.round(parms.mapWidth * parms.mapHeight * 1.7)) ? 63 : dict.getLetter();	// Question mark tile
				tiles[x][y].el.className = 'tile variant' + tiles[x][y].variant;
			}
		}

		// Check for triplicates
		for ( x = 0; x < parms.mapWidth; x++ ) {
			for ( y = 0; y < parms.mapHeight; y++) {
				// Almost all Qs must have an U
				if ( tiles[x][y].letter == 81 && countQ % 2 === 0 ) {
					checkQ(x, y);
					countQ++;
				}

				while ( checkDuplicates(x, y) ) {
					tiles[x][y].letter = dict.getLetter();
				}
				tiles[x][y].el.innerHTML = String.fromCharCode(tiles[x][y].letter);
				if ( tiles[x][y].el.innerHTML != '?' && vowels.match(tiles[x][y].el.innerHTML) ) vowelsCount++;
			}
		}

		showTiles(onCompletion, 1500);
	}

	function showTiles (onCompletion, delay) {
		var x, y;
		delay = delay || 200;
		for ( x = 0; x < parms.mapWidth; x++ ) {
			for ( y = 0; y < parms.mapHeight; y++) {
				utils.animate(tiles[x][y].el, {
					from: { scale: 0.5, opacity: 0 },
					to: { scale: 1, opacity: 1 },
					delay: delay + x * y * 25,
					easing: HEXA.easing.quadraticOut,
					duration: 250,
					callback: x == parms.mapWidth-1 && y == parms.mapHeight-1 ? onCompletion : null
				});
			}
		}
	}


	/**
	*
	* Check duplicate (triplicate actually)
	*
	*/
	function checkDuplicates (x, y) {
		var tmpX,
			tmpY,
			i,
			letter = 0,
			neighbor = 0,
			letterCount = {},
			shiftY;

		letterCount = {};
		letter = tiles[x][y].letter;
		letterCount[letter] = 1;

		for ( i = 0; i < 6; i++ ) {
			shiftY = rose[i].x !== 0 && x % 2 ? 1 : 0;

			tmpX = x + rose[i].x;
			tmpY = y + rose[i].y + shiftY;

			if ( tmpX > -1 && tmpY > -1 && tmpX < parms.mapWidth && tmpY < parms.mapHeight ) {
				neighbor = tiles[tmpX][tmpY].letter;
				letterCount[neighbor] = letterCount[neighbor] ? letterCount[neighbor]+1 : 1;
			}
		}

		return letterCount[letter] > 2;
	}


	/**
	*
	* Give an U to a Q
	*
	*/
	function checkQ (x, y) {
		var i,
			tmpX,
			tmpY;

		for ( i = 0; i < 6; i++ ) {
			tmpX = x + rose[i].x;
			tmpY = y + rose[i].y + (rose[i].x !== 0 && x % 2 ? 1 : 0);

			if ( tmpX > -1 && tmpY > -1 && tmpX < parms.mapWidth && tmpY < parms.mapHeight ) {
				if (tiles[tmpX][tmpY].letter == 85) return;
			}
		}

		tmpX = -1;
		tmpY = -1;

		while ( tmpX < 0 || tmpY < 0 || tmpX > parms.mapWidth - 1 || tmpY > parms.mapHeight - 1 ) {
			i = utils.rnd(5);

			tmpX = x + rose[i].x;
			tmpY = y + rose[i].y + (rose[i].x !== 0 && x % 2 ? 1 : 0);
		}

		tiles[tmpX][tmpY].letter = 85;
		tiles[tmpX][tmpY].el.innerHTML = 'U';
	}


	/**
	*
	* Find tile xy array from pixel position
	*
	*/
	function findTileFromPosition (posx, posy, board) {
		var x, y, z, ix, iy, iz, s, abs_dx, abs_dy, abs_dz,
			map_x, map_y,
			wrapper;

		wrapper = board || boardEl;
		posx -= wrapper.offsetLeft + 20;
		posy -= wrapper.offsetTop + 20;

		while ( wrapper = wrapper.offsetParent ) {
			posx -= wrapper.offsetLeft;
			posy -= wrapper.offsetTop;
		}

		//posx = posx - boardEl.offsetLeft - boardWrapperEl.offsetLeft - gameEl.offsetLeft;
		//posy = posy - boardEl.offsetTop - boardWrapperEl.offsetTop - gameEl.offsetTop;

		// Code from http://www-cs-students.stanford.edu/~amitp/Articles/GridToHex.html
		x = (posx - (parms.tileWidth / 2)) / (parms.tileWidth * 0.75);
		y = (posy - (parms.tileHeight / 2)) / parms.tileHeight;
		z = -0.5 * x - y;
		y = -0.5 * x + y;

		ix = Math.floor(x + 0.5);
		iy = Math.floor(y + 0.5);
		iz = Math.floor(z + 0.5);
		s = ix + iy + iz;
		if ( s ) {
			abs_dx = Math.abs(ix - x);
			abs_dy = Math.abs(iy - y);
			abs_dz = Math.abs(iz - z);
			if (abs_dx >= abs_dy && abs_dx >= abs_dz) {
				ix -= s;
			} else if (abs_dy >= abs_dx && abs_dy >= abs_dz) {
				iy -= s;
			} else {
				iz -= s;
			}
		}

		map_x = ix;
		map_y = (iy - iz + (1 - ix % 2 ) ) / 2 - 0.5;

		if ( map_x < 0 || map_x > parms.mapWidth - 1 || map_y < 0 || map_y > parms.mapHeight - 1 ) return false;

/*		var tx = map_x * (hex_width / 2) * 1.5;
		var ty = map_y * hex_height + (map_x % 2) * (hex_height / 2);
		var test = document.getElementById('test');
		test.style.top = Math.floor(ty) + boardEl.offsetTop + 'px';
		test.style.left = Math.floor(tx) + boardEl.offsetLeft + 'px';*/

		return { x: map_x, y: map_y };
	}


	/**
	*
	* Find the position of the second tile from the first
	*
	*/
	function findDirection (x1, y1, x2, y2) {
		var i,
			tmpX,
			tmpY;
		
		for ( i = 0; i < 6; i++ ) {
			tmpX = x1 + rose[i].x;
			tmpY = y1 + rose[i].y + (rose[i].x !== 0 && x1 % 2 ? 1 : 0);

			if (tmpX == x2 && tmpY == y2) return rose[i];
		}

		return false;
	}


	/**
	*
	* Find the 6 tiles around the selected one
	*
	*/
	function findNearby (x, y) {
		var i = 0,
			tmpX,
			tmpY,
			nearby = [];

		for ( ; i < 6; i++ ) {
			tmpX = x + rose[i].x;
			tmpY = y + rose[i].y + (rose[i].x !== 0 && x % 2 ? 1 : 0);

			if ( tmpX > -1 && tmpY > -1 && tmpX < parms.mapWidth && tmpY < parms.mapHeight ) {
				nearby.push(tiles[tmpX][tmpY].el);
			}
		}
		
		return nearby;
	}

	/**
	*
	* Free the hexmap
	*
	*/
	function destroy () {
		var x, y;

		utils.unbind(window, 'orientationchange', orientationChange);

		for ( x = 0; x < parms.mapWidth; x++ ) {
			for ( y = 0; y < parms.mapHeight; y++) {
				tiles[x][y].el.style[parms.transform] = '';		// Empty GPU memory?!
				boardEl.removeChild(tiles[x][y].el);
			}
		}

		tiles = [];
	}

	function dropTiles () {
		var x, y,
			delay = 0;

		HEXA.render.removeKeyframesByContext('tiles');

		for ( y = parms.mapHeight - 1; y > -1; y-- ) {
			for ( x = parms.mapWidth - 1; x > -1; x--) {
				utils.animate(tiles[x][y].el, {
					from: { x: 0, y: 0 },
					to: { x: 0, y: boardEl.offsetHeight + boardEl.offsetTop + boardWrapperEl.offsetTop },
					duration: 350,
					delay: delay,
					easing: HEXA.easing.cubicIn
				});
				delay += 25;
			}

			delay += 50;
		}
	}

	function orientationChange () {
		var x, y,
			offsetY,
			distanceX = Math.round(parms.tileWidth / 4) * 3,
			distanceY = parms.tileHeight;

		for ( x = 0; x < parms.mapWidth; x++ ) {
			offsetY = x % 2 ? Math.round(parms.tileHeight / 2) : 0;

			for ( y = 0; y < parms.mapHeight; y++ ) {
				tiles[x][y].el.style.left = x * distanceX + 'px';
				tiles[x][y].el.style.top = y * distanceY + offsetY + 'px';
			}
		}
	}

	function removeVowel () {
		vowelsCount--;
	}

	function addVowel () {
		vowelsCount++;
	}

	function getVowels () {
		return vowelsCount;
	}

	return {
		init: init,
		findTileFromPosition: findTileFromPosition,
		findDirection: findDirection,
		findNearby: findNearby,
		dropTiles: dropTiles,
		removeVowel: removeVowel,
		addVowel: addVowel,
		getVowels: getVowels,
		redraw: redraw,
		showTiles: showTiles,
		destroy: destroy
	};
})();