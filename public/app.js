const templates = ["template (1).png", "template (2).png", "template (3).png", "template (4).png", "template (5).png", "template (6).png", "template (7).png", "template (8).png",  "template (9).png"];
const example = ["template (1).png", "template (2).png", "template (3).png", "template (4).png", "template (5).png", "template (6).png", "template (7).png", "template (8).png",  "template (9).png"];
const templateTitles = ["Strawberry Delight", "Cute Vintage", "Apple Blossom", "Blueberry Dream", "Ocean Breeze", "Scrapbook Chic", "Red Velvet", "Spiderman Fun", "Floral Fantasy"];
let currentIndex = 0;
let selectedTemplate = templates[0];

const stageTemplate = document.getElementById("stage-template");
const stageCamera = document.getElementById("stage-camera");
const carouselImg = document.getElementById("carouselImg");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const useTemplateBtn = document.getElementById("useTemplateBtn");
const exampleStack = document.getElementById("exampleStack");
const backBtn = document.getElementById("backBtn");
const startBtn = document.getElementById("startBtn");
const Timer = document.getElementById("fiveMinTimer");
const previous = document.getElementById("prev");
const next = document.getElementById("next");

const cameraVideo = document.getElementById("camera");
const currentTemplateName = document.getElementById("currentTemplateName");
const captureBtn = document.getElementById("captureBtn");
const countdownEl = document.getElementById("countdown");

const previewPopup = document.getElementById("previewPopup");
const previewFinal = document.getElementById("previewFinal");
const saveBtn = document.getElementById("saveBtn");
const retakeBtn = document.getElementById("retakeBtn");

const savedList = document.getElementById("savedList");

startBtn.onclick = () => {
  document.querySelector(".main-menu").classList.add("hidden");
  stageTemplate.classList.remove("hidden");
  Timer.classList.remove("hidden");
  startTimer(330, true);
};

function showCarousel(i){
  currentIndex = (i + templates.length) % templates.length;
  carouselImg.src = "example/" + example[currentIndex];
  previous.src = "example/" + templates[(currentIndex - 1 + templates.length) % templates.length];
  next.src = "example/" + templates[(currentIndex + 1) % templates.length];
  selectedTemplate = "templates/" + templates[currentIndex];
  renderExampleUsage(selectedTemplate);
}
prevBtn.onclick = ()=> showCarousel(currentIndex-1);
previous.onclick = ()=> showCarousel(currentIndex-1);
nextBtn.onclick = ()=> showCarousel(currentIndex+1);
next.onclick = ()=> showCarousel(currentIndex+1);

function renderExampleUsage(templatePath){
  exampleStack.innerHTML = "";
  for(let k=0;k<3;k++){
    const box = document.createElement("div");
    box.style.width="133px"; box.style.height="225px"; box.style.position="relative";
    box.style.borderRadius="8px"; box.style.overflow="hidden"; box.style.background="#222";
    const bg = document.createElement("div");
    bg.style.width="100%"; bg.style.height="100%"; bg.style.background=`linear-gradient(180deg,#444,#111)`;
    box.appendChild(bg);

    const overlay = document.createElement("img");
    overlay.src = templatePath;
    overlay.style.position="absolute"; overlay.style.left=0; overlay.style.top=0;
    overlay.style.width="100%"; overlay.style.height="100%"; overlay.style.objectFit="cover";
    box.appendChild(overlay);

    exampleStack.appendChild(box);
  }
}

showCarousel(0);

useTemplateBtn.onclick = async () => {
  stageTemplate.classList.add("hidden");
  stageCamera.classList.remove("hidden");
  currentTemplateName.innerText = templateTitles[currentIndex];
  await startCamera();
  startSSE(); 
};

backBtn.onclick = () => {
  stageCamera.classList.add("hidden");
  stageTemplate.classList.remove("hidden");
}

async function startCamera(){
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width:1280, height:720 }, audio:false });
    cameraVideo.srcObject = stream;
    await cameraVideo.play();
  } catch (err) {
    alert("Gagal mengakses kamera: " + err.message);
    console.error(err);
  }
}

let shutterFlashEl = null;
function flashScreen(duration = 160) {
  if (!shutterFlashEl) {
    shutterFlashEl = document.createElement("div");
    shutterFlashEl.id = "shutterFlash";
    shutterFlashEl.className = "shutter-flash";
    document.body.appendChild(shutterFlashEl);
  }
  shutterFlashEl.style.transition = `opacity ${duration}ms ease-out`;
  shutterFlashEl.style.opacity = "1";
  void shutterFlashEl.offsetWidth;
  setTimeout(() => {
    shutterFlashEl.style.opacity = "0";
    const shutter = document.getElementById("shutterFlash");
    shutter.remove();
    shutterFlashEl = null;
  }, 30);
}

function playShutter(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(1000, ctx.currentTime);
    g.gain.setValueAtTime(1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.16);
  } catch(e){
    console.warn("audio not available", e);
    flashScreen(160);
  }
}

function playCountdown(){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(1000, ctx.currentTime);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.16);
  } catch(e){
    console.warn("audio not available", e);
  }
}

function showCountdownAnim(n){
  return new Promise(resolve=>{
    playCountdown();
    countdownEl.style.opacity = 1;
    countdownEl.innerText = n;
    countdownEl.style.transform = "scale(1.2)";
    countdownEl.style.transition = "transform 300ms ease, opacity 200ms";
    setTimeout(()=>{
      countdownEl.style.transform = "scale(1.0)";
    },80);
    setTimeout(()=>{
      countdownEl.style.opacity = 0;
      resolve();
    },900);
  });
}

function captureImage(){
  const canvas = document.createElement("canvas");
  canvas.width = 1280; canvas.height = 720;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function mergeImages(listOfBase64, overlaySrc){
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 2160;
  const ctx = canvas.getContext("2d");

  const num = 3;
  const paddingX = 109;
  const paddingTop = 80;
  const paddingBottom = 43;
  const BottomSpacing = 148;
  const gapBetween = 45;

  const availableHeight = canvas.height - paddingTop - paddingBottom - BottomSpacing - gapBetween * (num - 1);
  const slotH = availableHeight / num;
  const slotW = canvas.width - paddingX * 2;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < num; i++) {
    const img = await loadImage(listOfBase64[i]);
    const scale = Math.min(slotW / img.width, slotH / img.height);
    const drawW = Math.round(img.width * scale);
    const drawH = Math.round(img.height * scale);

    const x = Math.round(paddingX + (slotW - drawW) / 2);
    const y = Math.round(paddingTop + i * (slotH + gapBetween) + (slotH - drawH) / 2);

    ctx.drawImage(img, x, y, drawW, drawH);
  }

  const overlay = await loadImage(overlaySrc);
  ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}

function loadImage(src){
  return new Promise((res, rej)=>{
    const img = new Image();
    img.onload = ()=>res(img);
    img.onerror = e=>rej(e);
    img.src = src;
  });
}

captureBtn.onclick = async ()=>{
  captureBtn.disabled = true;
  const captures = [];
  for(let i=0;i<3;i++){
    for(let n=5; n>=1; n--){
      await showCountdownAnim(n);
    }
    playShutter();
    flashScreen(160);
    const data = captureImage();
    captures.push(data);
    await new Promise(r => setTimeout(r, 500));
  }

  const finalData = await mergeImages(captures, selectedTemplate);
  previewFinal.src = finalData;
  previewPopup.classList.remove("hidden");
  captureBtn.disabled = false;
};

document.addEventListener("keydown", (e)=>{
  const isSpace = e.code === "Space" || e.key === " " || e.key === "Spacebar";
  if (!isSpace) return;

  const target = e.target;
  const tag = target && target.tagName ? target.tagName.toLowerCase() : "";
  const isEditable = (target && (target.isContentEditable)) || tag === "input" || tag === "textarea" || (target && target.getAttribute && target.getAttribute("role") === "textbox");
  if (isEditable) return;

  e.preventDefault();
  if (captureBtn && !captureBtn.disabled) {
    captureBtn.click();
  }
});

saveBtn.onclick = async ()=>{
  try {
    saveBtn.disabled = true;
    const base64 = previewFinal.src;
    const res = await fetch("/save", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ imageBase64: base64 })
    });
    const data = await res.json();
    if(data && data.path){
      alert("Tersimpan: " + data.path);
    } else {
      alert("Gagal menyimpan");
    }
    previewPopup.classList.add("hidden");
  } catch(err){
    console.error(err); alert("Error saat menyimpan: "+err.message);
  } finally {
    saveBtn.disabled = false;
  }
};

retakeBtn.onclick = ()=> previewPopup.classList.add("hidden");

let evtSource = null;
function startSSE(){
  if(evtSource) return;
  evtSource = new EventSource("/events");
  evtSource.addEventListener("saved", e=>{
    try {
      const d = JSON.parse(e.data);
      addSavedItem(d.path, d.filename, d.date);
    } catch(err){ console.error(err); }
  });
  evtSource.onopen = ()=> console.log("SSE connected");
  evtSource.onerror = e=> console.warn("SSE error", e);
}

function addSavedItem(publicPath, filename, dateFolder){
  const item = document.createElement("div");
  item.className = "saved-item";
  const img = document.createElement("img");
  img.src = publicPath;
  img.alt = filename;
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `<div>${filename}</div><div>${dateFolder}</div>`;
  const del = document.createElement("button");
  del.textContent = "Hapus";
  del.style.marginLeft="auto";

  del.onclick = async ()=> {
    if(!confirm("Hapus file dari disk?")) return;
    del.disabled = true;
    try {
      let sendPath = publicPath;
      try {
        const u = new URL(publicPath, window.location.href);
        sendPath = u.pathname;
      } catch (e) {
        console.warn("Invalid URL for path:", publicPath);
      }

      const res = await fetch("/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: sendPath })
      });

      const contentType = res.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) {
        data = await res.json().catch(()=>null);
      } else {
        const text = await res.text().catch(()=>"");
        console.warn("Non-JSON response from delete-image:", text.slice(0,200));
      }

      if (res.ok && data && data.success) {
        item.remove();
        console.log("Deleted:", sendPath);
      } else {
        const errMsg = (data && data.error) ? data.error : (res.statusText || "Unknown error");
        alert("Gagal menghapus: " + errMsg);
      }
    } catch(err){
      console.error("Delete error", err);
      alert("Error saat menghapus: " + err.message);
    } finally {
      del.disabled = false;
    }
  };

  console.log("Adding saved item:", publicPath, filename, dateFolder);

  item.appendChild(img);
  item.appendChild(meta);
  item.appendChild(del);
  savedList.prepend(item);
}

async function loadInitialSaved(){
  console.log("Loading initial saved images...");
}

loadInitialSaved();

let TimeInterval = null;
let TimeRemaining = 300;

function formatTime(seconds){
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
}

function stopTimer(){
  if(TimeInterval){
    clearInterval(TimeInterval);
    TimeInterval = null;
  }
}

function startTimer(durationSec = 300, showAlert = true){
  stopTimer();
  TimeRemaining = durationSec;
  const el = document.getElementById("fiveMinTimer");
  if(el) el.textContent = formatTime(TimeRemaining);

  TimeInterval = setInterval(()=>{
    TimeRemaining--;
    if(el) el.textContent = formatTime(TimeRemaining);
    if(TimeRemaining <= 0){
      stopTimer();
      if(showAlert) alert("Waktu 5 menit telah habis");
      setTimeout(()=> {
        return window.location.reload();
      }, 5000);
    } else if(TimeRemaining <= 10){
      el.classList.add("timer-warning");
    }
  }, 1000);
}
