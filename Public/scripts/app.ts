class Editor {
    private noteEditorDiv;
    private titleField;
    private contentsField;
    private saveButton;
    private currentNote = null;
    public delegate: EditorDelegate = null;

    constructor() {
        this.noteEditorDiv = $('#noteEditorDiv');
        this.titleField = $('#titleField');
        this.contentsField = $('#contentsField');
        this.saveButton = $('#saveButton');

        this.saveButton.bind('click', () => {
            let data = {
                "title": this.titleField.val(),
                "contents": this.contentsField.val(),
                "id": this.currentNote.id
            };
            if (this.delegate) {
                this.delegate.onSaveButtonClick(data);
            }
        });
    }

    public enable(): void {
        this.noteEditorDiv.show();
        this.saveButton.removeAttr("disabled");
        this.titleField.removeAttr("disabled");
        this.contentsField.removeAttr("disabled");
    }

    public disable(): void {
        this.noteEditorDiv.hide();
        this.saveButton.attr("disabled", "disabled");
        this.titleField.attr("disabled", "disabled");
        this.contentsField.attr("disabled", "disabled");
        this.titleField.val("");
        this.contentsField.val("");
        this.currentNote = null;
    }

    public showNote(note): void {
        this.enable();
        this.currentNote = note;
        this.titleField.val(note.title);
        this.contentsField.val(note.contents);
    }
}

interface EditorDelegate {
    onSaveButtonClick(note);
}

class NotesList {
    private notesDiv;
    public delegate: NotesListDelegate = null;

    constructor() {
        this.notesDiv = $('#notesDiv');
    }

    public empty(): void {
        this.notesDiv.empty();
    }

    public displayNotes(notes): void {
        this.empty();
        for (let note of notes) {
            let p = $("<p>");
            let editButton = $('<input type="button" value="edit">');
            editButton.bind('click', () => {
                this.delegate.onEditNote(note);
            });
            let deleteButton = $('<input type="button" value="delete">');
            deleteButton.bind('click', () => {
                this.delegate.onDeleteNote(note);
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
            this.notesDiv.append(p);
        }
    }
}

interface NotesListDelegate {
    onEditNote(note): void;
    onDeleteNote(note): void;
    onPublishNote(note): void;
    onUnpublishNote(note): void;
}

class Application implements EditorDelegate, NotesListDelegate {
    private usernameField;
    private passwordField;
    private loginButton;
    private createNoteButton;
    private securityToken = null;
    private notesList = new NotesList();
    private editor = new Editor();
    private noteTemplate = {
        "title": "New note",
        "contents": "New note contents"
    };

    constructor() {
        this.usernameField = $('#usernameField');
        this.passwordField = $('#passwordField');
        this.loginButton = $('#loginButton');
        this.createNoteButton = $('#createNoteButton');

        this.editor.delegate = this;
        this.notesList.delegate = this;

        this.loginButton.bind('click', () => {
            this.login();
        });

        this.createNoteButton.bind('click', () => {
            this.createNote();
        });
    }

    public login(): void {
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            contentType: "application/json; charset=utf-8",
            beforeSend: (xhr) => {
                let token = btoa(this.usernameField.val() + ":" + this.passwordField.val());
                xhr.setRequestHeader ("Authorization", "Basic " + token);
            },
            success: (data) => {
                this.securityToken = data["token"];
                this.getNotes();
                this.usernameField.attr("disabled", "disabled");
                this.passwordField.attr("disabled", "disabled");
                this.createNoteButton.removeAttr("disabled");
                this.loginButton.val("logout");
                this.loginButton.unbind('click');
                this.loginButton.bind('click', () => {
                    this.logout();
                });
            },
            error: () => {
                alert("Wrong credentials");
            },
        });
    }

    public logout(): void {
        this.editor.disable();
        this.notesList.empty();
        this.securityToken = null;
        this.usernameField.removeAttr("disabled");
        this.passwordField.removeAttr("disabled");
        this.createNoteButton.attr("disabled", "disabled");
        this.loginButton.val("login");
        this.loginButton.unbind('click');
        this.loginButton.bind('click', () => {
            this.login();
        });
    }

    public createNote(): void {
        if (this.securityToken !== null) {
            this.editor.disable();
            $.ajax({
                type: "POST",
                url: "/api/v1/notes",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(this.noteTemplate),
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
        else {
            alert("Please login first");
        }
    }

    public getNotes(): void {
        if (this.securityToken !== null) {
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes",
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: (data) => {
                    let notes = data["data"];
                    this.notesList.displayNotes(notes);
                },
            });
        }
        else {
            alert("Please login first");
        }
    }

    public onDeleteNote(note): void {
        if (this.securityToken !== null) {
            this.editor.disable();
            $.ajax({
                type: "DELETE",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + note.id,
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
        else {
            alert("Please login first");
        }
    }

    public onSaveButtonClick(note): void {
        if (this.securityToken !== null && note !== null) {
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + note.id,
                data: JSON.stringify(note),
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
    }

    public onEditNote(note): void {
        this.editor.showNote(note);
    }

    public onPublishNote(note): void {
        if (this.securityToken !== null) {
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + note.id + "/publish",
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
    }

    public onUnpublishNote(note): void {
        if (this.securityToken !== null) {
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + note.id + "/unpublish",
                beforeSend: (xhr) => {
                    xhr.setRequestHeader ("Authorization", "Bearer " + this.securityToken);
                },
                success: () => {
                    this.getNotes();
                },
            });
        }
    }
}

let app;

$(function () {
    app = new Application();
});
