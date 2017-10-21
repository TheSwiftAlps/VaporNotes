class LoginForm {
    public delegate: LoginFormDelegate = null;
    private _usernameField;
    private _passwordField;
    private _loginButton;

    constructor() {
        this._usernameField = $('#usernameField');
        this._passwordField = $('#passwordField');
        this._loginButton = $('#loginButton');

        this._loginButton.bind('click', () => {
            let user = this._usernameField.val();
            let pass = this._passwordField.val();
            this.delegate.onLogin(user, pass);
        });
    }

    enable(): void {
        this._usernameField.removeAttr("disabled");
        this._passwordField.removeAttr("disabled");
        this._loginButton.val("login");
        this._loginButton.unbind('click');
        this._loginButton.bind('click', () => {
            let user = this._usernameField.val();
            let pass = this._passwordField.val();
            this.delegate.onLogin(user, pass);
        });
    }

    disable(): void {
        this._usernameField.attr("disabled", "disabled");
        this._passwordField.attr("disabled", "disabled");
        this._loginButton.val("logout");
        this._loginButton.unbind('click');
        this._loginButton.bind('click', () => {
            this.delegate.onLogout();
        });
    }
}
