import $ = require('jquery');
import {NotesListDelegate} from "./NotesListDelegate";

export class NotesList {
    public delegate: NotesListDelegate = null;
    private _notesDiv;

    constructor() {
        this._notesDiv = $('#notesDiv');
    }

    show(): void {
        this._notesDiv.show();
    }

    hide(): void {
        this._notesDiv.hide();
    }

    empty(): void {
        this._notesDiv.empty();
    }

    writeEmptyMessage(): void {
        let p = $("<p>No notes. Click \"create note\" to write one.</p>");
        this._notesDiv.append(p);
    }

    displayNotes(notes): void {
        this._notesDiv.empty();
        if (notes.length == 0) {
            this.writeEmptyMessage();
            return;
        }
        for (let note of notes) {
            let p = $("<p>");
            let editButton = $('<input type="button" value="edit">');
            editButton.bind('click', () => {
                this.delegate.onEditNote(note);
            });
            let deleteButton = $('<input type="button" value="delete">');
            deleteButton.bind('click', () => {
                let ok = confirm("Are you sure?");
                if (ok) {
                    this.delegate.onDeleteNote(note);
                }
            });
            p.append(editButton);
            p.append("&nbsp;");
            if (note.published) {
                let a = $('<a target="_blank" href="/' + note.slug + '">' + note.title + '</a>');
                let unpublishButton = $('<input type="button" value="unpublish">');
                unpublishButton.bind('click', () => {
                    this.delegate.onUnpublishNote(note);
                });
                p.append(a);
                p.append("&nbsp;");
                p.append(unpublishButton);
            }
            else {
                p.append(note.title);
                let publishButton = $('<input type="button" value="publish">');
                publishButton.bind('click', () => {
                    this.delegate.onPublishNote(note);
                });
                p.append("&nbsp;");
                p.append(publishButton);
            }
            p.append("&nbsp;");
            p.append(deleteButton);
            this._notesDiv.append(p);
        }
    }
}
