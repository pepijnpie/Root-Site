/* Root: The Roleplaying Game – equipment creator */
(function () {
  "use strict";

  var D = window.ROOT_DATA;

  var KEY = {
    items: "rootsite.eq.items",
    custom: "rootsite.eq.customTags",
    draft: "rootsite.eq.draft"
  };
  var TYPES = [["weapon", "Weapon"], ["armor", "Armor"], ["shield", "Shield"], ["gear", "Gear"]];
  var RANGES = [["intimate", "Intimate"], ["close", "Close"], ["far", "Far"]];
  var LOADS = [0, 1, 2, 3];
  var WEAR_MIN = 1, WEAR_MAX = 8;
  var MINUS = "−";

  /* ------------------------------------------------------------------ helpers */

  function $(id) { return document.getElementById(id); }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function sentence(list) { return cap(list.join(", ")); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* *italic* and **bold** in tag text */
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  }
  /* a tag text can run over several lines; a line starting with "- " is a bullet */
  function rich(s) {
    var lines = String(s).split("\n");
    if (lines.length === 1) return inline(s);
    return lines.map(function (line, i) {
      if (/^- /.test(line)) return '<span class="bl">' + inline(line.slice(2)) + "</span>";
      return i ? '<span class="ln">' + inline(line) + "</span>" : inline(line);
    }).join("");
  }
  function plainText(s) { return String(s).replace(/\*+/g, "").replace(/\n- /g, "\n  • "); }
  /* tag name as printed on a card: "Ensigiled (Lizard Cult)" */
  function tagLabel(item, t) {
    var note = item.notes && item.notes[t.id];
    return t.name + (note ? " (" + note + ")" : "");
  }

  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  /* ------------------------------------------------------------------ state */

  function blank() {
    return { name: "", type: "weapon", wear: 2, marked: 0, load: 1, ranges: [], skills: [], tags: [], notes: {}, counts: {} };
  }

  function sanitize(it) {
    var o = blank();
    if (!it || typeof it !== "object") return o;
    if (typeof it.id === "string") o.id = it.id;
    o.name = String(it.name || "").slice(0, 60);
    o.type = TYPES.some(function (t) { return t[0] === it.type; }) ? it.type : "weapon";
    var w = parseInt(it.wear, 10);
    o.wear = clamp(isNaN(w) ? 2 : w, WEAR_MIN, WEAR_MAX);
    var m = parseInt(it.marked, 10);
    o.marked = clamp(isNaN(m) ? 0 : m, 0, o.wear);
    var l = parseInt(it.load, 10);
    o.load = clamp(isNaN(l) ? 1 : l, 0, 3);
    var rs = Array.isArray(it.ranges) ? it.ranges : [];
    o.ranges = RANGES.map(function (r) { return r[0]; }).filter(function (r) { return rs.indexOf(r) >= 0; });
    function strings(a) {
      return uniq((Array.isArray(a) ? a : []).filter(function (s) { return typeof s === "string" && s.length < 60; })).slice(0, 40);
    }
    o.skills = strings(it.skills);
    o.tags = strings(it.tags);
    // per-tag label ("Lizard Cult") and how often a stackable tag is applied
    var notes = it.notes && typeof it.notes === "object" ? it.notes : {};
    var counts = it.counts && typeof it.counts === "object" ? it.counts : {};
    o.tags.forEach(function (id) {
      if (typeof notes[id] === "string" && notes[id].trim()) o.notes[id] = notes[id].trim().slice(0, 60);
      var c = parseInt(counts[id], 10);
      if (c >= 2 && c <= 6) o.counts[id] = c;
    });
    return o;
  }

  var items = (load(KEY.items, []) || []).map(sanitize).map(function (it) { if (!it.id) it.id = uid(); return it; });
  var custom = (load(KEY.custom, []) || []).filter(function (t) {
    return t && typeof t.id === "string" && typeof t.name === "string" && typeof t.text === "string";
  }).map(function (t) {
    return {
      id: t.id, name: String(t.name).slice(0, 40), kind: t.kind === "neg" ? "neg" : "pos", src: "custom", p: 0,
      text: String(t.text).slice(0, 600), applies: String(t.applies || "").slice(0, 60),
      value: typeof t.value === "number" && t.value !== 0 ? clamp(Math.round(t.value), -6, 6) : (t.kind === "neg" ? -1 : 1)
    };
  });

  var saved = load(KEY.draft, null);
  var draft = saved && saved.d ? sanitize(saved.d) : blank();
  var editingId = saved && saved.editing && items.some(function (i) { return i.id === saved.editing; }) ? saved.editing : null;

  var filter = "all", query = "", libSrc = "core", ownKind = "pos", editingTagId = null;
  var tagIndex = Object.create(null);

  function rebuildTagIndex() {
    tagIndex = Object.create(null);
    D.tags.concat(custom).forEach(function (t) { tagIndex[t.id] = t; });
  }
  rebuildTagIndex();

  /* ------------------------------------------------------------------ rules */

  /*  Value = boxes of wear + special tags + weapon skill tags − flaw tags
      (core book p. 184, without its extra Value for a second range: here a range is free).
      Load = base load, changed by Weighty / Comfortable / Light. */
  function calc(item) {
    var weapon = item.type === "weapon";
    var wear = item.wear;
    var skills = weapon ? item.skills.length : 0;
    var special = 0, flaws = 0, loadAdj = 0, light = false;

    item.tags.forEach(function (id) {
      var t = tagIndex[id];
      if (!t) return;
      var n = t.stack ? (item.counts && item.counts[id]) || 1 : 1;
      if (t.value > 0) special += t.value * n; else flaws += -t.value * n;
      if (t.load === "zero") light = true; else if (t.load) loadAdj += t.load;
    });

    var raw = wear + skills + special - flaws;
    return {
      wear: wear, skills: skills, special: special, flaws: flaws,
      raw: raw, value: Math.max(0, raw),
      load: light ? 0 : Math.max(0, item.load + loadAdj),
      weapon: weapon
    };
  }

  /* ------------------------------------------------------------------ card (as printed in the book) */

  function cardHTML(item, o) {
    o = o || {};
    var c = calc(item);
    var name = item.name && item.name.trim();
    var marked = clamp(item.marked || 0, 0, item.wear);

    var boxes = "";
    for (var i = 0; i < item.wear; i++) {
      var on = i < marked;
      boxes += o.live
        ? '<button type="button" class="wb' + (on ? " on" : "") + '" data-wear="' + i + '" aria-pressed="' + on +
          '" aria-label="Wear box ' + (i + 1) + (on ? ", marked" : ", empty") + '"></button>'
        : '<i class="wb' + (on ? " on" : "") + '"></i>';
    }

    var sep = '<span class="eq-sep">|</span>';
    var stats = "<b>Value:</b> " + c.value + sep + "<b>Load:</b> " + c.load;
    if (c.weapon && item.ranges.length) {
      stats += sep + "<b>Range:</b> " + esc(sentence(item.ranges));
    }
    var body = "<p>" + stats + "</p>";
    if (c.weapon && item.skills.length) {
      body += "<p><b>Weapon skill tags:</b> " + esc(sentence(item.skills)) + "</p>";
    }

    var picked = item.tags.map(function (id) { return tagIndex[id]; }).filter(Boolean);
    var ordered = picked.filter(function (t) { return t.kind === "pos"; })
      .concat(picked.filter(function (t) { return t.kind === "neg"; }));
    var tags = ordered.map(function (t) {
      return '<div class="eq-tag"><i class="ic ' + t.kind + '"></i><b>' + esc(tagLabel(item, t)) + "</b>: " + rich(t.text) + "</div>";
    }).join("");
    if (!tags && o.hint) tags = '<p class="eq-empty">No tags yet. Pick some below.</p>';

    return '<div class="eq">' +
      '<div class="eq-bar">' +
        '<span class="eq-name' + (name ? "" : " ghost") + '">' + (name ? esc(name) : "Untitled equipment") + "</span>" +
        '<span class="eq-wear">' + boxes + "</span>" +
      "</div>" +
      '<div class="eq-body">' + body + "</div>" +
      '<div class="eq-tags">' + tags + "</div>" +
    "</div>";
  }

  function asText(item) {
    var c = calc(item);
    var head = (item.name || "Untitled equipment") + "  " +
      new Array(item.wear + 1).join("□");
    var stats = "Value: " + c.value + " | Load: " + c.load;
    if (c.weapon && item.ranges.length) stats += " | Range: " + sentence(item.ranges);
    var lines = [head, stats];
    if (c.weapon && item.skills.length) lines.push("Weapon skill tags: " + sentence(item.skills));
    var picked = item.tags.map(function (id) { return tagIndex[id]; }).filter(Boolean);
    picked.filter(function (t) { return t.kind === "pos"; })
      .concat(picked.filter(function (t) { return t.kind === "neg"; }))
      .forEach(function (t) { lines.push((t.kind === "pos" ? "(+) " : "(" + MINUS + ") ") + tagLabel(item, t) + ": " + plainText(t.text)); });
    return lines.join("\n");
  }

  /* ------------------------------------------------------------------ status line */

  var statusTimer;
  function say(msg, isErr) {
    var el = $("status");
    el.textContent = msg;
    el.className = "status" + (isErr ? " err" : "");
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { el.textContent = ""; }, 5000);
  }

  function scrollTo(id) {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    $(id).scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  /* ------------------------------------------------------------------ builder: form pieces */

  function segment(container, options, isOn, onPick) {
    container.innerHTML = "";
    options.forEach(function (opt) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = opt[1];
      b.setAttribute("aria-pressed", String(isOn(opt[0])));
      b.addEventListener("click", function () { onPick(opt[0]); });
      container.appendChild(b);
    });
  }

  function chips(container, options, list, onToggle) {
    container.innerHTML = "";
    options.forEach(function (opt) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = opt[1];
      b.setAttribute("aria-pressed", String(list.indexOf(opt[0]) >= 0));
      b.addEventListener("click", function () { onToggle(opt[0]); });
      container.appendChild(b);
    });
  }

  function toggleIn(list, v) {
    var i = list.indexOf(v);
    if (i >= 0) list.splice(i, 1); else list.push(v);
  }

  function renderControls() {
    $("f-name").value = draft.name;

    segment($("f-type"), TYPES, function (v) { return draft.type === v; }, function (v) {
      draft.type = v; renderControls(); refresh();
    });

    $("wear-out").textContent = draft.wear;
    $("wear-dec").disabled = draft.wear <= WEAR_MIN;
    $("wear-inc").disabled = draft.wear >= WEAR_MAX;
    var pips = "";
    for (var i = 0; i < draft.wear; i++) pips += "<i></i>";
    $("wear-pips").innerHTML = pips;

    segment($("f-load"), LOADS.map(function (n) { return [n, String(n)]; }),
      function (v) { return draft.load === v; },
      function (v) { draft.load = v; renderControls(); refresh(); });

    $("blk-weapon").hidden = draft.type !== "weapon";

    // one range at a time: picking another replaces it, picking the chosen one clears it.
    // (A book item loaded as a template can still carry two; the first click resolves that.)
    chips($("f-ranges"), RANGES, draft.ranges, function (v) {
      draft.ranges = draft.ranges.length === 1 && draft.ranges[0] === v ? [] : [v];
      renderControls(); refresh();
    });

    ["core", "sup", "rne"].forEach(function (src) {
      var opts = D.skills.filter(function (s) { return s.src === src; }).map(function (s) { return [s.id, cap(s.id)]; });
      chips($("f-skills-" + src), opts, draft.skills, function (v) {
        toggleIn(draft.skills, v); renderControls(); refresh();
      });
    });
  }

  /* ------------------------------------------------------------------ builder: tag list */

  function srcLabel(t) {
    if (t.src === "custom") return "Your own tag";
    return D.sources[t.src] + (t.p ? " · p. " + t.p : "");
  }

  function tagMatches(t) {
    if (filter === "pos" && t.kind !== "pos") return false;
    if (filter === "neg" && t.kind !== "neg") return false;
    if (filter === "core" && t.src !== "core") return false;
    if (filter === "sup" && t.src !== "sup") return false;
    if (filter === "rne" && t.src !== "rne") return false;
    if (filter === "custom" && t.src !== "custom") return false;
    if (filter === "picked" && draft.tags.indexOf(t.id) < 0) return false;
    var q = query.trim().toLowerCase();
    if (q && (t.name + " " + t.text + " " + t.applies).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }

  function tagRow(t) {
    var on = draft.tags.indexOf(t.id) >= 0;
    var v = Math.abs(t.value);
    var vnote = t.vnote || (v !== 1 ? "Counts as " + (t.value > 0 ? "+" : MINUS) + v + " Value." : "");

    // a label for the card ("Ensigiled (Lizard Cult)") and, for Contraband, how many times it applies
    var extra = "";
    if (t.detail) {
      extra += '<div class="tnote-l"><span>' + esc(t.detail) + '</span><input type="text" class="tnote" maxlength="60" ' +
        'aria-label="' + esc(t.detail + " for " + t.name) + '" placeholder="optional" value="' + esc(draft.notes[t.id] || "") + '"></div>';
    }
    if (t.stack) {
      extra += '<div class="tstack"><span>Applied</span>' +
        '<button type="button" data-act="stack-dec" aria-label="Apply ' + esc(t.name) + ' once less">' + MINUS + "</button>" +
        "<output>" + (draft.counts[t.id] || 1) + "×</output>" +
        '<button type="button" data-act="stack-inc" aria-label="Apply ' + esc(t.name) + ' once more">+</button></div>';
    }
    return '<div class="trow ' + t.kind + (on ? " on" : "") + '" data-id="' + esc(t.id) + '">' +
      "<label>" +
        '<input type="checkbox"' + (on ? " checked" : "") + ">" +
        '<i class="ic ' + t.kind + '"></i>' +
        '<span class="tx"><b class="tn">' + esc(t.name) + "</b>: " + rich(t.text) +
          (t.applies ? ' <span class="ap">(' + esc(t.applies) + ")</span>" : "") +
          (vnote ? '<span class="vn">' + esc(vnote) + "</span>" : "") +
          '<span class="src">' + esc(srcLabel(t)) + "</span></span>" +
        '<span class="state">' + (on ? "Added" : "Add") + "</span>" +
      "</label>" +
      (extra ? '<div class="extra">' + extra + "</div>" : "") +
      (t.src === "custom"
        ? '<div class="tact"><button type="button" data-act="edit-tag">Edit</button><button type="button" data-act="del-tag">Delete</button></div>'
        : "") +
    "</div>";
  }

  function renderTagList() {
    var all = D.tags.concat(custom).slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    var shown = all.filter(tagMatches);
    var pos = shown.filter(function (t) { return t.kind === "pos"; });
    var neg = shown.filter(function (t) { return t.kind === "neg"; });

    var html = "";
    if (pos.length) html += '<h3 class="group-title">Positive Tags</h3>' + pos.map(tagRow).join("");
    if (neg.length) html += '<h3 class="group-title">Negative Tags</h3>' + neg.map(tagRow).join("");
    if (!shown.length) html = '<p class="empty">No tags match. Try another word or show all tags.</p>';
    $("tag-list").innerHTML = html;

    $("tag-count").textContent = "Showing " + shown.length + " of " + all.length + " tags · " +
      draft.tags.length + " picked for this item";
  }

  function toggleTag(id, on) {
    var has = draft.tags.indexOf(id) >= 0;
    if (on && !has) draft.tags.push(id);
    if (!on && has) draft.tags.splice(draft.tags.indexOf(id), 1);
    if (filter === "picked") { renderTagList(); }
    else {
      var row = $("tag-list").querySelector('.trow[data-id="' + id.replace(/"/g, "") + '"]');
      if (row) {
        row.classList.toggle("on", on);
        row.querySelector(".state").textContent = on ? "Added" : "Add";
      }
      $("tag-count").textContent = $("tag-count").textContent.replace(/· \d+ picked/, "· " + draft.tags.length + " picked");
    }
    refresh();
  }

  /* ------------------------------------------------------------------ custom tags */

  function renderOwnKind() {
    segment($("o-kind"), [["pos", "Positive (adds Value)"], ["neg", "Negative (refunds Value)"]],
      function (v) { return ownKind === v; },
      function (v) { ownKind = v; renderOwnKind(); });
  }

  function resetOwnForm() {
    editingTagId = null;
    ownKind = "pos";
    $("o-name").value = "";
    $("o-text").value = "";
    $("o-applies").value = "";
    $("o-value").value = 1;
    $("o-save").textContent = "Save tag";
    $("own-sum").textContent = "Invent your own tag";
    renderOwnKind();
  }

  function saveOwnTag(e) {
    e.preventDefault();
    var name = $("o-name").value.trim();
    var text = $("o-text").value.trim();
    if (!name || !text) { return; }
    var v = clamp(parseInt($("o-value").value, 10) || 1, 1, 6);
    var t = {
      id: editingTagId || "c-" + uid(), name: name, kind: ownKind, src: "custom", p: 0,
      text: text, applies: $("o-applies").value.trim(), value: ownKind === "pos" ? v : -v
    };
    var idx = custom.map(function (c) { return c.id; }).indexOf(t.id);
    if (idx >= 0) custom[idx] = t; else { custom.push(t); draft.tags.push(t.id); }
    save(KEY.custom, custom);
    rebuildTagIndex();
    resetOwnForm();
    filter = "custom"; query = "";
    $("f-filter").value = "custom"; $("f-search").value = "";
    renderTagList(); renderSaved(); refresh();
    say("Tag “" + name + "” saved" + (idx >= 0 ? "." : " and added to this item."));
  }

  function editOwnTag(id) {
    var t = custom.filter(function (c) { return c.id === id; })[0];
    if (!t) return;
    editingTagId = id;
    ownKind = t.kind;
    $("o-name").value = t.name;
    $("o-text").value = t.text;
    $("o-applies").value = t.applies;
    $("o-value").value = Math.abs(t.value);
    $("o-save").textContent = "Update tag";
    $("own-sum").textContent = "Edit tag: " + t.name;
    renderOwnKind();
    $("own").open = true;
    $("o-name").focus();
  }

  function deleteOwnTag(id) {
    var t = custom.filter(function (c) { return c.id === id; })[0];
    if (!t) return;
    var uses = items.filter(function (i) { return i.tags.indexOf(id) >= 0; }).length;
    var msg = "Delete the tag “" + t.name + "”?" + (uses ? " It is used by " + uses + " saved item" + (uses > 1 ? "s" : "") + " and will be removed from them." : "");
    if (!confirm(msg)) return;
    custom = custom.filter(function (c) { return c.id !== id; });
    items.forEach(function (i) { i.tags = i.tags.filter(function (x) { return x !== id; }); });
    draft.tags = draft.tags.filter(function (x) { return x !== id; });
    save(KEY.custom, custom); save(KEY.items, items);
    rebuildTagIndex();
    if (editingTagId === id) resetOwnForm();
    renderTagList(); renderSaved(); refresh();
  }

  /* ------------------------------------------------------------------ preview */

  function row(label, val, cls) {
    return "<tr" + (cls ? ' class="' + cls + '"' : "") + "><td>" + label + "</td><td>" + val + "</td></tr>";
  }
  function signed(n, neg) { return n === 0 ? "0" : (neg ? MINUS : "+") + n; }

  function renderPreview() {
    $("preview-card").innerHTML = cardHTML(draft, { hint: true });

    var c = calc(draft);
    var html = "<caption>How the Value adds up</caption>" + row("Boxes of wear", c.wear);
    if (c.weapon) {
      html += row("Weapon skill tags", c.skills, c.skills ? "" : "zero");
    }
    html += row("Special tags", signed(c.special, false), c.special ? "" : "zero");
    html += row("Flaw tags", signed(c.flaws, true), c.flaws ? "" : "zero");
    html += row("Value", c.value, "sum");
    if (c.raw < 0) html += row("The total is " + c.raw + "; Value never goes below 0", "", "zero");
    $("calc").innerHTML = html;

    $("dock-value").textContent = c.value;
    $("btn-save").textContent = editingId ? "Update this item" : "Save to my equipment";
    $("btn-savenew").hidden = !editingId;
  }

  function refresh() {
    save(KEY.draft, { d: draft, editing: editingId });
    renderPreview();
  }

  /* ------------------------------------------------------------------ saving */

  function saveItem(asNew) {
    var name = draft.name.trim();
    if (!name) {
      say("Give the item a name first.", true);
      $("f-name").focus();
      return;
    }
    var it = sanitize(draft);
    it.name = name;
    var updated = false;
    if (editingId && !asNew) {
      var idx = items.map(function (i) { return i.id; }).indexOf(editingId);
      if (idx >= 0) { it.id = editingId; items[idx] = it; updated = true; }
    }
    if (!updated) { it.id = uid(); it.marked = 0; items.unshift(it); }
    if (!save(KEY.items, items)) say("Could not save; this browser is blocking storage.", true);
    editingId = null;
    draft = blank();
    renderControls(); renderTagList(); refresh(); renderSaved();
    say((updated ? "Updated “" : "Saved “") + name + "” in My Equipment.");
  }

  function startOver() {
    if ((draft.name.trim() || draft.tags.length) && !confirm("Clear the builder and start a new item?")) return;
    editingId = null;
    draft = blank();
    renderControls(); renderTagList(); refresh();
    $("f-name").focus();
  }

  function loadIntoBuilder(item, id) {
    draft = sanitize(item);
    draft.marked = id ? draft.marked : 0;
    delete draft.id;
    editingId = id || null;
    renderControls(); renderTagList(); refresh();
    scrollTo("builder");
    $("f-name").focus({ preventScroll: true });
  }

  function copyText() {
    var txt = asText(draft);
    function done() { say("Copied to the clipboard."); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { say("Copy is not available here.", true); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback);
    else fallback();
  }

  /* ------------------------------------------------------------------ saved list */

  function renderSaved() {
    var box = $("saved-list");
    if (!items.length) {
      box.innerHTML = '<p class="empty">Nothing saved yet. Build an item above, or add one from the pre-made lists below.</p>';
      return;
    }
    box.innerHTML = items.map(function (it) {
      return '<div class="entry" data-id="' + esc(it.id) + '">' + cardHTML(it, { live: true }) +
        '<div class="entry-actions">' +
          '<button type="button" data-act="edit">Edit</button>' +
          '<button type="button" data-act="dup">Duplicate</button>' +
          '<button type="button" class="danger" data-act="del">Delete</button>' +
        "</div></div>";
    }).join("");
  }

  function onSavedClick(e) {
    var wb = e.target.closest("button.wb");
    var entry = e.target.closest(".entry");
    if (!entry) return;
    var idx = items.map(function (i) { return i.id; }).indexOf(entry.dataset.id);
    if (idx < 0) return;
    var it = items[idx];

    if (wb) {
      var n = parseInt(wb.dataset.wear, 10);
      it.marked = (it.marked === n + 1) ? n : n + 1;
      save(KEY.items, items);
      entry.querySelector(".eq").outerHTML = cardHTML(it, { live: true });
      return;
    }
    var act = e.target.getAttribute("data-act");
    if (act === "edit") loadIntoBuilder(it, it.id);
    if (act === "dup") {
      var copy = clone(it); copy.id = uid(); copy.marked = 0; copy.name = it.name + " (copy)";
      items.splice(idx + 1, 0, copy); save(KEY.items, items); renderSaved();
    }
    if (act === "del" && confirm("Delete “" + it.name + "”?")) {
      items.splice(idx, 1); save(KEY.items, items);
      if (editingId === it.id) { editingId = null; refresh(); }
      renderSaved();
    }
  }

  function exportItems() {
    var data = { app: "root-equipment", version: 1, items: items, customTags: custom };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "root-equipment.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function importItems(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var list = Array.isArray(data) ? data : data.items;
        if (!Array.isArray(list)) throw new Error("no items");
        var newTags = Array.isArray(data.customTags) ? data.customTags : [];
        newTags.forEach(function (t) {
          if (t && typeof t.id === "string" && typeof t.name === "string" && typeof t.text === "string" &&
              !custom.some(function (c) { return c.id === t.id; })) {
            custom.push({
              id: t.id, name: String(t.name).slice(0, 40), kind: t.kind === "neg" ? "neg" : "pos", src: "custom", p: 0,
              text: String(t.text).slice(0, 600), applies: String(t.applies || "").slice(0, 60),
              value: typeof t.value === "number" && t.value ? clamp(Math.round(t.value), -6, 6) : (t.kind === "neg" ? -1 : 1)
            });
          }
        });
        var fresh = list.map(sanitize).filter(function (i) { return i.name; }).map(function (i) { i.id = uid(); return i; });
        items = fresh.concat(items);
        save(KEY.items, items); save(KEY.custom, custom);
        rebuildTagIndex(); renderTagList(); renderSaved(); refresh();
        say("Imported " + fresh.length + " item" + (fresh.length === 1 ? "" : "s") + ".");
      } catch (err) {
        say("That file is not a Root equipment export.", true);
      }
    };
    reader.readAsText(file);
  }

  /* ------------------------------------------------------------------ library */

  function presetItem(p) {
    return { name: p.name, type: p.type, wear: p.wear, marked: 0, load: p.load,
             ranges: p.ranges.slice(), skills: p.skills.slice(), tags: p.tags.slice(),
             notes: clone(p.notes || {}), counts: clone(p.counts || {}) };
  }

  /* a remark under a pre-made card when the book itself is not consistent */
  function libNote(p) {
    if (p.note) return p.note;
    var got = calc(presetItem(p)).value;
    if (p.off) {
      return "The book prints Value " + p.book + " here, but this item’s wear, weapon skill tags and tags add up to " +
        got + ", so that is what the site shows.";
    }
    if (got !== p.book) {
      return "The book charges 1-Value for the second range. Ranges cost nothing here, so this shows Value " +
        got + " instead of " + p.book + ".";
    }
    return "";
  }

  function renderLibrary() {
    segment($("lib-tabs"), [["core", "Core book"], ["sup", "Travelers & Outsiders"], ["rne", "Ruins & Expeditions"]],
      function (v) { return libSrc === v; },
      function (v) { libSrc = v; renderLibrary(); });

    var html = "";
    ["Weapons", "Armor", "Gear"].forEach(function (g) {
      var list = D.presets.filter(function (p) { return p.src === libSrc && p.group === g; });
      if (!list.length) return;
      html += '<div class="lib-group"><h3>' + g + '</h3><div class="flow">' + list.map(function (p) {
        var note = libNote(p);
        return '<div class="entry" data-preset="' + esc(p.id) + '">' + cardHTML(presetItem(p)) +
          (note ? '<p class="lib-note">' + esc(note) + "</p>" : "") +
          '<div class="entry-actions">' +
            '<button type="button" data-act="use">Use as template</button>' +
            '<button type="button" data-act="add">Add to my list</button>' +
          "</div></div>";
      }).join("") + "</div></div>";
    });
    $("lib-list").innerHTML = html;
  }

  function onLibraryClick(e) {
    var act = e.target.getAttribute("data-act");
    var entry = e.target.closest(".entry");
    if (!act || !entry) return;
    var p = D.presets.filter(function (x) { return x.id === entry.dataset.preset; })[0];
    if (!p) return;
    if (act === "use") {
      loadIntoBuilder(presetItem(p), null);
      say("“" + p.name + "” loaded as a template. Change what you like, then save.");
    }
    if (act === "add") {
      var it = sanitize(presetItem(p));
      it.id = uid();
      items.unshift(it);
      save(KEY.items, items); renderSaved();
      e.target.textContent = "Added ✓";
      setTimeout(function () { e.target.textContent = "Add to my list"; }, 1600);
    }
  }

  /* ------------------------------------------------------------------ wiring */

  function bind() {
    $("f-name").addEventListener("input", function (e) { draft.name = e.target.value; refresh(); });

    $("wear-dec").addEventListener("click", function () {
      draft.wear = clamp(draft.wear - 1, WEAR_MIN, WEAR_MAX); draft.marked = Math.min(draft.marked, draft.wear);
      renderControls(); refresh();
    });
    $("wear-inc").addEventListener("click", function () {
      draft.wear = clamp(draft.wear + 1, WEAR_MIN, WEAR_MAX); renderControls(); refresh();
    });

    $("f-search").addEventListener("input", function (e) { query = e.target.value; renderTagList(); });
    $("f-filter").addEventListener("change", function (e) { filter = e.target.value; renderTagList(); });

    $("tag-list").addEventListener("change", function (e) {
      if (e.target.matches('input[type="checkbox"]')) {
        toggleTag(e.target.closest(".trow").dataset.id, e.target.checked);
      }
    });
    $("tag-list").addEventListener("click", function (e) {
      var act = e.target.getAttribute("data-act");
      if (!act) return;
      var id = e.target.closest(".trow").dataset.id;
      if (act === "edit-tag") editOwnTag(id);
      if (act === "del-tag") deleteOwnTag(id);
      if (act === "stack-inc" || act === "stack-dec") {
        var n = clamp((draft.counts[id] || 1) + (act === "stack-inc" ? 1 : -1), 1, 6);
        if (n > 1) draft.counts[id] = n; else delete draft.counts[id];
        e.target.parentNode.querySelector("output").textContent = n + "×";
        refresh();
      }
    });
    $("tag-list").addEventListener("input", function (e) {
      if (!e.target.classList.contains("tnote")) return;
      var id = e.target.closest(".trow").dataset.id;
      var v = e.target.value.trim();
      if (v) draft.notes[id] = v.slice(0, 60); else delete draft.notes[id];
      refresh();
    });

    $("own-form").addEventListener("submit", saveOwnTag);
    $("o-cancel").addEventListener("click", resetOwnForm);

    $("btn-save").addEventListener("click", function () { saveItem(false); });
    $("btn-savenew").addEventListener("click", function () { saveItem(true); });
    $("btn-copy").addEventListener("click", copyText);
    $("btn-new").addEventListener("click", startOver);
    $("dock-save").addEventListener("click", function () { saveItem(false); scrollTo("saved"); });

    $("saved-list").addEventListener("click", onSavedClick);
    $("lib-list").addEventListener("click", onLibraryClick);

    $("btn-export").addEventListener("click", exportItems);
    $("btn-import").addEventListener("click", function () { $("file-import").click(); });
    $("file-import").addEventListener("change", function (e) {
      if (e.target.files[0]) importItems(e.target.files[0]);
      e.target.value = "";
    });
    $("btn-print").addEventListener("click", function () { window.print(); });
    $("btn-clear").addEventListener("click", function () {
      if (!items.length) return;
      if (!confirm("Delete all " + items.length + " saved items? Export first if you want a backup.")) return;
      items = []; editingId = null; save(KEY.items, items); refresh(); renderSaved();
    });
  }

  /* ------------------------------------------------------------------ self-check (?selftest) */

  function selfTest() {
    var bad = [];
    var known = [];   // items where the book's printed Value does not follow its own formula
    D.presets.forEach(function (p) {
      var got = calc(presetItem(p)).value;
      // the book charges 1 Value for a second range; the site does not
      var want = p.book - Math.max(0, p.ranges.length - 1);
      if (p.off) known.push(p.name + ": book " + p.book + ", site " + got);
      else if (got !== want) bad.push(p.name + ": app " + got + " vs book " + p.book + " (expected " + want + ")");
      p.tags.forEach(function (id) { if (!tagIndex[id]) bad.push(p.name + ": unknown tag " + id); });
      Object.keys(p.notes || {}).concat(Object.keys(p.counts || {})).forEach(function (id) {
        if (p.tags.indexOf(id) < 0) bad.push(p.name + ": note/count for a tag it does not have: " + id);
      });
    });
    var ids = {};
    D.tags.forEach(function (t) { if (ids[t.id]) bad.push("duplicate tag id " + t.id); ids[t.id] = 1; });
    var out = document.createElement("pre");
    out.id = "selftest";
    out.textContent = JSON.stringify({ presets: D.presets.length, tags: D.tags.length, mismatches: bad, bookInconsistent: known });
    document.body.appendChild(out);
  }

  /* ------------------------------------------------------------------ start */

  resetOwnForm();
  renderControls();
  renderTagList();
  renderSaved();
  renderLibrary();
  refresh();
  bind();
  if (location.search.indexOf("selftest") >= 0) selfTest();
})();
