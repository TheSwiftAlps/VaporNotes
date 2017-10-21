/// <reference path="./NetworkComponent.ts" />
/// <reference path="./EditorDelegate.ts" />
/// <reference path="./Editor.ts" />
/// <reference path="./NotesListDelegate.ts" />
/// <reference path="./NotesList.ts" />
/// <reference path="./LoginFormDelegate.ts" />
/// <reference path="./LoginForm.ts" />
/// <reference path="./ToolbarDelegate.ts" />
/// <reference path="./Toolbar.ts" />

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
            this._notesList.show();
            this.getNotes();
        });
    }

    onLogout(): void {
        this._network.noAuth();
        this._editor.disable();
        this._notesList.hide();
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

    getNotes(): void {
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
