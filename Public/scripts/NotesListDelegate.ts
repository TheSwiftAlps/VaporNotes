interface NotesListDelegate {
    onEditNote(note): void;
    onDeleteNote(note): void;
    onPublishNote(note): void;
    onUnpublishNote(note): void;
}
