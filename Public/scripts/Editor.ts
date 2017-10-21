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

    enable(): void {
        this._noteEditorDiv.show();
    }

    disable(): void {
        this._noteEditorDiv.hide();
        this._titleField.val("");
        this._contentsField.val("");
        this._currentNote = null;
    }

    showNote(note): void {
        this.enable();
        this._currentNote = note;
        this._titleField.val(note.title);
        this._contentsField.val(note.contents);
    }
}