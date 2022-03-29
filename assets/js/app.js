/*
1. Render songs
2. Scroll top
3. Play / pause / seek(tua)
4. CO rotate
5. Next / prev
6. Random
7. Next / Repeat when ended
8. Active song
9. Scroll active song into view
10. Play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8-player";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");
// console.log(playBtn);

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Ái Nộ",
      singer: "Masew x Khoi Vu",
      path: "./assets/music/AiNo.mp3",
      img: "./assets/img/aino-img.jpg",
    },
    {
      name: "Cưới Thôi",
      singer: "Masew x Masiu x B Ray x TAP",
      path: "./assets/music/CuoiThoi.mp3",
      img: "./assets/img/cuoithoi-img.jpg",
    },
    {
      name: "Phận Duyên Lỡ Làng",
      singer: "PHÁT HUY T4 X TRUZG",
      path: "./assets/music/PhanDuyenLoLang.mp3",
      img: "./assets/img/phanduyenlolang-img.jpg",
    },
    {
      name: "Thanh Xuân",
      singer: "Da LAB",
      path: "./assets/music/ThanhXuan.mp3",
      img: "./assets/img/thanhxuan-img.jpg",
    },
    {
      name: "Thức Giấc",
      singer: "Da LAB",
      path: "./assets/music/ThucGiac.mp3",
      img: "./assets/img/thucgiac-img.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currentIndex ? "active" : ""
        }" data-index = "${index}">
          <div
            class="thumb"
            style="
              background-image: url('${song.img}');
            "
          ></div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
        `;
    });
    playlist.innerHTML = htmls.join(" ");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    //xu ly cd quay
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000, //10second
        iterations: Infinity,
      }
    );
    cdThumbAnimate.pause();

    //xu ly phong to thu nho
    document.onscroll = function () {
      const scrollTop = document.documentElement.scrollTop || window.scrollY;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //xu ly khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //khi song duoc play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    //khi song bi pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    //khi tien do bai hat thay doi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    //xu ly tua bai hat
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    //khi next bai hat
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //khi perv bai hat
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //khi su dung random
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    //xu ly lap lai bai hat
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);

      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    //xu ly khi bai hat ket thuc
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    //lang nghe hanh vi click bai hat
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      //xu ly khi click vao bai hat
      if (songNode || e.target.closest(".option")) {
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }

      //xu ly khi click vao song option
      // if(e.target.closest('.option)'))
    };
  },
  scrollToActiveSong: function () {
    setTimeout(function () {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 250);
  },

  //load song
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url("${this.currentSong.img}")`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;

    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.songs.length);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    //gan cau hinh tu config vào ung dung
    this.loadConfig();

    //dinh nghia cac thuoc tinh cho object
    this.defineProperties();

    //lang nghe , xu ly cac su kien
    this.handleEvents();

    //tai thong tin bai hat vao UI khi chay ung dung
    this.loadCurrentSong();

    //render lai playlist
    this.render();

    //hien thi trang thai ban dau cua btn repeat va random
    repeatBtn.classList.toggle("active", this.isRepeat);
    randomBtn.classList.toggle("active", this.isRandom);
  },
};

app.start();
