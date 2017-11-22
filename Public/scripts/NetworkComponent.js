"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var NetworkComponent = (function () {
    function NetworkComponent() {
        this._beforeSendCallback = function (xhr) { };
        this._securityToken = null;
    }
    Object.defineProperty(NetworkComponent.prototype, "securityToken", {
        get: function () {
            return this._securityToken;
        },
        enumerable: true,
        configurable: true
    });
    NetworkComponent.prototype.noAuth = function () {
        this._securityToken = null;
        this._beforeSendCallback = function (xhr) { };
    };
    NetworkComponent.prototype.basicAuth = function (username, password) {
        this._securityToken = null;
        this._beforeSendCallback = function (xhr) {
            var token = btoa(username + ":" + password);
            xhr.setRequestHeader("Authorization", "Basic " + token);
        };
    };
    NetworkComponent.prototype.tokenAuth = function (token) {
        this._securityToken = token;
        this._beforeSendCallback = function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        };
    };
    NetworkComponent.prototype.sendRequest = function (method, url, data, callback) {
        $.ajax({
            type: method,
            url: url,
            contentType: "application/json; charset=utf-8",
            beforeSend: this._beforeSendCallback,
            data: data,
            success: callback,
            error: function () {
                alert("Request failed");
            }
        });
    };
    return NetworkComponent;
}());
exports.NetworkComponent = NetworkComponent;
//# sourceMappingURL=NetworkComponent.js.map