import Foundation
import Vapor
import HTTP
import AuthProvider

extension Droplet {
    func setupRoutes() throws {
        try setupUnauthenticatedRoutes()
        try setupPasswordProtectedRoutes()
        try setupTokenProtectedRoutes()
    }

    /// Sets up all routes that can be accessed
    /// without any authentication. This includes
    /// creating a new User.
    private func setupUnauthenticatedRoutes() throws {
        get("/") { request in
            return try Response(filePath: self.config.publicDir + "index.html")
        }

        get("ping") { req in
            var json = JSON()
            try json.set("ping", "pong")
            return json
        }

        get("info") { req in
            return req.description
        }

        get(String.parameter) { req in
            let slug = try req.parameters.next(String.self)
            let note = try Note.makeQuery().filter("slug", slug)
                                           .filter("published", true).first()
            guard let n = note else {
                throw Abort(.notFound, reason: "Note not found")
            }
            let data = [
                "title": n.title,
                "contents": n.contents
            ]
            return try self.view.make("template", data)
        }

        // create a new user
        //
        // POST /users
        // <json containing new user information>
        post("api", "v1", "users") { req in
            // require that the request body be json
            guard let json = req.json else {
                throw Abort(.badRequest)
            }

            // initialize the name and email from
            // the request json
            let user = try User(json: json)

            // ensure no user with this email already exists
            guard try User.makeQuery().filter("email", user.email).first() == nil else {
                throw Abort(.badRequest, reason: "A user with that email already exists.")
            }

            // require a plaintext password is supplied
            guard let password = json["password"]?.string else {
                throw Abort(.badRequest)
            }

            // hash the password and set it on the user
            user.password = try self.hash.make(password.makeBytes()).makeString()

            // save and return the new user
            try user.save()
            return user
        }
    }

    /// Sets up all routes that can be accessed using
    /// username + password authentication.
    /// Since we want to minimize how often the username + password
    /// is sent, we will only use this form of authentication to
    /// log the user in.
    /// After the user is logged in, they will receive a token that
    /// they can use for further authentication.
    private func setupPasswordProtectedRoutes() throws {
        // creates a route group protected by the password middleware.
        // the User type can be passed to this middleware since it
        // conforms to PasswordAuthenticatable
        let password = grouped([
            PasswordAuthenticationMiddleware(User.self)
        ])

        // verifies the user has been authenticated using the password
        // middleware, then generates, saves, and returns a new access token.
        //
        // POST /login
        // Authorization: Basic <base64 email:password>
        password.post("api", "v1", "login") { req in
            let user = try req.user()
            let token = try Token.generate(for: user)
            try token.save()
            return token
        }
    }

    /// Sets up all routes that can be accessed using
    /// the authentication token received during login.
    /// All of our secure routes will go here.
    private func setupTokenProtectedRoutes() throws {
        // creates a route group protected by the token middleware.
        // the User type can be passed to this middleware since it
        // conforms to TokenAuthenticatable
        let token = grouped([
            TokenAuthenticationMiddleware(User.self)
        ])

        // simply returns a greeting to the user that has been authed
        // using the token middleware.
        //
        // GET /me
        // Authorization: Bearer <token from /login>
        token.get("api", "v1", "me") { req in
            let user = try req.user()
            return "Hello, \(user.name)"
        }

        let controller = NoteController()
        let api = token.grouped("api")
        let v1 = api.grouped("v1")
        v1.get("notes", handler: controller.index)
        v1.get("notes", "backup", handler: controller.zip)
        v1.post("notes", "search", handler: controller.search)
        v1.get("notes", Note.parameter, handler: controller.show)
        v1.post("notes", handler: controller.store)
        v1.put("notes", Note.parameter, "publish", handler: controller.publish)
        v1.put("notes", Note.parameter, "unpublish", handler: controller.unpublish)
        v1.put("notes", Note.parameter, handler: controller.replace)
        v1.patch("notes", Note.parameter, handler: controller.update)
        v1.delete("notes", Note.parameter, handler: controller.delete)
        v1.delete("notes", handler: controller.clear)
    }
}

