var NetworkComponent = (function () {
    function NetworkComponent() {
        this._beforeSendCallback = function (xhr) { };
        this._securityToken = null;
    }
    Object.defineProperty(NetworkComponent.prototype, "securityToken", {
        get: function () {
            return this._securityToken;
        },
        enumerable: true,
        configurable: true
    });
    NetworkComponent.prototype.noAuth = function () {
        this._securityToken = null;
        this._beforeSendCallback = function (xhr) { };
    };
    NetworkComponent.prototype.basicAuth = function (username, password) {
        this._securityToken = null;
        this._beforeSendCallback = function (xhr) {
            var token = btoa(username + ":" + password);
            xhr.setRequestHeader("Authorization", "Basic " + token);
        };
    };
    NetworkComponent.prototype.tokenAuth = function (token) {
        this._securityToken = token;
        this._beforeSendCallback = function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        };
    };
    NetworkComponent.prototype.sendRequest = function (method, url, data, callback) {
        $.ajax({
            type: method,
            url: url,
            contentType: "application/json; charset=utf-8",
            beforeSend: this._beforeSendCallback,
            data: data,
            success: callback,
            error: function () {
                alert("Request failed");
            }
        });
    };
    return NetworkComponent;
}());
var Editor = (function () {
    function Editor() {
        var _this = this;
        this.delegate = null;
        this._currentNote = null;
        this._noteEditorDiv = $('#noteEditorDiv');
        this._titleField = $('#titleField');
        this._contentsField = $('#contentsField');
        this._saveButton = $('#saveButton');
        this._saveButton.bind('click', function () {
            var data = {
                "title": _this._titleField.val(),
                "contents": _this._contentsField.val(),
                "id": _this._currentNote.id
            };
            if (_this.delegate) {
                _this.delegate.onSaveNote(data);
            }
        });
    }
    Editor.prototype.enable = function () {
        this._noteEditorDiv.show();
    };
    Editor.prototype.disable = function () {
        this._noteEditorDiv.hide();
        this._titleField.val("");
        this._contentsField.val("");
        this._currentNote = null;
    };
    Editor.prototype.showNote = function (note) {
        this.enable();
        this._currentNote = note;
        this._titleField.val(note.title);
        this._contentsField.val(note.contents);
    };
    return Editor;
}());
var NotesList = (function () {
    function NotesList() {
        this.delegate = null;
        this._notesDiv = $('#notesDiv');
    }
    NotesList.prototype.show = function () {
        this._notesDiv.show();
    };
    NotesList.prototype.hide = function () {
        this._notesDiv.hide();
    };
    NotesList.prototype.empty = function () {
        this._notesDiv.empty();
    };
    NotesList.prototype.writeEmptyMessage = function () {
        var p = $("<p>No notes. Click \"create note\" to write one.</p>");
        this._notesDiv.append(p);
    };
    NotesList.prototype.displayNotes = function (notes) {
        var _this = this;
        this._notesDiv.empty();
        if (notes.length == 0) {
            this.writeEmptyMessage();
            return;
        }
        var _loop_1 = function (note) {
            var p = $("<p>");
            var editButton = $('<input type="button" value="edit">');
            editButton.bind('click', function () {
                _this.delegate.onEditNote(note);
            });
            var deleteButton = $('<input type="button" value="delete">');
            deleteButton.bind('click', function () {
                var ok = confirm("Are you sure?");
                if (ok) {
                    _this.delegate.onDeleteNote(note);
                }
            });
            p.append(editButton);
            p.append("&nbsp;");
            if (note.published) {
                var a = $('<a target="_blank" href="/' + note.slug + '">' + note.title + '</a>');
                var unpublishButton = $('<input type="button" value="unpublish">');
                unpublishButton.bind('click', function () {
                    _this.delegate.onUnpublishNote(note);
                });
                p.append(a);
                p.append("&nbsp;");
                p.append(unpublishButton);
            }
            else {
                p.append(note.title);
                var publishButton = $('<input type="button" value="publish">');
                publishButton.bind('click', function () {
                    _this.delegate.onPublishNote(note);
                });
                p.append("&nbsp;");
                p.append(publishButton);
            }
            p.append("&nbsp;");
            p.append(deleteButton);
            this_1._notesDiv.append(p);
        };
        var this_1 = this;
        for (var _i = 0, notes_1 = notes; _i < notes_1.length; _i++) {
            var note = notes_1[_i];
            _loop_1(note);
        }
    };
    return NotesList;
}());
var LoginForm = (function () {
    function LoginForm() {
        var _this = this;
        this.delegate = null;
        this._usernameField = $('#usernameField');
        this._passwordField = $('#passwordField');
        this._loginButton = $('#loginButton');
        this._loginButton.bind('click', function () {
            var user = _this._usernameField.val();
            var pass = _this._passwordField.val();
            _this.delegate.onLogin(user, pass);
        });
    }
    LoginForm.prototype.enable = function () {
        var _this = this;
        this._usernameField.removeAttr("disabled");
        this._passwordField.removeAttr("disabled");
        this._loginButton.val("login");
        this._loginButton.unbind('click');
        this._loginButton.bind('click', function () {
            var user = _this._usernameField.val();
            var pass = _this._passwordField.val();
            _this.delegate.onLogin(user, pass);
        });
    };
    LoginForm.prototype.disable = function () {
        var _this = this;
        this._usernameField.attr("disabled", "disabled");
        this._passwordField.attr("disabled", "disabled");
        this._loginButton.val("logout");
        this._loginButton.unbind('click');
        this._loginButton.bind('click', function () {
            _this.delegate.onLogout();
        });
    };
    return LoginForm;
}());
var Toolbar = (function () {
    function Toolbar() {
        var _this = this;
        this.delegate = null;
        this._createNoteButton = $('#createNoteButton');
        this._backupButton = $('#backupButton');
        this._searchField = $('#searchField');
        this._searchButton = $('#searchButton');
        this._resetButton = $('#resetButton');
        this._createNoteButton.bind('click', function () {
            _this.delegate.onCreate();
        });
        this._backupButton.bind('click', function () {
            _this.delegate.onBackup();
        });
        this._searchButton.bind('click', function () {
            var searchQuery = _this._searchField.val();
            _this.delegate.onSearch(searchQuery);
        });
        this._resetButton.bind('click', function () {
            _this._searchField.val("");
            _this.delegate.onReset();
        });
    }
    Toolbar.prototype.enable = function () {
        this._createNoteButton.removeAttr("disabled");
        this._backupButton.removeAttr("disabled");
        this._searchField.removeAttr("disabled");
        this._searchButton.removeAttr("disabled");
        this._resetButton.removeAttr("disabled");
    };
    Toolbar.prototype.disable = function () {
        this._createNoteButton.attr("disabled", "disabled");
        this._backupButton.attr("disabled", "disabled");
        this._searchField.attr("disabled", "disabled");
        this._searchButton.attr("disabled", "disabled");
        this._resetButton.attr("disabled", "disabled");
    };
    return Toolbar;
}());
var Application = (function () {
    function Application() {
        this._notesList = new NotesList();
        this._editor = new Editor();
        this._loginForm = new LoginForm();
        this._network = new NetworkComponent();
        this._toolbar = new Toolbar();
        this._noteTemplate = {
            "title": "New note",
            "contents": "New note contents"
        };
        this._downloadFrame = document.getElementById('downloadFrame');
        this._editor.delegate = this;
        this._notesList.delegate = this;
        this._loginForm.delegate = this;
        this._toolbar.delegate = this;
    }
    Application.prototype.onLogin = function (user, pass) {
        var _this = this;
        var url = "/api/v1/login";
        this._network.basicAuth(user, pass);
        this._network.sendRequest("POST", url, null, function (data) {
            var securityToken = data["token"];
            _this._network.tokenAuth(securityToken);
            _this._toolbar.enable();
            _this._loginForm.disable();
            _this._notesList.show();
            _this.getNotes();
        });
    };
    Application.prototype.onLogout = function () {
        this._network.noAuth();
        this._editor.disable();
        this._notesList.hide();
        this._toolbar.disable();
        this._loginForm.enable();
    };
    Application.prototype.onCreate = function () {
        var _this = this;
        this._editor.disable();
        var url = "/api/v1/notes";
        var data = JSON.stringify(this._noteTemplate);
        this._network.sendRequest("POST", url, data, function () {
            _this.getNotes();
        });
    };
    Application.prototype.getNotes = function () {
        var _this = this;
        var url = "/api/v1/notes";
        this._network.sendRequest("GET", url, null, function (data) {
            var notes = data["data"];
            _this._notesList.displayNotes(notes);
        });
    };
    Application.prototype.onBackup = function () {
        var url = "/api/v1/notes/backup?_authorizationBearer=" + this._network.securityToken;
        this._downloadFrame['src'] = url;
    };
    Application.prototype.onSearch = function (query) {
        var _this = this;
        this._editor.disable();
        if (query === null || query.length == 0) {
            this.getNotes();
            return;
        }
        var url = "/api/v1/notes/search";
        var obj = JSON.stringify({ "query": query });
        this._network.sendRequest("POST", url, obj, function (data) {
            var notes = data["data"];
            console.dir(notes);
            _this._notesList.displayNotes(notes);
        });
    };
    Application.prototype.onReset = function () {
        this._editor.disable();
        this.getNotes();
    };
    Application.prototype.onSaveNote = function (note) {
        var _this = this;
        var url = "/api/v1/notes/" + note.id;
        var data = JSON.stringify(note);
        this._network.sendRequest("PUT", url, data, function () {
            _this.getNotes();
        });
    };
    Application.prototype.onDeleteNote = function (note) {
        var _this = this;
        this._editor.disable();
        var url = "/api/v1/notes/" + note.id;
        this._network.sendRequest("DELETE", url, null, function () {
            _this.getNotes();
        });
    };
    Application.prototype.onEditNote = function (note) {
        this._editor.showNote(note);
    };
    Application.prototype.onPublishNote = function (note) {
        var _this = this;
        var url = "/api/v1/notes/" + note.id + "/publish";
        this._network.sendRequest("PUT", url, null, function () {
            _this.getNotes();
        });
    };
    Application.prototype.onUnpublishNote = function (note) {
        var _this = this;
        var url = "/api/v1/notes/" + note.id + "/unpublish";
        this._network.sendRequest("PUT", url, null, function () {
            _this.getNotes();
        });
    };
    return Application;
}());
var app;
$(function () {
    app = new Application();
});
//# sourceMappingURL=app.js.map