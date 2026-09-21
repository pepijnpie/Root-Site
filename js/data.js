/*
 * Root: The Roleplaying Game – equipment data
 * Transcribed from the core book (Chapter 7, pp. 181–192), the
 * Travelers & Outsiders supplement (Chapter 4, pp. 79–90) and
 * Ruins & Expeditions (Chapter 3, pp. 53–63).
 *
 * Text markup used in `text`:  *italic move name*   **bold**
 * A newline starts a new line; a line starting with "- " is a bullet.
 * Tag `value` is signed: positive tags +1, negative tags −1, with the book
 * exceptions Luxury (+4 in total), Makeshift (−2), Loose Weave (−2) and
 * Borrowed (−6). Ripper and Specialized are priced 2-Value in the book but
 * count 1 here, on purpose: the site has no extra per-tag costs.
 * Tag `load` is the effect on Load: +1 / −1, or "zero" (Light).
 * Tag `detail` adds a label the user can fill in, e.g. "Ceremonial (Keepers
 * in Iron)"; `stack` lets a tag be applied more than once (Contraband).
 */
(function () {
  "use strict";

  var tags = [];

  function add(kind, src, page, list) {
    list.forEach(function (row) {
      var name = row[0], text = row[1], applies = row[2] || "", extra = row[3] || {};
      var t = {
        id: name.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name: name,
        kind: kind,
        src: src,
        p: page,
        text: text,
        applies: applies,
        value: kind === "pos" ? 1 : -1
      };
      for (var k in extra) t[k] = extra[k];
      tags.push(t);
    });
  }

  /* ---------- Core book: positive tags (pp. 186–188) ---------- */
  add("pos", "core", 186, [
    ["Arrow-proof", "Ignore the first hit dealing injury from arrows that you suffer in a scene.", "Armor"],
    ["Blunted", "This weapon inflicts exhaustion, not injury.", "Hammer, staff"],
    ["Catfolk Steel", "Mark wear when *engaging in melee* to shift your range one step, even on a miss.", "Armor, weapons"],
    ["Ceremonial", "Choose an attached faction. While this item is displayed, treat yourself as having +1 Reputation with that faction, and –1 Reputation with other factions.", "Anything", { detail: "Faction" }],
    ["Comfortable", "This item counts as 1 fewer Load.", "Armor", { load: -1 }],
    ["Durable", "If this item would ever be destroyed, permanently remove 1-wear from it instead. If it ever has no wear remaining, it is destroyed.", "Anything"],
    ["Eaglecraft", "Mark wear when *engaging in melee* to both make and suffer another exchange of harm.", "Weapons"],
    ["Fast", "Mark wear when *engaging in melee* to suffer 1 fewer harm, even on a miss.", "Smaller or thinner weapons"],
    ["Friendly", "When you *meet someone important*, mark exhaustion to roll with your Reputation +1.", "Armor, nonthreatening weapons like staves"]
  ]);
  add("pos", "core", 187, [
    ["Flexible", "When you *grapple* with someone, mark exhaustion to ignore the first choice they make.", "Armor"],
    ["Foxfolk Steel", "Ignore the first box of wear you mark on this item each session.", "Weapons and some armor"],
    ["Hair Trigger", "Mark wear to *target a vulnerable* foe at close range instead of far.", "Crossbow"],
    ["Healer’s Kit", "Mark wear to clear exhaustion. Mark 2-wear to clear injury.", "Healer’s kit"],
    ["Heavy Bludgeon", "Mark exhaustion to ignore your enemy’s armor when you inflict harm.", "Hammer, mace"],
    ["Heavy Draw Weight", "When you *target a vulnerable* foe with this bow, mark exhaustion to inflict 1 additional injury.", "Bow"],
    ["Iron Bolts", "This weapon inflicts 1 additional wear when its harm is absorbed by armor.", "Bow, crossbow"],
    ["Large", "Mark exhaustion when inflicting harm with this weapon to inflict 1 additional harm.", "Weapons"],
    ["Luxury", "After creation, this item is worth +3-Value.", "Anything",
      { value: 4, vnote: "Counts as +4 Value in total: +1 as a tag, and +3 after creation." }],
    ["Mousefolk Steel", "Mark wear to *engage in melee* using Cunning instead of Might.", "Weapons"],
    ["Mighty", "When you *wreck something* with this item, mark 2-wear to shift a miss to a 7–9 or a 7–9 to a 10+ result.", "Explosives, heavy weapons"],
    ["Oiled String", "Mark wear to use the weapon skill *quick shot* even if you don’t have it.", "Bow"],
    ["Quick", "Mark exhaustion to *engage in melee* with Finesse instead of Might.", "Small or fast weapons"],
    ["Rabbitfolk Steel", "Mark wear to *engage in melee* with Finesse instead of Might.", "Weapons"],
    ["Reach", "When you *engage in melee*, mark wear on this weapon to inflict harm instead of trading harm; you cannot use this tag if your enemy’s weapon also has **reach**.", "Large, tall weapons"],
    ["Refreshing", "When you take some time to relax and drink or eat from this item with a group, mark 3-wear, +1 additional wear for each participant past the third. Every participant clears all exhaustion.", "Meal, flask"],
    ["Sharp", "Mark wear when inflicting harm with this weapon to inflict 1 additional harm.", "Edged weapons"]
  ]);
  add("pos", "core", 188, [
    ["Short Limbs", "Mark wear to fire a *quick shot* at far range.", "Small bow"],
    ["Signature", "Whenever you earn prestige or notoriety while showing this item, mark 1 additional prestige or notoriety.", "Anything displayed"],
    ["Thick", "When you mark wear on this shield to block a hit, you only ever mark 1-wear, even if you are blocking more harm from a single hit.", "Shield"],
    ["Thief Kit", "When you *attempt a roguish feat* appropriate for this item, you may mark wear on this item instead of marking exhaustion to avoid a risk coming to bear on a 7–9.", "Tools, specially made armor or weapons"],
    ["Throwable", "Mark exhaustion to *target a vulnerable foe* with this weapon at far range.", "Daggers, grenades"],
    ["Tightly Woven", "When you take a few seconds to repair this armor after a fight, clear 1-wear you marked during the fight.", "Chain armor"],
    ["Tricky", "When you use this item to *trick an NPC* by distracting them at a distance, on a 7–9 mark wear to eliminate one option from the *trick an NPC* move before the NPC picks.", "Bolas, bows"],
    ["Unassuming", "Until you harm an enemy, they will never deem you more of a threat than other vagabonds with arms and armor.", "Robes, staves"],
    ["Versatile", "When you move to or from a range this weapon can reach, mark wear to make a quick strike and inflict injury on any opponent in this weapon’s range.", "Fast weapons"]
  ]);

  /* ---------- Core book: negative tags (pp. 188–189) ---------- */
  add("neg", "core", 188, [
    ["Bulky", "This weapon cannot be hidden and is always visible while on your body. Mark exhaustion whenever you *attempt a roguish feat* or *trust fate* to sneak, hide, blindside, or perform an act of acrobatics.", "Large weapons"],
    ["Cumbersome", "Mark 1-exhaustion when you don your armor—clear 1-exhaustion when you take it off.", "Heavy armor"],
    ["Fragile", "When you make a weapon move with this weapon, mark wear on it. Mark exhaustion to ignore this effect.", "Light weapons"],
    ["Hated", "Take –2 Reputation with the faction that loathes this item while it is displayed. If you reveal this item to foes from that faction, they clear morale as they are energized by anger at you.", "Anything", { detail: "Faction" }],
    ["Shoddy", "Repairing this item costs twice as much Value per box of wear cleared.", "Anything"],
    ["Slow", "When you *engage in melee* with this weapon, choose one fewer option. Mark wear to ignore this effect.", "Heavy weapons"]
  ]);
  add("neg", "core", 189, [
    ["Ugly", "Take –1 to *meet someone* important while they can see this item. Mark exhaustion to hide it.", "Weapons or handheld items"],
    ["Unwieldy", "Take a –1 to all weapon moves—both basic and special weapon moves—made with this weapon. Mark exhaustion to ignore this effect."],
    ["Weighty", "This item counts as 1 additional Load.", "Anything large", { load: 1 }],
    ["Wicked", "Anyone who sees this weapon will deem its wielder a threat, at least to be watched carefully. When you inflict any harm with this weapon, mark notoriety with an observing faction for each harm inflicted.", "Cruel weapons"]
  ]);

  /* ---------- Travelers & Outsiders: positive tags (pp. 81–83) ---------- */
  add("pos", "sup", 81, [
    ["Accurate", "When you inflict injury with this weapon, mark exhaustion to target a specific part of your target’s body and impair it until they have time to heal.", "Bow, knives"],
    ["Barbed", "When you catch someone with this weapon’s end, mark exhaustion to move to intimate range and *grapple with them* as if you had rolled a 10+.", "Spears, axes, chains"],
    ["Blend", "When you use this item to blend into the appropriate environment, mark wear to roll Sneak or Hide as if you had those feats. If you do have those feats, mark wear in the same situation to instead take +1 ongoing for the scene.", "Camouflage, local clothing, etc."]
  ]);
  add("pos", "sup", 82, [
    ["Cathartic", "When you use this item for a recreational activity with another vagabond, mark 2-wear for both vagabonds to each clear 2-exhaustion.", "Art supplies, bow and arrow, etc."],
    ["Common", "When repairing this item, you can repair twice as much wear for the same Value.", "Anything"],
    ["Disarming", "When wearing this item, you are underestimated. Mark exhaustion to change a miss to a 7-9 or a 7-9 to a 10+ when *tricking an NPC by appearing weak or nonthreatening*.", "Tattered-seeming clothes, burlap robes"],
    ["Distracting", "When you *grapple with an enemy* while you wield or display this item, mark exhaustion to change a miss to a 7-9 or a 7-9 to a 10+.", "Anything visibly or audibly distracting for your enemy"],
    ["Disguised", "Until this item is revealed as a weapon, it will be treated as if it isn’t one. When you *attempt the Blindside roguish feat* with this weapon while it is still unrevealed, mark wear to shift a miss to a 7-9 or a 7-9 to a 10+.", "Any weapon disguised as a commonplace object"],
    ["Hidden", "Mark exhaustion when being searched or examined to ensure this item goes unnoticed. Mark wear to *attempt the Blindside roguish feat* if you don’t have it, or to take a 10+ to Blindside if you do have it.", "Stiletto, baton"],
    ["Impressive", "When you *storm a group* wielding this item, mark wear to inflict 2-morale harm on them, in addition to the consequences of your roll.", "Skull-shaped hammer, black sword"],
    ["Incendiary", "This item inspires members of one faction, and angers and upsets members of another. When you openly give this item to an interested party in order to spread its message, mark prestige equal to this item’s Value with the positive faction, and notoriety equal to this item’s Value with the negative faction.", "Pamphlets, libel, slanderous texts"],
    ["Intimidating", "When you flaunt this item to *persuade an NPC* through threats, you can mark 2-notoriety with their faction to shift a miss to a 7-9 or a 7-9 to a 10+.", "Any weapon"],
    ["Inspiring", "When you use this item to *help another vagabond*, you can mark wear instead of exhaustion.", "Anything"],
    ["Invigorating", "When you consume this item, mark 2-injury to clear all your exhaustion and add 2 boxes to your exhaustion track for the rest of the scene (they go away at the end of the scene, whether they are marked or unmarked, with no further harmful effects either way).", "Stimulant"]
  ]);
  add("pos", "sup", 83, [
    ["Legendary", "This item has its own reputation track, referred to as Legend, equivalent to 15 boxes of Prestige. It starts with Legend +1, and has no Legend boxes marked. To reach Legend +2, it would have to have 10 boxes of Legend marked, and then would clear its track. To reach Legend +3, it would have to have 15 boxes of Legend marked. This item also has a favored faction and a hated faction. Any time you wield this item openly, you do not mark prestige or notoriety at all. Instead, you mark Legend on this item when you aid the favored faction and injure the hated faction. For Reputation moves, roll with the item’s Legend instead of your own Reputation. Whenever any session goes by in which you did not mark any Legend on this item, clear 1 box of Legend from this item. If you have no boxes to clear, reduce its Legend by 1.", "Anything"],
    ["Light", "This item doesn’t count towards your Load.", "Anything made from lighter materials than normal", { load: "zero" }],
    ["Nasty", "When you *grapple with an enemy*, both yours and your enemy’s first choice is doubled in effect.", "Heavy gauntlet or other heavy weapon"],
    ["Poison", "When you *target a vulnerable foe*, inflict exhaustion instead of injury; your target is poisoned until cured. While poisoned, each time they take a significant or strenuous action, inflict exhaustion. If they fall unconscious, inflict injury every 6 hours until they receive the cure or perish.", "Anything envenomed or poisoned"],
    ["Precise", "Mark wear to ignore your enemy’s armor when you inflict harm.", "Thin weapons"],
    ["Reinforced", "While wearing this armor, you may absorb injury as exhaustion 1-for-1 instead of absorbing it as wear.", "Armor"],
    ["Sturdy", "When you would mark wear on this item, you may mark exhaustion instead. You cannot mark exhaustion to absorb injury with this tag.", "Anything"]
  ]);

  /* ---------- Travelers & Outsiders: negative tags (p. 84) ---------- */
  add("neg", "sup", 84, [
    ["Conspicuous", "When you *target a vulnerable foe at far range*, you cannot keep your position hidden, even on a 10+. Mark wear to ignore this effect.", "Any far-range weapon that is particularly noisy or visible"],
    ["Cursed", "Allied NPCs suffer morale harm when they see you bearing this item.", "Anything with a hateful myth around it"],
    ["Dangerous", "Mark injury—in addition to any other consequences—when you make a weapon move with this item and roll a 7-9.", "Some explosives, difficult weapons"],
    ["Hard to Hold", "When you *grapple with an enemy*, if you roll a 7-9, you lose your grip on this item in addition to the other consequences of your roll. Mark exhaustion to ignore this effect.", "Anything with poor grip"],
    ["Identifiable", "This item is known to be associated with a particular individual. Anyone who sees it instantly recognizes it and associates you with that individual.", "Anything"],
    ["Immoral", "While this item is displayed, you cannot *persuade* or *ask for a favor* from denizens most directly insulted by its immoral nature. Take -1 to *ask for a favor* from all other denizens while this item is visible.", "Cat claw knuckles, bird beak necklace, etc."],
    ["Incriminating", "When any significant individual member of the faction offended by this item first sees you bearing it, mark notoriety with that faction.", "Anything"],
    ["Makeshift", "This item cannot be repaired. This negative tag refunds 2-Value instead of 1-Value.", "Anything created with *Improvise a Weapon*", { value: -2 }],
    ["Noisy", "When you *wreck something* using this item, you always attract attention, regardless of the roll.", "Explosives"],
    ["Scarce", "The tools to repair this item are not commonplace. Standard repairs can clear wear to one box fewer than maximum (so an item with 3 boxes of wear could only ever be repaired through standard means to 2-wear marked). Full repairs for this item require specialists with rare equipment.", "Anything antique or rare"]
  ]);

  /* ---------- Ruins & Expeditions: positive tags (pp. 53–55) ---------- */
  add("pos", "rne", 53, [
    ["Badgerfolk Hilt", "When wielding this weapon, you can mark wear to avoid being disarmed.", "Hilted weapons"],
    ["Beguiling", "When you *attempt to trick or persuade an NPC* while you wield or display this item, mark exhaustion when you roll a 12+ to include Mastery (Travelers & Outsiders, page 69) options.", "Armor, clothes, trinkets"],
    ["Binding", "When you *engage in melee at close range*, add this choice to the list: mark wear to wrap up your opponent’s weapon; then, mark up to 2-exhaustion. Your opponent must mark the same amount of exhaustion, or you wrench the weapon from their hands.", "Chains, whips"]
  ]);
  add("pos", "rne", 54, [
    ["Concave", "When you *engage in melee* while holding this shield, mark exhaustion on a hit to knock your opponent off balance; you create an opportunity for yourself or your allies.", "Shields"],
    ["Corvidfolk Cloth", "When you use this item to approach an unsuspecting target, mark wear to roll Blindside or Pickpocket as if you had those feats. If you do have those feats, mark wear in the same situation to instead take +1 ongoing for the scene.", "Cloaks, hoods"],
    ["Cranecarved", "When you *use the Longshot weapon skill with this bow*, do not mark exhaustion.", "Bows"],
    ["Deflecting", "You may mark wear on this weapon as if it was a shield or armor; it does not count as a shield or armor for any other effects.", "Hand protection, specialized swords"],
    ["Ensigiled", "This item is marked with a faction’s seal. When wielding or displaying this item, you can make the faction-specific Reputation move associated with that faction as if your Reputation was one level higher [max+4].", "", { detail: "Faction" }],
    ["Fascinating", "After you *meet someone important*, mark exhaustion and pick 1; you tell them how you used the item to…\n- Defend a faction, person, or clearing; they will tell you some current news relevant to that thing\n- Fight a faction, person, or idea; they will reveal their true allegiance in the conflict you’ve described\n- Serve a faction, person, or cause; they will point you toward others who share your loyalty to that thing\nYou can mark exhaustion to ask a followup question; they must answer it honestly, but can be cagey with the details.", "Anything"],
    ["Lizardhewn Grip", "The first time you *parry the attacks of an enemy* with this weapon in a fight, do not mark exhaustion.", "Light weapons"],
    ["Menacing", "While wielding or displaying this item, you can *intimidate enemy troops with* -1 Reputation—instead of -2 Reputation or lower—and you always inflict an additional morale harm on the group, even on a miss.", "Armor, weapons"],
    ["Otterfolk Webbing", "Increase your carrying capacity by 2-Load.", "Armor, clothes, packs"]
  ]);
  add("pos", "rne", 55, [
    ["Rallying", "While you wield or display this item, you can *lead troops of a faction in battle* with +2 Reputation—instead of +3 Reputation—with their faction; you always gain 1 additional hold, even on a miss.", "Anything"],
    ["Ratfolk Iron", "When you *engage in melee*, mark exhaustion to choose an additional option.", "Weapons"],
    ["Ripper", "When you inflict injury on an opponent with this weapon, you may mark wear; if you do, they must mark 2-exhaustion, or they permanently lose 1 injury box.", "Edged weapons",
      { vnote: "The book prices this tag at 2-Value; here it counts as 1, like every other tag." }],
    ["Seasoned", "When adding ingredients to this item for cooking, treat the meal as an item with the Refreshing tag and Wear equal to the amount of Depletion or Value spent on those ingredients.", "Cookware"],
    ["Specialized", "When you craft this item, choose a move from your playbook that you haven’t unlocked. While you wield or wear this item, you can mark wear and exhaustion to make use of that move for the scene.", "Anything",
      { vnote: "The book prices this tag at 2-Value; here it counts as 1, like every other tag." }],
    ["Silenced", "Mark wear to attempt the Blindside roguish feat if you don’t have it; if you do have Blindside, mark wear to ensure that you do not draw unwanted attention, even on a miss.", "Crossbows, bows"],
    ["Symbolic", "Choose a faction; when you *endorse or vilify a new leader* of that faction, remove an option from the list before the GM picks.", "Anything", { detail: "Faction" }],
    ["Tapered", "When you *attempt the Blindside roguish feat*, mark wear to inflict an additional 2-harm.", "Daggers"],
    ["Thornback", "When an opponent grabs you while you are wearing this item, mark exhaustion to inflict 1-injury. Until they let you go, they suffer 1-injury each time they act against you.", "Armor"],
    ["Well-Kept", "This piece of armor has been well-maintained and repaired over the years, so much so that it is very difficult to destroy. This armor is never destroyed for all of its wear being filled; it can only be destroyed by filling every box of wear, and then taking direct, intentional action to destroy it with specialized tools or a particularly destructive environment.", "Old but sturdy armor"]
  ]);

  /* ---------- Ruins & Expeditions: negative tags (pp. 56–57) ---------- */
  add("neg", "rne", 56, [
    ["Borrowed", "This item is on loan from a high-status benefactor and must eventually be returned. When you create an item with this tag, name the faction, and the GM names the benefactor. Your benefactor is always able to find you, and has many envoys at their disposal. When time passes, one comes to collect; roll with Luck. On a hit, the envoy asks for a favor; do it, and you can keep the item. On a 10+, the envoy also gives you a chance to purchase the item instead; the GM will tell you the cost. On a miss, you must return the item or face grave consequences. This tag refunds 6-Value instead of 1-Value.", "Anything", { value: -6, detail: "Faction" }],
    ["Brittle", "The first time you mark wear on this item during a session, mark an additional box. Any time a foe inflicts wear on this item, they inflict 1 additional wear.", "Armor, tools, weapons"],
    ["Burdensome", "When you *travel from clearing to clearing along the path*, you may only do so at a relaxed or average pace.", "Armor"],
    ["Clumsy", "When you engage in melee with this item, you cannot choose to suffer little (–1) harm. When you *wreck something* with this item, you always cause collateral damage, even on a 10+.", "Explosives, weapons"],
    ["Contraband", "When this item is created, choose a faction that recognizes it as illegal. When someone in a position of authority with that faction discovers you are carrying this item, mark 2-notoriety; they will immediately attempt to confiscate it. You may apply this tag again to select an additional faction.", "Armor, clothes, weapons", { stack: true, detail: "Faction(s)" }],
    ["Coveted", "When you first arrive in a clearing, roll with Luck. On a hit, this item attracts unwanted attention from the local denizens; the GM will tell you who has their eye on it. On a 7-9, their interest is intense; they offer to purchase it, try to steal it, or simply attempt to take it, GM’s choice. On a 10+, the interest is good-natured—admiration of the craft, interest in the object’s history—and modest. On a miss, someone powerful in the clearing decides to pursue this item, even at great cost.", "Anything"],
    ["Custom Fitted", "This item can only be wielded or worn by a particular species of animal common in the Woodland. When this item is created, choose the single type of animal that can use it—all others find it nearly impossible to use and must mark an exhaustion to take any meaningful action while doing so. This tag cannot be chosen by a player when creating an item; only the GM can assign this tag to an item.", "Anything", { detail: "Species" }]
  ]);
  add("neg", "rne", 57, [
    ["Eerie", "When you *persuade* someone while displaying this item and roll 7-9 or a miss, mark notoriety in addition to any other consequences of your roll.", "Anything strange and unusual"],
    ["Flamboyant", "When you *attempt a roguish feat to sneak or hide*, you incur an additional risk, even when using Mastery options.", "Anything"],
    ["Loose Weave", "For each injury you absorb with this armor, mark 2-wear instead of 1-wear. This tag refunds 2-Value instead of 1-Value.", "Chain armor", { value: -2 }],
    ["Shabby", "In addition to any other consequences, mark wear on this item when you roll a miss while wielding it.", "Weapons, tools, etc."],
    ["Softwood", "When you mark wear on this shield instead of marking injury, mark additional wear. Mark exhaustion to ignore this effect.", "Shields"],
    ["Suspicious", "When you wear, wield, or otherwise display this item, you must mark an additional exhaustion to attempt to evade detection or hide from someone actively looking for you.", "Anything"],
    ["Unbalanced", "When you *engage in melee*, you pick one fewer option on a hit.", "Heavy weapons"],
    ["Unimpressive", "While you wield or wear this item, you always inflict one fewer morale harm and take -1 to *meet someone important*.", "Armor, weapons"]
  ]);

  /* ---------- Weapon skill tags (only skills that need a tagged weapon) ---------- */
  var skills = [
    { id: "cleave", src: "core" },
    { id: "disarm", src: "core" },
    { id: "harry a group", src: "core" },
    { id: "parry", src: "core" },
    { id: "quick shot", src: "core" },
    { id: "storm a group", src: "core" },
    { id: "trick shot", src: "core" },
    { id: "vicious strike", src: "core" },
    { id: "battle fury", src: "sup" },
    { id: "charge", src: "sup" },
    { id: "lunge", src: "sup" },
    { id: "paired fighting", src: "sup" },
    { id: "pinpoint shot", src: "sup" },
    { id: "long shot", src: "sup" },
    { id: "point-blank shot", src: "sup" },
    { id: "switch hands", src: "sup" },
    // need no tagged weapon, but items in Ruins & Expeditions carry them anyway
    { id: "hurl", src: "sup" },
    { id: "hammerpaws", src: "sup" }
  ];

  /* ---------- Pre-made equipment ----------
   * load = base Load before tags (Weighty / Comfortable / Light adjust it),
   * book = the Value printed in the book, used as a self-check.
   * extra: notes {tagId: "Lizard Cult"}, counts {tagId: 2},
   *        off: true  = the book's printed Value does not follow its own formula,
   *        note: own remark shown under the card.                           */
  var presets = [];
  function P(src, group, name, type, wear, load, ranges, skl, tg, book, extra) {
    var p = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      src: src, group: group, name: name, type: type, wear: wear, load: load,
      ranges: ranges, skills: skl, tags: tg, book: book
    };
    for (var k in (extra || {})) p[k] = extra[k];
    presets.push(p);
  }
  var I = "intimate", C = "close", F = "far";

  // Core book, p. 191–192
  P("core", "Weapons", "Dagger", "weapon", 1, 0, [I, C], ["parry", "vicious strike"], ["quick"], 5);
  P("core", "Weapons", "Mousefolk Short Sword", "weapon", 3, 1, [C], ["parry", "disarm"], ["mousefolk-steel"], 6);
  P("core", "Weapons", "Foxfolk Longsword", "weapon", 2, 1, [C], ["disarm", "vicious strike"], ["foxfolk-steel"], 5);
  P("core", "Weapons", "Rabbitfolk Axe", "weapon", 2, 1, [C], ["disarm"], ["rabbitfolk-steel"], 4);
  P("core", "Weapons", "Greatsword", "weapon", 2, 2, [C], ["cleave", "storm a group", "disarm"], ["sharp", "large", "bulky"], 6);
  P("core", "Weapons", "Smithy Hammer", "weapon", 2, 1, [I, C], ["cleave"], ["heavy-bludgeon"], 5);
  P("core", "Weapons", "Staff", "weapon", 2, 1, [C], ["parry"], ["blunted"], 4);
  P("core", "Weapons", "Quarterstaff", "weapon", 3, 1, [C], ["parry"], ["reach", "blunted"], 6);
  P("core", "Weapons", "Shortbow", "weapon", 4, 1, [C], ["quick shot"], ["short-limbs"], 6);
  P("core", "Weapons", "Longbow", "weapon", 4, 1, [F], ["harry a group"], [], 5);
  P("core", "Weapons", "Trick Bow", "weapon", 3, 1, [C], ["harry a group", "trick shot"], [], 5);
  P("core", "Weapons", "Crossbow", "weapon", 2, 1, [F], ["trick shot"], ["oiled-string", "hair-trigger", "iron-bolts"], 6);
  P("core", "Weapons", "Sling and Rocks", "weapon", 2, 0, [C], ["harry a group"], [], 3);
  P("core", "Armor", "Leather Armor", "armor", 2, 1, [], [], ["flexible"], 3);
  P("core", "Armor", "Chainmail", "armor", 3, 1, [], [], ["tightly-woven", "weighty"], 3);
  P("core", "Armor", "Plate Armor", "armor", 4, 1, [], [], ["arrow-proof", "cumbersome", "weighty"], 3);
  P("core", "Armor", "Robes", "armor", 1, 1, [], [], ["unassuming"], 2);

  // Travelers & Outsiders, p. 85–90
  P("sup", "Weapons", "Lizard Cult Ritual Blade", "weapon", 1, 0, [I, C], ["vicious strike"], ["intimidating", "incriminating"], 3);
  P("sup", "Weapons", "Spiked Flail/Chain", "weapon", 3, 1, [C], ["storm a group", "cleave"], ["impressive", "dangerous"], 5);
  P("sup", "Weapons", "Spring-loaded Wristblade", "weapon", 4, 0, [I], ["vicious strike"], ["hidden", "accurate", "scarce"], 6);
  P("sup", "Weapons", "Lizard Stinger", "weapon", 2, 0, [I], [], ["hidden", "poison"], 4);
  P("sup", "Weapons", "Dueling Rapier", "weapon", 3, 1, [C], ["disarm", "parry"], ["precise", "quick", "fragile"], 6);
  P("sup", "Weapons", "Bird Talon Gauntlets", "weapon", 2, 1, [I, C], ["vicious strike"], ["nasty", "immoral"], 4);
  P("sup", "Weapons", "Royal Oak Bow", "weapon", 5, 0, [F], ["trick shot"], ["accurate", "heavy-draw-weight", "weighty"], 7);
  P("sup", "Weapons", "Riverboat Paddle", "weapon", 2, 1, [C], ["storm a group"], ["blunted", "hard-to-hold", "unwieldy"], 2);
  P("sup", "Weapons", "Stiletto Dagger", "weapon", 2, 0, [I], ["vicious strike"], ["precise", "hidden"], 5);
  P("sup", "Weapons", "Automatic Crossbow", "weapon", 4, 1, [F], ["harry a group", "storm a group"], ["hair-trigger", "conspicuous", "scarce"], 5);
  P("sup", "Weapons", "Polearm", "weapon", 3, 1, [C], ["cleave", "disarm"], ["common", "reach", "bulky"], 6);
  P("sup", "Weapons", "Harp Bow", "weapon", 4, 1, [C], ["quick shot"], ["disguised", "short-limbs", "fragile"], 6);
  P("sup", "Weapons", "Sword Cane", "weapon", 3, 1, [C], ["parry", "disarm"], ["disguised", "quick", "hard-to-hold"], 6);
  P("sup", "Weapons", "Blade of the Last Dynasty / Sword of the True King", "weapon", 5, 1, [C], ["parry", "vicious strike"], ["legendary", "eaglecraft", "luxury", "identifiable"], 12);
  P("sup", "Armor", "Bear Skull Helmet", "armor", 2, 1, [], [], ["impressive", "cursed"], 2);
  P("sup", "Armor", "Heavy Gambeson", "armor", 1, 1, [], [], ["reinforced"], 2);
  P("sup", "Armor", "Spiked Shield", "shield", 2, 1, [], [], ["nasty", "distracting"], 4);
  P("sup", "Armor", "Scavenged Armor", "armor", 3, 1, [], [], ["disarming", "makeshift"], 2);
  P("sup", "Armor", "Turtle Shell Pavise", "shield", 4, 1, [], [], ["arrow-proof", "thick", "immoral"], 5);
  P("sup", "Gear", "Collapsible Paraglider", "gear", 3, 1, [], [], ["thief-kit", "sturdy", "weighty"], 4);
  P("sup", "Gear", "Forest Cloak", "gear", 2, 1, [], [], ["blend"], 3);
  P("sup", "Gear", "Libelous Documents", "gear", 3, 1, [], [], ["incendiary", "incriminating"], 3);
  P("sup", "Gear", "Portable Easel & Paints", "gear", 4, 1, [], [], ["cathartic", "weighty"], 4);
  P("sup", "Gear", "Corvid Explosives", "gear", 2, 1, [], [], ["mighty", "noisy"], 2);
  P("sup", "Gear", "Box of Fine Snuff", "gear", 1, 0, [], [], ["invigorating", "luxury"], 6);
  P("sup", "Gear", "Belt of Smoke Bombs", "gear", 2, 0, [], [], ["thief-kit", "light"], 4);
  P("sup", "Gear", "Masterwork Instrument", "gear", 4, 1, [], [], ["inspiring", "signature"], 6);
  P("sup", "Gear", "Grappling Gun", "gear", 4, 1, [], [], ["thief-kit", "scarce"], 4);
  P("sup", "Gear", "Performer’s Garb", "gear", 2, 1, [], [], ["disarming", "distracting"], 4);

  // Ruins & Expeditions, p. 58–63
  P("rne", "Weapons", "Acute Razor", "weapon", 5, 1, [I, C], ["vicious strike"], ["ripper", "silenced", "unbalanced"], 4, { off: true });
  P("rne", "Weapons", "Badgerfolk Broadsword", "weapon", 4, 1, [C], ["cleave", "disarm", "storm a group"], ["badgerfolk-hilt", "ceremonial", "reach", "clumsy"], 9, { notes: { ceremonial: "Keepers in Iron" } });
  P("rne", "Weapons", "Blade of Last Breaths", "weapon", 2, 0, [I, C], ["vicious strike"], ["precise", "tapered", "cursed"], 5);
  P("rne", "Weapons", "Bull Thistle Blowgun", "weapon", 2, 0, [F], [], ["accurate", "common", "poison", "fragile"], 4);
  P("rne", "Weapons", "Birdsbane Chain", "weapon", 3, 1, [C], ["switch hands"], ["barbed", "binding", "suspicious"], 5);
  P("rne", "Weapons", "Elegant Bow", "weapon", 5, 1, [F], ["long shot"], ["cranecarved", "heavy-draw-weight", "light", "brittle"], 8,
    { note: "The book prints Load 1 here, but the Light tag says this item doesn’t count towards your Load, so it shows 0." });
  P("rne", "Weapons", "Knucklebones", "weapon", 3, 1, [I], [], ["nasty"], 4);
  P("rne", "Weapons", "Ratfolk Saber", "weapon", 6, 1, [C], ["paired fighting"], ["ratfolk-iron", "ripper", "custom-fitted"], 5, { off: true, notes: { "custom-fitted": "rats" } });
  P("rne", "Weapons", "Reptilian Half-pike", "weapon", 3, 1, [C], ["hurl", "lunge"], ["lizardhewn-grip", "throwable", "conspicuous"], 6);
  P("rne", "Weapons", "Vineleather Wraps", "weapon", 3, 0, [], ["hammerpaws"], ["deflecting"], 5,
    { note: "Hammerpaws needs no tagged weapon. This tag means the wraps can be wielded together with Hammerpaws without making the vagabond “armed” and removing access to Hammerpaws." });
  P("rne", "Weapons", "Gigantic Claymore", "weapon", 3, 1, [C], ["battle fury", "cleave"], ["large", "menacing", "badgerfolk-hilt", "bulky", "clumsy", "weighty"], 5);
  P("rne", "Armor", "Concave Shield", "shield", 3, 1, [], [], ["concave", "softwood"], 3);
  P("rne", "Armor", "Sacrificial Leathers", "armor", 2, 1, [], [], ["ensigiled", "flexible", "immoral"], 3, { notes: { ensigiled: "Lizard Cult" } });
  P("rne", "Armor", "Keepers’ Cuirass", "armor", 7, 1, [], [], ["reinforced", "thornback", "well-kept", "weighty"], 5, { off: true });
  P("rne", "Armor", "Shining Aegis", "armor", 4, 1, [], [], ["distracting", "inspiring", "symbolic", "cumbersome", "flamboyant", "weighty"], 4);
  P("rne", "Gear", "Cloak of the Corvid King", "gear", 4, 0, [], [], ["corvidfolk-cloth", "ensigiled", "contraband"], 4,
    { notes: { ensigiled: "Corvid Conspiracy", contraband: "Eyrie Dynasties & Grand Duchy" }, counts: { contraband: 2 } });
  P("rne", "Gear", "Ancient Diadem", "gear", 5, 0, [], [], ["fascinating", "legendary", "luxury", "coveted", "eerie"], 9);

  window.ROOT_DATA = {
    tags: tags,
    skills: skills,
    presets: presets,
    sources: { core: "Core book", sup: "Travelers & Outsiders", rne: "Ruins & Expeditions", custom: "Custom" }
  };
})();
