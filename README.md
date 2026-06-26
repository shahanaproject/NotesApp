live at https://shahanaproject.github.io/NotesApp/
# Notes App

This folder contains a React Notes App with:

- List, detail, create, and edit pages
- React Router navigation
- localStorage persistence
- Search/filter by note title or body

## Files

- `src/main.jsx` - all app screens, routes, and note logic
- `src/styles.css` - app styling
- `index.html` - Vite HTML entry file
- `package.json` - dependencies and scripts
- `package-lock.json` - exact installed dependency versions
- `dist/` - production build output

## How To Use

1. Open this folder in VS Code or your terminal.

2. Install the dependencies:

   ```bash
   npm install
   ```

   On Windows PowerShell, if `npm` is blocked, use:

   ```bash
   npm.cmd install
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

   Or on Windows PowerShell:

   ```bash
   npm.cmd run dev
   ```

4. Open the local URL shown in the terminal.

   It is usually:

   ```text
   http://localhost:5173
   ```

5. Use the app:

   - Click `New` or `Create` to add a note.
   - Click any note card to open the detail page.
   - Click the pencil icon to edit a note.
   - Click the trash icon to delete a note.
   - Use the search box on the list page to filter notes.

6. Your notes are saved automatically in your browser using localStorage.

## Build For Production

To create a fresh production build:

```bash
npm run build
```

Or on Windows PowerShell:

```bash
npm.cmd run build
```

The built files will be placed in `dist/`.

## Important Note

Do not open `dist/index.html` directly by double-clicking it. Because this app uses React Router and Vite asset paths, run it with `npm run dev` during development or serve the `dist/` folder with a static web server for production.
