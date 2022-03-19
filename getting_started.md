# Getting started

This page is an introduction to making live visuals using hydra. It covers the basics of writing code in the browser to generate and mix live video sources. No coding or video experience is necessary! For more in-depth explanations and guides, please see[]

* [Getting started short version](https://)

### Using this tutorial
This document contains live examples directly embedded within the page. You can edit the code in each text box, and run the example again by pressing `ctrl+shift+enter`. All of the code can also run in the hydra web editor[add link]. Clicking the [] icon opens the code in the web editor.

### Getting to know browser's environment
At the right up corner you will find this buttons 
![](https://i.imgur.com/iCG8Lrq.png)
1. **Play button.** You can use it to run the code.
2. Upload your sketch to Hydra's gallery **(not working for the moment?)**
3. **Clear all** and start from scratch.
4. **Random sketch examples**. Always is a good way to learn Hydra is studying someone elses code.
5. Make random change, **dices** modify values automatically. Try it with some of the sketches examples.
6. **Help menu** with useful links.

## First line of code
Use the ***clean all*** button to erase the previous sketch.
Running your first line of code: `osc()`. 
Inside the `osc()` parenthesis and in every source function you can modify parameters to the code like `osc(2)`. 
![](https://i.imgur.com/ZfgVjJZ.gif)


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

## What is an error? 
Oh no! You have an error :( but don’t worry, if you have an error you’ll notice a label at the left-bottom on your screen. Something like ‘Unexpected token ‘.’ (in red) ’ will appear. This doesn’t affect your code, but you won’t be able to continue coding until you fix the error. Usually it is a typing error or something related to the syntax. 

## What is a comment?

### Single line comment:

```javascript
//Hello I’m a comment line. I’m a text that won’t change your code. You can write notations, your name or even a poem here.
```


## c) Adding transformations
```javascript
osc().rotate().out()
```

As you can see, you have first an input signal `osc()` and things that come after (`rotate()` and `out()`) are connected with a dot ‘.’
In this sense, Hydra is inspired by modular synthesis. Instead of connecting cables you connect different kinds of javascript functions.  
![](https://i.imgur.com/RBRxeiL.jpg)
###### source [Sandin Image Processor](https://en.wikipedia.org/wiki/Sandin_Image_Processor)



You can continue adding transformations like:  `osc().rotate().out()`. You can find more functions [here](/functions).
The logic is to initialize an input signal, then transformations (geometry and color transformations) and in the end always the output `.out(o0)` There are 4 output buffers that can be used: `.out(o0)` `.out(o1)` `.out(o2)` `.out(o3).`


## d) Using external sources
External sources can be used as a canvas inside Hydra, this can be: video, images, webcam, p5js, GLSL. In order to do this, first of all, external sources must be called with `s0.init` function. This doesn’t mean that you’ll see the effect instantly on your sketch. You need to call the source as you would do it with any input signal in the code. There are 4 input channels that can be used to introduce an external signal: s0, s1, s2, s3.

```javascript
s0.initCam() //webcam as external source
src(s0).out() //external source as canvas inside Hydra

s1.initImage('url image link') //image as an external source
src(s1).out(o0) //external image source as texture inside Hydra

s2.initVideo('url video link') //video as an external source
src(s2).out(o1) //external video source as texture inside Hydra

s3.initCam(1) //another webcam as an external source. Just change number in the parenthesis if you have more webcams connected
src(s3).out(o2)
```

## e) Multiple outputs 
Multiple outputs can be used, added or combined to each other. The available outputs are `.out(o0)` - `.out(o1)` - `.out(o2)` - `out(o3)`. To see all together use `render()`, to choose a specific output, for example `render(o1)`. Default buffer is `.out(o0)` = `.out() `

```javascript
gradient(1).out(o0)
osc().out(o1)
voronoi().out(o2)
noise().out(o3)
render()
```
![](https://i.imgur.com/G4fCaLz.jpg)
*Trick: try to create different sketches and switch them in your live performance or even combine them.*

```javascript
gradient(1).out(o0)
osc().out(o1)
render(o0) //switch render output
// render(o1) 
```

## f) Blend modes between textures
In order to combine different output or textures you have several blend mode criteria.


```javascript
osc().blend(src(o1)).out() //mixes colors adds light but also opacity
```
```javascript
src(o1).add(src(o3)).out(o2) //additive light. Color only gets brighterWhite intensity as priority  
```

```javascript
noise().diff(src(o1)).out(o1) //combines different signals by color difference (color negative/inverted/opposite).  
```
```javascript
osc().mult(src(o1)).out() //subtract light. Black intensity as a priority.
```
## g) modulate
`modulate()` An analogy in the real world, would be looking through a texture glass window.
`modulate()` does not change color or luminosity but shifts pixels by another texture; imagine looking through a bumpy glass window.

```javascript
osc().modulate(noise(3)).out()
```
### Try modulate with a camera!
```javascript
s0.initCam()

shape().modulate(src(s0)).out()

src(s0).modulate(shape()).out()
```
