import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  FilePlus2,
  Home,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "notes-router-app.notes";

const seedNotes = [
  {
    id: "welcome-note",
    title: "Welcome to Notes",
    body: "Create, search, edit, and keep notes right in your browser. Everything persists in localStorage.",
    updatedAt: new Date().toISOString(),
  },
];

const NotesContext = createContext(null);

function readStoredNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed : seedNotes;
  } catch {
    return seedNotes;
  }
}

function NotesProvider({ children }) {
  const [notes, setNotes] = useState(readStoredNotes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const value = useMemo(() => {
    function createNote(data) {
      const now = new Date().toISOString();
      const note = {
        id: crypto.randomUUID(),
        title: data.title.trim() || "Untitled note",
        body: data.body.trim(),
        updatedAt: now,
      };
      setNotes((current) => [note, ...current]);
      return note;
    }

    function updateNote(id, data) {
      const now = new Date().toISOString();
      setNotes((current) =>
        current.map((note) =>
          note.id === id
            ? {
                ...note,
                title: data.title.trim() || "Untitled note",
                body: data.body.trim(),
                updatedAt: now,
              }
            : note,
        ),
      );
    }

    function deleteNote(id) {
      setNotes((current) => current.filter((note) => note.id !== id));
    }

    return { notes, createNote, updateNote, deleteNote };
  }, [notes]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within NotesProvider");
  }
  return context;
}

function App() {
  return (
    <BrowserRouter>
      <NotesProvider>
        <div className="appShell">
          <header className="topbar">
            <Link className="brand" to="/">
              <span className="brandIcon">
                <Edit3 size={20} aria-hidden="true" />
              </span>
              <span>Notes</span>
            </Link>
            <nav className="navActions" aria-label="Primary">
              <Link className="iconButton" to="/" aria-label="Notes list" title="Notes list">
                <Home size={19} aria-hidden="true" />
              </Link>
              <Link className="primaryButton" to="/notes/new">
                <Plus size={18} aria-hidden="true" />
                <span>New</span>
              </Link>
            </nav>
          </header>

          <main className="mainPane">
            <Routes>
              <Route path="/" element={<NotesList />} />
              <Route path="/notes/new" element={<CreateNote />} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              <Route path="/notes/:id/edit" element={<EditNote />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </NotesProvider>
    </BrowserRouter>
  );
}

function NotesList() {
  const { notes } = useNotes();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredNotes = notes
    .filter((note) => {
      const haystack = `${note.title} ${note.body}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <section className="page">
      <div className="pageHeader">
        <div>
          <p className="eyebrow">{notes.length} {notes.length === 1 ? "note" : "notes"}</p>
          <h1>All notes</h1>
        </div>
        <Link className="primaryButton" to="/notes/new">
          <FilePlus2 size={18} aria-hidden="true" />
          <span>Create</span>
        </Link>
      </div>

      <label className="searchField">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title or body"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" title="Clear search">
            <X size={17} aria-hidden="true" />
          </button>
        ) : null}
      </label>

      {filteredNotes.length ? (
        <div className="noteGrid">
          {filteredNotes.map((note) => (
            <Link className="noteCard" key={note.id} to={`/notes/${note.id}`}>
              <div>
                <h2>{note.title}</h2>
                <p>{note.body || "No body text yet."}</p>
              </div>
              <time dateTime={note.updatedAt}>{formatDate(note.updatedAt)}</time>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={normalizedQuery ? "No matching notes" : "No notes yet"}
          action={normalizedQuery ? "Try a different search." : "Create your first note."}
        />
      )}
    </section>
  );
}

function NoteDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notes, deleteNote } = useNotes();
  const note = notes.find((item) => item.id === id);

  if (!note) {
    return <MissingNote />;
  }

  function handleDelete() {
    const confirmed = window.confirm("Delete this note?");
    if (confirmed) {
      deleteNote(note.id);
      navigate("/");
    }
  }

  return (
    <article className="page noteDetail">
      <div className="detailToolbar">
        <Link className="ghostButton" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back</span>
        </Link>
        <div className="toolbarGroup">
          <Link className="iconButton" to={`/notes/${note.id}/edit`} aria-label="Edit note" title="Edit note">
            <Edit3 size={18} aria-hidden="true" />
          </Link>
          <button className="dangerIconButton" type="button" onClick={handleDelete} aria-label="Delete note" title="Delete note">
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <header className="noteHeader">
        <p className="eyebrow">Updated {formatDate(note.updatedAt)}</p>
        <h1>{note.title}</h1>
      </header>
      <div className="noteBody">{note.body || "No body text yet."}</div>
    </article>
  );
}

function CreateNote() {
  const navigate = useNavigate();
  const { createNote } = useNotes();

  function handleSubmit(data) {
    const note = createNote(data);
    navigate(`/notes/${note.id}`);
  }

  return (
    <section className="page">
      <NoteForm
        heading="Create note"
        submitLabel="Save note"
        onSubmit={handleSubmit}
        backTo="/"
      />
    </section>
  );
}

function EditNote() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notes, updateNote } = useNotes();
  const note = notes.find((item) => item.id === id);

  if (!note) {
    return <MissingNote />;
  }

  function handleSubmit(data) {
    updateNote(note.id, data);
    navigate(`/notes/${note.id}`);
  }

  return (
    <section className="page">
      <NoteForm
        heading="Edit note"
        initialTitle={note.title}
        initialBody={note.body}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        backTo={`/notes/${note.id}`}
      />
    </section>
  );
}

function NoteForm({ heading, initialTitle = "", initialBody = "", submitLabel, onSubmit, backTo }) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const canSave = title.trim().length > 0 || body.trim().length > 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSave) {
      return;
    }
    onSubmit({ title, body });
  }

  return (
    <form className="noteForm" onSubmit={handleSubmit}>
      <div className="detailToolbar">
        <Link className="ghostButton" to={backTo}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back</span>
        </Link>
        <button className="primaryButton" type="submit" disabled={!canSave}>
          <Save size={18} aria-hidden="true" />
          <span>{submitLabel}</span>
        </button>
      </div>

      <h1>{heading}</h1>
      <label>
        <span>Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="A useful title"
          autoFocus
        />
      </label>
      <label>
        <span>Body</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write the note..."
          rows={12}
        />
      </label>
    </form>
  );
}

function MissingNote() {
  return (
    <section className="page">
      <div className="detailToolbar">
        <Link className="ghostButton" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back</span>
        </Link>
      </div>
      <EmptyState title="Note not found" action="Return to the list and choose another note." />
    </section>
  );
}

function EmptyState({ title, action }) {
  return (
    <div className="emptyState">
      <Edit3 size={34} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{action}</p>
    </div>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

createRoot(document.getElementById("root")).render(<App />);
