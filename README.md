# PG Admin

![version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![license](https://img.shields.io/badge/license-ISC-lightgrey.svg)

Simple, lightweight admin panel built with Express and static templates. This repository provides a minimal example admin UI with a login flow that serves HTML templates from the `templates/` folder and static assets from `public/`.

## Key Features

- **Lightweight**: No database required for the demo — sessions are in-memory.
- **Simple structure**: Uses `server.js`, static files in `public/` and HTML templates in `templates/` to keep the app easy to read and extend.
- **Developer-friendly**: `npm run dev` uses `nodemon` for quick iteration.

**Important:** This project contains example credentials and an in-memory session store. Do not use as-is in production.

## Quick Start

1. Install Node.js (>= 16) and npm.
2. From the project root, install dependencies:

```powershell
npm install
```

3. Run the app:

```powershell
npm start
# or for development with auto-reload
npm run dev
```

4. Open the app in your browser:

```
http://localhost:5000
```

### Default (demo) credentials

Use these only for local testing. Replace them before deploying.

- Username: `anasmonar@gmail.com`
- Password: `anuammuaju2022`

## Configuration & Notes

- The app listens on `PORT` (default `5000`).
- `server.js` currently contains hard-coded credentials and a session secret. For production, replace these with environment variables (for example: `SESSION_SECRET`, and move user data to a secure store).
- Session store is in-memory (via `express-session`) and will not persist across restarts. Use a persistent session store (Redis, database) in production.

## Project Structure

- `server.js` — Express server and routing
- `package.json` — Node dependencies and npm scripts
- `templates/` — HTML views (`login.html`, `index.html`, `orders.html`)
- `public/` — Static assets (CSS, JS, images)

## Where To Get Help

- Open an issue: `https://github.com/anazmuhdd/PG_Admin/issues`
- For urgent or private inquiries, contact the repository maintainer via their GitHub profile: `https://github.com/anazmuhdd`

## Contributing

Contributions are welcome. If you plan to contribute, please open an issue first to discuss larger changes. Create a fork, add a clear commit history, and open a pull request. If you maintain a `CONTRIBUTING.md`, add it to the repository and it will be referenced here.

## Security

- Do not commit secrets. Remove or rotate the hard-coded credentials and `session` secret before publishing or deploying.
- Consider adding a `LICENSE` file (package.json currently lists `ISC`).

## License

This project declares the `ISC` license in `package.json`. Add a top-level `LICENSE` file if you want a license file visible in the repository.

---

If you want, I can also:

- add a `CONTRIBUTING.md` template, or
- replace hard-coded credentials with environment-based configuration and a `.env.example`.

Would you like me to make one of those follow-up changes?
