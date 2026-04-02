---
title: "A camera with no lens? No way!"
description: "Discover how a pinhole camera works and why it can produce sharp images without any lens at all. Explore the physics of light, aperture, and image formation."
pubDate: 2024-02-01
tags: ["physics", "optics", "cameras", "light"]
---

You might think a camera needs a lens — but a tiny hole is all it takes to form an image. Pinhole cameras have been used for centuries and are still the best way to understand how image formation works.

## How it works

Light travels in straight lines. When light from a scene passes through a tiny hole into a dark box, each point on the scene projects a ray through the hole and hits the back wall at a unique position — forming an upside-down image.

### Why is the image sharp?

With an infinitely small hole, every ray from a given point in the scene maps to exactly one point on the image plane. In practice, a very small hole gives a sharp (but dim) image.

### The trade-off: sharpness vs. brightness

| Hole size | Sharpness | Brightness |
|---|---|---|
| Very small | Very sharp | Very dim |
| Small | Sharp | Dim |
| Large | Blurry | Bright |

As the hole gets bigger, light from a single object point hits a larger area on the image plane — creating a **circle of confusion** and blurring the image.

## Diffraction

There is a limit to how small the hole can be. Make it too small and diffraction — the bending of light around edges — actually makes the image blurrier again. The optimal pinhole size is:

$$d = 1.9\sqrt{f\lambda}$$

Where **f** is the distance to the image plane and **λ** is the wavelength of light (~550nm for green light).

## Try it yourself

Build a pinhole camera from a shoebox and a piece of tracing paper. Or try our [interactive Pin-hole Simulator](/apps/pinhole-simulator) to explore how hole size affects image sharpness.
