/// <reference path="./NotesListDelegate.ts" />
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
