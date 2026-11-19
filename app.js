const KEY = "solvik_v3_insta_style";

const seed = {
  user: {
    username: "leo_p",
    bio: "Créateur de Solvik • Open Source & mobile-first",
    vip: false,
    passCount: 0,
    joined: false
  },
  filter: "all",
  cardStyle: "none",
  activePostId: null,
  activeChat: null,
  stories: [
    { user: "mael_k", vip: true, text: "Pass du mois actif 🔥", bg: "bg-gold" },
    { user: "sara_dev", vip: false, text: "Test du mode mobile sur iPhone 📱", bg: "bg-neon" },
    { user: "nolan_91", vip: false, text: "Qui lance le prochain défi ? 👀", bg: "bg-sunset" },
    { user: "camille_x", vip: false, text: "Vibe du soir #vibe ✨", bg: "bg-mint" }
  ],
  posts: [
    {
      id: 1,
      author: "mael_k",
      avatarBg: "bg-gold",
      vip: true,
      cardStyle: "card-sunset",
      time: "14 min",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=75",
      caption: "Soirée de ouf, le badge Pass Solvik est gratuit ce mois-ci et ça change tout #solvik #pass #vibe",
      reactions: { fire: 32, skull: 4, heart: 19 },
      userReacted: [],
      saved: false,
      comments: [
        { author: "sara_dev", text: "Le rendu sur téléphone est super propre 🔥" }
      ]
    },
    {
      id: 2,
      author: "sara_dev",
      avatarBg: "bg-neon",
      vip: false,
      cardStyle: "card-neon",
      time: "42 min",
      image: "",
      caption: "Enfin un réseau ouvert, léger sur mobile et où t'as pas besoin de vendre un rein pour avoir du style #solvik #dev",
      reactions: { fire: 21, skull: 2, heart: 14 },
      userReacted: [],
      saved: false,
      comments: []
    },
    {
      id: 3,
      author: "nolan_91",
      avatarBg: "bg-sunset",
      vip: false,
      cardStyle: "none",
      time: "1 h",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=75",
      caption: "Petit défi du week-end : qui poste la meilleure photo ou idée avant dimanche ? #défi #vibe",
      reactions: { fire: 27, skull: 6, heart: 11 },
      userReacted: [],
      saved: false,
      comments: []
    }
  ],
  chats: {
    mael_k: {
      bg: "bg-gold",
      vip: true,
      messages: [
        { from: "them", text: "Wshh Solvik a grave plus de gueule comme ça 🔥" },
        { from: "them", text: "Tu as testé le mode Pass dessus ?" }
      ]
    },
    sara_dev: {
      bg: "bg-neon",
      vip: false,
      messages: [
        { from: "them", text: "J'ai liké ton dernier post, le style est clean !" }
      ]
    },
    nolan_91: {
      bg: "bg-sunset",
      vip: false,
      messages: [
        { from: "them", text: "Dis-moi quand on lance un défi sur le feed !" }
      ]
    }
  },
  notifs: [
    { title: "Pass Solvik", desc: "@mael_k brille avec le badge Pass du mois", time: "12 min" },
    { title: "Réactions", desc: "Ton fil gagne en activité #solvik", time: "1 h" }
  ]
};

let db = JSON.parse(localStorage.getItem(KEY)) || seed;

function persist() {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function initials(name) {
  return name.slice(0, 2).toUpperCase();
}

function linkifyTags(txt) {
  return txt.replace(/(#[a-zA-Z0-9_àâäéèêëîïôöùûüç]+)/g, '<span class="tag-link">$1</span>');
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.tTimer);
  window.tTimer = setTimeout(() => el.classList.remove("show"), 2000);
}

function goView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.target === name));
  const target = document.getElementById(`view-${name}`);
  if (target) target.classList.add("active");
}

function syncProfile() {
  const vip = db.user.vip;
  document.getElementById("app-shell").classList.toggle("vip-active", vip);
  document.getElementById("brand-badge").textContent = vip ? "PASS ACTIF • VIP" : "MOBILE • OPEN";
  document.getElementById("account-username").textContent = `@${db.user.username}`;
  document.getElementById("account-bio").textContent = db.user.bio;

  const av = document.getElementById("account-avatar");
  av.textContent = initials(db.user.username);
  av.className = `avatar lg ${vip ? "bg-gold" : "bg-neon"}`;

  document.getElementById("account-vip-badge").classList.toggle("hidden", !vip);
  document.getElementById("pass-state-pill").textContent = vip ? "ACTIF ✓" : "STANDARD";
  document.getElementById("stat-pass").textContent = db.user.passCount;
  document.getElementById("join-pass-btn").textContent = db.user.joined
    ? "Inscrit au tirage gratuit ✓"
    : "Participer gratuitement au tirage";
}

function renderStories() {
  const strip = document.getElementById("stories-strip");
  strip.innerHTML = db.stories
    .map(
      (s, i) => `
      <div class="story-item" data-story="${i}">
        <div class="story-ring ${s.vip ? "vip" : ""}">
          <div class="story-inner ${s.bg}">${initials(s.user)}</div>
        </div>
        <span>@${s.user}</span>
      </div>
    `
    )
    .join("");
}

function totalReactions(post) {
  return post.reactions.fire + post.reactions.skull + post.reactions.heart;
}

function cardHTML(post) {
  const isMine = post.author === db.user.username;
  const r = post.userReacted || [];
  return `
    <article class="insta-card ${post.vip ? "vip-card" : ""} ${post.cardStyle && post.cardStyle !== "none" ? post.cardStyle : ""}">
      <div class="insta-head">
        <div class="insta-user">
          <div class="avatar ${post.vip ? "bg-gold" : post.avatarBg}">${initials(post.author)}</div>
          <div>
            <div class="user-line">
              <strong>@${post.author}</strong>
              ${post.vip ? '<span class="badge-vip">PASS</span>' : ""}
            </div>
            <span class="time-txt">${post.time}</span>
          </div>
        </div>
        ${isMine ? `<button class="ghost-btn" data-del="${post.id}">Suppr.</button>` : ""}
      </div>

      ${post.image ? `<img class="insta-photo" src="${post.image}" alt="Post de @${post.author}" loading="lazy" />` : ""}

      <div class="insta-body">
        <p class="insta-caption">${linkifyTags(post.caption)}</p>
        <div class="insta-bar">
          <div class="reactions-group">
            <button class="react-btn ${r.includes("fire") ? "active" : ""}" data-react="${post.id}:fire">🔥 ${post.reactions.fire}</button>
            <button class="react-btn ${r.includes("heart") ? "active" : ""}" data-react="${post.id}:heart">💕 ${post.reactions.heart}</button>
            <button class="react-btn ${r.includes("skull") ? "active" : ""}" data-react="${post.id}:skull">💀 ${post.reactions.skull}</button>
          </div>
          <div class="extra-btns">
            <button class="ghost-btn" data-comment="${post.id}">💬 ${post.comments.length}</button>
            <button class="ghost-btn ${post.saved ? "saved" : ""}" data-save="${post.id}">${post.saved ? "★" : "☆"}</button>
            ${!isMine ? `<button class="ghost-btn" data-chat="${post.author}">MP</button>` : ""}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderAll() {
  const feedEl = document.getElementById("feed-list");
  const mineEl = document.getElementById("my-posts-list");

  let items = [...db.posts];
  if (db.filter === "trending") items.sort((a, b) => totalReactions(b) - totalReactions(a));
  if (db.filter === "vip") items = items.filter((p) => p.vip);
  if (db.filter === "saved") items = items.filter((p) => p.saved);

  feedEl.innerHTML = items.length
    ? items.map(cardHTML).join("")
    : `<p style="color:var(--muted);text-align:center;padding:24px;font-size:0.86rem;">Aucun post dans ce filtre pour l'instant.</p>`;

  const mine = db.posts.filter((p) => p.author === db.user.username);
  mineEl.innerHTML = mine.length
    ? mine.map(cardHTML).join("")
    : `<p style="color:var(--muted);text-align:center;padding:16px;font-size:0.84rem;">Appuie sur + pour poster ton premier truc.</p>`;

  document.getElementById("stat-posts").textContent = mine.length;
  document.getElementById("stat-likes").textContent = mine.reduce((acc, p) => acc + totalReactions(p), 0);

  renderExplore(document.getElementById("search-input").value);
}

function renderExplore(q = "") {
  const query = q.trim().toLowerCase();
  const grid = document.getElementById("explore-grid");
  const res = document.getElementById("search-results");

  grid.innerHTML = db.posts
    .map(
      (p) => `
      <div class="explore-tile" data-jump="${p.id}">
        ${p.image ? `<img src="${p.image}" alt="" />` : `<span>${p.caption.slice(0, 42)}</span>`}
      </div>
    `
    )
    .join("");

  const matches = db.posts.filter(
    (p) => p.author.toLowerCase().includes(query) || p.caption.toLowerCase().includes(query)
  );
  res.innerHTML = matches.map(cardHTML).join("");
}

function renderInbox() {
  const list = document.getElementById("mp-list");
  list.innerHTML = Object.entries(db.chats)
    .map(([user, c]) => {
      const last = c.messages[c.messages.length - 1];
      return `
        <div class="mp-item" data-chat="${user}">
          <div class="avatar ${c.bg}">${initials(user)}</div>
          <div>
            <strong>@${user} ${c.vip ? '<span class="badge-vip">PASS</span>' : ""}</strong>
            <p>${last ? last.text : "Nouvelle discussion"}</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function openRoom(user) {
  if (!db.chats[user]) {
    db.chats[user] = { bg: "bg-neon", vip: false, messages: [{ from: "them", text: "Salut ! On se capte ici ?" }] };
  }
  db.activeChat = user;
  goView("mp");
  document.getElementById("mp-list-view").classList.add("hidden");
  document.getElementById("mp-room-view").classList.remove("hidden");
  document.getElementById("room-username").textContent = `@${user}`;
  renderMessages();
}

function sendMsg(text) {
  const clean = text.trim();
  if (!clean || !db.activeChat) return;
  const user = db.activeChat;
  db.chats[user].messages.push({ from: "me", text: clean });
  persist();
  renderMessages();

  setTimeout(() => {
    db.chats[user].messages.push({ from: "them", text: "Bien reçu 🔥 Solvik est grave fluide !" });
    persist();
    if (db.activeChat === user) renderMessages();
  }, 650);
}

function renderMessages() {
  const box = document.getElementById("chat-box");
  const msgs = db.chats[db.activeChat]?.messages || [];
  box.innerHTML = msgs.map((m) => `<div class="msg-bubble ${m.from}">${m.text}</div>`).join("");
  box.scrollTop = box.scrollHeight;
}

function openComments(id) {
  db.activePostId = id;
  const post = db.posts.find((p) => p.id === id);
  const box = document.getElementById("comments-list");
  box.innerHTML = post.comments.length
    ? post.comments.map((c) => `<div class="comment-row"><strong>@${c.author}</strong> : ${c.text}</div>`).join("")
    : `<p style="color:var(--muted);font-size:0.82rem;">Sois le premier à commenter.</p>`;
  document.getElementById("comment-sheet").classList.add("open");
}

document.querySelectorAll(".nav-btn").forEach((b) => b.addEventListener("click", () => goView(b.dataset.target)));

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    db.filter = chip.dataset.filter;
    renderAll();
  });
});

document.getElementById("banner-to-pass").addEventListener("click", () => goView("pass"));
document.getElementById("open-mp-btn").addEventListener("click", () => {
  document.getElementById("mp-list-view").classList.remove("hidden");
  document.getElementById("mp-room-view").classList.add("hidden");
  renderInbox();
  goView("mp");
});
document.getElementById("close-mp-btn").addEventListener("click", () => goView("accueil"));
document.getElementById("back-mp-list").addEventListener("click", () => {
  document.getElementById("mp-room-view").classList.add("hidden");
  document.getElementById("mp-list-view").classList.remove("hidden");
  renderInbox();
});

document.getElementById("open-notif-btn").addEventListener("click", () => {
  document.getElementById("notif-dot").style.display = "none";
  document.getElementById("notif-list").innerHTML = db.notifs
    .map((n) => `<div class="notif-item"><div><strong>${n.title}</strong><p>${n.desc} • ${n.time}</p></div></div>`)
    .join("");
  goView("notifs");
});
document.getElementById("close-notif-btn").addEventListener("click", () => goView("accueil"));

const createSheet = document.getElementById("create-sheet");
document.getElementById("open-create-btn").addEventListener("click", () => createSheet.classList.add("open"));
document.getElementById("close-create-btn").addEventListener("click", () => createSheet.classList.remove("open"));

document.querySelectorAll(".theme-dot").forEach((dot) => {
  dot.addEventListener("click", () => {
    document.querySelectorAll(".theme-dot").forEach((d) => d.classList.remove("active"));
    dot.classList.add("active");
    db.cardStyle = dot.dataset.cardStyle;
  });
});

document.querySelectorAll(".add-hash").forEach((btn) => {
  btn.addEventListener("click", () => {
    const ta = document.getElementById("post-caption");
    ta.value = `${ta.value} ${btn.dataset.hash}`.trim() + " ";
    ta.focus();
  });
});

document.getElementById("submit-post-btn").addEventListener("click", () => {
  const ta = document.getElementById("post-caption");
  const imgInput = document.getElementById("post-image-url");
  const caption = ta.value.trim();
  if (!caption) return;

  db.posts.unshift({
    id: Date.now(),
    author: db.user.username,
    avatarBg: db.user.vip ? "bg-gold" : "bg-neon",
    vip: db.user.vip,
    cardStyle: db.cardStyle,
    time: "à l'instant",
    image: imgInput.value.trim(),
    caption,
    reactions: { fire: 1, skull: 0, heart: 0 },
    userReacted: ["fire"],
    saved: false,
    comments: []
  });

  ta.value = "";
  imgInput.value = "";
  createSheet.classList.remove("open");
  persist();
  renderAll();
  goView("accueil");
  toast("Post publié sur Solvik 🔥");
});

document.addEventListener("click", (e) => {
  const story = e.target.closest("[data-story]");
  if (story) {
    const s = db.stories[Number(story.dataset.story)];
    toast(`@${s.user} : ${s.text}`);
  }

  const reactBtn = e.target.closest("[data-react]");
  if (reactBtn) {
    const [idStr, type] = reactBtn.dataset.react.split(":");
    const post = db.posts.find((p) => p.id === Number(idStr));
    if (post) {
      post.userReacted = post.userReacted || [];
      const idx = post.userReacted.indexOf(type);
      if (idx >= 0) {
        post.userReacted.splice(idx, 1);
        post.reactions[type] = Math.max(0, post.reactions[type] - 1);
      } else {
        post.userReacted.push(type);
        post.reactions[type] += 1;
      }
      persist();
      renderAll();
    }
  }

  const comBtn = e.target.closest("[data-comment]");
  if (comBtn) openComments(Number(comBtn.dataset.comment));

  const saveBtn = e.target.closest("[data-save]");
  if (saveBtn) {
    const post = db.posts.find((p) => p.id === Number(saveBtn.dataset.save));
    if (post) {
      post.saved = !post.saved;
      persist();
      renderAll();
      toast(post.saved ? "Post enregistré" : "Retiré des enregistrés");
    }
  }

  const delBtn = e.target.closest("[data-del]");
  if (delBtn) {
    db.posts = db.posts.filter((p) => p.id !== Number(delBtn.dataset.del));
    persist();
    renderAll();
    toast("Post supprimé");
  }

  const chatBtn = e.target.closest("[data-chat]");
  if (chatBtn) openRoom(chatBtn.dataset.chat);

  const jumpBtn = e.target.closest("[data-jump]");
  if (jumpBtn) {
    goView("accueil");
    toast("Post mis en avant dans le fil");
  }
});

document.getElementById("close-comment-btn").addEventListener("click", () => {
  document.getElementById("comment-sheet").classList.remove("open");
});

document.getElementById("comment-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = document.getElementById("comment-input");
  const txt = inp.value.trim();
  if (!txt) return;
  const post = db.posts.find((p) => p.id === db.activePostId);
  if (post) {
    post.comments.push({ author: db.user.username, text: txt });
    inp.value = "";
    persist();
    openComments(post.id);
    renderAll();
  }
});

document.querySelectorAll(".quick-msg").forEach((btn) => {
  btn.addEventListener("click", () => sendMsg(btn.dataset.q));
});

document.getElementById("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = document.getElementById("chat-input");
  sendMsg(inp.value);
  inp.value = "";
});

document.getElementById("search-input").addEventListener("input", (e) => renderExplore(e.target.value));
document.querySelectorAll(".chip-tag").forEach((c) => {
  c.addEventListener("click", () => {
    document.getElementById("search-input").value = c.dataset.tag;
    renderExplore(c.dataset.tag);
  });
});

document.getElementById("join-pass-btn").addEventListener("click", () => {
  db.user.joined = true;
  persist();
  syncProfile();
  toast("Tu es inscrit au tirage gratuit du Pass !");
});

document.getElementById("simulate-win-btn").addEventListener("click", () => {
  db.user.vip = !db.user.vip;
  if (db.user.vip) db.user.passCount += 1;
  db.posts.forEach((p) => {
    if (p.author === db.user.username) {
      p.vip = db.user.vip;
      p.avatarBg = db.user.vip ? "bg-gold" : "bg-neon";
    }
  });
  persist();
  syncProfile();
  renderAll();
  toast(db.user.vip ? "Mode Pass Solvik activé ✨" : "Mode Standard rétabli");
});

document.getElementById("open-edit-btn").addEventListener("click", () => {
  document.getElementById("edit-name-input").value = db.user.username;
  document.getElementById("edit-bio-input").value = db.user.bio;
  document.getElementById("edit-sheet").classList.add("open");
});

document.getElementById("close-edit-btn").addEventListener("click", () => {
  document.getElementById("edit-sheet").classList.remove("open");
});

document.getElementById("save-edit-btn").addEventListener("click", () => {
  const newName = document.getElementById("edit-name-input").value.trim().replace(/^@/, "");
  const newBio = document.getElementById("edit-bio-input").value.trim();
  if (newName) {
    const old = db.user.username;
    db.user.username = newName;
    db.posts.forEach((p) => {
      if (p.author === old) p.author = newName;
    });
  }
  db.user.bio = newBio || db.user.bio;
  persist();
  syncProfile();
  renderAll();
  document.getElementById("edit-sheet").classList.remove("open");
  toast("Profil sauvegardé");
});

let sec = 11 * 86400 + 4 * 3600 + 32 * 60 + 10;
setInterval(() => {
  if (sec > 0) sec--;
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  document.getElementById("pass-countdown").textContent =
    `${d}j ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}, 1000);

syncProfile();
renderStories();
renderAll();
renderInbox();