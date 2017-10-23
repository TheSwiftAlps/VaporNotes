interface LoginFormDelegate {
    onLogin(user: string, pass: string): void;
    onLogout(): void;
}
