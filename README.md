# fourcorners

The Four Corners Games studio site, served at https://fourcornersgames.ca
(GitHub Pages, see `CNAME`). Plain static HTML and one stylesheet, no build
step. Every page exists in English and French (Quebec's language rules), and
each links to its other-language twin.

## Layout

```
/                      studio home (games, about, contact)
/fr/                   French home
/yarntoss/             YarnToss game page
/yarntoss/privacy.html, terms.html, delete-account.html
/fr/yarntoss/          French game page
/fr/yarntoss/confidentialite.html, conditions.html, supprimer-compte.html
/yarntoss/img/         game art (webp) for the game page and home card
/assets/fonts/         self-hosted Lato (studio) and Baloo 2 (YarnToss), with their OFL licences
/brand/                logo files and the logo animation script
/404.html
```

Fonts and images are all self-hosted, so visiting the site never contacts a
third party (the privacy policies rely on that).

## Old URLs are redirect stubs - keep them

`/privacy.html`, `/terms.html`, `/delete-account.html` and
`/fr/confidentialite.html`, `/fr/conditions.html`, `/fr/supprimer-compte.html`
were the YarnToss legal pages before they moved under `/yarntoss/`. Shipped
game builds (`scripts/legal_links.gd` in YarnToss) and the Play Console
listing may still point at them, so they stay as small redirect pages
(meta refresh + JS that keeps any `#fragment`). Never delete them.

## Each game has its own legal pages

A privacy policy has to describe what that specific game collects, so each
game gets its own set under `/<game>/` (and `/fr/<game>/`), with its own
account-deletion page if it has accounts. To add a game:

1. Copy `yarntoss/` and `fr/yarntoss/` to the new game's folder.
2. Rewrite the privacy policy for what the new game actually does (data,
   services, ages, purchases, ads). Keep the shared parts (who we are, your
   rights, the CAI, security, contact).
3. Add a `.theme-<game>` block in `style.css` (colours and display font) and
   put it on each page's `<body>`.
4. Add the game to the Games section of both home pages and to every page's
   footer.

## Game art

`yarntoss/img/` holds web copies of the YarnToss Play Store listing art
(`assets/store_listing/` in the YarnToss repo: feature graphic, screenshots,
icon) and a few character sprites, resized and converted to webp. Only
listing/marketing art belongs here - don't publish game builds or asset
dumps (see the web-build retirement note in YarnToss's `CLAUDE.md`).

## Discord notices

Two things post to the team Discord channel, through the same webhook
YarnToss uses:
- **Commits:** a repo webhook (Settings -> Webhooks) pointed at the Discord
  webhook URL with `/github` on the end, content type `application/json`.
  Posts every push, on any branch.
- **"Site updated"**: `.github/workflows/site-live-discord.yml`, on every push
  to `main`. It waits for GitHub Pages to finish building that commit, then
  posts that it's live (or that the build failed, or never finished within
  10 minutes). Needs the plain webhook URL (no `/github`) as the
  `DISCORD_WEBHOOK_URL` repo secret; without it the workflow does nothing.

## Dev panel (`/dev/yarntoss/`)

A hidden page for the YarnToss devs: both leaderboards, every player's full
cloud save (click a name) with editing, rename history, `config/*` docs, and
dev messages that pop up in every open game. Not linked from anywhere and
marked `noindex`, but the URL is not the protection: everything goes through
Firestore with the dev's own login, and the rules only allow it for accounts
whose `scores/{uid}` has `is_dev: true` (see YarnToss's `docs/firebase.md`,
"Web dev panel"). It's the one page that talks to a third party (Google's
Firebase APIs), and only once a dev signs in.

- Sign in with the **email and password** of a dev account (Play Games-only
  accounts can't sign in on the web; YarnToss's doc says how to add one).
- `dev/yarntoss/game-data.js` holds the names of achievements, catalogue
  entries, skins, cosmetics, Workshop upgrades and rooms, copied from the game.
  After changing any of those in YarnToss, regenerate it:
  `python tools/yarntoss_dev_data.py ../YarnToss`
- What the panel can edit (`EDITABLE` in `app.js`) must match what the game
  adopts after a dev edit (`CloudSave._adopt_field()` in YarnToss).
