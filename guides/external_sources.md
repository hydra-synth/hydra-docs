# External Sources
---

## initCam

You can use a webcam's video as such:

```javascript
s0.initCam()

s0.initCam(2) // if you have many cameras, you can select one specifically
```

## initScreen

You can capture your screen or specific windows or tabs to use as a video source:

```javascript
s0.initScreen()
```

---

## initImage

In order to load an image to load an image into a source object, the syntax is the following:

```javascript
s0.initImage("https://www.somewebpage.org/urlto/image.jpg")
```

When running Hydra in Atom, or any other local manner, you can load local files referring to them by URI:

```javascript
s0.initImage("file:///home/user/Images/image.png")
```

### Supported formats

You can load `.jpeg`, `.png`, and `.bmp` as well as `.gif` and `.webp` (although animation won't work).

## initVideo

The syntax for loading video is the same as for loading image, only changing the function to `loadVideo`:

```javascript
s0.initVideo("https://www.somewebpage.org/urlto/video.mp4")
```

### Supported formats

You can load `.mp4`, `.ogg` and `.webm` videos.

### Useful HTML Video properties

You can access all of the [HTML Video](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video) functions when a video is loaded to a Source via `s0.src`. Some useful properties are:

```javascript
s0.src.playbackRate = 2 // double the speed at which the video plays
s0.src.currentTime = 10 // seek to the 10th second
s0.src.loop = false // don't loop the video
```

---

## initStream : streaming between Hydra sessions

Hydra (the editor) also has built-in streaming. You can stream the output of your Hydra to someone else and vice-versa. This is done in a similar fashion to using images and videos, using external sources. But there are some extra steps for streaming:

### The pb object

On your Hydra editor, you can find a pre-defined object called `pb` (as in patch-bay). This object basically represents the connection of your Hydra editor instance to all others hosted on the same server. When you want to share your stream to someone else you'll have to give your Hydra session a name. Do this using the `pb.setName()` function and by passing in some string as the name. For example: `pb.setName('myverycoolsession')`. If you want someone else to stream to you, ask them to set a name as such and share it with you.

You can see online sessions using the function `pb.list()`, which will return an Array of names.

### Starting to stream

Streaming is as simple as initiating the source as a stream and passing the name of the session you want to stream. For example:

```javascript
s0.initStream('myfriendsverycoolsession')
src(s0)
    .out()
```

---

## Extra parameters

Any external sources loaded into Hydra are using [regl's texture constructor](https://github.com/regl-project/regl/blob/master/API.md#textures) in the background. There are many properties you can set when loading a texture and Hydra and regl handle the important ones for you. But to set any of these properties you can pass an object containing them to any of the init functions. For example:

```javascript
s0.initCam(0,{mag: 'linear'})
```

`mag` & `min` are the most used, since using `linear` interpolation will resize textures in a smooth way. The default for both is `nearest`. 

---

## Common problems

### CORS policy

If you try to load images (or videos) from some websites (most of them, really), sometimes nothing shows up on the screen. Opening the browser's console might reveal a message similar to this one:

```
Access to image at '...' from origin 'https://hydra.ojack.xyz' 
has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

The CORS in CORS policy stands for 'Cross-origin resource sharing'. This refers to the action of calling resources (such as images) from one website to another. For example, asking for an image hosted on other website from inside the Hydra editor. This error message is basically telling us "hey, the website you're trying to ask for an image doesn't allow other websites to use their resources, so i can't let you have that picture".
In order to circumvent this error, you can try re-uploading the images you want to use to some image hosting service that allows cross-origin sharing such as imgur, where you can also load short videos. You can also try to use websites which you know will allow cross-origin resource sharing such as [Wikimedia Commons](https://commons.wikimedia.org/), which is great for video.

### Loading video from YouTube, Vimeo, etc

Some users may be tempted to try and load some video they liked on YouTube, for example, and run something suchlike:

```javascript
s0.initVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // doesn't work
```

This will not work. The same goes for Vimeo and other video streaming services. When you use such an URL, it is not returning a video, it is returning the website where you can watch the video! The URL you pass to `initVideo` has to go directly to a video file. In other words, the URL should (usually) end in `.mp4`, `.webm` or `.ogg`. And, even if you did get a URL directly to the video with a tool such as youtube-dl, you'll run into CORS problems.

#### Workaround

The most common workarounds are:

* Run Hydra locally (on Atom for example) and load local video files
* Have the video run on its own window and use `initScreen` to capture it

