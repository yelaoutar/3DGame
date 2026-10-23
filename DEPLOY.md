# Publish on GitHub Pages

Everything needed for deployment is included. Nothing has been pushed or published.

## 1. Create a repository

On GitHub create a new **public** repository (for free Pages), for example `little-universe`.
Leave the README, license and .gitignore checkboxes unchecked so the repository is empty.

## 2. Push from this folder

Open a terminal in this project folder. Replace YOUR-USERNAME and YOUR-REPO below:

```sh
git init -b main
git add .
git commit -m "Add A Little Universe game"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Git may ask you to sign in through your browser. If it asks for your commit identity, set your Git name/email as instructed by Git and retry the commit. Do not enter your GitHub password in a terminal prompt; use the normal Git Credential Manager sign-in.

Use Git to push, not GitHub's browser file uploader: `flower_bouquet.glb` is about 40 MB, above the browser upload limit but below the regular Git per-file limit. The supplied assets must stay in public/. node_modules/, dist/ and original downloaded asset archives are excluded automatically.

## 3. Enable Pages

In the repository open **Settings > Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Open **Actions > Deploy game to GitHub Pages > Run workflow**, select main and run it. If the initial automatic run failed before Pages was enabled, rerun it now.

When the deployment succeeds, its summary and Settings > Pages show your game URL:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO/
```

Share that link. Your computer does not need to remain on. The repository and game's dialogue/assets are public. No multiplayer or response tracking is included.

## Updating the game

```sh
git add .
git commit -m "Update game"
git push
```

Every push to main automatically tests, builds and deploys the game. Do not manually upload dist/ or node_modules/. No repository secrets or access tokens are needed for this workflow; GitHub provides the deployment token.

## Local checks

```sh
npm ci
npm test
npm run build
npm run preview
```

The production build uses relative URLs, so any repository name works. The development import map is removed during build. The 40 MB bouquet may take a little time to download on a slow connection.

References: https://vite.dev/guide/static-deploy.html and https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
