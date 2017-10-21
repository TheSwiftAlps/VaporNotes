var Editor = (function () {
    function Editor() {
        var _this = this;
        this.currentNote = null;
        this.delegate = null;
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
                _this.delegate.onSaveButtonClick(_this, data);
            }
        });
    }
    Editor.prototype.enable = function () {
        this.noteEditorDiv.show();
        this.saveButton.removeAttr("disabled");
        this.titleField.removeAttr("disabled");
        this.contentsField.removeAttr("disabled");
    };
    Editor.prototype.disable = function () {
        this.noteEditorDiv.hide();
        this.saveButton.attr("disabled", "disabled");
        this.titleField.attr("disabled", "disabled");
        this.contentsField.attr("disabled", "disabled");
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
var Application = (function () {
    function Application() {
        var _this = this;
        this.securityToken = null;
        this.notes = null;
        this.editor = new Editor();
        this.noteTemplate = {
            "title": "New note",
            "contents": "New note contents"
        };
        this.usernameField = $('#usernameField');
        this.passwordField = $('#passwordField');
        this.loginButton = $('#loginButton');
        this.createNoteButton = $('#createNoteButton');
        this.notesDiv = $('#notesDiv');
        this.editor.delegate = this;
        this.loginButton.bind('click', function () {
            _this.login();
        });
        this.createNoteButton.bind('click', function () {
            _this.createNote();
        });
    }
    Application.prototype.login = function () {
        var _this = this;
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            contentType: "application/json; charset=utf-8",
            beforeSend: function (xhr) {
                var token = btoa(_this.usernameField.val() + ":" + _this.passwordField.val());
                xhr.setRequestHeader("Authorization", "Basic " + token);
            },
            success: function (data) {
                _this.securityToken = data["token"];
                _this.getNotes();
                _this.usernameField.attr("disabled", "disabled");
                _this.passwordField.attr("disabled", "disabled");
                _this.createNoteButton.removeAttr("disabled");
                _this.loginButton.val("logout");
                _this.loginButton.unbind('click');
                _this.loginButton.bind('click', function () {
                    _this.logout();
                });
            },
            error: function () {
                alert("Wrong credentials");
            },
        });
    };
    Application.prototype.logout = function () {
        var _this = this;
        this.editor.disable();
        this.notesDiv.empty();
        this.securityToken = null;
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
        if (this.securityToken !== null) {
            this.editor.disable();
            $.ajax({
                type: "POST",
                url: "/api/v1/notes",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(this.noteTemplate),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + _this.securityToken);
                },
                success: function () {
                    _this.getNotes();
                },
            });
        }
        else {
            alert("Please login first");
        }
    };
    Application.prototype.getNotes = function () {
        var _this = this;
        if (this.securityToken !== null) {
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + _this.securityToken);
                },
                success: function (data) {
                    _this.notes = data["data"];
                    _this.displayNotes();
                },
            });
        }
        else {
            alert("Please login first");
        }
    };
    Application.prototype.deleteNote = function (id) {
        var _this = this;
        if (this.securityToken !== null) {
            this.editor.disable();
            $.ajax({
                type: "DELETE",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + id,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + _this.securityToken);
                },
                success: function () {
                    _this.getNotes();
                },
            });
        }
        else {
            alert("Please login first");
        }
    };
    Application.prototype.onSaveButtonClick = function (editor, note) {
        var _this = this;
        if (this.securityToken !== null && note !== null) {
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + note.id,
                data: JSON.stringify(note),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + _this.securityToken);
                },
                success: function () {
                    _this.getNotes();
                },
            });
        }
    };
    Application.prototype.publishNote = function (id) {
        var _this = this;
        if (this.securityToken !== null) {
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + id + "/publish",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + _this.securityToken);
                },
                success: function () {
                    _this.getNotes();
                },
            });
        }
    };
    Application.prototype.unpublishNote = function (id) {
        var _this = this;
        if (this.securityToken !== null) {
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/v1/notes/" + id + "/unpublish",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + _this.securityToken);
                },
                success: function () {
                    _this.getNotes();
                },
            });
        }
    };
    Application.prototype.displayNotes = function () {
        var _this = this;
        this.notesDiv.empty();
        var _loop_1 = function (note) {
            var p = $("<p>");
            var editButton = $('<input type="button" value="edit">');
            editButton.bind('click', function () {
                _this.editor.showNote(note);
            });
            var deleteButton = $('<input type="button" value="delete">');
            deleteButton.bind('click', function () {
                _this.deleteNote(note.id);
            });
            p.append(editButton);
            p.append("&nbsp;");
            if (note.published) {
                var a = $('<a target="_blank" href="/' + note.slug + '">' + note.title + '</a>');
                var unpublishButton = $('<input type="button" value="unpublish">');
                unpublishButton.bind('click', function () {
                    _this.unpublishNote(note.id);
                });
                p.append(a);
                p.append("&nbsp;");
                p.append(unpublishButton);
            }
            else {
                p.append(note.title);
                var publishButton = $('<input type="button" value="publish">');
                publishButton.bind('click', function () {
                    _this.publishNote(note.id);
                });
                p.append("&nbsp;");
                p.append(publishButton);
            }
            p.append("&nbsp;");
            p.append(deleteButton);
            this_1.notesDiv.append(p);
        };
        var this_1 = this;
        for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            _loop_1(note);
        }
    };
    return Application;
}());
var app;
$(function () {
    app = new Application();
});
//# sourceMappingURL=app.js.map