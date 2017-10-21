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
var AuthType;
(function (AuthType) {
    AuthType[AuthType["none"] = 0] = "none";
    AuthType[AuthType["basic"] = 1] = "basic";
    AuthType[AuthType["token"] = 2] = "token";
})(AuthType || (AuthType = {}));
var NetworkComponent = (function () {
    function NetworkComponent() {
        this.auth = AuthType.none;
        this.beforeSendCallback = function (xhr) { };
    }
    NetworkComponent.prototype.noAuth = function () {
        this.auth = AuthType.none;
        this.beforeSendCallback = function (xhr) { };
    };
    NetworkComponent.prototype.basicAuth = function (username, password) {
        this.auth = AuthType.basic;
        this.beforeSendCallback = function (xhr) {
            var token = btoa(username + ":" + password);
            xhr.setRequestHeader("Authorization", "Basic " + token);
        };
    };
    NetworkComponent.prototype.tokenAuth = function (token) {
        this.auth = AuthType.token;
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
        this.network = new NetworkComponent();
        this.noteTemplate = {
            "title": "New note",
            "contents": "New note contents"
        };
        this.usernameField = $('#usernameField');
        this.passwordField = $('#passwordField');
        this.loginButton = $('#loginButton');
        this.createNoteButton = $('#createNoteButton');
        this.editor.delegate = this;
        this.notesList.delegate = this;
        this.loginButton.bind('click', function () {
            _this.login();
        });
        this.createNoteButton.bind('click', function () {
            _this.createNote();
        });
    }
    Application.prototype.login = function () {
        var _this = this;
        var url = "/api/v1/login";
        var user = this.usernameField.val();
        var pass = this.passwordField.val();
        this.network.basicAuth(user, pass);
        this.network.sendRequest("POST", url, null, function (data) {
            var securityToken = data["token"];
            _this.network.tokenAuth(securityToken);
            _this.getNotes();
            _this.usernameField.attr("disabled", "disabled");
            _this.passwordField.attr("disabled", "disabled");
            _this.createNoteButton.removeAttr("disabled");
            _this.loginButton.val("logout");
            _this.loginButton.unbind('click');
            _this.loginButton.bind('click', function () {
                _this.logout();
            });
        });
    };
    Application.prototype.logout = function () {
        var _this = this;
        this.editor.disable();
        this.notesList.empty();
        this.network.noAuth();
        this.usernameField.removeAttr("disabled");
        this.passwordField.removeAttr("disabled");
        this.createNoteButton.attr("disabled", "disabled");
        this.loginButton.val("login");
        this.loginButton.unbind('click');
        this.loginButton.bind('click', function () {
            _this.login();
        });
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