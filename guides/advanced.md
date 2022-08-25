# Advanced Guide
---

## Dynamic inputs

If you're coding in Hydra, you're constantly trying many values to input to the sources and transforms, and it's just a matter of time until you like how more than one looks, and you want to somehow switch between them. We'll be referring to this idea of arguments whose value change over time as dynamic arguments. And there are two main ways to achieve this in Hydra: Arrays and functions.

### Arrays

#### Sequence your inputs

When you send an Array as an input, Hydra will automatically switch and jump from each element from the Array to the next one. When there are no more elements, it wraps all the way back to the beginning. Let's see it in action:

```hydra
osc([20,30,50,60],.1,[0,1.5])
	.out()
```

As you can see, the fact that both these Arrays have a different amount of values doesn't matter, Hydra will take values from each element of any Array for the same amount of time by default.

The Arrays can be passed in any way, you may have a variable that stores an Array and use its name within your sketches (not recommended in some scenarios, more info below), you may create a function that returns Arrays and use that to automatically generate discrete sequences of values:

```hydra
randomArray = (l=12)=> Array.from({length: l}, Math.random);
gradient()
	.hue(randomArray())
	.out()
```

#### Changing the global bpm for Arrays

To change how rapidly Hydra switches from element to element of all Arrays, you can change the `bpm` variable (meaning beats per minute) to any value you desire:

```hydra
bpm = 138 // change me !
randomArray = (l=12)=> Array.from({length: l}, Math.random);
gradient()
	.hue(randomArray())
	.out()
```

The default value for `bpm` is 30.

When livecoding visuals at the same time that music is playing, it can be useful to have a tapping metronome opened to keep track of the BPM being played and set this variable as such.

#### Changing the speed of a specific Array

Hydra adds a couple of methods to all Arrays to be used inside Hydra. `.fast` will control the speed at which Hydra takes elements from the Array. It receives a Number as argument, by which the global speed will be multiplied. So calling `.fast(1)` on an Array is the same as nothing. Higher values will generate faster switching, while lower than 1 values will be slower.

```hydra
bpm = 45
osc([20,30,50,60],.1,[0,1.5].fast(1.5)) // 50% faster
    //.rotate([-.2,0,.2].fast(1)) // try different speeds for each array
	.out()
```

#### Offsetting the timing of an Array

Another one of the methods Hydra adds to Arrays, allows you to offset the timing at which Hydra will switch from one element of the Array to the next one. The method `.offset` takes a Number from 0 to 1.

```hydra
bpm = 45
osc([20,30,50,60],.1,[0,1.5].offset(.5)) // try changing the offset
	.out()
```

#### Fitting the values of an Array within a range

Sometimes you have an Array whose values aren't very useful when used as input for a some Hydra function.
Hydra adds a `.fit` method to Arrays which takes a minimum and a maximum to which fit the values into:

```hydra
bpm = 120
arr = ()=> [1,2,4,8,16,32,64,128,256,512]
osc(50,.1,arr().fit(0,Math.PI))
	.scale(arr().fit(1,2))
	.out()
```

#### Interpolating between values

You can also interpolate between values instead of jumping from one to the other. That is, smoothly transition between values. For this you can use the `.smooth` method. It may take a Number argument (defaulted to 1) which controls the smoothness.

```hydra
bpm = 50
arr = [0,0.8,2]
osc(50,.1,arr.smooth())
	.rotate(arr.fit(-Math.PI/4,Math.PI/4).smooth())
	.out()
```

Try smoothing some of the above examples and see what happens!

##### Easing functions

The default interpolation used by Hydra on an Array that called `.smooth` is linear interpolation. You can select a different easing function as follows:

```hydra
bpm = 50
arr = [0,0.8,2]
osc(50,.1,arr.ease('easeInQuad'))
	.rotate(arr.fit(-Math.PI/4,Math.PI/4).ease('easeOutQuad'))
	.out() // try other easing functions !
```

The following are the available easing functions:

* linear: no easing, no acceleration
* easeInQuad: accelerating from zero velocity
* easeOutQuad: decelerating to zero velocity
* easeInOutQuad: acceleration until halfway, then deceleration
* easeInCubic
* easeOutCubic
* easeInOutCubic
* easeInQuart
* easeOutQuart
* easeInOutQuart
* easeInQuint
* easeOutQuint
* easeInOutQuint
* sin: sinusoidal shape

#### Note on storing Arrays on variables / functions

Storing an Array in a variable can lead to some trouble as soon as you apply some of the just-mentioned functions to it. Since Arrays are Objects, each time you call your variable, you'll be calling the same Object. If you apply some speed via `.fast` or smoothness via `.smooth` somewhere in your patch, and then use the same variable, all the following uses of the Array will also have these effects applied to them. For example

```hydra
arr = [1,2,3]
osc(30,.1,arr.smooth())
	.rotate(arr)
	.out()

arr2 = () => [1,2,3]
osc(30,.1,arr2().smooth())
	.rotate(arr2())
	.out(o1)

render()
```

#### Note on Arrays and textures

Note that the following will not work:

```javascript
solid(1,.5,0)
	.diff([osc(),noise()])
	.out()
```

Hydra can't handle Arrays of textures. You can work around it in some ways:

```hydra
solid(1,.5,0)
	.diff(osc().blend(noise(),[0,1].smooth()))
	.out()
```

Unfortunately, if you want to use many textures this solution doesn't really apply.

Users of Hydra have come up with some experimental solutions which might come in handy in some scenarios, but they come with some drawbacks:

```javascript
// blending method, heavy GPU load.
// every element from the array will be rendered even if not shown.
// allows for blending between elements.

select = function(arr,l=0){
	const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
	const blending = (l,i)=> (clamp(l-(i-1),0,1))
	const isFunction = (typeof l === 'function')
	return arr.reduce((prev,curr,i)=>
		prev.blend(curr, isFunction ? ()=>blending(l(),i) : blending(l,i))
	)
}
textures = [noise(), osc(), voronoi(), gradient()]
select(textures,()=>Math.floor(mouse.x/innerWidth*4))
    .out()
```

```javascript
// re-compiling method, heavy CPU load. 
// it reserves an output for the switching. 
// can't blend between elements. 
// each time an element switches the shader must be recompiled

osc(20)
  	.rotate()
  	.modulate(o3,.2)
	.out()

textures = [noise(), osc(), voronoi(), shape()]
index = 0
tex = textures[index]
update = (dt)=> {
	if(time % (60 / bpm) * 1000 < dt){
		index++; index %= textures.length;
		tex = textures[index]
		tex.out(o3)
    }
}
```

### Functions

#### React to values in time

The other main way of adding dynamic inputs to your sketches is passing functions as arguments. When Hydra takes a function as an argument, what it will do is evaluate it every time it renders a frame. The return of the function will be used as the value for that parameter during that frame render. So you can use a function to simply keep track of a value that you know will change over time, for example, mouse position (which we'll see later).

```hydra
voronoi(5,.1,()=>Math.sin(time*4))
	.out()
```

The `time` variable seen there is a variable pre-declared by Hydra, that stores how much time passed since Hydra started in seconds.

Functions used in Hydra don't need to be arrow functions, any no-argument function will do! Make sure your function is returning a Number to avoid errors.

#### Using the time variable

When you use functions that can take numerical arguments, `time` will allow you to have their values evolve through... time. If you multiply time by some value it's as if time goes faster, while dividing while act as making time go slower. For example `Math.sin(time*4)` will go 4 times faster than `Math.sin(time)`.

Those users more familiar with mathematics might see this as:

* `y(t) = t` : `()=>time`
* `y(t) = A sin(f t + ph)` : `()=>amplitude*Math.sin(freq*time + phase)`

We recommend getting familiar with some of the methods in the JS built-in `Math` object. Learn more about it [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)

#### Changing the global speed

You can either slow down or fasten the rate at with `time` increases via changing the `speed` variable:

```javascript
speed = 1  // default
speed = 2  // twice as fast
speed = .5 // half as fast
speed = 0  // freezed 
```

---

## Using iteration and conditionals to create patches

##### Note

For this tutorial we'll be assuming you've already learned by your own means what iteration and conditionals are in a programming context.

### Iteration : automatically generate patches

As you may know from regular programming, or other creative coding environments such as p5, iteration helps us repeat some operation(s) many times to achieve a specific goal. Maybe you would like to layer many similar objects but with slightly different values, and you want so many of them that writing each one manually isn't desirable. Maybe you want to have some form of very specific feedbacks, etc.
Let's jump straight into some examples.

#### for loops

For loops that generate patches can be used inside or outside functions, but we will be sticking with the latter for convenience.

The typical structure of a patch-generating for loop is as follows:

```javascript
someFunction = (iterations) => {
	accumulator = osc(); // first part of the patch, a source
  	for(i=1; i<iterations; i++){ // i is also called a "counter`
    	accumulator.someTransform(i);
    }
  	return accumulator;
}
someFunction(5).out()
```

Of course this is just a useful example, and your code may end up looking very different depending on what crazy ideas you want to try. But let's use this as a starting point. See how the use of a function allows us to reuse this iterative process with different parameters such as the amount of iterations. Also note how we start the counter variable `i` on the value `1` instead of the typical `0`. Since `0` will usually null an effect, the result will be equal to the first value assigned our accumulator, so we can skip the `0` iteration altogether. For those not familiar with the abbreviation `i++`, this basically means `i+=1`, which means `i = i+1`.

##### Example: rotating

```hydra 
// 'nest' is only a creative, arbitrary name
nest = (freq,div) => {
    nest = osc(freq,.02); step = Math.PI*2/div
    for(r = step; r<Math.PI*2; r+=step)
            nest.diff(osc(freq,.02).rotate(r))
    return nest;
}
nest(30,4).out()
```

Here we want to see how it would look like if we grab an oscillator of a given `freq` frequency, and calculate the `diff` between other rotated oscillators of the same frequency. To achieve that, we define our accumulator `nest` with the initial value of `osc(freq,.02)`. Then, we define a `step` which will be how many radians the oscillator will rotate. We calculate this as a division of 2pi (a full 360° turn) by some `div` number. Then we iterate over `nest`, applying the `diff` and the effect respectively, and adding a `step` to our counter `r` each iteration.

##### Example: very specific feedback

```hydra
feedbacks = (q) => {
    result = noise(4).luma(-.1);
    for(i = 1; i<q; i++)
        result.modulate(src(o0).scale(1/(i)),.03*i)
    return result;
}
feedbacks(5)
    .out()
```

##### Example: layering varying circles

```hydra
screenRatio = () => 1 // innerHeight/innerWidth // this only makes sense in the editor
circle = () => shape(64,.9,.1).scale(1,screenRatio).luma().color(1,.1,.2)
tunnel = (q=5) => {
    tunnel = circle();
    for(i=1; i<q; i++){
        nextCircle = circle()
                        .invert(i%2) // inverts every other iteration
                        .hue(.01*i)
                        .scale(0.85**i);
        tunnel.layer(nextCircle);
    }
    return tunnel;
}
tunnel(8)
    .out()
```

Try adding or changing the transforms that happen to every `nextCircle` and see how drastically yet easily they can change the visuals. Specially using transforms like `repeatX`.
Still, always keep in mind while using iteration, that the more effects and iterations you add, the heavier the sketch will be to process.

#### .forEach, .map and .reduce

Those familiar with more array focused programming languages such as Python or Haskell, or more functional structures even inside JavaScript, may be used to iterating using the `forEach`, `map` and/or `reduce` structures. Where given an Array, we use each value to alter something or to reduce the entire Array into a desired result.
Practically anything done with these functions can be done using `for` loops, so if you are new to these or you just don't like how they look, then there really is no need for you to learn these, even if you're super interested in iteration.

##### .forEach

Structures using `.forEach` are quite useful for those who'd like to generate patches from predefined data. Here's an example using the ASCII values of a given string:

```hydra
text = "Hydra :)"
arr = Array.from(text).map(char => {return char.charCodeAt()})
result = solid()
arr.forEach(ascii => {
	result.add(
		shape(4,.2,.5).luma(.6,.3)
      		.color(1,0,0).hue(ascii/100)
      		.scrollX(.4+ascii/100)
      		.rotate(Math.PI*ascii/100)
    	,.4)
})
result.out()
```
Try changing the text, and remember not to use very long strings given they will be quite heavy to process.

##### .reduce

Using `.reduce` is quite useful when you have an array of textures. Here's a simple example:

```hydra
vs = [noise(), osc(), voronoi(), gradient()];
result = () => vs.reduce((prev,curr)=> {
	return prev.diff(curr)
	},solid())
result().out()
```

##### .map 

Haters of state (non-political) will prefer `.map` any day over `.forEach`. Looking at the example for `.forEach`, we see were creating a texture and adding it to an accumulator _for each_ element in the Array. We can separate the texture generating part of the code and the blending part using `.map` to get an array of textures and `.reduce` to blend them:

```hydra
text = "Hydra >:]"
arr = Array.from(text).map(char => {return char.charCodeAt()})
arr = arr.map(ascii => 
	shape(4,.2,.5).luma(.6,.3)
      		.color(1,0,0).hue(ascii/100)
      		.scrollX(.4+ascii/100)
      		.rotate(Math.PI*ascii/100)
)
result = arr.reduce((prev,curr)=>prev.add(curr,.4),solid())
result.out()
```

### Conditionals

Conditionals aren't very useful on their own here, given all code execution on Hydra happens arbitrarily and manually via the interaction of the user. The only case you would want to use an `if` statement by its own while livecoding Hydra is that where you'd like some variable to change given some condition and only at the time of each code evaluation. But even still, you'll see that putting any conditionals inside functions will be the most useful approach because of code reusability and readability. Let's get to it.

#### Conditionals in functions

We know from previous tutorials we can make our own functions to be used as arguments of Hydra sources and transforms, and how Hydra evaluates these functions each frame. Here's an example where we use conditionals to have a hue change happen only during 3 seconds out of every 10 seconds:

```hydra
hueChange = () => {
    if(time%10 < 3)
        return time/2
    else
        return 0
}
osc(20,.1,2.6)
	.modulate(osc(20).rotate(Math.PI/2),.3)
	.hue(hueChange)
	.out()
```

Another common use of conditionals in programming is to avoid errors or undesired behaviors. Here's a simple example where we wrap the square root function from the Math API into our own `sqrt` function which turns any negative input into positive:

```hydra
sqrt = (n) => {
	if(n<0) n*=-1; //if negative, multiply by -1
  	return Math.sqrt(n)
}
noise(2)
	.diff(noise(2).scale(()=>sqrt(Math.sin(time/2))))
	.out()
```

#### The ternary operator

Before we go forward and use both iteration and conditionals, we'd like to show you the ternary operator. This operator can simplify many conditional operations. The syntax is the following:

```javascript
x = condition ? valueIfTrue : valueIfFalse;

// which is the same as
if(condition)
    x = valueIfTrue
else
    x = valueIfFalse
```

Now we can simplify the hue change example into:

```javascript
osc(20,.1,2.6)
	.modulate(osc(20).rotate(Math.PI/2),.3)
	.hue(()=> time%10<3 ? time/2 : 0)
	.out()
```

#### Conditionals inside iterations

Let's go back to a previous example, the nest, where we wanted to do many `diff` using the same oscillator many times with different angles of rotation. Here's a new version where we invert the colors of the first half of oscillators, and we apply colorama to the oscillator in every other iteration.

```hydra
// 'nest' is only a creative, arbitrary name
nest = (freq,div) => {
  	nest = osc(freq,.02); step = Math.PI*2/div
	for(i = 1; i<div; i++){
      r = i*step;
      nextOsc = osc(freq,.02).rotate(r);
      if(r<Math.PI) nextOsc.invert();
      nest.diff(nextOsc);
      if(i%2==0) nest.colorama(.06) 
    }
  	return nest;
}
nest(15,6).out()
```

The first change you'll notice is that now we're calculating the angle of rotation `r` inside the iteration, and for that we now use a regular counter such as `i`. We can get the exact same angle of rotation as before via multiplying the counter by the step. We do this specifically because if we want to have something happen every other condition, we'll need to know if the number of iteration we're in is even or not. This is what happens at `if(i%2==0)`.
However we still make use of `r` inside of the first conditional, `if(r<Math.PI)`. This will result in about half of the oscillators to be inverted, given Math.PI is half a turn.

---

## Using the update function

There's a function in the Hydra API called `update`. This function runs at the beginning of every frame render right before the values for `time` and `a.fft` are calculated. If you are familiar with Processing or p5, you can think of `update` as Hydra's equivalent to the `draw` function.
Using `update` can be very useful for creating generative visuals (generative in the sense of controlling visual elements with values that evolve through time either randomly or following certain rules). It can also be used to have a finer and/or connected control over parameters when compared to using simple arrow functions as arguments.
It is also worth noting that the function receives a `dt` argument, which contains the delta time elapsed between the rendering of the previous frame and the current one. You may or may not want to use this to control your visuals (most of the examples don't use it, actually).

### Examples

#### Using `update` and `time` to have complex control of parameters through time

```hydra
inv = 0; r = 0;
osc(30,.1,()=>-inv)
	.invert(()=>inv)
	.diff(osc(30).rotate(()=>r))
	.out()

update = (dt) => {
	inv = time % 12 < 6 ? Math.abs(Math.sin(time)) : time*2 % 2
	r += Math.sin(time/2) * (time%2.5) * 0.02
  	r -= Math.cos(time)*0.01
}
```

The structure `time % every < duration` is super useful to make stuff happen `every` certain amount of seconds, for a given `duration` (also in seconds).
`time % wavelength / wavelength` can be interpreted as a sawtooth wave with a given wavelength. This would generate an ascending sawtooth going from 0 to 1 in the amount of time specified by whe wavelength. For a descending one you can write something like `1-(time % wavelength / wavelength)`. If you want values from 0 to `wavelength` just remove the division.

#### Adding a frame counter to make frame-specific actions

Having something appear for only one frame can be super useful in many feedback-based sketches:

```hydra
toggle = 0; rotation = .01
src(o0)
    .scale(1.017)
    .rotate(()=>rotation)
    .layer(
        osc(10,.25,2)
            .mask(shape(4,.2))
            .mult(solid(0,0,0,0),()=>1-toggle)
    )
    .out()

frameCount = 0
update = (dt) => {
    toggle = 0
    if(frameCount % 120 == 0){
        toggle = 1; rotation *= -1;
    }
    frameCount++
}
```

#### Randomly evolving values through time (Random walker)

```hydra
x = 0; y = 0;
t = ()=> solid(1, 1, 1, 1).mask(shape(3, .05, .01).rotate(Math.PI))
src(o0)
	.blend(osc(8,.1,.2).hue(.3),-.015)
  	.scale(1.01)
  	.rotate(.01).mult(solid(0,0,0),.006)
	.layer(t().scroll(()=>x,()=>y))
	.layer(t().scroll(()=>-x,()=>-y))
	.out()
update = (dt)=> {
	x += (Math.random()-.47)/100
	y += (Math.random()-.47)/100
}
```

### `update` vs Arrow functions

Every function that you use as an argument is evaluated right before the current frame is about to be rendered. Which is the same thing that happens with the `update` function! This means, unless we use `dt`, everything we can do on `update` we can technically do on argument functions. It's up for us to decide when one's better than the other. If we are controlling many interconnected variables and procedures, most probably, an arrow function or a named function won't be that nice to use. It'll be confusing as to why a function which is supposed to represent a simple dynamic argument is doing so much stuff inside of itself. Maybe we could separate the different behaviors into many arrow functions. But if these functions were to feed from each other, this will yet again get confusing quite rapidly. Even then, there are many scenarios where an arrow function can do the same work as the update function with less code. For example, here's a patch where a circle chases your mouse:

```hydra
// works well only on editor
x = () => (-mouse.x/innerWidth)+.5
y = () => (-mouse.y/innerHeight)+.5
posx = x(); posy = y();
shape(16,.05)
	.scrollX(() => posx += (x() - posx) / 40)
	.scrollY(() => posy += (y() - posy) / 40)
	.add(o0,.9)
	.out()
```