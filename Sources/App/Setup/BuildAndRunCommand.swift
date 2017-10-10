import Vapor
import Console

public final class BuildAndRunCommand: Command {
    public let id = "build-run"
    public let help = ["This commands performs a build and run operation in one shot"]
    public let console: ConsoleProtocol

    public init(console: ConsoleProtocol) {
        self.console = console
    }

    public func run(arguments: [String]) throws {
        console.print("==> vapor build")
        try console.foregroundExecute(program: "vapor", arguments: ["build"])
        console.print("==> vapor run serve")
        try console.foregroundExecute(program: "vapor", arguments: ["run", "serve"])
    }
}

extension BuildAndRunCommand: ConfigInitializable {
    public convenience init(config: Config) throws {
        let console = try config.resolveConsole()
        self.init(console: console)
    }
}

