"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid");
var NotesList_1 = require("./NotesList");
var Editor_1 = require("./Editor");
var LoginForm_1 = require("./LoginForm");
var NetworkComponent_1 = require("./NetworkComponent");
var Toolbar_1 = require("./Toolbar");
var Application = (function () {
    function Application() {
        this._notesList = new NotesList_1.NotesList();
        this._editor = new Editor_1.Editor();
        this._loginForm = new LoginForm_1.LoginForm();
        this._network = new NetworkComponent_1.NetworkComponent();
        this._toolbar = new Toolbar_1.Toolbar();
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
        var uuidv4 = uuid.v4();
        var template = {
            "title": "New note",
            "contents": "New note contents",
            "id": uuidv4
        };
        var data = JSON.stringify(template);
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
        // The Vapor docs indicate that one can pass
        // the current security token in the URL
        // https://docs.vapor.codes/2.0/auth/helper/
        var url = "/api/v1/notes/backup?_authorizationBearer=" + this._network.securityToken;
        // Courtesy of
        // https://stackoverflow.com/a/3749395/133764
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
exports.Application = Application;
//# sourceMappingURL=Application.js.map