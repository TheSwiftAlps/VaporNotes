var Editor = (function () {
    function Editor() {
        var _this = this;
        this.delegate = null;
        this.currentNote = null;
        this.noteEditorDiv = $('#noteEditorDiv');
        this.titleField = $('#titleField');
        this.contentsField = $('#contentsField');
        this.saveButton = $('#saveButton');
        this.saveButton.bind('click', function () {
            var data = {
                "title": _this.titleField.val(),
                "contents": _this.contentsField.val(),
                "id": _this.currentNote.id
            };
            if (_this.delegate) {
                _this.delegate.onSaveButtonClick(data);
            }
        });
    }
    Editor.prototype.enable = function () {
        this.noteEditorDiv.show();
    };
    Editor.prototype.disable = function () {
        this.noteEditorDiv.hide();
        this.titleField.val("");
        this.contentsField.val("");
        this.currentNote = null;
    };
    Editor.prototype.showNote = function (note) {
        this.enable();
        this.currentNote = note;
        this.titleField.val(note.title);
        this.contentsField.val(note.contents);
    };
    return Editor;
}());
var NotesList = (function () {
    function NotesList() {
        this.delegate = null;
        this.notesDiv = $('#notesDiv');
    }
    NotesList.prototype.empty = function () {
        this.notesDiv.empty();
    };
    NotesList.prototype.displayNotes = function (notes) {
        var _this = this;
        this.empty();
        var _loop_1 = function (note) {
            var p = $("<p>");
            var editButton = $('<input type="button" value="edit">');
            editButton.bind('click', function () {
                _this.delegate.onEditNote(note);
            });
            var deleteButton = $('<input type="button" value="delete">');
            deleteButton.bind('click', function () {
                _this.delegate.onDeleteNote(note);
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
            this_1.notesDiv.append(p);
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
        this.usernameField = $('#usernameField');
        this.passwordField = $('#passwordField');
        this.loginButton = $('#loginButton');
        this.loginButton.bind('click', function () {
            var user = _this.usernameField.val();
            var pass = _this.passwordField.val();
            _this.delegate.onLogin(user, pass);
        });
    }
    LoginForm.prototype.enable = function () {
        var _this = this;
        this.usernameField.removeAttr("disabled");
        this.passwordField.removeAttr("disabled");
        this.loginButton.val("login");
        this.loginButton.unbind('click');
        this.loginButton.bind('click', function () {
            var user = _this.usernameField.val();
            var pass = _this.passwordField.val();
            _this.delegate.onLogin(user, pass);
        });
    };
    LoginForm.prototype.disable = function () {
        var _this = this;
        this.usernameField.attr("disabled", "disabled");
        this.passwordField.attr("disabled", "disabled");
        this.loginButton.val("logout");
        this.loginButton.unbind('click');
        this.loginButton.bind('click', function () {
            _this.delegate.onLogout();
        });
    };
    return LoginForm;
}());
var NetworkComponent = (function () {
    function NetworkComponent() {
        this.beforeSendCallback = function (xhr) { };
        this.securityToken = null;
    }
    NetworkComponent.prototype.noAuth = function () {
        this.securityToken = null;
        this.beforeSendCallback = function (xhr) { };
    };
    NetworkComponent.prototype.basicAuth = function (username, password) {
        this.securityToken = null;
        this.beforeSendCallback = function (xhr) {
            var token = btoa(username + ":" + password);
            xhr.setRequestHeader("Authorization", "Basic " + token);
        };
    };
    NetworkComponent.prototype.tokenAuth = function (token) {
        this.securityToken = token;
        this.beforeSendCallback = function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        };
    };
    NetworkComponent.prototype.sendRequest = function (method, url, data, callback) {
        $.ajax({
            type: method,
            url: url,
            contentType: "application/json; charset=utf-8",
            beforeSend: this.beforeSendCallback,
            data: data,
            success: callback,
            error: function () {
                alert("Request failed");
            }
        });
    };
    return NetworkComponent;
}());
var Application = (function () {
    function Application() {
        var _this = this;
        this.notesList = new NotesList();
        this.editor = new Editor();
        this.loginForm = new LoginForm();
        this.network = new NetworkComponent();
        this.noteTemplate = {
            "title": "New note",
            "contents": "New note contents"
        };
        this.createNoteButton = $('#createNoteButton');
        this.backupButton = $('#backupButton');
        this.downloadFrame = document.getElementById('downloadFrame');
        this.editor.delegate = this;
        this.notesList.delegate = this;
        this.loginForm.delegate = this;
        this.createNoteButton.bind('click', function () {
            _this.createNote();
        });
        this.backupButton.bind('click', function () {
            _this.backup();
        });
    }
    Application.prototype.onLogin = function (user, pass) {
        var _this = this;
        var url = "/api/v1/login";
        this.network.basicAuth(user, pass);
        this.network.sendRequest("POST", url, null, function (data) {
            var securityToken = data["token"];
            _this.network.tokenAuth(securityToken);
            _this.createNoteButton.removeAttr("disabled");
            _this.backupButton.removeAttr("disabled");
            _this.loginForm.disable();
            _this.getNotes();
        });
    };
    Application.prototype.onLogout = function () {
        this.editor.disable();
        this.notesList.empty();
        this.network.noAuth();
        this.createNoteButton.attr("disabled", "disabled");
        this.backupButton.attr("disabled", "disabled");
        this.loginForm.enable();
    };
    Application.prototype.createNote = function () {
        var _this = this;
        this.editor.disable();
        var url = "/api/v1/notes";
        var data = JSON.stringify(this.noteTemplate);
        this.network.sendRequest("POST", url, data, function () {
            _this.getNotes();
        });
    };
    Application.prototype.getNotes = function () {
        var _this = this;
        var url = "/api/v1/notes";
        this.network.sendRequest("GET", url, null, function (data) {
            var notes = data["data"];
            _this.notesList.displayNotes(notes);
        });
    };
    Application.prototype.backup = function () {
        // The Vapor docs indicate that one can pass
        // the current security token in the URL
        // https://docs.vapor.codes/2.0/auth/helper/
        var url = "/api/v1/notes/backup?_authorizationBearer=" + this.network.securityToken;
        // Courtesy of
        // https://stackoverflow.com/a/3749395/133764
        this.downloadFrame['src'] = url;
    };
    Application.prototype.onSaveButtonClick = function (note) {
        var _this = this;
        var url = "/api/v1/notes/" + note.id;
        var data = JSON.stringify(note);
        this.network.sendRequest("PUT", url, data, function () {
            _this.getNotes();
        });
    };
    Application.prototype.onDeleteNote = function (note) {
        var _this = this;
        this.editor.disable();
        var url = "/api/v1/notes/" + note.id;
        this.network.sendRequest("DELETE", url, null, function () {
            _this.getNotes();
        });
    };
    Application.prototype.onEditNote = function (note) {
        this.editor.showNote(note);
    };
    Application.prototype.onPublishNote = function (note) {
        var _this = this;
        var url = "/api/v1/notes/" + note.id + "/publish";
        this.network.sendRequest("PUT", url, null, function () {
            _this.getNotes();
        });
    };
    Application.prototype.onUnpublishNote = function (note) {
        var _this = this;
        var url = "/api/v1/notes/" + note.id + "/unpublish";
        this.network.sendRequest("PUT", url, null, function () {
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