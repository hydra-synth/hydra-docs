# GLSL Guide

## Using custom GLSL functions

Those more experienced with Hydra and/or digital visuals in general, might know that Hydra is built on WebGL and its shadering language, GLSL ES. Hydra has a unique way of adding custom source and transform functions which we will explain here.

### setFunction

The Hydra API includes a function called `setFunction` which receives a specific type of JavaScript object. This object will have the properties `name`, `type`, `inputs` and `glsl`. 
* `name` is a String with the name for the function
* `type` is one of the available types of functions ('src', 'color', 'coord', 'combine', 'combineCoord') 
* `inputs` is an Array of objects each with it's own `name`, `type` and `default` properties. They represent the arguments of the GLSL function.
* `glsl` is a String with the glsl code.

#### Example

```javascript
setFunction({
    name: 'myOsc',
    type: 'src',
    inputs: [
        { name: 'freq', type: 'float', default: 20 }
    ],
    glsl: `
        return vec4(sin((_st.x+time)*freq*vec3(0.1)),1.0);
    `
})
```

### Types of GLSL functions and their arguments

#### src

A function with a specified type of `src` is one that generates visuals by its own. Just like `osc` or `noise`. They all have a `vec2` argument called `_st` for the coordinate. And you can add any custom inputs as shown above. You must return a `vec4`.

#### color

A `color` function receives a `vec4` called `_c0` that represents the color being affected by the transform. As any function you may add any extra inputs. You must return another `vec4`.

```hydra
setFunction({
    name: 'switchColors',
    type: 'color',
    inputs: [],
    glsl: `
        return _c0.brga;
    `
})
osc(60,.1,5).switchColors()
	.out()
```

#### coord

A `coord` function receives a `vec2` called `_st` that represents the coordinate plane. You must return another `vec2`.

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

#### combine

The functions of type `combine` receive 2 `vec4` arguments, `_c0` and `_c1`. The first one represents the texture being affected and the latter represents the texture being blended into the former. For example, when you use `osc().mult(noise())`, inside the definition of the function, `_c0` represents the `osc()` and `_c1` represents the `noise()` colors. You can think combine functions as blending modes. And as custom function you may add extra inputs as needed. You must return a `vec4`.

```hydra
setFunction({
    name: 'negate',
    type: 'combine',
    inputs: [
        { type: 'float', name: 'amount', default: 1 }
    ],
    glsl:`
        _c1 *= amount;
        return vec4(vec3(1.0)-abs(vec3(1.0)-_c0.rgb-_c1.rgb), min(max(_c0.a, _c1.a),1.0));
    `
})
osc().negate(noise().brightness(.5))
	.out()
```

#### combineCoord

`combineCoord` functions change the position of colors in the texture being affected given the colors of another texture. Think about the many modulate functions for example, since they are precisely this type. They receive a `vec2 _st` and a `vec4 _c0`. You must return a `vec2`.

```hydra
setFunction({
    name: 'myModulator',
    type: 'combineCoord',
    inputs: [],
    glsl: `
        return vec2(_st.x+(_c0.g-_c0.b*0.1),_st.y+(_c0.r*0.2));
    `
})
noise(2).myModulator(osc(20,.1,1).diff(o0))
	.out()
```

### Built in functions you can use

The following functions are pre-defined for every Hydra generated shader, and in the same way that some built-in functions use them, you may too:

#### _luminance

```glsl
float _luminance(vec3 rgb){
      const vec3 W = vec3(0.2125, 0.7154, 0.0721);
      return dot(rgb, W);
}
```

Returns the luminance of a given rgb color.

#### _rgb2Hsv

```glsl
vec3 _rgbToHsv(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
```

Transforms a color from the rgb to the hsv colorspace.

#### _hsv2Rgb

```glsl
vec3 _hsvToRgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
```

Transforms a color from the hsv colorspace back to rgb.

##### Note

As of now there is no way to define "global" functions such as these ones just mentioned. But expect it soon!

### Examples

#### Chroma Key

This example modifies `color` to replace green background with transparency (i.e., chroma keying). The GLSL code is ported from [Inigo Quilez's example](https://www.shadertoy.com/view/XsfGzn).

```javascript
setFunction({
    name: 'chroma',
    type: 'color',
    inputs: [
        ],
    glsl: `
        float maxrb = max( _c0.r, _c0.b );
        float k = clamp( (_c0.g-maxrb)*5.0, 0.0, 1.0 );
        float dg = _c0.g; 
        _c0.g = min( _c0.g, maxrb*0.8 ); 
        _c0 += vec4(dg - _c0.g);
        return vec4(_c0.rgb, 1.0 - k);
`})

// s0.initCam()
// src(s0).out(o0)
solid(0,1,0).layer(shape(5,0.3,0.3).luma()).out(o0)
osc(30, 0, 1).layer(src(o0).chroma()).out(o1)
render()
```

---

## GLSL Injection

Since Hydra runs GLSL on the background, and everything you input into the parameters of the different functions ends up written on GLSL (be it literally or as a uniform), you can sort of hack Hydra (and totally break it) by sending strings of GLSL expressions as arguments:

```hydra
src(o0)
    .scroll(()=>mouse.x/innerWidth,()=>mouse.y/innerHeight)
    .layer(noise(3).sub(osc(5,.1,2)).luma(.1,.01))
    .scroll("-sign(st.x-0.5)*0.5","-sign(st.y-0.5)*0.2")
    .scale("0.8+st.x*0.2")
    .rotate(0,.1)
	.brightness(.01)
    .out()
```

The reason you can "totally break Hydra" here is that Hydra works with a modular flow. In order for it to work, when you do coordinate transforms after a bunch of interconnected textures, these transforms must apply to all coordinate references in the shader. If you inject values of the `st` coordinates in your arguments, Hydra has no way of applying any further transforms to them, therefore breaking the modularity.

---

## Extensions

### Extra shaders

There are some Hydra extensions that load many custom glsl functions, such as:

* [extra-shaders-for-hydra](https://gitlab.com/metagrowing/extra-shaders-for-hydra)
* [hydra-blending-modes](https://github.com/ritchse/hydra-extensions)

### Extra Functionality

The [hydra-glsl extension](https://github.com/ritchse/hydra-extensions/blob/main/doc/hydra-glsl.md) allows you to write GLSL directly in your patches. For example:

```javascript
glsl('vec4(sin(((_st.x*54.)+time*2.)*vec3(0.1,0.102,0.101)),1.0)')
    .diff(o0)
    .glslColor('vec4(c0.brg,1.)')
    .glslCoord('xy*=(1.0/vec2(i0, i0)); return xy',.25)
    .glslCombine('c0-c1',o1)
    .glslCombineCoord('uv+(vec2(c0.r,c0.b)*0.1)',o1)
    .out()
```