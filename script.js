class NotesApp {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.currentNote = null;
    this.initializeElements();
    this.addEventListeners();
    this.displayNotesList();
    this.handleMarkdownShorcuts();
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      this.darkModeBtn.textContent = "☀️";
    }
  }

  initializeElements() {
    this.notesList = document.getElementById("notesList");
    this.titleInput = document.getElementById("titleInput");
    this.noteContent = document.getElementById("noteContent");
    this.previewContent = document.getElementById("previewContent");
    this.newNoteBtn = document.getElementById("newNoteBtn");
    this.saveNoteBtn = document.getElementById("saveNoteBtn");
    this.deleteNoteBtn = document.getElementById("deleteNoteBtn");
    this.tabBtns = document.querySelectorAll(".tab-btn");
    this.darkModeBtn = document.getElementById("darkModeToggle");
  }

  addEventListeners() {
    this.newNoteBtn.addEventListener("click", () => this.createNewNote());
    this.saveNoteBtn.addEventListener("click", () => this.saveNote());
    this.deleteNoteBtn.addEventListener("click", () => this.deleteNote());
    this.noteContent.addEventListener("input", () => this.updatePreview());
    this.tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchTab(e));
    });
    this.darkModeBtn.addEventListener("click", () => this.toggleDarkMode());
  }

  saveNote() {
    const title = this.titleInput.value.trim();
    const content = this.noteContent.value.trim();

    if (!title || !content) {
      alert("Please enter both title and content.");
      return;
    }

    const note = {
      id: this.currentNote ? this.currentNote.id : Date.now(),
      title,
      content,
      lastModified: new Date().toISOString(),
    };

    if (this.currentNote) {
      const index = this.notes.findIndex((n) => n.id === this.currentNote.id);
      this.notes[index] = note;
    } else {
      this.notes.push(note);
    }

    this.currentNote = note;
    this.saveToLocalStorage();
    this.displayNotesList();
    this.highlightActiveNote();
  }

  highlightActiveNote() {
    const noteItems = document.querySelectorAll(".note-item");
    noteItems.forEach((item) => item.classList.remove("active"));

    if (this.currentNote) {
      const activeNote = Array.from(noteItems).find(
        (item) => item.dataset.id === String(this.currentNote.id)
      );

      if (activeNote) activeNote.classList.add("active");
    }
  }

  deleteNote() {
    if (!this.currentNote) return;

    if (confirm("Are you sure you want to delete this note?")) {
      this.notes = this.notes.filter((note) => note.id !== this.currentNote.id);
      this.saveToLocalStorage();
      this.displayNotesList();
      this.createNewNote();
    }
  }

  createNewNote() {
    this.currentNote = null;
    this.titleInput.value = "";
    this.noteContent.value = "";
    this.updatePreview();
    this.highlightActiveNote();
  }

  saveToLocalStorage() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  switchTab(e) {
    const tab = e.target.dataset.tab;
    this.tabBtns.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    if (tab === "preview") {
      this.noteContent.style.display = "none";
      this.previewContent.style.display = "block";
    } else {
      this.noteContent.style.display = "block";
      this.previewContent.style.display = "none";
    }
  }

  toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    this.darkModeBtn.textContent = isDarkMode ? "☀️" : "🌙";
    localStorage.setItem("darkMode", isDarkMode);
  }

  loadNote(note) {
    this.currentNote = note;
    this.titleInput.value = note.title;
    this.noteContent.value = note.content;
    this.updatePreview();
    this.highlightActiveNote();
  }

  updatePreview() {
    const markdown = this.noteContent.value;
    this.previewContent.innerHTML = marked.parse(markdown);
    hljs.highlightAll();
  }

  displayNotesList() {
    this.notesList.innerHTML = "";
    this.notes
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .forEach((note) => {
        const noteElement = this.createNoteElement(note);
        this.notesList.appendChild(noteElement);
      });
  }

  createNoteElement(note) {
    const div = document.createElement("div");
    div.classList.add("note-item");
    div.dataset.id = note.id;
    if (this.currentNote && this.currentNote.id === note.id) {
      div.classList.add("active");
    }

    const formattedDate = new Date(note.lastModified).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

    div.innerHTML = `
        <h3>${note.title}</h3>
        <p>${formattedDate}</p>
    `;

    div.addEventListener("click", () => this.loadNote(note));
    return div;
  }

  handleMarkdownShorcuts() {
    this.noteContent.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const cursorPos = this.noteContent.selectionStart;
      const text = this.noteContent.value;
      const currentLine = text.substring(0, cursorPos).split("\n").pop();

      const bulletMatch = currentLine.match(/^(\s*)([-*+])\s/);
      if (!bulletMatch) return;

      e.preventDefault();

      const [fullMatch, indentation, bulletChar] = bulletMatch;

      const start = cursorPos - currentLine.length;
      const end = cursorPos;

      if (currentLine.trim() === bulletChar) {
        this.replaceText(start, end, "\n");
        this.setCursorPosition(start);
      } else {
        const newBullet = `\n${indentation}${bulletChar} `;
        this.replaceText(cursorPos, cursorPos, newBullet);
        this.setCursorPosition(cursorPos + newBullet.length);
      }
    });
  }

  replaceText(start, end, newText) {
    this.noteContent.value =
      this.noteContent.value.slice(0, start) +
      newText +
      this.noteContent.value.slice(end);
  }

  setCursorPosition(position) {
    this.noteContent.selectionStart = this.noteContent.selectionEnd = position;
  }
}

new NotesApp();