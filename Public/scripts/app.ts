class Editor {
    public delegate: EditorDelegate = null;
    private noteEditorDiv;
    private titleField;
    private contentsField;
    private saveButton;
    private currentNote = null;

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
    }

    public disable(): void {
        this.noteEditorDiv.hide();
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
    public delegate: NotesListDelegate = null;
    private notesDiv;

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

class LoginForm {
    private usernameField;
    private passwordField;
    private loginButton;
    public delegate: LoginFormDelegate = null;

    constructor() {
        this.usernameField = $('#usernameField');
        this.passwordField = $('#passwordField');
        this.loginButton = $('#loginButton');

        this.loginButton.bind('click', () => {
            let user = this.usernameField.val();
            let pass = this.passwordField.val();
            this.delegate.onLogin(user, pass);
        });
    }

    public enable(): void {
        this.usernameField.removeAttr("disabled");
        this.passwordField.removeAttr("disabled");
        this.loginButton.val("login");
        this.loginButton.unbind('click');
        this.loginButton.bind('click', () => {
            let user = this.usernameField.val();
            let pass = this.passwordField.val();
            this.delegate.onLogin(user, pass);
        });
    }

    public disable(): void {
        this.usernameField.attr("disabled", "disabled");
        this.passwordField.attr("disabled", "disabled");
        this.loginButton.val("logout");
        this.loginButton.unbind('click');
        this.loginButton.bind('click', () => {
            this.delegate.onLogout();
        });
    }
}

interface LoginFormDelegate {
    onLogin(user: String, pass: String): void;
    onLogout(): void;
}

enum AuthType {
    none,
    basic,
    token
}

class NetworkComponent {
    private auth = AuthType.none;
    private beforeSendCallback = (xhr) => {};
    public securityToken: String = null;

    noAuth(): void {
        this.auth = AuthType.none;
        this.securityToken = null;
        this.beforeSendCallback = (xhr) => {};
    }

    basicAuth(username: String, password: String) {
        this.auth = AuthType.basic;
        this.securityToken = null;
        this.beforeSendCallback = (xhr) => {
            let token = btoa(username + ":" + password);
            xhr.setRequestHeader ("Authorization", "Basic " + token);
        };
    }

    tokenAuth(token: String): void {
        this.auth = AuthType.token;
        this.securityToken = token;
        this.beforeSendCallback = (xhr) => {
            xhr.setRequestHeader ("Authorization", "Bearer " + token);
        };
    }

    sendRequest(method: String, url: String, data, callback): void {
        $.ajax({
            type: method,
            url: url,
            contentType: "application/json; charset=utf-8",
            beforeSend: this.beforeSendCallback,
            data: data,
            success: callback,
            error: () => {
                alert("Request failed");
            }
        });
    }
}

class Application implements EditorDelegate, NotesListDelegate, LoginFormDelegate {
    private createNoteButton;
    private backupButton;
    private downloadFrame;
    private notesList = new NotesList();
    private editor = new Editor();
    private loginForm = new LoginForm();
    private network = new NetworkComponent();
    private noteTemplate = {
        "title": "New note",
        "contents": "New note contents"
    };

    constructor() {
        this.createNoteButton = $('#createNoteButton');
        this.backupButton = $('#backupButton');
        this.downloadFrame = document.getElementById('downloadFrame');

        this.editor.delegate = this;
        this.notesList.delegate = this;
        this.loginForm.delegate = this;

        this.createNoteButton.bind('click', () => {
            this.createNote();
        });

        this.backupButton.bind('click', () => {
            this.backup();
        });
    }

    onLogin(user: String, pass: String): void {
        let url = "/api/v1/login";
        this.network.basicAuth(user, pass);
        this.network.sendRequest("POST", url, null, (data) => {
            let securityToken = data["token"];
            this.network.tokenAuth(securityToken);
            this.createNoteButton.removeAttr("disabled");
            this.backupButton.removeAttr("disabled");
            this.loginForm.disable();
            this.getNotes();
        });
    }

    onLogout(): void {
        this.editor.disable();
        this.notesList.empty();
        this.network.noAuth();
        this.createNoteButton.attr("disabled", "disabled");
        this.backupButton.attr("disabled", "disabled");
        this.loginForm.enable();
    }

    public createNote(): void {
        this.editor.disable();
        let url = "/api/v1/notes";
        let data = JSON.stringify(this.noteTemplate);
        this.network.sendRequest("POST", url, data, () => {
            this.getNotes();
        });
    }

    public getNotes(): void {
        let url = "/api/v1/notes";
        this.network.sendRequest("GET", url, null, (data) => {
            let notes = data["data"];
            this.notesList.displayNotes(notes);
        });
    }

    public backup(): void {
        // The Vapor docs indicate that one can pass
        // the current security token in the URL
        // https://docs.vapor.codes/2.0/auth/helper/
        let url = "/api/v1/notes/backup?_authorizationBearer=" + this.network.securityToken;
        // Courtesy of
        // https://stackoverflow.com/a/3749395/133764
        this.downloadFrame['src'] = url;
    }

    onSaveButtonClick(note): void {
        let url = "/api/v1/notes/" + note.id;
        let data = JSON.stringify(note);
        this.network.sendRequest("PUT", url, data, () => {
            this.getNotes();
        });
    }

    onDeleteNote(note): void {
        this.editor.disable();
        let url = "/api/v1/notes/" + note.id;
        this.network.sendRequest("DELETE", url, null, () => {
            this.getNotes();
        });
    }

    onEditNote(note): void {
        this.editor.showNote(note);
    }

    onPublishNote(note): void {
        let url = "/api/v1/notes/" + note.id + "/publish";
        this.network.sendRequest("PUT", url, null, () => {
            this.getNotes();
        });
    }

    onUnpublishNote(note): void {
        let url = "/api/v1/notes/" + note.id + "/unpublish";
        this.network.sendRequest("PUT", url, null, () => {
            this.getNotes();
        });
    }
}

let app;

$(function () {
    app = new Application();
});
