class NetworkComponent {
    private _beforeSendCallback = (xhr) => {};
    private _securityToken: String = null;

    get securityToken(): String {
        return this._securityToken;
    }

    noAuth(): void {
        this._securityToken = null;
        this._beforeSendCallback = (xhr) => {};
    }

    basicAuth(username: String, password: String) {
        this._securityToken = null;
        this._beforeSendCallback = (xhr) => {
            let token = btoa(username + ":" + password);
            xhr.setRequestHeader ("Authorization", "Basic " + token);
        };
    }

    tokenAuth(token: String): void {
        this._securityToken = token;
        this._beforeSendCallback = (xhr) => {
            xhr.setRequestHeader ("Authorization", "Bearer " + token);
        };
    }

    sendRequest(method: String, url: String, data, callback): void {
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
