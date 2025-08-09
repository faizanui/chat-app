// ==== CONFIG ====
// Firebase config from your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyD4ChiEUTh3FCQ7fVJVmrlio89pjbVc_cE",
  authDomain: "chatapp-9d499.firebaseapp.com",
  databaseURL: "https://chatapp-9d499-default-rtdb.firebaseio.com",
  projectId: "chatapp-9d499",
  storageBucket: "chatapp-9d499.firebasestorage.app",
  messagingSenderId: "246220700767",
  appId: "1:246220700767:web:acee96906cd23138642fea",
  measurementId: "G-4XE1KH0Y4Z"
};
const GIPHY_API_KEY = "GqzktKr2vSIx64H3javR8bmNKmRpXTfX";

// ==== INIT ====
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

// ==== USER LOGIN ====
let username = localStorage.getItem("chatUsername") || prompt("Enter username:");
localStorage.setItem("chatUsername", username);
let userColor = localStorage.getItem("chatUserColor") || "#"+Math.floor(Math.random()*16777215).toString(16);
localStorage.setItem("chatUserColor", userColor);
let userAvatar = localStorage.getItem("userAvatar") || "";
let userStatus = localStorage.getItem("userStatus") || "";

// ==== DOM ====
const chatContainer = document.getElementById("chat-container");
const themeSelector = document.getElementById("themes");
const bgBtn = document.getElementById("bg-btn");
const bgUpload = document.getElementById("bg-upload");
const bgReset = document.getElementById("bg-reset");
const fontSelector = document.getElementById("font-selector");
const grad1 = document.getElementById("grad1"), grad2 = document.getElementById("grad2");
const avatarUpload = document.getElementById("avatar-upload");
const avatarBtn = document.getElementById("avatar-btn"), avatarReset = document.getElementById("avatar-reset");
const userStatusInput = document.getElementById("custom-status");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const typingIndicator = document.getElementById("typing-indicator");
const sendBtn = document.getElementById("send-btn");
const emojiBtn = document.getElementById("emoji-btn");
const stickerBtn = document.getElementById("sticker-btn");
const gifBtn = document.getElementById("gif-btn");
const emojiPicker = document.getElementById("emoji-picker");
const stickerPicker = document.getElementById("sticker-picker");
const gifPicker = document.getElementById("gif-picker");
const gifSearchInput = document.getElementById("gif-search-input");
const gifResults = document.getElementById("gif-results");
const fileInput = document.getElementById("file-input");
const imgBtn = document.getElementById("img-btn");
const audioBtn = document.getElementById("audio-btn");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const exportBtn = document.getElementById("export-btn");
const onlineUsersDiv = document.getElementById("online-users");
const groupSelect = document.getElementById("group-select");
const createGroupBtn = document.getElementById("create-group");
const leaveGroupBtn = document.getElementById("leave-group");
const groupMembersDiv = document.getElementById("group-members");

// ==== PERSONALIZATION ====
const savedTheme = localStorage.getItem("chatTheme") || "theme-light";
chatContainer.classList.remove("theme-light", "theme-dark", "theme-blue", "theme-pink");
chatContainer.classList.add(savedTheme); themeSelector.value = savedTheme;
themeSelector.addEventListener("change", function(){
  chatContainer.classList.remove("theme-light", "theme-dark", "theme-blue", "theme-pink");
  chatContainer.classList.add(this.value); localStorage.setItem("chatTheme",this.value);
});
const savedBg = localStorage.getItem("chatBgImage");
if(savedBg){ chatContainer.classList.add("custom-bg"); chatBox.style.backgroundImage = `url(${savedBg})`; bgReset.style.display = "inline"; }
bgBtn.onclick=()=>bgUpload.click();
bgUpload.onchange=function(e){
  const file = e.target.files[0];
  if(file&&file.type.startsWith("image/")){
    const reader = new FileReader();
    reader.onload=function(evt){
      chatContainer.classList.add("custom-bg");
      chatBox.style.backgroundImage = `url(${evt.target.result})`;
      localStorage.setItem("chatBgImage",evt.target.result); bgReset.style.display = "inline";
    }; reader.readAsDataURL(file);
  }
};
bgReset.onclick=()=>{localStorage.removeItem("chatBgImage");chatBox.style.backgroundImage="";chatContainer.classList.remove("custom-bg");bgReset.style.display="none";};
const savedFont=localStorage.getItem("chatFont")||"'Segoe UI', Arial";
chatBox.style.fontFamily=savedFont; fontSelector.value=savedFont;
fontSelector.onchange=()=>{chatBox.style.fontFamily=fontSelector.value;localStorage.setItem("chatFont",fontSelector.value);};
if(localStorage.getItem("gradColor1")){
  grad1.value=localStorage.getItem("gradColor1");
  grad2.value=localStorage.getItem("gradColor2");
  document.documentElement.style.setProperty("--self-bubble-grad",`linear-gradient(${grad1.value},${grad2.value})`);
}
function updateGrad(){
  document.documentElement.style.setProperty("--self-bubble-grad",`linear-gradient(${grad1.value},${grad2.value})`);
  localStorage.setItem("gradColor1",grad1.value);localStorage.setItem("gradColor2",grad2.value);
}
grad1.oninput=updateGrad; grad2.oninput=updateGrad;
if(userAvatar) avatarReset.style.display="inline";
avatarBtn.onclick=()=>avatarUpload.click();
avatarUpload.onchange=function(e){
  const file = e.target.files[0];
  if(file&&file.type.startsWith("image/")){
    const reader = new FileReader();
    reader.onload=function(evt){userAvatar=evt.target.result;localStorage.setItem("userAvatar",userAvatar);avatarReset.style.display="inline"; setOnlineStatus();}
    reader.readAsDataURL(file);
  }
};
avatarReset.onclick=()=>{localStorage.removeItem("userAvatar");userAvatar="";avatarReset.style.display="none";setOnlineStatus();}
userStatusInput.value=userStatus;
userStatusInput.oninput=function(){userStatus=userStatusInput.value;localStorage.setItem("userStatus",userStatus);setOnlineStatus();}

// ==== COUNTRY FLAG via ipinfo.io ====
let countryCode = localStorage.getItem("myCountryCode") || "UN";
fetch("https://ipinfo.io/json?token=37f0b476f8be30").then(r=>r.json()).then(data=>{
  countryCode = data && data.country ? data.country : "UN";
  localStorage.setItem("myCountryCode",countryCode); setOnlineStatus();
});

// ==== ONLINE USERS PANEL with Last Seen, Sorting, Flags ====
function setOnlineStatus(){
  const myOnlineRef = db.ref("onlineUsers/"+username);
  const myLastSeenRef = db.ref("lastSeen/"+username);
  myOnlineRef.set({name:username,avatar:userAvatar||"",color:userColor,lastActive:Date.now(),country:countryCode,userStatus:userStatus||""});
  setInterval(()=>myOnlineRef.update({lastActive:Date.now()}),5000);
  myOnlineRef.onDisconnect().remove();
  myLastSeenRef.onDisconnect().set(Date.now());
  db.ref("userStatus/"+username).set(userStatus||""); db.ref("userStatus/"+username).onDisconnect().set(userStatus||"");
}
setOnlineStatus();
db.ref("onlineUsers").on("value", snapshot => {
  const onlineUsers = snapshot.val()||{};
  db.ref("lastSeen").once("value").then(lsSnap=>{
    const lastSeenData = lsSnap.val()||{};
    db.ref("userStatus").once("value").then(statusSnap=>{
      const statusMap = statusSnap.val()||{};
      onlineUsersDiv.innerHTML="";
      const allUsers = new Set([...Object.keys(lastSeenData),...Object.keys(onlineUsers)]);
      const userArray = [];
      allUsers.forEach(name=>{
        const uOnline = onlineUsers[name];
        const avatarUrl = (uOnline&&uOnline.avatar)||"https://via.placeholder.com/28";
        const color = (uOnline&&uOnline.color)||"#888";
        const displayName = (uOnline&&uOnline.name)||name;
        const lastActive = (uOnline&&uOnline.lastActive)||lastSeenData[name]||0;
        const isOnline=!!uOnline;
        const country = (uOnline && uOnline.country) || "UN";
        const flag = country!=="UN"?`<img src="https://flagcdn.com/24x18/${country.toLowerCase()}.png" style="width:20px;height:14px;">`:"";
        let statusText;
        if(isOnline)statusText=`<span style="color:green;font-size:12px;">Online</span>`;
        else if(lastActive){
          const minsAgo=Math.floor((Date.now()-lastActive)/60000);
          if(minsAgo<1)statusText=`<span style="color:#888;font-size:12px;">Last seen just now</span>`;
          else if(minsAgo===1)statusText=`<span style="color:#888;font-size:12px;">Last seen 1 min ago</span>`;
          else statusText=`<span style="color:#888;font-size:12px;">Last seen ${minsAgo} mins ago</span>`;
        }else statusText=`<span style="color:#888;font-size:12px;">No data</span>`;
        userArray.push({
          name:displayName,avatar:avatarUrl,color,statusText,isOnline,lastActive,
          country,flag,userStatus:statusMap[name]||""
        });
      });
      userArray.sort((a,b)=>{
        if(a.isOnline&&!b.isOnline)return -1;
        if(!a.isOnline&&b.isOnline)return 1;
        return b.lastActive-b.lastActive;
      });
      userArray.forEach(u=>{
        const entry=document.createElement("div");
        entry.classList.add("user-entry");
        entry.innerHTML = `
          ${u.flag}
          <img src="${u.avatar}">
          <div>
            <span style="color:${u.color};font-weight:bold; font-size:13px;">${u.name}</span>
            <span style="font-size:12px; margin-left:2px;">${u.userStatus?`<em>(${u.userStatus})</em>`:""}</span><br>
            ${u.statusText}
          </div>
        `;
        onlineUsersDiv.appendChild(entry);
      });
    });
  });
});

// ==== GROUP CHAT SELECTOR & CONTROLS ====
let currentGroup = localStorage.getItem("chatGroup") || null;
function loadGroups() {
  db.ref("groups").orderByChild("members/" + username).equalTo(true).on("value", snap => {
    groupSelect.innerHTML = "";
    snap.forEach(child => {
      const groupID = child.key;
      const g = child.val();
      const opt = document.createElement("option");
      opt.value = groupID;
      opt.textContent = g.name + (g.admins && g.admins[username] ? " (Admin)" : "");
      groupSelect.appendChild(opt);
    });
    if (currentGroup && groupSelect.querySelector(`[value="${currentGroup}"]`)) {
      groupSelect.value = currentGroup;
    } else if (groupSelect.options.length) {
      groupSelect.selectedIndex = 0;
      currentGroup = groupSelect.value;
      localStorage.setItem("chatGroup", currentGroup);
    }
    showGroupMembers();
    loadMessages();
  });
}
groupSelect.onchange = function() {
  currentGroup = this.value;
  localStorage.setItem("chatGroup", currentGroup);
  showGroupMembers();
  loadMessages();
};
createGroupBtn.onclick = function() {
  const groupName = prompt("Group name?");
  if (!groupName) return;
  const newGroupRef = db.ref("groups").push();
  newGroupRef.set({
    name: groupName,
    members: { [username]: true },
    admins: { [username]: true },
    created: Date.now()
  });
  currentGroup = newGroupRef.key;
  localStorage.setItem("chatGroup", currentGroup);
  loadGroups();
};
leaveGroupBtn.onclick = function() {
  if (!currentGroup) return;
  if (confirm("Leave this group?")) {
    db.ref(`groups/${currentGroup}/members/${username}`).remove();
    if (groupSelect.options.length > 1) {
      groupSelect.selectedIndex = 0;
      currentGroup = groupSelect.value;
      localStorage.setItem("chatGroup", currentGroup);
    } else {
      currentGroup = null;
      groupSelect.innerHTML = "";
    }
    loadGroups();
    loadMessages();
  }
};
function showGroupMembers() {
  if (!currentGroup) { groupMembersDiv.innerHTML = ""; return; }
  db.ref(`groups/${currentGroup}/members`).once("value").then(snap => {
    let html = "<b>Members:</b>";
    snap.forEach(child => { html += ` ${child.key}`; });
    db.ref(`groups/${currentGroup}/admins`).once("value").then(aSnap => {
      html += "<br><b>Admins:</b>";
      aSnap.forEach(a => { html += ` ${a.key}`; });
      groupMembersDiv.innerHTML = html;
    });
  });
}
loadGroups();

// ==== MULTI-LANGUAGE DICTIONARY ====
const translations = {
  en: { send: "Send", typing: "is typing...", online: "Online", lastSeen: "Last seen", deleted: "This message was deleted" },
  es: { send: "Enviar", typing: "escribiendo...", online: "En línea", lastSeen: "Visto", deleted: "Este mensaje fue eliminado" },
  hi: { send: "भेजें", typing: "टाइप कर रहा है...", online: "ऑनलाइन", lastSeen: "अंतिम बार देखा", deleted: "यह संदेश हटा दिया गया है" }
};
function t(key) {
  const lang = "en"; // or allow user to select
  return translations[lang][key] || translations["en"][key] || key;
}

// ==== PICKERS ====
["😀","😂","😊","😍","😎","😢","👍","🙏","🔥","🎉","❤️"].forEach(e=>{
  const span=document.createElement("span");
  span.textContent=e;span.classList.add("emoji");
  span.onclick=()=>{messageInput.value+=e;emojiPicker.style.display="none";messageInput.focus();}
  emojiPicker.appendChild(span);
});
["https://i.imgur.com/O3GsK0n.png","https://i.imgur.com/Bd0n9cJ.png"].forEach(url=>{
  const img=document.createElement("img");
  img.src=url;img.classList.add("sticker");
  img.onclick=()=>{sendSpecial("",url);stickerPicker.style.display="none";}
  stickerPicker.appendChild(img);
});
emojiBtn.onclick=()=>togglePicker(emojiPicker);
stickerBtn.onclick=()=>togglePicker(stickerPicker);
gifBtn.onclick=()=>togglePicker(gifPicker);
function togglePicker(p){[emojiPicker,stickerPicker,gifPicker].forEach(x=>{if(x!==p)x.style.display="none";});p.style.display=p.style.display==="block"?"none":"block";}
gifSearchInput.addEventListener("keyup",()=>{
  const q=gifSearchInput.value.trim();
  if(q.length<2)return;
  fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=12`)
  .then(r=>r.json()).then(data=>{
    gifResults.innerHTML="";
    data.data.forEach(g=>{
      const img=document.createElement("img");
      img.src=g.images.fixed_height_small.url;
      img.classList.add("gif-thumb");
      img.onclick=()=>{sendSpecial("",g.images.fixed_height.url);gifPicker.style.display="none";};
      gifResults.appendChild(img);
    });
  });
});

// ==== IMAGE / VOICE UPLOAD ====
imgBtn.onclick=()=>fileInput.click();
fileInput.onchange=e=>{
  const file=e.target.files[0]; if(!file) return;
  const ref=storage.ref("chat_images/"+Date.now()+"_"+file.name);
  ref.put(file).then(s=>s.ref.getDownloadURL()).then(url=>sendSpecial("",url));
};
audioBtn.onclick = function(){
  if(!navigator.mediaDevices){alert("Audio recording not supported."); return;}
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks,{type:"audio/webm"});
      const reader = new FileReader();
      reader.onload = function(e){
        sendSpecial("", "", null, e.target.result);
      };
      reader.readAsDataURL(audioBlob);
      stream.getTracks().forEach(t=>t.stop());
    };
    mediaRecorder.start();
    setTimeout(()=>mediaRecorder.stop(),7000); alert("Recording... Will auto-send in 7 seconds.");
  });
};

// ==== AES ENCRYPTION/DECRYPTION ====
const ENCRYPTION_KEY = "groupchat123"; // Shared passphrase for demo, use stronger for real app!
async function encryptAES(text, key) {
  const enc = new TextEncoder();
  const rawKey = await window.crypto.subtle.importKey("raw", enc.encode(key), "AES-GCM", false, ["encrypt"]);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt({name:"AES-GCM",iv}, rawKey, enc.encode(text));
  return btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(encrypted)));
}
async function decryptAES(blob, key) {
  blob = atob(blob);
  const enc = new TextEncoder();
  const iv = new Uint8Array(Array.from(blob).slice(0,12).map(ch=>ch.charCodeAt(0)));
  const data = new Uint8Array(Array.from(blob).slice(12).map(ch=>ch.charCodeAt(0)));
  const rawKey = await window.crypto.subtle.importKey("raw", enc.encode(key), "AES-GCM", false, ["decrypt"]);
  const decrypted = await window.crypto.subtle.decrypt({name:"AES-GCM",iv}, rawKey, data);
  return new TextDecoder().decode(decrypted);
}

// ==== MESSAGE SEND ====
let replyTo = null;
sendBtn.onclick=async function(){
  if(!messageInput.value.trim())return;
  await sendSpecial(messageInput.value.trim(),"",replyTo); messageInput.value=""; replyTo = null;
  document.getElementById("reply-preview")?.remove();
};
// Send all media
async function sendSpecial(text,imgUrl,replyKey=null,audioData=null){
  if (!currentGroup) return alert("No group selected");
  const now=Date.now();
  const timeStr=new Date(now).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  let encryptedText = ""; if (text) encryptedText = await encryptAES(text, ENCRYPTION_KEY);
  db.ref(`groups/${currentGroup}/messages`).push({
    user:username,
    text:encryptedText,
    time:timeStr,
    timestamp:now,
    color:userColor,
    image:imgUrl||"",
    deleted:false,
    edited:false,
    pinned:false,
    replyTo:replyKey||"",
    avatar:userAvatar||"",
    audio: audioData || "",
    seenBy: { [username]: true }
  });
}

// ==== MESSAGE REACTIONS/PIN ====
function addReaction(msgKey, emoji){
  db.ref(`groups/${currentGroup}/messages/${msgKey}/reactions/${encodeURIComponent(username)}`).set(emoji);
}
function togglePin(msgKey, pinned){
  db.ref(`groups/${currentGroup}/messages/${msgKey}`).update({pinned: !pinned});
}

// ==== MESSAGE RECEIVE/RENDER, READ RECEIPTS ====
function markAsSeen(key, m) {
  if(m.user !== username && !m.deleted)
    db.ref(`groups/${currentGroup}/messages/${key}/seenBy/${username}`).set(true);
}
function prepareReply(replyKey, text){
  replyTo = replyKey;
  let preview = document.createElement("div");
  preview.id = "reply-preview";
  preview.className="reply-preview";
  preview.textContent = "Replying to: "+text;
  document.getElementById("reply-preview")?.remove();
  document.getElementById("input-area").prepend(preview);
}
function renderMessage(key, m){
  let row=document.getElementById("msg-"+key);
  if(!row){ row=document.createElement("div"); row.classList.add("message-row"); row.id="msg-"+key; chatBox.appendChild(row);}
  else{row.innerHTML="";}
  const b=document.createElement("div");
  b.classList.add("bubble",m.user===username?"self":"other");
  if(m.pinned) b.classList.add("pinned");
  let avatarHTML = m.avatar ? `<img src="${m.avatar}" class="avatar">` : "";
  let replyHtml = m.replyTo ? `<div class="reply-preview">Reply to: ${document.getElementById("msg-"+m.replyTo)?.querySelector(".bubble .username")?.textContent||""}</div>` : "";
  if(m.deleted){
    b.innerHTML=`<em style="color:grey;">${t("deleted")}</em>`;
  }else{
    decryptAES(m.text||"", ENCRYPTION_KEY).then(decryptedMessage=>{
      b.innerHTML = `${avatarHTML}<span class="username" style="color:${m.color};">${m.user}</span>
      ${replyHtml}
      ${decryptedMessage||""}
      ${m.image?`<br><img src="${m.image}">`: ""}
      ${m.audio?`<br><audio controls src="${m.audio}"></audio>`:""}
      <span class="time">${m.time}${m.edited?" (edited)":""}${renderTicks(m)}</span>
      <div class="reaction-bar" id="react-${key}"></div>`;
    });
  }
  // Pin/edit/delete/reply for own
  if(m.user===username&&!m.deleted){
    const del=document.createElement("span");del.textContent="❌";del.className="delete-btn";del.title="Delete message";
    del.onclick=()=>{if(confirm("Delete this message?"))db.ref(`groups/${currentGroup}/messages/${key}`).update({text:"",image:"",audio:"",deleted:true});};row.appendChild(del);
    if(!m.image && !m.audio && Date.now()-m.timestamp<=15*60*1000){
      const edit=document.createElement("span");edit.textContent="✏️";edit.className="edit-btn";edit.title="Edit message";
      edit.onclick=()=>{const newText=prompt("Edit your message:",m.text);if(newText!==null){encryptAES(newText.trim(),ENCRYPTION_KEY).then(enc=>{db.ref(`groups/${currentGroup}/messages/${key}`).update({text:enc,edited:true});});}};row.appendChild(edit);
    }
    const pin=document.createElement("span");pin.textContent="📍";pin.className="pin-btn";pin.title="Pin/unpin";pin.onclick=()=>togglePin(key,m.pinned);row.appendChild(pin);
    const reply=document.createElement("span");reply.textContent="↩️";reply.className="reply-btn";reply.title="Reply";reply.onclick=()=>prepareReply(key,m.text||"");row.appendChild(reply);
  } else if(!m.deleted){
    const reply=document.createElement("span");reply.textContent="↩️";reply.className="reply-btn";reply.title="Reply";reply.onclick=()=>prepareReply(key,m.text||"");row.appendChild(reply);
  }
  // ---- Reactions ----
  const reactDiv = b.querySelector(".reaction-bar");
  ["👍","😂","❤️","🎉"].forEach(e=>{
    const s=document.createElement("span");s.textContent=e;
    s.onclick=()=>addReaction(key,e);reactDiv.appendChild(s);
  });
  if(m.reactions){ for(const [u,emj] of Object.entries(m.reactions)){ reactDiv.innerHTML += `<span title="${u}">${emj}</span> `; } }
  row.appendChild(b);
  chatBox.scrollTop=chatBox.scrollHeight;
  markAsSeen(key,m);
  // Show notification if unfocused
  decryptAES(m.text||"", ENCRYPTION_KEY).then(mm=>{
    if(m.user!==username&&!m.deleted&&!document.hasFocus()) showNotification(`${m.user}: ${mm}`);
  });
}
function renderTicks(m){
  // ✔ sent, ✔✔ delivered, ✔✔ blue seen by all
  let tick="✔"; const seenUsers = m.seenBy ? Object.keys(m.seenBy).filter(u => u !== m.user) : [];
  if(seenUsers.length>0) tick = "✔✔";
  let allSeen = seenUsers.length>0 && seenUsers.every(u=>m.seenBy[u]);
  let color = allSeen?'#2196F3':'#555';
  return `<span class="ticks" style="color:${color};">${tick}</span>`;
}
function loadMessages() {
  if (!currentGroup) { chatBox.innerHTML = "<em>Select a group to view messages.</em>"; return; }
  db.ref(`groups/${currentGroup}/messages`).off();
  chatBox.innerHTML = "";
  db.ref(`groups/${currentGroup}/messages`).on("child_added", snap => { renderMessage(snap.key, snap.val()); });
  db.ref(`groups/${currentGroup}/messages`).on("child_changed", snap => { renderMessage(snap.key, snap.val()); });
}

// ==== TYPING INDICATOR ====
messageInput.oninput = () => db.ref("typing/"+username).set(messageInput.value ? username : "");
db.ref("typing").on("value", snap => {
  let others = Object.values(snap.val()||{}).filter(v=>v&&v!==username);
  typingIndicator.textContent = others.length ? `${others.join(", ")} is typing...` : "";
});

// ==== SEARCH/EXPORT ====
searchBtn.onclick = function(){
  const val = searchInput.value.trim().toLowerCase();
  if(!val) return;
  db.ref(`groups/${currentGroup}/messages`).once("value").then(snap=>{
    let results = [];
    snap.forEach(child=>{
      const m = child.val();
      decryptAES(m.text||"", ENCRYPTION_KEY).then(decrypted=>{
        if((decrypted && decrypted.toLowerCase().includes(val))||(m.user&&m.user.toLowerCase().includes(val))){
          let r = document.getElementById("msg-"+child.key);
          if(r) r.classList.add("search-row");
        }
      });
    });
  });
};
exportBtn.onclick=function(){
  db.ref(`groups/${currentGroup}/messages`).once("value").then(snap=>{
    let txt = "User,Time,Text\n";
    let promises = [];
    snap.forEach(child=>{
      const m=child.val();
      promises.push(decryptAES(m.text||"", ENCRYPTION_KEY).then(decTxt=>{
        txt += `"${m.user}","${m.time}","${decTxt||""}"\n`;
      }));
    });
    Promise.all(promises).then(()=>{
      let blob=new Blob([txt],{type:"text/csv"});
      let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="chat.csv";a.click();
    });
  });
}

// ==== PUSH NOTIFICATIONS ====
function showNotification(msg) {
  if (Notification.permission === "granted") {
    new Notification("New chat message", { body: msg });
  }
}
if ("Notification" in window && Notification.permission !== "granted") Notification.requestPermission();

// ==== INIT LOAD ====
loadMessages();

