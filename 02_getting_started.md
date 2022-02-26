# Getting started

running your first line of code: `osc()`. parameters to the code `osc(2)`.

```javascript
osc()
```

- Run your first line of code: ‘osc().out()’ Pressing  ‘shift + ctrl + enter’

```javascript
osc().out()
```

- Change inside parameters like ‘osc(2).out()’

```javascript
osc(2).out()
```

// modular synthesis

## c) adding transformations
```javascript
osc().rotate().out()
```

As you can see, you have first an input signal `osc()` and things that come after (`rotate()` and `out()`) are connected with a dot ‘.’
In this sense, Hydra is inspired by modular synthesis. Instead of connecting cables you connect different kinds of javascript functions.  

You can continue adding transformations like:  `osc().rotate().out()`. You can find more functions [here](/functions).
Here is the logic: first initial input signal, then transformations and in the end always the output `.out(oX)`

## d) using external sources
External sources can be used as a canvas inside Hydra, this can be: video, images, webcam, p5js, GLSL. In order to do this, first of all, external sources must be called with `sX.init` function. This doesn’t mean that you’ll see the effect instantly on your sketch. You need to call the source as you would do it with any input signal in the code. 

```javascript
s0.initCam() //webcam as external source
src(s0).out() //external source as canvas inside Hydra
```

## e) multiple outputs 
Multiple outputs can be used, added or combined to each other. Default outputs are `.out(o0)` - `.out(o1)` - `.out(o2)` - `out(o3)`. To see all together use `render()`, to choose a specific output, for example `render(o1)`. 

```javascript
gradient(1).out(o0)
osc().out(o1)
voronoi().out(o2)
noise().out(o3)
render()
```

Trick: try to create different sketches and switch them in your live performance or even combine them. 

```javascript
gradient(1).out(o0)
osc().out(o1)
render(o0)
// render(o1)
```

## f) blend modes between textures
In order to combine different output or textures you have several blend mode criteria.
`blend()` mixes colorsadds light but also opacity

```javascript
osc().blend(shape()).out()
```

.add() //additive light. Color only gets brighterWhite intensity as priority  

```javascript
noise().add(shape()).out()
```

.diff() //combines different signals by color difference (color negative/inverted/opposite).  
.mult() //subtract light. Black intensity as a priority.
.mask() // it creates a mask cutting  
.layer() // Overlay layers without modifying opacity or brightness, the layer you overlay must be transparent. As for example a .png file. Otherwise, the signal function must be followed by  .luma() to subtract the black from the "top" layer and be able to see the initial generator.  

## g) nested blend modes
You can nest blend modes. It’s important, in general, the order of how you use it sometimes can make a difference. 
osc().add(noise()).mask(shape()).out()
osc().mask(shape()).add(noise()).out()

## h) modulate
`modulate()` overlays by texture pixels criteria. Not by color or luminosity, but for texture shape. An analogy in the real world, would be looking through a texture glass window.
`modulate()` does not change color or luminosity but shifts pixels by another texture; imagine looking through a bumpy glass window.

```javascript
osc().modulate(noise(3)).out()
```

## (what is an error? )
Oh no! You have an error :( but don’t worry, if you have an error you’ll notice a label at the left-bottom on your screen. Something like ‘Unexpected token ‘.’ (in red) ’ will appear. This doesn’t affect your code, but you won’t be able to continue coding until you fix the error. Usually it is a typing error or something related to the sintaxis. 

## what is a comment?

Single line comment:

```javascript
//Hello I’m a comment line. I’m a text that won’t change your code. You can write notations, your name or even a poem here.
```

Multi line comment:

```javascript
/*
And
I’m a
paragraph
comment.
*/
```
