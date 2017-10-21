interface LoginFormDelegate {
    onLogin(user: String, pass: String): void;
    onLogout(): void;
}
