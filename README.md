# Root RPG tools

Fan-made tools for *Root: The Roleplaying Game*, styled after the books.

**Now:** Equipment creator — wear, ranges, weapon skill tags and all tags from the core book, *Travelers & Outsiders* and *Ruins & Expeditions* (113 tags, 63 pre-made items). Value and Load follow the book's formula (Boxes of Wear + Weapon Skill Tags + Special Tags − Flaw Tags). Cards look like the entries in the books' equipment lists.

House rules: no "cannot pair with" conflicts, no boss tags, and every tag is worth 1-Value (so Ripper and Specialized count 1 although the book prices them at 2). A weapon has one range at a time and a range costs no Value (the book adds 1 for a second range). Book exceptions that stay: Luxury +4 in total, Makeshift −2, Loose Weave −2, Borrowed −6. Pre-made items whose Value differs from the printed one (two-range items, and Acute Razor, Ratfolk Saber and Keepers' Cuirass, which do not follow the book's own formula) say so under the card.

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

*Root: The Roleplaying Game* and its supplements *Travelers & Outsiders* and *Ruins & Expeditions* are by Magpie Games and Leder Games. This is an unofficial fan tool; rules text, tags and artwork belong to their creators.
