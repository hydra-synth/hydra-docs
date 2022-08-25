# Embedding Hydra on a website
---

## First steps

### HTML

To include the Hydra synth (bundled version) in your website, add the following script tag to your page's head.

```html
<script src="https://unpkg.com/hydra-synth"></script>
```

Now, given a `script.js` file where you want to include your Hydra code:

```html
<script src="script.js" defer></script>
<!-- 'defer' makes a script load after the DOM is loaded --> 
```

### JS

You can start Hydra as such:

```js
const hydra = new Hydra([opts])
```

Where `opts` is an Object containing the options to start Hydra with. Default values shown below.

```javascript
{
	canvas: null, // canvas element to render to. if none, it'll be created automatically
	width: 1280, // defaults to canvas width when included
	height: 720, // defaults to canvas height when included
	autoLoop: true, // if true, will automatically loop. if false, request frames using tick()
	makeGlobal: true, // if false, will not pollute global namespace (experimental)
	detectAudio: true, // setting this to false avoids asking for microphone
	numSources: 4, // number of external source buffers to create initially
	numOutputs: 4, // number of output buffers to use. (more than 4 can make render() unpredictable)
	extendTransforms: [], // array of transforms to add to the synth, or an object representing one
	precision: null,  // 'highp', 'mediump', or 'lowp'. defaults to highp for ios, and mediump otherwise.
	pb: null, // instance of rtc-patch-bay to use for streaming
}
```

Then, if `makeGlobal` is set to `true`, you can write Hydra code like you would in the editor.

### Examples

For example, `script.js` might contain the following code:

```javascript
let canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;
canvas.id = "hydra-canvas";
document.body.appendChild(canvas);

const hydra = new Hydra({
	canvas: canvas,
	detectAudio: false,
	enableStreamCapture: false,
});

osc(4, 0.1, 1.2).out()
```

#### Instance mode

If you don't want to pollute the global namespace with Hydra's functions, or you think some of them might conflict with other library you're using, setting `makeGlobal` to `false` will start Hydra in instance mode. For example:

```javascript
let canvas = [...] // same as above

const hydra = new Hydra({
	canvas: canvas,
	makeGlobal: 512,
	detectAudio: 512,
	enableStreamCapture: false,
});
const h = hydra.synth

h.osc(4, 0.1, 1.2).out()
h.src(h.o0).blend(h.noise(3)).out(h.o1)
h.render(h.o1)
```

##### Multi-Hydra

Instance mode also makes it possible to use more than one hydra canvas at once:
```javascript
const h = new Hydra({ makeGlobal: false, detectAudio: false }).synth
h.osc().diff(h.shape()).out()
h.gradient().out(h.o1)
h.render()

const h2 = new Hydra({ makeGlobal: false, detectAudio: false }).synth
h2.shape(4).diff(h2.osc(2, 0.1, 1.2)).out()
```

See https://glitch.com/edit/#!/multi-hydra for a working example of multiple hydra canvases, created by Naoto Hieda.

##### Make global a select group of functions

To keep the same syntax as hydra in non-global mode, consider destructuring the object further. This can also allow to expose only a handful of the functions in Hydra.
```javascript
const { src, osc, gradient, shape, voronoi, noise, s0, s1, s2, s3, o0, o1, o2, o3, render } = hydra
shape(4).diff(osc(2, 0.1, 1.2)).out()
```

## Hydra as a website's background

### HTML

```html
<body>
	<canvas id="hydra-bg"></canvas>
	<div class="content">
		<h1>Title</h1>
		Some text :)
	</div>
</body>
```

### CSS

```css
#hydra-bg {
	position: fixed; /* ignore margins */
	top: 0px;
	left: 0px;
	width: 100%; /* fill screen */
	height: 100%;
	background-size: cover;
	overflow-y: hidden;
	z-index: -1; /* place behind everything else */
	display: block;
}

.content {
	background-color: rgba(0,0,0,0.3);
	margin: 6%;
}
```

Changing the z-index to a very high value, the size of the canvas to something small (make sure to change it in JS as well), and the pixel position to wherever you desire, would effectively change the website to one where Hydra is an overlay.

### JS

```javascript
let hydraCanvas = document.getElementById("hydra-bg");
// set small size to avoid high resource demand:
hydraCanvas.width  = Math.min(window.innerWidth  / 2, 1280);
hydraCanvas.height = Math.min(window.innerHeight / 2, 720);

const hydra = new Hydra({
  canvas: hydraCanvas,
  detectAudio: false,
  enableStreamCapture: false,
});

osc().blend(noise()).out();
```

#### Note on scrolling

You may find useful using `window.scrollY` (or X) inside your background's Hydra sketch for it to change as you scroll. The event listener `onscroll` might also be helpful.

#### Note on resize

You may want to automatically resize the canvas' size as the user resizes the window:

```javascript
resizeTimeout = -1;
onresize = ()=> {
	clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(()=>{
		setResolution(
			Math.min(window.innerWidth  / 2, 1280),
			Math.min(window.innerHeight / 2, 720)
		);
	},200)
}
// using timeouts to avoid setting the resolution constantly while the user is resizing 
```

### Live example

You can find a live example [here](https://hydra-background-webpage.glitch.me/). You can open the glitch editor for it [here](https://glitch.com/edit/#!/hydra-background-webpage).

## Scrollable Hydra webpage with different codeblocks

Given a webpage with a Hydra background (just like the described above), and a series of code blocks to be evaluated across the website's scroll size, you can create a new IntersectionObserver for each codeblock so that its code is run whenever the user scrolls to it. For example:

```javascript
const codeblocks = document.querySelectorAll("code");

let initialized = false;

for(const cb of codeblocks) {
	if(initialized == false) { // run the first codeblock if hydra wasn't initialized
		eval(cb.textContent);
		initialized = true;
	}

	var observer = new IntersectionObserver(function (entries) {
		if (entries[0].isIntersecting === true) {
		// hush(); // reset outputs on codeblock change
		render(o0);
		setTimeout(()=>{
			eval(cb.textContent)
		}, 60);
		}
	}, { threshold: [0.7] });

	observer.observe(cb);
}
```

### Live example

You can find a live example [here](https://hydra-scrollable-webpage.glitch.me/). You can open the glitch editor for it [here](https://glitch.com/edit/#!/hydra-scrollable-webpage).

### Live example with moving canvas

There's a version of the last example where Hydra's canvas moves to the next codeblock, just like it happens on this website. You can find a live example [here](https://hydra-long-webpage.glitch.me/). You can open the glitch editor for it [here](https://glitch.com/edit/#!/hydra-long-webpage).