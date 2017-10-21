"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.Editor = Editor;
