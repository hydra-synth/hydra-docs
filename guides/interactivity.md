# Interactivity Guide
---

#### Note

All of the examples using mouse position to move stuff on the canvas won't work well here, since the canvas doesn't occupy the full size of the screen as in the editor. Take this into account when we use `mouse`, that the positions are relative to the full webpage and not the canvas. This also means that as you scroll down this guide the `y` value will get higher and higher.

---

## Using the mouse

You can have your visuals react to the position of your mouse (or finger, in touch devices). Hydra has an object called `mouse` which stores and keeps track of the position of your mouse on the webpage.

### mouse.x & mouse.y

```hydra
gradient()
	.hue(()=>mouse.x/3000)
	.scale(1,1,()=>mouse.y/1000)
	.out()
```
|
You can refer to the pixel position of your mouse by calling `mouse.x` and `mouse.y`, each one corresponding to the horizontal and vertical coordinates respectively. When we say 'pixel position', this means that the values you'll find stored in both x and y are represented in pixels. So for `mouse.x`, this means the amount of pixels from the left edge of your window to the position of your mouse. For `mouse.y`, this means the amount of pixels between the top end of your screen and the position of your mouse.

Many times it will be most useful to use values relative to the size of the screen. And also to have values that exist between ranges more reasonable to the hydra functions you're using. For example [-0.5; 0.5] for scrollX and scrollY, [0; 2pi] for rotation, or [0; 1] for general purposes.

### Control anything with your mouse

On Hydra, most values used are pretty small. So it will be way more useful to have the position of the mouse as values from 0 and 1:

#### Getting values from 0 to 1

```hydra
x = () => mouse.x/innerWidth // 0→1
y = () => mouse.y/innerHeight // 0→1
osc()
        .scale(()=>1+x()*2)
        .modulate(noise(4),()=>y()/4)
        .out()
```

You can simply multiply by `2*Math.PI` to change the range to [0; 2pi]

### Make something follow your mouse

On Hydra, things are placed between 0.5 and -0.5 (left to right, top to bottom). In order for anything to follow your mouse, you'll need to get the position of your mouse between that range:

#### Getting values from 0 to ±0.5 from the center

```hydra
x = () => (-mouse.x/innerWidth)+.5 // 0.5→-0.5
y = () => (-mouse.y/innerHeight)+.5 // 0.5→-0.5
solid(255)
    .diff(
        shape(4,.1)
        .scroll(()=>x(),()=>y())
    )
    .out()
```

Remember you can name these functions however you prefer.

---

## Using JavaScript event listeners

Browsers have implemented in them a system of events which allows them to do X when Y happens. More concretely, this means we can define functions that will be run whenever a given event happens. Some examples of events are `click` (when a mouse click happens), `resize` (when the browser's window is resized), `keydown` (when a keyboard key is pressed down), `load` (when the webpage and its resources have been loaded), etc.
We call each function we assign to an event an "event listener". And there are to ways to add event listeners to our Hydra instance (or in any webpage):

```javascript
addEventListener('click', (event) => {});

onclick = (event) => { };
```

We'll be using the latter in the next examples since it's shorter. The former can allow you to add many listeners for the same event, but we don't really need that as much in Hydra, although you might find cool things to do with them!
All event listeners have one parameter, which here we conveniently called `event`, where we receive an object representing the event and useful data about it. For example, a `click` event includes data about the position the click was done, if the alt or ctrl keys were pressed while clicking, etc. You can ignore it if you won't use values from it.

### click, pointerdown and pointerup

One of the key things you need to take into account when working with mouse and keyboard events is that every time you click, every time you press a key, there's a pressing and a release action. These are usually named in events as 'down' or 'up'. For example, `mousedown` events happen when you start pressing the mouse button, `mouseup` events will happen at the release, and `click` events will happen when you both pressed and release the left mouse button. However, we'll try to use `PointerEvent`'s' instead of `MouseEvent`s since they are more general and work perfectly with any sort of pointer such as touch devices, drawing tablets, etc. They also allow for multi-touch input.


#### Toggle transforms on click

```hydra
toggle = 0
onclick = () => { toggle = toggle ? 0 : 1 }
osc(30,.2,1.5)
	.rotate(()=>toggle*Math.PI/2)
	.out()

onpointerup = null // ignore this for now
```
Note that in JavaScript, you can pass any value as a boolean and JavaScript will try to interpret it in some way (search for truthy and falsy if you want to learn more). With numbers, `0` will act as `false` and any other number will act as `true`. We can make use of this to generate our toggling action.
Fans of bitwise operators might implement the toggle as `toggle = toggle ^ 1`, where `^` means XOR.

##### Pointer version

We can simplify a click to be simply when any pointer is released (or pressed, whichever you prefer):
```hydra 
onclick = null // getting rid of the conflicting click event
//
toggle = 0
onpointerup = () => { toggle = toggle ? 0 : 1 }
osc(30,.2,1.5)
	.rotate(()=>toggle*Math.PI/2)
	.out()
```
Note that this example won't work if run after the previous one. Since both events will be triggered and the toggle will happen two times. Remember to "clean-up" any conflicting events either by reloading Hydra (remember to save doing `Ctrl+Shift+L`!) or simply setting the conflicting event to `null`. For example: `onclick = null`.

#### Activate transforms while clicking

```hydra
press = 0
onpointerdown = () => { press = 1 }
onpointerup = () => { press = 0 }
osc(30,.2,-1)
	.kaleid(()=> press ? 6 : 2 )
	.modulate(o0,.085)
	.out()
```
Note how we make use of the ternary operator again to get arbitrarily different values depending on if the user is pressing or not. You could also change these values into some other functions! or play with `time`. 

#### Count the amount of clicks

```hydra
clicks = 1
onpointerup = () => { clicks++ }
noise(()=>clicks)
	.out()
```
The use of `++` at the end of `clicks` is a shorthand in many C-like languages for something like `clicks = clicks + 1`. Learn more about it [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Increment)

#### Accumulate during clicks

In order to accumulate values while a pointer is being pressed we need to be constantly checking if it's pressed. We can do this using JavaScript's functionality for intervals. We could even do this with timeouts, actually. But there's a better way of doing this, which is checking if the pointer is being pressed every time Hydra renders a frame. But let's not get ahead of ourselves, and see the intervals version before:

```javascript
press = false
onpointerdown = () => { press = true }
onpointerup = () => { press = false }
pressedTime = 0; sensitivity = 0.05;
// clearInterval(interval) // uncomment after first eval
interval = setInterval(()=>{ pressedTime += press ? sensitivity : 0 },34)
osc(15,.1,()=>pressedTime)
	.out()
```

Ok, now that we see how tedious it can be to use intervals, let's see how we can do this in a more Hydrated way. As we just said, we could try checking if the pointer is being pressed each time Hydra renders a frame. Coincidentally, the arrows functions we love to use as arguments for our functions, are checked by Hydra every frame! We could try writing the action that updates our `pressedTime` inside one:

```hydra
press = false
onpointerdown = () => { press = true }
onpointerup = () => { press = false }
pressedTime = 0; sensitivity = 0.05;
osc(15,.1,()=>pressedTime += press ? sensitivity : 0)
	.out()
```
This works! And there's no need to explicitly `return pressedTime` in our function since JavaScript can infer that's what we want to return since it's the last (and only) assignment we made.
There's another way of making Hydra run some functionality each frame, which is using Hydra's `update` function which is discussed in the next part.

#### Generating new patches on clicks

Since outputting is simply a function call as any other. We can also try to evaluate patches when an event is triggered:
```hydra
textures = [noise(),osc(),osc(50).kaleid(),voronoi(),noise().thresh(0)]
onpointerdown = () => {
	osc(40,.05,Math.random()*2)
		.rotate(Math.PI/2)
		.modulate(textures.at(Math.random()*textures.length),.25)
  		.out()
}
osc().out() // placeholder until click
```

#### Other mouse/pointer events

There are many other pointer events you can try to experiment with! For example `pointermove` is triggered whenever the pointer moves. Read more about them [here](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events#event_types_and_global_event_handlers)

### keydown & keyup

To use keyboard input, we can use `KeyboardEvent`'s such as `keydown`, `keyup`. These work exactly like `pointerdown` and `pointerup`, but here's where the listener parameter we called `event` earlier, the one we've been quietly ignoring, comes into play. Since the event that we get will tell us which key was pressed! And if it was pressed while pressing Ctrl or Alt, etc. Now we can do everything we've been doing with the mouse buttons using any key from the keyboard! If we want to use a specific we can just use a condition and ask if the event we received is correspondent with the key we want. You can test different keys and what their events return in very handy websites such as [key.js](https://keyjs.dev/).

#### Moving stuff with the arrow keys

Here either add or subtract one from our x and y values depending on which arrow key the user presses. Each representing one of the 2 dimensional axis.
```hydra
x = 0; y = 0;
onkeyup = (event) => {
	switch(event.key){
      case "ArrowUp": y++; break;
      case "ArrowDown": y--; break;
      case "ArrowLeft": x++; break;
      case "ArrowRight": x--; break;
    }
}
noise(6)
	.diff(o0)
	.scroll(()=>x/10,()=>y/10)
	.sub(shape(4,.02).scroll(()=>x/10,()=>y/10),2)
	.out()

onpointerdown = null // getting rid of the previous listener
```

#### Example: Typing shapes

Here we use the `keyCode` of the last pressed key to change the shape being shown. This is a modification of ax example from the page about iteration. There we used ASCII codes to automatically generate shapes. However, ASCII and keyCodes of given letters are different!

```hydra
key = 25
onkeydown = (e) => { key = e.keyCode }
src(o0)
	.scale(1.007)
	.layer(
		shape(()=>3+(key%4),.1,.4)
			.luma(.6,.01)
			.color(1,.5,0).hue(()=>key/100)
			.scrollX(()=>.4+key/100)
			.rotate(()=>Math.PI*key/100)
	)
	.out()

// type anything here:
// 
```