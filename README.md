# Root RPG tools

Fan-made tools for *Root: The Roleplaying Game*, styled after the books.

**Now:** Equipment creator — wear, ranges, weapon skill tags and all tags from the core book and *Travelers & Outsiders*. Value and Load follow the book's formula (Boxes of Wear + Extra Ranges + Special Tags + Weapon Move Tags − Flaw Tags). Cards look like the entries in the books' equipment lists.

**Later:** character maker and more.

## Run it

It is plain HTML/CSS/JS with no build step. Open `index.html`, or publish it with GitHub Pages
(Settings → Pages → Deploy from a branch → `main` / root).

Saved equipment and custom tags live in the visitor's own browser (localStorage); use **Export** / **Import** to move them.

## Layout

| Path | What |
| --- | --- |
| `index.html` | Equipment creator page |
| `css/root.css` | Shared Root look (parchment, dark-red bars, tag icons) — reused by every tool |
| `css/equipment.css` | Equipment page layout |
| `js/data.js` | Tags, weapon skills and pre-made equipment, transcribed from the books |
| `js/equipment.js` | Rules, card rendering, saving |
| `assets/` | Parchment tile and leaf border taken from the book pages |

Open `index.html?selftest` to check every pre-made item against the Value printed in the book.

## Credits

*Root: The Roleplaying Game* and *Travelers & Outsiders* are by Magpie Games and Leder Games. This is an unofficial fan tool; rules text, tags and artwork belong to their creators.
