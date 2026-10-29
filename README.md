# NAKRI × OG — Music Website

A responsive music website for GitHub Pages with a custom logo, social-media icons, album collection, artist labels, animated intro, and a sticky audio player with repeat-one playback.

## What's new
- Custom NAKRI × OG SVG logo in `assets/logo/`, used as the site icon and brand mark.
- Social-media SVG icons in `assets/social-icons/`.
- Album collection automatically groups tracks using each song's `album` value.
- Search by song, artist, or album; filter by album; sort by title or artist.
- Fixed bottom music player with previous/next, seeking, volume, and repeat-current-track button.
- Drop-in opening animation and animated record artwork, with reduced-motion accessibility support.
- Responsive mobile layout.

## Add songs
1. Put audio files (`.mp3`, `.m4a`, `.ogg`, `.wav`, `.aac`, or `.flac`) in `songs/`.
2. Put cover art in `thumbnails/` if desired.
3. Run `py build_songs.py` to rebuild `songs.json` (or edit `songs.json` manually).
4. Upload `index.html`, `style.css`, `app.js`, `songs.json`, `assets/`, `songs/`, and `thumbnails/` to the published GitHub Pages folder.

## Song metadata
Each entry in `songs.json` can use these fields:
```json
[
  {
    "title": "Song title",
    "artist": "Artist name",
    "album": "Album name",
    "file": "songs/song-file.mp3",
    "cover": "thumbnails/song-cover.jpg",
    "duration": "3:25"
  }
]
```
`album`, `cover`, and `duration` are optional. If you use `build_songs.py`, check whether it has generated the album metadata you want; you can add an `album` value manually to the generated JSON.

## Set your real social links
The current social buttons link to the general Facebook, Instagram, and YouTube homepages as safe placeholders. To link your own profiles, open `index.html` and replace the three URL values in **both** the hero social links and Contact section with your profile URLs. Search for `https://www.facebook.com/`, `https://www.instagram.com/`, and `https://www.youtube.com/`.

## Important
- GitHub Pages is static hosting; it cannot automatically list files in `songs/`. The `songs.json` file must list each playable track.
- Filenames and folder names are case-sensitive on GitHub Pages.
- If a track appears but does not play, confirm its audio path exists in the repository and check the browser developer console (F12).
- Only upload music and artwork you own or have permission to distribute.
