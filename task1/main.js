var gl;
var center = {x: -1.5, y: -1.0};
var zoom = 2.0;
var param = { re: -0.8, im: 0.156};
var iterationsNumber = 270;
var isDragging = false;
var offsetX;
var offsetY;
var prevDragX;
var prevDragY;
var dragVelocity = 0.1;
function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl");
		if ( !gl )
			gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
}
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}
	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}
	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}
var shaderProgram;

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}
	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "tex");
	shaderProgram.iterUniform = gl.getUniformLocation(shaderProgram, "iters");
	shaderProgram.cUniform = gl.getUniformLocation(shaderProgram, "center");
	shaderProgram.paramUniform = gl.getUniformLocation(shaderProgram, "param");
	shaderProgram.zoomUniform = gl.getUniformLocation(shaderProgram, "zoom");
}
function handleLoadedTexture(texture, image) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
var neheTexture;
function initTexture() {
	neheTexture = gl.createTexture();
	var image = new Image();
	image.onload = function () {
		handleLoadedTexture(neheTexture, image)
	}
	image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAIAAAC+O+cgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuM4zml1AAAAKJSURBVDhPTZJ/LNRxGMff9U9t9U/9URMl5zchOhzHOc7hcH6lGGVFmczIQnOTk185hUJCJNUyY42aajNlltWssZrVbja13WqssaaZJuvd92O1tT179vzx7Pnxfr8AKx9YybHPF9b+sFHAJhAHlNgfDFsVbNWwC4VMA5kW9hFwiIKDDo7RcIqFsx7O8XBOhOtRuCbD/RjcU+CRCo80eKbD8yS8MnD4FLwz4ZMFnzM4kg15DuTn4JsL3zz450NRAEUhFBcQWAxlCYIuQlmKYANUZQgph9oIdQVCKxFWBU0NwmsRXgetCRFXEdGAyEZEXYeuGbpWxLQiug2x7YjtQFwn4roQ34O0pyi0oGwdxt8oJ4ybUfGvMHLLZt56mdsrubOWu+q4t57WDbRrolMz3VrpdYvyTgZ0MeQONXcZ9YD6h0zqZ+oATzxi5hCznzBvhOefs3iUhhc0vmT1BE2TbHzNlim2v2X3DO+/Y98sBz9yyMxncxyd5/hnTlo49YXTi5z9RvMy57/T8oOLq1xe48o6f27wF0WW6qU1LqzSsiJ6zEuif3qBU1/FBGnO6CeOzHHYzMEPYkvve3bNiL3S9oY3NL1izQSN4zSMiQulO6Vrsx/z9LC4P2WAif3U94m/NL1U9VDRRXkHvdrE747NPNgk1NhTz9113FHDbZVCq78a/icjyjZQtIiMMSTcE7LHdwv99beFF5IjMW3Q3YSuBbobiJSiUXinvSZ8DDdBc0U4G1oNdZXwWl0O1SXhvsqAoFIoJR5KEFAkCBGcFMAvH3558MuFXIocQZTPWXhnCcYk0iTePDPgkS4IdE/FoeOCSbdkuCbBJREuCXDSC24dY+CoEyTbayELhyzsDz5PVcNfaJaWAAAAAElFTkSuQmCC";
}
var posBuffer;

function initBuffers() {
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    var vertices = [
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    posBuffer.itemSize = 3;
    posBuffer.numItems = 4;
}

function drawScene() {

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, posBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, neheTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);
	
    gl.uniform1f(shaderProgram.iterUniform, iterationsNumber);
    gl.uniform1f(shaderProgram.zoomUniform, zoom);
    gl.uniform2f(shaderProgram.cUniform, center.x, center.y);
    gl.uniform2f(shaderProgram.paramUniform, param.re, param.im);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, posBuffer.numItems);
    gl.flush();
}
function tick() {
	requestAnimationFrame(tick);
	drawScene();
}
function webGLStart() {
	var canvas = $("#glcanvas");
	if ('onwheel' in document) {
		// IE9+, FF17+, Ch31+
		canvas.on("wheel", onWheel);
	} else if ('onmousewheel' in document) {
		canvas.on("mousewheel", onWheel);
	}
	
	offsetX = canvas.offset().left;
	offsetY = canvas.offset().top;
	
	canvas.mousedown(function(e){handleMouseDown(e);});
	canvas.mousemove(function(e){handleMouseMove(e);});
	canvas.mouseup(function(e){handleMouseUp(e);});
	canvas.mouseout(function(e){handleMouseOut(e);});
	
	
	
	initGL(canvas[0]);
	initShaders();
	initBuffers();
	initTexture();
    setInterval(drawScene, 15);
}

function onWheel(e) {
    e = e || window.event;
	var delta = e.originalEvent.deltaY || e.originalEvent.detail || e.originalEvent.wheelDelta;
    var velocity = delta > 0 ? 1.1: 0.9;
	var canvas = $("#glcanvas")
	var x = e.clientX || e.originalEvent.clientX;
	var y = e.clientY || e.originalEvent.clientY;
	var mousex = x - canvas.offset().left;
    var mousey = y - canvas.offset().top;
    center.x += (mousex / 640) * zoom * (1 - velocity);
    center.y += (mousey / 480) * zoom * (1 - velocity);
    zoom *= velocity;
}

function handleMouseDown(e){
	prevDragX=parseInt(e.originalEvent.clientX-offsetX);
	prevDragY=parseInt(e.originalEvent.clientY-offsetY);
	isDragging=true;
}

function handleMouseUp(e){
	isDragging=false;
}

function handleMouseOut(e){
	isDragging=false;
}

function handleMouseMove(e){
	if(isDragging) {
		var canMouseX=parseInt(e.originalEvent.clientX-offsetX);
		var canMouseY=parseInt(e.originalEvent.clientY-offsetY);

		center.x -= ((canMouseX - prevDragX) / 640) * zoom * dragVelocity;
		center.y -= ((canMouseY - prevDragY) / 480) * zoom * dragVelocity;

		prevDragX = canMouseX;
		prevDragY = canMouseY;
	}
}


function updateParameters() {
	param.re = parseFloat($("#paramRe").val());
	param.im = parseFloat($("#paramIm").val());
	iterationsNumber = parseInt($("#iterationsNumber").val());
}
