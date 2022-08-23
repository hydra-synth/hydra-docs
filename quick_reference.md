# Quick Reference

## Reset Hydra

```hydra
hush()

// fps, bpm and speed won't be reset to their defaults by calling hush
// their defaults are: fps = undefined, bpm = 30, speed = 1
```

## Load images / videos / camera / screen

```hydra
s0.initImage('https://hydra.ojack.xyz/docs/assets/hydra.jpg')
src(s0)
    .out()

// for video:
// s0.initVideo('https://website.com/somevideo.mp4')

// for webcam:
// s0.initCam(0)

// for screen:
// s0.initScreen()

// change interpolation method (default is 'nearest'):
// s0.initImage('https://hydra.ojack.xyz/docs/assets/hydra.jpg',{min:'linear', mag:'linear'})
```

Further explanation in the [external sources guide](guides/external_sources).

## Arrays

```hydra
bpm = 40

src(o0)
	.scale([1,1.02])
	.layer(osc(9,.1,2).mask(shape(4,.3,0)))
	.out(o0)

osc(30,.1,[0,1.5].fast(1.5))
	.diff(shape(16,[0,.3],.1))
	.out(o1)

osc()
  	.rotate([1,4,2,5,3].fit(0,3.14).smooth())
	.out(o2)

sh = ()=> [.2,.5,.7,.8].ease('easeInQuart')
noise(2)
	.shift(sh()
           ,sh().offset(1/3)
           ,sh().offset(2/3))
	.out(o3)

render()
```

Further explanation in the [advanced guide](guides/advanced#arrays).

### Easing functions

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

## Arrow functions

```hydra
voronoi(5,.1,()=>Math.sin(time*4))
	.out()
```

Further explanation in the [advanced guide](guides/advanced#functions).

## Mouse

```hydra
gradient()
	.hue(()=>mouse.x/3000)
	.scale(1,1,()=>mouse.y/2000)
	.out(o0)
```

```javascript
// getting values from 0 to 1
x = () => mouse.x/innerWidth  // 0 → 1
y = () => mouse.y/innerHeight // 0 → 1

// getting values from 0.5 to -0.5 (left to right)
x = () => (-mouse.x/innerWidth)+.5  // 0.5 → -0.5
y = () => (-mouse.y/innerHeight)+.5 // 0.5 → -0.5
```

## Audio

```javascript
a.setBins(5) // amount of bins (bands) to separate the audio spectrum

noise(2)
	.modulate(o0,()=>a.fft[1]*.5) // listening to the 2nd band
	.out()

a.setSmooth(.8) // audio reactivity smoothness from 0 to 1, uses linear interpolation
a.setScale(8)    // loudness upper limit (maps to 0)
a.setCutoff(0.1)   // loudness from which to start listening to (maps to 0)

a.show() // show what hydra's listening to
// a.hide()

render(o0)
```

Further explanation in the [audio guide](guides/audio)

## `update`

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

Further explanation in the [advanced guide](guides/advanced#using-the-update-function).

## Streaming between sessions

<table>
<thead>
<tr>
<th>Hydra 1</th><th>Hydra 2</th>
</tr>
</thead>

<tbody>
<tr>
<td>

```javascript
pb.setName('hydra_1')

s0.initStream('hydra_2')
osc()
    .diff(src(s0))
    .out()
```

</td>
<td>

```javascript
pb.setName('hydra_2')

s0.initStream('hydra_1')
noise()
    .blend(s0)
    .out()
```

</td>
</tr>
</tbody>
</table>

Further explanation in the [external sources guide](guides/external_sources#streaming-between-hydra-sessions).

## Custom GLSL functions

```hydra
setFunction({
    name: 'tan',
    type: 'coord',
    inputs: [
      { name: 'freq', type: 'float', default: 1 },
      { name: 'mult', type: 'float', default: 0.25 }
    ],
    glsl: `
        return tan(_st*3.141592*freq)*mult;
    `
})
osc(60,.1,5).tan(2)
	.out()
```

Further explanation in the [glsl guide](guides/glsl).

### Types of GLSL functions

<div style="width:100%; table-layout:fixed;">

| Type | Prameters | Return type |
|------|--------|-|
| src | _st | vec4 |
| color | _c0 | vec4 |
| coord | _st | vec2 |
| combine | _c0, _c1 | vec4 |
| combineCoord | _st, _c0 | vec2 |

</div>

## Loading external libraries

```javascript
await loadScript("https://unpkg.com/tone")

synth = new Tone.Synth().toDestination();

bpm = 60
rot = 0
osc(25).diff(osc(20).rotate(()=>rot))
	.out()

update = (dt)=> {
	if ((time % (60/bpm))*1000 < dt){
		rot = Math.random()*Math.PI*2;
		synth.triggerAttackRelease(220+Math.random()*660, "8n");
    }
}
```

Further explanation in the [external libraries guide](guides/external_libraries).

## p5 integration

```javascript
p1 = new P5()

p1.hide() // hide the p5 canvas
s0.init({src:p1.canvas}) // assign s0 to p5 canvas

src(s0)
	.diff(osc(3))
	.out()

p1.draw = ()=> {
  	p1.background(0,10)
	p1.rect(p1.mouseX,p1.mouseY,120,40)
}
```

Further explanation in the [external libraries guide](guides/external_libraries).