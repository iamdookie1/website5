// ---------- Preset option lists ----------
const TRAITS = [
  "Kind", "Sarcastic", "Shy", "Confident", "Funny", "Serious", "Mysterious",
  "Loyal", "Rebellious", "Curious", "Calm", "Energetic", "Blunt", "Gentle",
  "Cunning", "Protective", "Awkward", "Flirty", "Stoic", "Playful",
  "Ambitious", "Empathetic", "Sarcastic-but-caring", "Stubborn", "Optimistic"
];

const APPEARANCE = [
  "Slim build", "Athletic build", "Muscular build", "Curvy build", "Average build",
  "Short hair", "Long hair", "Messy hair", "Freckles", "Scar across eyebrow",
  "Tattoos", "Glasses", "Piercings", "Sharp jawline", "Soft features",
  "Bright eyes", "Tan skin", "Pale skin", "Dark skin"
];

const STYLES = [
  "Formal", "Casual", "Sarcastic wit", "Poetic", "Blunt & direct",
  "Warm and reassuring", "Teasing", "Overly polite", "Uses slang",
  "Speaks in riddles", "Talks fast", "Soft-spoken", "Dramatic flair"
];

// ---------- State ----------
const state = {
  traits: new Set(),
  appearance: new Set(),
  style: new Set()
};

// ---------- Tag picker rendering ----------
function renderPicker(pickerId, options, key) {
  const picker = document.getElementById(pickerId);
  picker.innerHTML = "";
  options.forEach(opt => picker.appendChild(makeTagOption(opt, key)));
}

function makeTagOption(value, key) {
  const el = document.createElement("div");
  el.className = "tag-option";
  el.textContent = value;
  el.dataset.value = value;
  if (state[key].has(value)) el.classList.add("selected");
  el.addEventListener("click", () => toggleTag(value, key, el));
  return el;
}

function toggleTag(value, key, el) {
  if (state[key].has(value)) {
    state[key].delete(value);
    el.classList.remove("selected");
  } else {
    state[key].add(value);
    el.classList.add("selected");
  }
  renderSelectedRow(key);
}

function renderSelectedRow(key) {
  const row = document.getElementById(`${key}Selected`);
  row.innerHTML = "";
  state[key].forEach(value => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `${escapeHtml(value)} <button type="button" aria-label="Remove">×</button>`;
    chip.querySelector("button").addEventListener("click", () => removeTag(value, key));
    row.appendChild(chip);
  });
}

function removeTag(value, key) {
  state[key].delete(value);
  const picker = document.getElementById(pickerIdFor(key));
  const el = picker.querySelector(`[data-value="${cssEscape(value)}"]`);
  if (el) el.classList.remove("selected");
  renderSelectedRow(key);
}

function pickerIdFor(key) {
  return { traits: "traitPicker", appearance: "appearancePicker", style: "stylePicker" }[key];
}

function cssEscape(str) {
  return str.replace(/["\\]/g, "\\$&");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Custom "add" buttons ----------
document.querySelectorAll(".btn-add").forEach(btn => {
  btn.addEventListener("click", () => addCustomTag(btn));
});

document.querySelectorAll(".custom-add input").forEach(input => {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const btn = input.parentElement.querySelector(".btn-add");
      addCustomTag(btn);
    }
  });
});

function addCustomTag(btn) {
  const inputEl = document.getElementById(btn.dataset.input);
  const key = btn.dataset.list;
  const pickerId = btn.dataset.target;
  const value = inputEl.value.trim();
  if (!value) return;

  const picker = document.getElementById(pickerId);
  let el = picker.querySelector(`[data-value="${cssEscape(value)}"]`);
  if (!el) {
    el = makeTagOption(value, key);
    picker.appendChild(el);
  }
  if (!state[key].has(value)) {
    state[key].add(value);
    el.classList.add("selected");
  }
  renderSelectedRow(key);
  inputEl.value = "";
  inputEl.focus();
}

// ---------- Height slider ----------
const heightRange = document.getElementById("heightRange");
const heightValue = document.getElementById("heightValue");

function updateHeightLabel() {
  const cm = parseInt(heightRange.value, 10);
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  heightValue.textContent = `${feet}'${inches}" (${cm}cm)`;
}
heightRange.addEventListener("input", updateHeightLabel);

// ---------- Profile generation ----------
function collectData() {
  return {
    name: document.getElementById("charName").value.trim(),
    age: document.getElementById("charAge").value.trim(),
    gender: document.getElementById("charGender").value.trim(),
    role: document.getElementById("charRole").value.trim(),
    height: heightValue.textContent,
    outfit: document.getElementById("charOutfit").value.trim(),
    background: document.getElementById("charBackground").value.trim(),
    likes: document.getElementById("charLikes").value.trim(),
    dislikes: document.getElementById("charDislikes").value.trim(),
    greeting: document.getElementById("charGreeting").value.trim(),
    traits: [...state.traits],
    appearance: [...state.appearance],
    style: [...state.style],
    formats: [...document.querySelectorAll('#formatToggles input:checked')].map(cb => cb.value)
  };
}

function generateProfile() {
  const d = collectData();
  const format = document.getElementById("formatStyle").value;
  let text;

  if (format === "json") {
    text = JSON.stringify(d, null, 2);
  } else if (format === "bullets") {
    text = buildBullets(d);
  } else if (format === "plain") {
    text = buildPlain(d);
  } else {
    text = buildMarkdown(d);
  }

  document.getElementById("output").value = text;
  document.getElementById("copyStatus").textContent = "";
}

function line(label, value) {
  return value ? `${label}: ${value}` : "";
}

function buildPlain(d) {
  const parts = [
    d.name && `Name: ${d.name}`,
    line("Age", d.age),
    line("Gender", d.gender),
    line("Role", d.role),
    line("Height", d.height),
    d.appearance.length && `Appearance: ${d.appearance.join(", ")}`,
    line("Outfit", d.outfit),
    d.traits.length && `Personality: ${d.traits.join(", ")}`,
    d.style.length && `Speaking style: ${d.style.join(", ")}`,
    d.formats.length && `Formatting notes: ${d.formats.join(". ")}`,
    d.likes && `Likes: ${d.likes}`,
    d.dislikes && `Dislikes: ${d.dislikes}`,
    d.background && `Background: ${d.background}`,
    d.greeting && `Sample greeting: ${d.greeting}`
  ].filter(Boolean);
  return parts.join("\n");
}

function buildMarkdown(d) {
  const parts = [];
  if (d.name) parts.push(`**${d.name}**`);
  const basics = [line("Age", d.age), line("Gender", d.gender), line("Role", d.role), line("Height", d.height)].filter(Boolean);
  if (basics.length) parts.push(basics.join(" | "));
  if (d.appearance.length) parts.push(`**Appearance:** ${d.appearance.join(", ")}${d.outfit ? `. Wears: ${d.outfit}` : ""}`);
  if (d.traits.length) parts.push(`**Personality:** ${d.traits.join(", ")}`);
  if (d.style.length) parts.push(`**Speaking style:** ${d.style.join(", ")}`);
  if (d.formats.length) parts.push(`**Formatting notes:** ${d.formats.join(". ")}`);
  if (d.likes) parts.push(`**Likes:** ${d.likes}`);
  if (d.dislikes) parts.push(`**Dislikes:** ${d.dislikes}`);
  if (d.background) parts.push(`**Background:** ${d.background}`);
  if (d.greeting) parts.push(`**Sample greeting:** ${d.greeting}`);
  return parts.join("\n\n");
}

function buildBullets(d) {
  const parts = [];
  if (d.name) parts.push(`Character: ${d.name}`);
  if (d.age) parts.push(`- Age: ${d.age}`);
  if (d.gender) parts.push(`- Gender: ${d.gender}`);
  if (d.role) parts.push(`- Role: ${d.role}`);
  if (d.height) parts.push(`- Height: ${d.height}`);
  if (d.appearance.length) parts.push(`- Appearance: ${d.appearance.join(", ")}`);
  if (d.outfit) parts.push(`- Outfit: ${d.outfit}`);
  if (d.traits.length) parts.push(`- Personality: ${d.traits.join(", ")}`);
  if (d.style.length) parts.push(`- Speaking style: ${d.style.join(", ")}`);
  if (d.formats.length) d.formats.forEach(f => parts.push(`- ${f}`));
  if (d.likes) parts.push(`- Likes: ${d.likes}`);
  if (d.dislikes) parts.push(`- Dislikes: ${d.dislikes}`);
  if (d.background) parts.push(`- Background: ${d.background}`);
  if (d.greeting) parts.push(`- Sample greeting: ${d.greeting}`);
  return parts.join("\n");
}

// ---------- Copy button ----------
async function copyOutput() {
  const output = document.getElementById("output");
  const status = document.getElementById("copyStatus");

  if (!output.value.trim()) {
    generateProfile();
  }
  if (!output.value.trim()) {
    status.textContent = "Nothing to copy yet — fill in some details first.";
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    status.textContent = "Copied to clipboard!";
  } catch (err) {
    output.select();
    document.execCommand("copy");
    status.textContent = "Copied to clipboard!";
  }
  setTimeout(() => { status.textContent = ""; }, 2500);
}

// ---------- Init ----------
renderPicker("traitPicker", TRAITS, "traits");
renderPicker("appearancePicker", APPEARANCE, "appearance");
renderPicker("stylePicker", STYLES, "style");
updateHeightLabel();

document.getElementById("generateBtn").addEventListener("click", generateProfile);
document.getElementById("copyBtn").addEventListener("click", copyOutput);
document.getElementById("formatStyle").addEventListener("change", () => {
  if (document.getElementById("output").value.trim()) generateProfile();
});
