# Carlos Alcala — Portfolio

This is a static website hosted on GitHub Pages. No build tools or dependencies are required.

## File structure

- `index.html` — page text, navigation, projects, and galleries.
- `styles.css` — fonts, colors, layout, responsiveness, and Waymo-style route positioning.
- `script.js` — project slideshow controls.
- `assets/` — project images and videos; references appear in `index.html`.
- `resume.pdf` — PDF opened by the Resume link in the navigation.

## Editing

To edit the introduction or a project, open `index.html`. To edit fonts, spacing, colors, or the route's size and placement, open `styles.css`. To change the route's exact curve, find `<svg class="waymo-route"` in `index.html` and change its `<path d="...">` coordinates. To change an image, put a new file inside `assets/` and update its `src` in `index.html`. For slideshow behavior, open `script.js`.

## Publishing

Upload the **contents** of this folder to the root of `CarlosA019/CarlosA019.github.io` on the `main` branch, replacing the old `index.html`. Keep folder paths as they are, especially `assets/`. GitHub Pages will serve `index.html` automatically.

All existing content and visual styles were carried over from the supplied portfolio; only inline CSS, JavaScript, and embedded media were moved into separate files.

## Troubleshooting

The route is clipped to the hero so it cannot create sideways scrolling or cover the navigation. The Resume link references `./resume.pdf`; upload that PDF at the same level as `index.html`, `styles.css`, and `script.js` (not inside `assets/`). GitHub Pages may take a minute to refresh after committing.
