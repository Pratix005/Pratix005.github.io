# pratix005.github.io

**Live: https://pratix005.github.io**

My portfolio. React + Vite, animated with [Motion](https://motion.dev).

- `src/data.js`: all the content (featured work, projects, results, covers, tools)
- `src/App.jsx`: sections and motion (loader, 3D project ring, scroll effects)
- `src/styles.css`: styles; every colour comes from the variables at the top
- `src/scan.js`: the in-browser playground, a small JavaScript port of
  [aadhaarguard](https://github.com/Pratix005/aadhaarguard)
- `public/assets/`: screenshots, GIFs, favicon, social image

```bash
npm install
npm run dev      # local dev server
npm run build    # output in dist/
```

Pushing to `main` builds and deploys through GitHub Actions (`.github/workflows/deploy.yml`).
