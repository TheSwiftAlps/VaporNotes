import FluentProvider
import MarkdownProvider
import AuthProvider
import LeafProvider

extension Config {
    public func setup() throws {
        // allow fuzzy conversions for these types
        // (add your own types here)
        Node.fuzzy = [Row.self, JSON.self, Node.self]

        try setupProviders()
        try setupPreparations()
        try setupMiddleware()
        try setupCommands()
    }

    private func setupCommands() throws {
        try addConfigurable(command: BuildAndRunCommand.init, name: "build-run")
    }

    private func setupMiddleware() throws {
        try addConfigurable(middleware: VersionMiddleware(), name: "version")
    }

    /// Configure providers
    private func setupProviders() throws {
        try addProvider(FluentProvider.Provider.self)
        try addProvider(MarkdownProvider.Provider.self)
        try addProvider(AuthProvider.Provider.self)
        try addProvider(LeafProvider.Provider.self)
    }

    /// Add all models that should have their
    /// schemas prepared before the app boots
    private func setupPreparations() throws {
        preparations.append(Note.self)
        preparations.append(User.self)
        preparations.append(Token.self)
    }
}
