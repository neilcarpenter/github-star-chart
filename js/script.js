// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var COLOURS = {"Arduino": "#bd79d1", "Java": "#b07219", "VHDL": "#543978", "Scala": "#7dd3b0", "Emacs Lisp": "#c065db", "Delphi": "#b0ce4e", "Ada": "#02f88c", "VimL": "#199c4b", "Perl": "#0298c3", "Lua": "#fa1fa1", "Rebol": "#358a5b", "Verilog": "#848bf3", "Factor": "#636746", "Ioke": "#078193", "R": "#198ce7", "Erlang": "#949e0e", "Nu": "#c9df40", "AutoHotkey": "#6594b9", "Clojure": "#db5855", "Shell": "#5861ce", "Assembly": "#a67219", "Parrot": "#f3ca0a", "C#": "#555", "Turing": "#45f715", "AppleScript": "#3581ba", "Eiffel": "#946d57", "Common Lisp": "#3fb68b", "Dart": "#cccccc", "SuperCollider": "#46390b", "CoffeeScript": "#244776", "XQuery": "#2700e2", "Haskell": "#29b544", "Racket": "#ae17ff", "Elixir": "#6e4a7e", "HaXe": "#346d51", "Ruby": "#701516", "Self": "#0579aa", "Fantom": "#dbded5", "Groovy": "#e69f56", "C": "#555", "JavaScript": "#f15501", "D": "#fcd46d", "ooc": "#b0b77e", "C++": "#f34b7d", "Dylan": "#3ebc27", "Nimrod": "#37775b", "Standard ML": "#dc566d", "Objective-C": "#f15501", "Nemerle": "#0d3c6e", "Mirah": "#c7a938", "Boo": "#d4bec1", "Objective-J": "#ff0c5a", "Rust": "#dea584", "Prolog": "#74283c", "Ecl": "#8a1267", "Gosu": "#82937f", "FORTRAN": "#4d41b1", "ColdFusion": "#ed2cd6", "OCaml": "#3be133", "Fancy": "#7b9db4", "Pure Data": "#f15501", "Python": "#3581ba", "Tcl": "#e4cc98", "Arc": "#ca2afe", "Puppet": "#cc5555", "Io": "#a9188d", "Max": "#ce279c", "Go": "#8d04eb", "ASP": "#6a40fd", "Visual Basic": "#945db7", "PHP": "#6e03c1", "Scheme": "#1e4aec", "Vala": "#3581ba", "Smalltalk": "#596706", "Matlab": "#bb92ac"}; // https://github.com/doda/github-language-colors

var user = 'neilcarpenter';

var fullData = [];
function APIurl() {
	return 'https://api.github.com/users/' + user + '/starred?client_id=e7881d948a0a7499bddf&client_secret=89369afecc8be691d087da9930e7376c07eaf08c&callback=?';
}

var WIDTH, HEIGHT, MAX_WATCHERS, BAR_WIDTH, DATA_LENGTH;
var c, ctx;
var mouse = { x: 0, y: 0 };
var animation = null;

function begin () {

	fullData.length = 0;

	$.getJSON(APIurl(), function(data){

		var links = data.meta.Link;
		var linksLen = data.meta.Link.length;
		var pagesLen = 1;

		for (var i = 0; i < linksLen; i++) {
			if ( links[i][1].rel === 'last' ) {
				pagesLen = links[i][0].split('&page=')[1];
			}
		}

		fullData = data.data;
		
		getAllData( pagesLen );

	});

}

function getAllData (totalPages) {

	var url;

	for (var i = 2; i <= totalPages; i++) {

		url = APIurl() + '&page=' + i;

		$.getJSON(url, function(data){

			mergeArrays( fullData, data.data );

			if ( i > totalPages ) dataHasArrived();

		});

	}

}

function mergeArrays (array1, array2) {

	var len = array2.length;
	for (var i = 0; i < len; i++) {
		array1.push( array2[i] );
	}

}

function dataHasArrived () {

	getMaxWatchers();

}

function getMaxWatchers () {

	DATA_LENGTH = fullData.length;

	MAX_WATCHERS = 0;

	for (var i = 0; i < DATA_LENGTH; i++) {
		MAX_WATCHERS = fullData[i].watchers > MAX_WATCHERS ? fullData[i].watchers : MAX_WATCHERS;
	}

	setupData();

}

function setupData () {
	
	for (var i = 0; i < DATA_LENGTH; i++) {
		fullData[i].HEIGHT = 0;
		fullData[i].MAX_HEIGHT = (fullData[i].watchers / MAX_WATCHERS) * HEIGHT;
		fullData[i].VELOCITY = randomFromInterval(1, 3);
	}

	initCanvas();

}

function initCanvas () {

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	c = document.getElementById('canvas');
	ctx = c.getContext('2d');

	c.width = WIDTH;
	c.height = HEIGHT;

	c.addEventListener('mousemove', mouseMove, false);
	c.addEventListener('mouseup', mouseUp, false);

	loop();

	window.onresize = function () {
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;

		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		c.width = WIDTH;
		c.height = HEIGHT;

		setupData();
	};

}

function loop() {
	animation = requestAnimationFrame( function(){ loop(); } );
	draw();
}

function draw () {

	BAR_WIDTH = WIDTH / DATA_LENGTH;

	var barHeight;
	var colour;
	var x, y;

	ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	for (var i = 0; i < DATA_LENGTH; i++) {
		
		barHeight = fullData[i].HEIGHT;
		colour = COLOURS[fullData[i].language] || '#505050';
		x = i * BAR_WIDTH;
		y = HEIGHT - barHeight;

		ctx.fillStyle = colour;
		ctx.fillRect(x, y, BAR_WIDTH, barHeight);

		fullData[i].HEIGHT += ( fullData[i].HEIGHT < fullData[i].MAX_HEIGHT) ? ( 1 * fullData[i].VELOCITY ) : 0;

	}

	drawText();

}

function drawText () {

	var hoverIndex = Math.floor(mouse.x / BAR_WIDTH);
	var name = fullData[hoverIndex].name;
	var desc = fullData[hoverIndex].description;
	var repos = fullData.length;
	var language = fullData[hoverIndex].language || 'not set';
	var languageColor = COLOURS[fullData[hoverIndex].language] || '#505050';

	// title
	ctx.textAlign = 'right';
	ctx.fillStyle = '#fff';
	ctx.font = 'bold 12px sans-serif';
	ctx.fillText('the ' + repos + ' repos ' + user + ' has starred on GitHub, by most watched', (WIDTH - 50), 50);

	// name
	ctx.textAlign = 'left';
	ctx.font = 'bold 16px sans-serif';
	ctx.fillText(name, 50, 50);

	// desc
	ctx.font = 'bold 12px sans-serif';
	ctx.fillText(desc, 50, 70);

	// lang
	ctx.fillStyle = languageColor;
	ctx.fillText(('language: ' + language), 50, 90);

	ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.fillRect((hoverIndex*BAR_WIDTH), 0, BAR_WIDTH, HEIGHT);

}

function randomFromInterval (from, to) {
	return Math.floor(Math.random() * (to - from+ 1 ) + from);
}

function mouseUp () {

	var hoverIndex = Math.floor(mouse.x / BAR_WIDTH);
	var url = fullData[hoverIndex].html_url;

	window.open(url, '_blank');

}

function mouseMove (e) {

	mouse.x = e.offsetX;
	mouse.y = e.offsetY;

}

$(function () {

	begin();

	$('a').click(function (e) {
		e.preventDefault();
		$('html').toggleClass('search-open');
	});

	$('form').submit(function (e) {
		e.preventDefault();

		$('html').removeClass('search-open');

		user = $(this).find('input').val();

		window.cancelAnimationFrame(animation);
		animation = null;
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		begin();

		$(this).find('input').val('');
		$(this).find('input').attr('placeholder', 'Enter another GitHub username').blur();

	});

});