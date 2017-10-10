import Vapor

extension Droplet {
    func setupRoutes() throws {
        try resource("notes", NoteController.self)

        get("ping") { req in
            var json = JSON()
            try json.set("ping", "pong")
            return json
        }

        get("info") { req in
            return req.description
        }
    }
}
