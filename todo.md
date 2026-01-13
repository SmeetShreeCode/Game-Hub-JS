# TODO List – Vertical Platform
https://itch.io/  
https://prismic.io/blog/css-scroll-effects

## 🎮 Gameplay Features
- [ ] Add **multiple levels** with unique backgrounds
- [ ] Add basic **enemy with patrol** movement
- [ ] Allow player to **attack and defeat enemies**
- [ ] Add collectible items (**coins, gems, etc.**)
- [ ] Implement a **score system**
- [ ] Add a **goal/portal to complete** the level

## 💡 Game Design
- [ ] Design a progression system (unlock double jump, new attacks)
- [ ] Add short story intro or NPCs with dialogue
- [ ] Increase difficulty across levels

## 🔊 Audio & Visual
- [ ] Add background music
- [ ] Add jump and attack sound effects
- [ ] Add particle effects for jump/land
- [ ] Add attack animation effects
- [ ] Add screen shake on impact

## 🧪 Technical Enhancements
- [ ] Improve camera with smooth follow/parallax
- [ ] Create level manager to load/switch scenes
- [ ] Clean up duplicate code and organize logic

## 🔁 Replayability
- [ ] Add endless mode or random level generation
- [ ] Track high scores or add timer challenge
- [ ] Save player progress with localStorage

## 👣 Start Here (Beginner Focus)
- [ ] Add second level with new background
- [ ] Add a simple patrolling enemy
- [ ] Add one collectible and display score
- [ ] Add portal/door to finish level



Great — I’ll give you:

Which tool is best for Windows

Why it’s the best

Exact ready-to-use commands / steps for downloading sites (including only images if you want)

✅ Best Tool for Windows: HTTrack
✔ Best overall
✔ Easiest to use
✔ Free & open source
✔ GUI (no coding needed)
✔ Most reliable for downloading images + web pages
✔ Automatically fixes links so you can browse offline

Most Windows users prefer HTTrack because it works almost exactly like SiteSucker but for Windows.

🛠️ How to Use HTTrack (step-by-step)
1. Download

Google: HTTrack
Download: WinHTTrack Website Copier

2. Install & open it
3. Create a new project

Project name: anything

Category: optional

Base path: a folder where it will save the site

4. Add your URL

Paste the website URL (e.g. https://wallpaperscraft.com
)

5. Press Next and Finish

HTTrack starts downloading the whole site.

📥 If you want ONLY images (recommended for wallpaper sites)

HTTrack lets you filter file types.

Follow this:

Start a new HTTrack project

Click “Set Options”

Go to “Scan Rules” and add these:

+*.jpg
+*.jpeg
+*.png
+*.webp
+*.gif
-*


This means:

Download only image files

Ignore everything else

Now it will grab EVERY image it can find on that site.

🧰 Alternative (Command-line users): Wget

If you prefer commands (powerful but harder), here are ready-to-use commands.

🟦 Download entire site (HTML + images):
wget -r -k -p -E https://wallpaperscraft.com/

🟩 Download only images (best for big wallpaper sites):
wget -r -A jpg,jpeg,png,webp,gif https://wallpaperscraft.com/


This will recursively download only image files.

⭐ Final Recommendation
Tool	Ease	Power	Best For
HTTrack	⭐⭐⭐⭐⭐	⭐⭐⭐⭐	Best for 99% of users
Wget	⭐⭐	⭐⭐⭐⭐⭐	Advanced users / automation
Cyotek WebCopy	⭐⭐⭐⭐	⭐⭐⭐	Simple websites
Getleft	⭐⭐⭐	⭐⭐	Lightweight jobs