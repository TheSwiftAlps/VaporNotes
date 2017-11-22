import $ = require('jquery');

export class NetworkComponent {
    private _beforeSendCallback = (xhr) => {};
    private _securityToken: string = null;

    get securityToken(): string {
        return this._securityToken;
    }

    noAuth(): void {
        this._securityToken = null;
        this._beforeSendCallback = (xhr) => {};
    }

    basicAuth(username: string, password: string) {
        this._securityToken = null;
        this._beforeSendCallback = (xhr) => {
            let token = btoa(username + ":" + password);
            xhr.setRequestHeader ("Authorization", "Basic " + token);
        };
    }

    tokenAuth(token: string): void {
        this._securityToken = token;
        this._beforeSendCallback = (xhr) => {
            xhr.setRequestHeader ("Authorization", "Bearer " + token);
        };
    }

    sendRequest(method: string, url: string, data, callback): void {
        $.ajax({
            type: method,
            url: url,
            contentType: "application/json; charset=utf-8",
            beforeSend: this._beforeSendCallback,
            data: data,
            success: callback,
            error: () => {
                alert("Request failed");
            }
        });
    }
}
