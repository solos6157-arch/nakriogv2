const audio = document.getElementById("audio");
const grid = document.getElementById("songGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const albumSelect = document.getElementById("albumSelect");
const emptyState = document.getElementById("emptyState");
const trackCount = document.getElementById("trackCount");
const playBtn = document.getElementById("playBtn");
const seekBar = document.getElementById("seekBar");
const loopBtn = document.getElementById("loopBtn");
let songs = [], visibleSongs = [], albums = [], currentIndex = -1, repeatOne = false;

document.getElementById("year").textContent = new Date().getFullYear();
audio.volume = 0.8;
function safeText(value, fallback = "") { return typeof value === "string" && value.trim() ? value.trim() : fallback; }
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }

function renderAlbums() {
  const albumGrid = document.getElementById("albumGrid");
  const albumEmpty = document.getElementById("albumEmpty");
  albumGrid.innerHTML = "";
  albums = [...new Set(songs.map(s => s.album).filter(Boolean))];
  document.getElementById("albumCount").textContent = `${albums.length} ALBUM${albums.length === 1 ? "" : "S"}`;
  albumEmpty.hidden = albums.length > 0;
  const selected = albumSelect.value;
  albumSelect.innerHTML = '<option value="all">All albums</option>';
  albums.forEach(name => {
    const option = document.createElement("option"); option.value = name; option.textContent = name; albumSelect.appendChild(option);
  });
  albumSelect.value = albums.includes(selected) ? selected : "all";
  albums.forEach(name => {
    const albumSongs = songs.filter(s => s.album === name);
    const card = document.createElement("button"); card.type = "button"; card.className = "album-card";
    const art = document.createElement("div"); art.className = "album-art";
    const coverSong = albumSongs.find(s => s.cover);
    if (coverSong) {
      const img = document.createElement("img"); img.src = coverSong.cover; img.alt = `${name} cover`; img.loading = "lazy";
      img.onerror = () => { art.innerHTML = '<span>♫</span>'; }; art.appendChild(img);
    } else { const icon = document.createElement("span"); icon.textContent = "♫"; art.appendChild(icon); }
    const title = document.createElement("strong"); title.textContent = name;
    const sub = document.createElement("small"); sub.textContent = `${albumSongs.length} track${albumSongs.length === 1 ? "" : "s"} · ${albumSongs[0]?.artist || "NAKRI × OG"}`;
    card.append(art,title,sub);
    card.addEventListener("click", () => { albumSelect.value = name; renderSongs(); document.getElementById("library").scrollIntoView({behavior:"smooth"}); });
    albumGrid.appendChild(card);
  });
}
function renderSongs() {
  const query = searchInput.value.trim().toLowerCase();
  visibleSongs = songs.map((song,index)=>({...song,originalIndex:index}))
    .filter(song => `${song.title} ${song.artist} ${song.album}`.toLowerCase().includes(query))
    .filter(song => albumSelect.value === "all" || song.album === albumSelect.value);
  if (sortSelect.value === "name") visibleSongs.sort((a,b)=>a.title.localeCompare(b.title));
  else if (sortSelect.value === "artist") visibleSongs.sort((a,b)=>a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
  grid.innerHTML = "";
  trackCount.textContent = `${visibleSongs.length} TRACK${visibleSongs.length === 1 ? "" : "S"}`;
  emptyState.hidden = visibleSongs.length !== 0;
  visibleSongs.forEach(song => {
    const card = document.createElement("article");
    card.className = "song-card" + (song.originalIndex === currentIndex ? " is-playing" : "");
    card.tabIndex = 0; card.setAttribute("role","button"); card.setAttribute("aria-label",`Play ${song.title} by ${song.artist}`);
    const cover = document.createElement("div"); cover.className = "cover-wrap";
    if (song.cover) {
      const img = document.createElement("img"); img.src = song.cover; img.alt = `${song.title} cover`; img.loading = "lazy";
      img.onerror = () => { cover.innerHTML = '<div class="cover-placeholder">♫</div>'; }; cover.appendChild(img);
    } else { const placeholder = document.createElement("div"); placeholder.className="cover-placeholder"; placeholder.textContent="♫"; cover.appendChild(placeholder); }
    const button = document.createElement("button"); button.className="card-play"; button.type="button";
    button.setAttribute("aria-label",`Play ${song.title}`); button.textContent=song.originalIndex===currentIndex&&!audio.paused?"Ⅱ":"▶";
    button.addEventListener("click",event=>{event.stopPropagation();playSong(song.originalIndex);}); cover.appendChild(button);
    const title=document.createElement("h3");title.className="song-title";title.textContent=song.title;
    const artist=document.createElement("div");artist.className="song-artist";artist.textContent=song.artist;
    const meta=document.createElement("div");meta.className="song-meta";
    const label=document.createElement("span");label.textContent=song.album || "NAKRI × OG";
    const duration=document.createElement("span");duration.textContent=song.duration || "MP3";
    meta.append(label,duration);card.append(cover,title,artist,meta);
    card.addEventListener("click",()=>playSong(song.originalIndex));
    card.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();playSong(song.originalIndex);}});
    grid.appendChild(card);
  });
}
function updateNowPlaying(song) {
  document.getElementById("nowTitle").textContent=song.title;
  document.getElementById("nowArtist").textContent=song.artist;
  const mini=document.getElementById("miniCover");mini.innerHTML="";
  if(song.cover){const img=document.createElement("img");img.src=song.cover;img.alt="";img.onerror=()=>{mini.textContent="♫";};mini.appendChild(img);}
  else mini.textContent="♫";
}
async function playSong(index) {
  if(!songs[index])return;
  if(currentIndex===index){if(audio.paused){try{await audio.play();}catch(e){showAudioError();}}else audio.pause();return;}
  currentIndex=index;const song=songs[index];audio.src=song.file;updateNowPlaying(song);renderSongs();
  try{await audio.play();}catch(e){showAudioError();}
}
function showAudioError(){document.getElementById("nowArtist").textContent="Could not play file — check the song path";}
function playNext(direction=1) {
  if(!songs.length)return;
  const next=currentIndex<0?0:(currentIndex+direction+songs.length)%songs.length;
  playSong(next);
}
searchInput.addEventListener("input",renderSongs);
sortSelect.addEventListener("change",renderSongs);
albumSelect.addEventListener("change",renderSongs);
playBtn.addEventListener("click",async()=>{
  if(currentIndex<0){if(songs.length)await playSong(0);return;}
  if(audio.paused){try{await audio.play();}catch(e){showAudioError();}}else audio.pause();
});
document.getElementById("prevBtn").addEventListener("click",()=>{if(audio.currentTime>3)audio.currentTime=0;else playNext(-1);});
document.getElementById("nextBtn").addEventListener("click",()=>playNext(1));
document.getElementById("volumeBar").addEventListener("input",event=>{audio.volume=Number(event.target.value);});
loopBtn.addEventListener("click",()=>{repeatOne=!repeatOne;audio.loop=repeatOne;loopBtn.classList.toggle("active",repeatOne);loopBtn.title=repeatOne?"Repeat current song on":"Repeat off";loopBtn.setAttribute("aria-pressed",String(repeatOne));});
audio.addEventListener("play",()=>{playBtn.textContent="Ⅱ";playBtn.setAttribute("aria-label","Pause");renderSongs();});
audio.addEventListener("pause",()=>{playBtn.textContent="▶";playBtn.setAttribute("aria-label","Play");renderSongs();});
audio.addEventListener("loadedmetadata",()=>{document.getElementById("duration").textContent=formatTime(audio.duration);});
audio.addEventListener("timeupdate",()=>{
  document.getElementById("currentTime").textContent=formatTime(audio.currentTime);
  if(Number.isFinite(audio.duration)&&audio.duration>0)seekBar.value=String(Math.round(audio.currentTime/audio.duration*1000));
});
seekBar.addEventListener("input",()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seekBar.value)/1000*audio.duration;});
audio.addEventListener("ended",()=>{if(!repeatOne)playNext(1);});
async function loadLibrary() {
  try {
    const response=await fetch(new URL("songs.json",document.baseURI),{cache:"no-store"});
    if(!response.ok)throw new Error("songs.json not found");
    const data=await response.json();if(!Array.isArray(data))throw new Error("songs.json must contain a list");
    songs=data.filter(item=>item&&item.file).map(item=>({
      title:safeText(item.title,"Untitled track"),artist:safeText(item.artist,"NAKRI × OG"),
      album:safeText(item.album,""),file:new URL(item.file,document.baseURI).href,
      cover:item.cover?new URL(item.cover,document.baseURI).href:"",duration:safeText(item.duration,"MP3")
    }));
    renderAlbums();renderSongs();
    if(!songs.length){emptyState.hidden=false;emptyState.querySelector("h3").textContent="No songs added yet";emptyState.querySelector("p").textContent="Add audio files to songs/ and update songs.json to show them here.";}
  } catch(error) {
    grid.innerHTML="";emptyState.hidden=false;emptyState.querySelector("h3").textContent="Your music library could not load";
    emptyState.querySelector("p").textContent="Make sure songs.json is uploaded beside index.html and contains valid JSON.";
    trackCount.textContent="0 TRACKS";console.error("Could not load music library:",error);
  }
}
loadLibrary();
