"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
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
exports.LoginForm = LoginForm;
//# sourceMappingURL=LoginForm.js.map