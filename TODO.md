# TODO - Ocean “next level” upgrade

- [ ] Create a Three.js WebGL layer inside `public/ocean.html` (add canvas/root, include Three.js + modules).
- [ ] Add Three.js water shader (ripple/displacement) and update loop with delta-time in `public/ocean.js`.
- [ ] Hook bottle/text “throw” events to ripple impulses (coordinate mapping from DOM pond to water plane).
- [ ] Implement fog gradient + God Rays post-processing.
- [ ] Implement simplified buoyancy/bobbing + rotation based on sampled wave height/normal.
- [ ] Remove/disable old CSS float/wave animation from bottles (or keep only for fallback).
- [ ] Manual test: run site, throw bottles, confirm ripples, visuals, and frame-rate consistency.

