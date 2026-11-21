# pratix005.github.io

My portfolio. React + Vite, animated with Framer Motion.

- `src/data.js`: all the content (featured work, the 14 projects, the log, tools)
- `src/App.jsx`: sections and motion
- `src/scan.js`: the in-browser playground, a small JavaScript port of
  [aadhaarguard](https://github.com/Pratix005/aadhaarguard)
- `public/assets/`: GIFs, favicon, social image

```bash
npm install
npm run dev      # local dev server
npm run build    # output in dist/
```

Pushing to `main` builds and deploys through GitHub Actions (`.github/workflows/deploy.yml`).
Pages source must be set to **GitHub Actions** in the repo settings.
