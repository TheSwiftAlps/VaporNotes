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
