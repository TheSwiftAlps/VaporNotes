import Vapor

extension Droplet {
    func setupRoutes() throws {
        let controller = NoteController()
        let api = grouped("api")
        let v1 = api.grouped("v1")
        v1.get("notes", handler: controller.index)
        v1.get("notes", Note.parameter, handler: controller.show)
        v1.post("notes", handler: controller.store)
        v1.put("notes", Note.parameter, handler: controller.replace)
        v1.delete("notes", Note.parameter, handler: controller.delete)

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
