class akiros_hexed_player extends HTMLElement {
  constructor() {
    console.log("component mounted");
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();   // HTML
    this.cache();    // querySelector внутри shadow
    this.bind();     // события
    this.init();     // логика (episodes, video load и т.д.)
  }

  render() {this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="module_ah/css/css.css">

    <div class="player">
        <div class="loader hidden"></div>
        <div class="center_icon">
            <img src="content/fa32/play.png" alt="no alt">
        </div>
        <div class="skip_icon">
            <img src="" alt="">
        </div>
        <div class="vignette"></div>
        <video class="video">
            <source src="video/0afc058184599bdebfab9cd8cc7417ee.mp4" type="video/mp4">
        </video> <!--removed "controls" redone-->
        
        <div class="top_left_panel">

            <button class="ep_btn" onclick="toggleEpisodes()">Серии ▾</button>

            <div class="ep_nav">
                <button onclick="prevEpisode()"><img src="content/fa32/skiper/b_skip_s.png" alt="no alt"></button>
                <button onclick="nextEpisode()"><img src="content/fa32/skiper/f_skip_s.png" alt="no alt"></button>
            </div>

            <div class="ep_dropdown hidden">
                <div class="ep_list"></div>
            </div>

        </div>
        <div class="top_right_panel">
            <input type="text" class="seek" placeholder="00:00" style="width: 60px;">
            <button class="button " id="btn_seek" onclick="seekToTime(); changeSeekIcon()"><img src="content/fa32/correct_skiper/hourglass-1.png" alt="no alt"></button>
                            
            <!--<button class="button " onclick="toggleMobileMode()"><img src="content/fa32/mode/phone.png" alt="no alt"></button>-->
        </div>
        <div class="controls"> <!-- Cool stuff-->
            <div class="bar">
                <input 
                    type="range" 
                    class="progress" 
                    min="0"
                    max="100"
                    value="0"
                >
                <div class="fill"></div>
                <div class="thumb"></div>
            </div>
                <div class="buttons">
                    <div class="l_b">
                        <button class="button play_button" onclick="togglePlay()"><img src="content/fa32/play.png" alt="no alt"></button>
                        <button class="button vol_button">
                            <img src="content/fa32/volume/volume-up.png" alt="">
                        </button>

                        <div class="volume">
                            <div class="volume_bar"></div>
                                <input type="range" class="volume_slider" min="0" max="100" value="100">
                                <div class="volume_fill"></div>
                                <div class="volume_thumb"></div>
                            </div>
                        </div>
                        <h2 class="time">00.00/00.00</h2>
    
                        <div class="r_b">
                            <button class="button s_button" onclick="toggleSettings()"><img src="content/fa32/setting.png" alt="no alt"></button>
                            <button class="button fs_button" onclick="togglefs()"><img src="content/fa32/compress.png" alt="no alt"></button>
                        </div>
                    </div>
                </div>
            <div class="settings_menu hidden">

                <div class="settings_tabs">
                    <button class="tab_btn active" onclick="setMode('quality')">Качество</button>
                    <button class="tab_btn" onclick="setMode('speed')">Скорость</button>
                </div>

                <div class="settings_list">
                    <button class="item quality_item" data-src="video/video_360.mp4">360p</button>
                    <button class="item quality_item" data-src="video/video_720.mp4">720p</button>
                    <button class="item quality_item" data-src="video/video_1080p.mp4">1080p</button>

                    <button class="item speed_item hidden">0.5x</button>
                    <button class="item speed_item hidden">Normal</button>
                    <button class="item speed_item hidden">1.25x</button>
                    <button class="item speed_item hidden">1.5x</button>
                    <button class="item speed_item hidden">2x</button>

                </div>
            </div>
        </div>
    </div>
    `};

    cache() {
        this.video = this.shadowRoot.querySelector(".video");
        this.progress = this.shadowRoot.querySelector(".progress");
        this.fill = this.shadowRoot.querySelector(".fill");
        this.thumb = this.shadowRoot.querySelector(".thumb");
        this.player = this.shadowRoot.querySelector(".player");

        this.play_icon = "content/fa32/play.png";
        this.pause_ico = "content/fa32/pause.png";
        this.p_img = this.shadowRoot.querySelector(".play_button img");

        this.fsBtn = this.shadowRoot.querySelector(".fs_button img");
        this.expandIco = "content/fa32/expand.png";
        this.compressIco = "content/fa32/compress.png";

        this.vol_slider = this.shadowRoot.querySelector(".volume_slider");
        this.vol_btn = this.shadowRoot.querySelector(".vol_button img");
        this.vol_fill = this.shadowRoot.querySelector(".volume_fill");
        this.vol_thumb = this.shadowRoot.querySelector(".volume_thumb");

        this.time = this.shadowRoot.querySelector(".time");

        this.center_icon = this.shadowRoot.querySelector(".center_icon");
        this.center_img = this.center_icon.querySelector("img");

        this.controls = this.shadowRoot.querySelector(".controls");
        this.vignette = this.shadowRoot.querySelector(".vignette");

        this.t_r_pnl = this.shadowRoot.querySelector(".top_right_panel");
        this.t_l_pnl = this.shadowRoot.querySelector(".top_left_panel");

        this.settings = this.shadowRoot.querySelector(".settings_menu");

        this.skipIcon = this.shadowRoot.querySelector(".skip_icon");
        this.skipImg = this.skipIcon.querySelector("img");

        this.list = this.shadowRoot.querySelector(".ep_list");
        this.dropdown = this.shadowRoot.querySelector(".ep_dropdown");

        this.loader = this.shadowRoot.querySelector(".loader");
        this.seekIcon = this.shadowRoot.querySelector("button.seek img");

        this.lastVolume = 1;
        this.skipTimer = null;
        this.current = 0;
        this.episodes = [];
        this.uiLocked = false;
        this.isDragging = false;
    };
    bind() {
        // ===== PLAY =====
        this.shadowRoot.querySelector(".play_button")
            .addEventListener("click", () => this.togglePlay());

        this.video.addEventListener("click", () => this.togglePlay());

        // ===== FULLSCREEN =====
        this.shadowRoot.querySelector(".fs_button")
            .addEventListener("click", () => this.toggleFS());

        // ===== PROGRESS =====
        this.progress.addEventListener("input", (e) => this.seek(e));

        this.progress.addEventListener("mousedown", () => this.isDragging = true);
        document.addEventListener("mouseup", () => this.isDragging = false);

        // ===== VOLUME =====
        this.vol_slider.addEventListener("input", () => this.setVolume());

        this.shadowRoot.querySelector(".vol_button")
            .addEventListener("click", () => this.toggleMute());

        // ===== KEYBINDS =====
        document.addEventListener("keydown", (e) => this.keybinds(e));

        // ===== EPISODES =====
        this.shadowRoot.querySelector(".ep_btn")
            .addEventListener("click", () => this.toggleEpisodes());

        this.shadowRoot.querySelector(".ep_nav button:first-child")
            .addEventListener("click", () => this.prevEpisode());

        this.shadowRoot.querySelector(".ep_nav button:last-child")
            .addEventListener("click", () => this.nextEpisode());

        // ===== SEEK INPUT =====
        this.shadowRoot.querySelector(".seek")
            .addEventListener("keydown", (e) => {
                if (e.key === "Enter") this.seekToTime();
            });

        this.shadowRoot.querySelector(".seek + button")
            .addEventListener("click", () => {
                this.seekToTime();
                this.changeSeekIcon();
            });
        this.shadowRoot.querySelector(".s_button")
            .addEventListener("click", () => this.toggleSettings());
    

        this.shadowRoot.querySelector(".seek").addEventListener("focus", () => {
            this.uiLocked = true;
        });

        this.shadowRoot.querySelector(".seek").addEventListener("blur", () => {
            this.uiLocked = false;
        });
        this.shadowRoot.querySelectorAll(".tab_btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const mode = btn.textContent.includes("Качество") ? "quality" : "speed";
                this.setMode(mode);
            });
        });
        this.shadowRoot.querySelectorAll(".speed_item").forEach(btn => {
            btn.addEventListener("click", () => {
                const speed = parseFloat(btn.textContent);
                this.setSpeed(speed);
            });
        });
        this.shadowRoot.querySelectorAll(".quality_item").forEach(btn => {
            btn.addEventListener("click", () => {
                //const src = btn.getAttribute("data-src") || btn.onclick?.toString();
                //this.setQuality(src);
            });
        });
        let lastTap = 0;

        this.player.addEventListener("touchend", (e) => {
            const now = Date.now();
            const diff = now - lastTap;

            // двойной тап (300мс окно)
            if (diff < 300 && diff > 0) {

                const rect = this.player.getBoundingClientRect();
                const x = e.changedTouches[0].clientX - rect.left;
                const width = rect.width;

                // левая сторона
                if (x < width * 0.15) {
                    this.video.currentTime = Math.max(0, this.video.currentTime - 10);
                    this.showSkipIcon("back");
                }

                // правая сторона
                else if (x > width * 0.85) {
                    this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
                    this.showSkipIcon("forward");
                }
            }

            lastTap = now;
        });
    }
    keybinds(e) {
        const tag = document.activeElement.tagName;
        if (tag === "INPUT") return;

        switch (e.code) {

            case "Space":
                e.preventDefault();
                this.togglePlay();
                break;

            case "ArrowLeft":
                this.video.currentTime = Math.max(0, this.video.currentTime - 10);
                this.showSkipIcon("back");
                break;

            case "ArrowRight":
                this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
                this.showSkipIcon("forward");
                break;

            case "KeyF":
                e.preventDefault();
                this.toggleFS();
                break;

            case "KeyM":
                this.toggleMute();
                break;
        }
    }
    setMode(mode) {
        const root = this.shadowRoot;

        const qualityItems = root.querySelectorAll(".quality_item");
        const speedItems = root.querySelectorAll(".speed_item");
        const tabs = root.querySelectorAll(".tab_btn");

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
    setQuality(src) {
        const time = this.video.currentTime;
        const playing = !this.video.paused;

        this.video.src = src;
        this.video.load();

        this.video.addEventListener("loadedmetadata", () => {
            this.video.currentTime = time;
            if (playing) this.video.play();
        }, { once: true });

        this.progress.value = 0;
        this.fill.style.width = "0%";
        this.thumb.style.left = "0%";
    }
    setSpeed(speed) {
        this.video.playbackRate = speed;
    }
    openTab(tab) {
        const root = this.shadowRoot;

        root.querySelector(".quality").classList.add("hidden");
        root.querySelector(".speed").classList.add("hidden");

        root.querySelector("." + tab).classList.remove("hidden");

        const tabs = root.querySelectorAll(".settings_tabs .tab_btn");
        tabs.forEach(b => b.classList.remove("active"));

        if (tab === "quality") {
            tabs[0].classList.add("active");
        } else {
            tabs[1].classList.add("active");
        }
    }
    async toggleFS() {
        if (!document.fullscreenElement) {
            await this.player.requestFullscreen?.();

            try {
                await screen.orientation.lock("landscape");
            } catch (e) {
                console.log("Orientation lock not supported");
            }

            this.fsBtn.src = this.expandIco;
        } else {
            document.exitFullscreen?.();

            try {
                await screen.orientation.unlock();
            } catch (e) {}

            this.fsBtn.src = this.compressIco;
        }
    }
    toggleSettings() {
        this.settings.classList.toggle("hidden");

        const open = !this.settings.classList.contains("hidden");

        this.uiLocked = open;

        if (open) {
            clearTimeout(this.hideTimer);
            this.forceShowUI();
        } else {
            this.uiLocked = false;
            this.showControls();
        }
    }
    toggleMute() {
        if (this.video.volume > 0) {
            this.lastVolume = this.video.volume;
            this.video.volume = 0;
            this.vol_slider.value = 0;
        } else {
            this.video.volume = this.lastVolume || 1;
            this.vol_slider.value = (this.video.volume * 100);
        }

        this.setVolume();
    }
    seekToTime() {
        const input = this.shadowRoot.querySelector(".seek").value.trim();

        if (!input) return;

        let seconds = 0;

        if (input.includes(":")) {
            const [min, sec] = input.split(":").map(Number);
            seconds = (min || 0) * 60 + (sec || 0);
        } else {
            seconds = Number(input) * 60;
        }

        if (isNaN(seconds)) return;

        this.video.currentTime = seconds;
    }
    showSkipIcon(type) {
        const icon = this.skipIcon;
        const img = this.skipImg;

        icon.classList.remove("back", "forward");

        if (type === "back") {
            img.src = "content/fa32/skiper/b_skip_h.png";
            icon.classList.add("back");
        }

        if (type === "forward") {
            img.src = "content/fa32/skiper/f_skip_h.png";
            icon.classList.add("forward");
        }

        icon.classList.add("show");

        clearTimeout(this.skipTimer);
        this.skipTimer = setTimeout(() => {
            icon.classList.remove("show");
        }, 500);
    }
    toggleEpisodes() {
        this.dropdown.classList.toggle("hidden");
        this.uiLocked = !this.dropdown.classList.contains("hidden");
    }

    nextEpisode() {
        if (this.current < this.episodes.length - 1) {
            this.loadEpisode(this.current + 1);
        }
    }

    prevEpisode() {
        if (this.current > 0) {
            this.loadEpisode(this.current - 1);
        }
    }
    bindVideo() {

        this.video.addEventListener("loadedmetadata", () => {
            this.progress.max = 100;
            this.updateTime();
        });

        this.video.addEventListener("timeupdate", () => {
            if (!this.video.duration || this.isDragging) return;

            const percent = (this.video.currentTime / this.video.duration) * 100;

            this.progress.value = percent;
            this.fill.style.width = percent + "%";
            this.thumb.style.left = percent + "%";

            this.updateTime();
        });

        this.video.addEventListener("ended", () => {
            this.video.dataset.ended = "true";
            this.center_icon.classList.add("show");
            this.showControls()
            
            this.center_img.src = "content/fa32/restart.png";
            this.p_img.src = "content/fa32/restart.png";
        });

        this.video.addEventListener("waiting", () => {
            this.loader.classList.remove("hidden");
        });

        this.video.addEventListener("canplay", () => {
            this.loader.classList.add("hidden");
        });

        this.video.addEventListener("stalled", () => {
            this.loader.classList.remove("hidden");
        });
    }
    togglePlay() {
        if (this.video.dataset.ended === "true") {
            this.restartVideo();
            return;
        }

        if (this.video.paused) {
            this.video.play();
            this.center_img.src = this.pause_ico;
            this.p_img.src = this.pause_ico;
        } else {
            this.video.pause();
            this.center_img.src = this.play_icon;
            this.p_img.src = this.play_icon;
        }

        this.center_icon.classList.add("show");

        setTimeout(() => {
            this.center_icon.classList.remove("show");
        }, 300);
    }

    restartVideo() {
        this.video.currentTime = 0;
        this.video.play();
        this.p_img.src = "content/fa32/pause.png";
        this.video.dataset.ended = "false";
        this.center_icon.classList.remove("show");

    }
    setVolume() {
        const value = this.vol_slider.value;
        const volume = value / 100;

        this.video.volume = volume;

        if (volume === 0) {
            this.vol_btn.src = "content/fa32/volume/volume-off.png";
        } else if (volume < 0.5) {
            this.vol_btn.src = "content/fa32/volume/volume-down.png";
        } else {
            this.vol_btn.src = "content/fa32/volume/volume-up.png";
        }

        this.vol_fill.style.width = value + "%";
        this.vol_thumb.style.left = value + "%";
    }
    updateTime() {
        const format = (t) => {
            const m = Math.floor(t / 60);
            const s = Math.floor(t % 60);
            return `${m}:${s.toString().padStart(2, "0")}`;
        };

        if (!this.video.duration) return;

        this.time.textContent =
            `${format(this.video.currentTime)} / ${format(this.video.duration)}`;
    }
    seek(e) {
        if (!this.video.duration) return;

        const percent = Number(e.target.value);

        this.video.currentTime = (percent / 100) * this.video.duration;

        this.fill.style.width = percent + "%";
        this.thumb.style.left = percent + "%";
    }
    async loadTitle() {
        try {
            const res = await fetch(new URL("video/data/index.json", location.href));
            const data = await res.json();

            if (!data.titles) {
                console.error("index.json без titles");
                return;
            }

            const title = data.titles.find(
                t => t.name.toLowerCase() === this.titleName.toLowerCase()
            );

            if (!title) {
                console.error(`Тайтл "${this.titleName}" не найден`);
                return;
            }

            const epRes = await fetch(new URL(title.path, location.href));
            const epData = await epRes.json();

            if (!epData.episodes) {
                console.error("Нет episodes в тайтле");
                return;
            }

            this.episodes = epData.episodes;

            this.renderEpisodes();
            this.loadEpisode(0);

        } catch (err) {
            console.error("loadTitle error:", err);
        }
    }
    async loadEpisodes() {
        try {
            const res = await fetch(new URL("video/data/test.json", location.href));
            const data = await res.json();

            this.episodes = data.episodes || [];

            this.renderEpisodes();
            this.loadEpisode(0);

        } catch (err) {
            console.error("loadEpisodes error:", err);
        }
    }

    renderEpisodes() {
        this.list.innerHTML = "";

        this.episodes.forEach((ep, i) => {
            const div = document.createElement("div");
            div.className = "ep_item";
            div.textContent = ep.name;

            div.addEventListener("click", () => this.loadEpisode(i));

            this.list.appendChild(div);
        });
    }
    resetUI() {
        this.progress.value = 0;
        this.fill.style.width = "0%";
        this.thumb.style.left = "0%";

        this.video.dataset.ended = "false";

        this.center_icon.classList.remove("show");
        this.player.classList.add("hide-cursor");
    }
    forceShowUI() {
        this.player.classList.remove("hide-cursor");
        this.controls.classList.remove("hidden");
        this.vignette.classList.remove("hidden");
        this.t_l_pnl.classList.remove("hidden");
        this.t_r_pnl.classList.remove("hidden");

        clearTimeout(this.hideTimer);
        this.showControls(); // перезапуск таймера
    }
    loadEpisode(i) {
        this.current = i;

        this.video.src = new URL(this.episodes[i].src, location.href).href;
        this.video.load();
    
        this.updateActiveEpisode();

        this.uiLocked = false;
    }

    updateActiveEpisode() {
        this.shadowRoot.querySelectorAll(".ep_item")
            .forEach((el, idx) => {
                el.classList.toggle("active", idx === this.current);
            });
    }

    startUI() {
        document.addEventListener("mousemove", () => this.showControls());
        document.addEventListener("mousedown", () => this.showControls());
        document.addEventListener("touchstart", () => this.showControls());
    }

    showControls() {
        if (this.uiLocked) return;

        this.player.classList.remove("hide-cursor");
        this.controls.classList.remove("hidden");
        this.vignette.classList.remove("hidden");
        this.t_l_pnl.classList.remove("hidden");
        this.t_r_pnl.classList.remove("hidden");

        clearTimeout(this.hideTimer);

        this.hideTimer = setTimeout(() => {
            if (this.uiLocked) return; // 🔥 ВАЖНО

            this.player.classList.add("hide-cursor");
            this.controls.classList.add("hidden");
            this.vignette.classList.add("hidden");
            this.t_l_pnl.classList.add("hidden");
            this.t_r_pnl.classList.add("hidden");
        }, 3000);
    }
    init() {
        this.bindVideo();
        this.startUI();
        this.titleName = this.getAttribute("title");

        if (this.titleName) {
            this.loadTitle();
        } else {
            this.loadEpisodes();
        }
    }
}
customElements.define("akiros-hexed-player", akiros_hexed_player);