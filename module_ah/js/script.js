
const video = document.querySelector(".video");
const progress = document.querySelector(".progress");
const fill = document.querySelector(".fill");
const thumb = document.querySelector(".thumb");
const player = document.querySelector(".player");

const play_icon = "content/fa32/play.png";
const pause_ico = "content/fa32/pause.png";
const p_img = document.querySelector(".play_button img");

const fsBtn = document.querySelector(".fs_button img");
const expandIco = "content/fa32/expand.png";
const compressIco = "content/fa32/compress.png";

const vol_slider = document.querySelector(".volume_slider");
const vol_btn = document.querySelector(".vol_button img");
const vol_fill = document.querySelector(".volume_fill");
const vol_thumb = document.querySelector(".volume_thumb");

const time = document.querySelector(".time");

const center_icon = document.querySelector(".center_icon");
const center_img = center_icon.querySelector("img");

let uiLocked = false;
let isTyping = false;

video.addEventListener("loadedmetadata", () => {
    progress.max = 100;
});
video.addEventListener("timeupdate", () => {
    if (!video.duration || isDragging) return;
    
    const percent = (video.currentTime / video.duration) * 100;

    progress.value = percent;
    fill.style.width = percent + "%";
    thumb.style.left = percent + "%";
});
progress.addEventListener("input", (e) => {
    if (!video.duration) return;

    const percent = Number(e.target.value);

    video.currentTime = (percent / 100) * video.duration;

    fill.style.width = percent + "%";
    thumb.style.left = percent + "%";
});
function togglePlay() {
    if (video.dataset.ended === "true") {
        restartVideo();
        return;
    }

    if (video.paused) {
        video.play();

        center_img.src = pause_ico;
        p_img.src = pause_ico;
    } else {
        video.pause();

        center_img.src = play_icon;
        p_img.src = play_icon;
    }

    center_icon.classList.add("show");

    setTimeout(() => {
        center_icon.classList.remove("show");
    }, 600);
}

function restartVideo() {
    video.currentTime = 0;
    video.play();
    center_icon.classList.remove("show");

    video.dataset.ended = "false";

    center_img.src = pause_ico;
    p_img.src = pause_ico;
}
function togglefs() {
    if (!document.fullscreenElement) {
        player.requestFullscreen?.();
        fsBtn.src = expandIco;
    } else {
        document.exitFullscreen?.();
        fsBtn.src = compressIco;
    }
}
video.addEventListener("ended", () => {
    center_icon.classList.add("show");
    video.dataset.ended = "true";
    center_img.src = "content/fa32/restart.png";
    p_img.src = "content/fa32/restart.png";
    showControls()
});
video.addEventListener("seeked", () => {
    if (video.currentTime < video.duration) {
        video.dataset.ended = "false";
        center_icon.classList.remove("show");
    }
});


let isDragging = false;

progress.addEventListener("mousedown", () => isDragging = true);
document.addEventListener("mouseup", () => isDragging = false);

progress.addEventListener("input", (e) => {
    if (!video.duration) return;

    const percent = Number(e.target.value);

    video.currentTime = (percent / 100) * video.duration;

    fill.style.width = percent + "%";
    thumb.style.left = percent + "%";
});


vol_slider.addEventListener("input", () => {
    const value = vol_slider.value;
    const volume = value / 100;

    video.volume = volume;

    if (volume === 0) {
        vol_btn.src = "content/fa32/volume/volume-off.png";
    } else if (volume < 0.5) {
        vol_btn.src = "content/fa32/volume/volume-down.png";
    } else {
        vol_btn.src = "content/fa32/volume/volume-up.png";
    }
    vol_fill.style.width = value + "%";
    vol_thumb.style.left = value + "%";
});

let lastVolume = 1;

document.querySelector(".vol_button").addEventListener("click", () => {
    if (video.volume > 0) {
        lastVolume = video.volume;

        video.volume = 0;
        vol_slider.value = 0;

        vol_fill.style.width = "0%";
        vol_thumb.style.left = "0%";

        vol_btn.src = "content/fa32/volume/volume-off.png";
    } else {
        video.volume = lastVolume;
        vol_slider.value = lastVolume * 100;

        vol_fill.style.width = (lastVolume * 100) + "%";
        vol_thumb.style.left = (lastVolume * 100) + "%";

        vol_btn.src = "content/fa32/volume/volume-up.png";
    }
});

const controls = document.querySelector(".controls");
const vignette = document.querySelector(".vignette");

const t_r_pnl= document.querySelector(".top_right_panel");
const t_l_pnl= document.querySelector(".top_left_panel");
let hideTimer;

function showControls() {
    const isDevOrMobile = window.innerWidth < 900;
    if (!isDevOrMobile) {
        controls.classList.remove("hidden");
        vignette.classList.remove("hidden");
        t_l_pnl.classList.remove("hidden");
        t_r_pnl.classList.remove("hidden");
        player.classList.remove("hide-cursor");
        clearTimeout(hideTimer);
        if (video.dataset.ended !== "true" && !uiLocked) {
            hideTimer = setTimeout(() => {
                controls.classList.add("hidden");
                vignette.classList.add("hidden");
                t_l_pnl.classList.add("hidden");
                t_r_pnl.classList.add("hidden");
                player.classList.add("hide-cursor");
            }, 3000); // 3 секунды
        }
    }
}

document.addEventListener("mousemove", showControls);
document.addEventListener("mousedown", showControls);
document.addEventListener("touchstart", showControls);
showControls();









video.addEventListener("click", (e) => {
    if (e.target.closest(".controls")) return;

    togglePlay()
});




function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

video.addEventListener("loadedmetadata", () => {
    time.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
});

video.addEventListener("timeupdate", () => {
    time.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
});

const settings = document.querySelector(".settings_menu");

function toggleSettings() {
    settings.classList.toggle("hidden");
    uiLocked = !settings.classList.contains("hidden");
    showControls();
}
document.addEventListener("click", (e) => {
    const btn = document.querySelector(".s_button");

    if (!settings.contains(e.target) && !btn.contains(e.target)) {
        settings.classList.add("hidden");
    }
});
function openTab(tab) {
    document.querySelector(".quality").classList.add("hidden");
    document.querySelector(".speed").classList.add("hidden");

    document.querySelector("." + tab).classList.remove("hidden");
}
function setSpeed(speed) {
    video.playbackRate = speed;
}
function setQuality(src) {
    const time = video.currentTime;
    const playing = !video.paused;

    video.src = src;
    video.load();

    video.currentTime = 0;

    progress.value = 0;
    fill.style.width = "0";
    thumb.style.left = "0";

    if (playing) video.play();
}

function openTab(tab) {

    document.querySelector(".quality").classList.add("hidden");
    document.querySelector(".speed").classList.add("hidden");

    document.querySelector("." + tab).classList.remove("hidden");

    // reset active
    document.querySelectorAll(".settings_tabs button")
        .forEach(b => b.classList.remove("active"));

    // add active
    if (tab === "quality") {
        document.querySelectorAll(".settings_tabs button")[0].classList.add("active");
    } else {
        document.querySelectorAll(".settings_tabs button")[1].classList.add("active");
    }
}
function setMode(mode) {

    const qualityItems = document.querySelectorAll(".quality_item");
    const speedItems = document.querySelectorAll(".speed_item");

    const tabs = document.querySelectorAll(".tab_btn");

    tabs.forEach(t => t.classList.remove("active"));

    if (mode === "quality") {
        tabs[0].classList.add("active");

        qualityItems.forEach(i => i.classList.remove("hidden"));
        speedItems.forEach(i => i.classList.add("hidden"));
    }

    if (mode === "speed") {
        tabs[1].classList.add("active");

        qualityItems.forEach(i => i.classList.add("hidden"));
        speedItems.forEach(i => i.classList.remove("hidden"));
    }
}
const skipIcon = document.querySelector(".skip_icon");
const skipImg = skipIcon.querySelector("img");

function showSkipIcon(type) {

    skipIcon.classList.remove("back", "forward");

    if (type === "back") {
        skipImg.src = "content/fa32/skiper/b_skip_h.png";
        skipIcon.classList.add("back");
    }

    if (type === "forward") {
        skipImg.src = "content/fa32/skiper/f_skip_h.png";
        skipIcon.classList.add("forward");
    }

    skipIcon.classList.add("show");

    clearTimeout(skipIcon.timer);

    skipIcon.timer = setTimeout(() => {
        skipIcon.classList.remove("show");
    }, 500);
}

document.addEventListener("keydown", (e) => {

    const tag = document.activeElement.tagName;

    if (tag === "INPUT") return;

    if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
    }

    if (e.key === "ArrowLeft") {
        video.currentTime = Math.max(0, video.currentTime - 10);
        showSkipIcon("back");
    }

    if (e.key === "ArrowRight") {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        showSkipIcon("forward");
    }
    console.log("KEY:", e.key);
    if (e.code === "KeyF") {
        e.preventDefault();
        togglefs();
    }
});



const list = document.querySelector(".ep_list");
const dropdown = document.querySelector(".ep_dropdown");

let episodes = [];
let current = 0;

fetch("video/data/test.json")
    .then(r => r.json())
    .then(data => {
        episodes = data.episodes;

        renderEpisodes();
        loadEpisode(0);
    });

function renderEpisodes() {
    list.innerHTML = "";

    episodes.forEach((ep, i) => {
        const div = document.createElement("div");
        div.className = "ep_item";

        div.textContent = ep.name; // 👈 твой JSON

        div.onclick = () => loadEpisode(i);

        list.appendChild(div);
    });
}

function loadEpisode(i) {
    current = i;

    video.src = episodes[i].src;
    //video.play();
    video.load(); 

    progress.value = 0;
    fill.style.width = "0%";
    thumb.style.left = "0%";

    document.querySelectorAll(".ep_item").forEach((el, idx) => {
        el.classList.toggle("active", idx === i);
    });
}

function nextEpisode() {
    if (current < episodes.length - 1) {
        loadEpisode(current + 1);
    }
}

function prevEpisode() {
    if (current > 0) {
        loadEpisode(current - 1);
    }
}

function toggleEpisodes() {
    dropdown.classList.toggle("hidden");
    uiLocked = !dropdown.classList.contains("hidden");
    showControls();
}


const loader = document.querySelector(".loader");

// когда начинается загрузка
video.addEventListener("waiting", () => {
    loader.classList.remove("hidden");
});

// когда можно играть
video.addEventListener("canplay", () => {
    loader.classList.add("hidden");
});

// когда буферится
video.addEventListener("stalled", () => {
    loader.classList.remove("hidden");
});

function seekToTime() {
    const input = document.querySelector(".seek").value.trim();

    if (!input) return;

    let seconds = 0;

    if (input.includes(":")) {
        const [min, sec] = input.split(":").map(Number);
        seconds = (min || 0) * 60 + (sec || 0);
    } else {
        seconds = Number(input) * 60;
    }

    if (isNaN(seconds)) return;

    video.currentTime = seconds;
    video.play();
}
const icons = [
    "content/fa32/correct_skiper/hourglass-1.png",
    "content/fa32/correct_skiper/hourglass-2.png",
    "content/fa32/correct_skiper/hourglass-3.png",
];

let iconIndex = 0;

const seekIcon = document.querySelector("button.seek img");

function changeSeekIcon() {
    iconIndex = (iconIndex + 1) % icons.length;
    seekIcon.src = icons[iconIndex];
}
video.addEventListener("seeking", () => {
    changeSeekIcon();
});
document.addEventListener("focusin", (e) => {
    if (e.target.tagName === "INPUT") {
        isTyping = true;
        uiLocked = true;
    }
});

document.addEventListener("focusout", (e) => {
    if (e.target.tagName === "INPUT") {
        isTyping = false;
        uiLocked = false;
        showControls();
    }
});



function toggleMobileMode() {
    document.body.classList.toggle("mobile_mode");

    const img = document.querySelector(".top_right_panel button img");

    const seek = document.querySelector(".seek");
    const settingsBtn = document.querySelector(".s_button");
    const volume = document.querySelector(".volume");

    const rightPanel = document.querySelector(".top_right_panel");
    const leftPanel = document.querySelector(".top_left_panel");
    const r_b = document.querySelector(".r_b");
    const l_b = document.querySelector(".l_b");
    const isMobile = document.body.classList.contains("mobile_mode");

    if (isMobile) {
        // переносим в правый блок
        rightPanel.appendChild(seek);
        rightPanel.appendChild(settingsBtn);

        // volume в левый (если ещё не там)
        leftPanel.appendChild(volume);

        img.src = "content/fa32/mode/pc.png";
    } else {
        l_b.appendChild(volume);

        r_b.appendChild(settingsBtn);
        r_b.appendChild(seek);

        img.src = "content/fa32/mode/phone.png";
    }
}