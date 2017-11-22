"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
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
exports.Toolbar = Toolbar;
//# sourceMappingURL=Toolbar.js.map