class Editor {
    public delegate: EditorDelegate = null;
    private _noteEditorDiv;
    private _titleField;
    private _contentsField;
    private _saveButton;
    private _currentNote = null;

    constructor() {
        this._noteEditorDiv = $('#noteEditorDiv');
        this._titleField = $('#titleField');
        this._contentsField = $('#contentsField');
        this._saveButton = $('#saveButton');

        this._saveButton.bind('click', () => {
            let data = {
                "title": this._titleField.val(),
                "contents": this._contentsField.val(),
                "id": this._currentNote.id
            };
            if (this.delegate) {
                this.delegate.onSaveNote(data);
            }
        });
    }

    public enable(): void {
        this._noteEditorDiv.show();
    }

    public disable(): void {
        this._noteEditorDiv.hide();
        this._titleField.val("");
        this._contentsField.val("");
        this._currentNote = null;
    }

    public showNote(note): void {
        this.enable();
        this._currentNote = note;
        this._titleField.val(note.title);
        this._contentsField.val(note.contents);
    }
}

interface EditorDelegate {
    onSaveNote(note);
}

class NotesList {
    public delegate: NotesListDelegate = null;
    private _notesDiv;

    constructor() {
        this._notesDiv = $('#notesDiv');
    }

    public empty(): void {
        this._notesDiv.empty();
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
            this._notesDiv.append(p);
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
    public delegate: LoginFormDelegate = null;
    private _usernameField;
    private _passwordField;
    private _loginButton;

    constructor() {
        this._usernameField = $('#usernameField');
        this._passwordField = $('#passwordField');
        this._loginButton = $('#loginButton');

        this._loginButton.bind('click', () => {
            let user = this._usernameField.val();
            let pass = this._passwordField.val();
            this.delegate.onLogin(user, pass);
        });
    }

    public enable(): void {
        this._usernameField.removeAttr("disabled");
        this._passwordField.removeAttr("disabled");
        this._loginButton.val("login");
        this._loginButton.unbind('click');
        this._loginButton.bind('click', () => {
            let user = this._usernameField.val();
            let pass = this._passwordField.val();
            this.delegate.onLogin(user, pass);
        });
    }

    public disable(): void {
        this._usernameField.attr("disabled", "disabled");
        this._passwordField.attr("disabled", "disabled");
        this._loginButton.val("logout");
        this._loginButton.unbind('click');
        this._loginButton.bind('click', () => {
            this.delegate.onLogout();
        });
    }
}

interface LoginFormDelegate {
    onLogin(user: String, pass: String): void;
    onLogout(): void;
}

class NetworkComponent {
    private _beforeSendCallback = (xhr) => {};
    private _securityToken: String = null;

    get securityToken(): String {
        return this._securityToken;
    }

    noAuth(): void {
        this._securityToken = null;
        this._beforeSendCallback = (xhr) => {};
    }

    basicAuth(username: String, password: String) {
        this._securityToken = null;
        this._beforeSendCallback = (xhr) => {
            let token = btoa(username + ":" + password);
            xhr.setRequestHeader ("Authorization", "Basic " + token);
        };
    }

    tokenAuth(token: String): void {
        this._securityToken = token;
        this._beforeSendCallback = (xhr) => {
            xhr.setRequestHeader ("Authorization", "Bearer " + token);
        };
    }

    sendRequest(method: String, url: String, data, callback): void {
        $.ajax({
            type: method,
            url: url,
            contentType: "application/json; charset=utf-8",
            beforeSend: this._beforeSendCallback,
            data: data,
            success: callback,
            error: () => {
                alert("Request failed");
            }
        });
    }
}

class Toolbar {
    public delegate: ToolbarDelegate = null;
    private _createNoteButton;
    private _backupButton;
    private _searchField;
    private _searchButton;
    private _resetButton;

    constructor() {
        this._createNoteButton = $('#createNoteButton');
        this._backupButton = $('#backupButton');
        this._searchField = $('#searchField');
        this._searchButton = $('#searchButton');
        this._resetButton = $('#resetButton');
        this._createNoteButton.bind('click', () => {
            this.delegate.onCreate();
        });
        this._backupButton.bind('click', () => {
            this.delegate.onBackup();
        });
        this._searchButton.bind('click', () => {
            let searchQuery = this._searchField.val();
            this.delegate.onSearch(searchQuery);
        });
        this._resetButton.bind('click', () => {
            this._searchField.val("");
            this.delegate.onReset();
        });
    }

    enable(): void {
        this._createNoteButton.removeAttr("disabled");
        this._backupButton.removeAttr("disabled");
        this._searchField.removeAttr("disabled");
        this._searchButton.removeAttr("disabled");
        this._resetButton.removeAttr("disabled");
    }

    disable(): void {
        this._createNoteButton.attr("disabled", "disabled");
        this._backupButton.attr("disabled", "disabled");
        this._searchField.attr("disabled", "disabled");
        this._searchButton.attr("disabled", "disabled");
        this._resetButton.attr("disabled", "disabled");
    }
}

interface ToolbarDelegate {
    onCreate(): void;
    onBackup(): void;
    onSearch(query: String): void;
    onReset(): void;
}

class Application implements EditorDelegate, NotesListDelegate, LoginFormDelegate, ToolbarDelegate {
    private _notesList = new NotesList();
    private _editor = new Editor();
    private _loginForm = new LoginForm();
    private _network = new NetworkComponent();
    private _toolbar = new Toolbar();
    private _downloadFrame;
    private _noteTemplate = {
        "title": "New note",
        "contents": "New note contents"
    };

    constructor() {
        this._downloadFrame = document.getElementById('downloadFrame');
        this._editor.delegate = this;
        this._notesList.delegate = this;
        this._loginForm.delegate = this;
        this._toolbar.delegate = this;
    }

    onLogin(user: String, pass: String): void {
        let url = "/api/v1/login";
        this._network.basicAuth(user, pass);
        this._network.sendRequest("POST", url, null, (data) => {
            let securityToken = data["token"];
            this._network.tokenAuth(securityToken);
            this._toolbar.enable();
            this._loginForm.disable();
            this.getNotes();
        });
    }

    onLogout(): void {
        this._editor.disable();
        this._notesList.empty();
        this._network.noAuth();
        this._toolbar.disable();
        this._loginForm.enable();
    }

    onCreate(): void {
        this._editor.disable();
        let url = "/api/v1/notes";
        let data = JSON.stringify(this._noteTemplate);
        this._network.sendRequest("POST", url, data, () => {
            this.getNotes();
        });
    }

    public getNotes(): void {
        let url = "/api/v1/notes";
        this._network.sendRequest("GET", url, null, (data) => {
            let notes = data["data"];
            this._notesList.displayNotes(notes);
        });
    }

    onBackup(): void {
        // The Vapor docs indicate that one can pass
        // the current security token in the URL
        // https://docs.vapor.codes/2.0/auth/helper/
        let url = "/api/v1/notes/backup?_authorizationBearer=" + this._network.securityToken;
        // Courtesy of
        // https://stackoverflow.com/a/3749395/133764
        this._downloadFrame['src'] = url;
    }

    onSearch(query: String): void {
        this._editor.disable();
        if (query === null || query.length == 0) {
            this.getNotes();
            return;
        }
        let url = "/api/v1/notes/search";
        let obj = JSON.stringify({ "query": query });
        this._network.sendRequest("POST", url, obj, (data) => {
            let notes = data["data"];
            console.dir(notes);
            this._notesList.displayNotes(notes);
        });
    }

    onReset(): void {
        this._editor.disable();
        this.getNotes();
    }

    onSaveNote(note): void {
        let url = "/api/v1/notes/" + note.id;
        let data = JSON.stringify(note);
        this._network.sendRequest("PUT", url, data, () => {
            this.getNotes();
        });
    }

    onDeleteNote(note): void {
        this._editor.disable();
        let url = "/api/v1/notes/" + note.id;
        this._network.sendRequest("DELETE", url, null, () => {
            this.getNotes();
        });
    }

    onEditNote(note): void {
        this._editor.showNote(note);
    }

    onPublishNote(note): void {
        let url = "/api/v1/notes/" + note.id + "/publish";
        this._network.sendRequest("PUT", url, null, () => {
            this.getNotes();
        });
    }

    onUnpublishNote(note): void {
        let url = "/api/v1/notes/" + note.id + "/unpublish";
        this._network.sendRequest("PUT", url, null, () => {
            this.getNotes();
        });
    }
}

let app;

$(function () {
    app = new Application();
});
