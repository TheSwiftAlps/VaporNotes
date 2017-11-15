import HTTP

final class VersionMiddleware: Middleware {
    func respond(to request: Request, chainingTo next: Responder) throws -> Response {
        let response = try next.respond(to: request)

        response.headers["Version"] = "Swift Alps 2017 - Notes API 1.0"
        return response
    }
}
