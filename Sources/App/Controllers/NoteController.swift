import Vapor
import HTTP

final class NoteController {
    func index(_ req: Request) throws -> ResponseRepresentable {
        let notes = try Note.all()
        let notesJSON = try notes.makeJSON()
        var json = JSON()
        try json.set("response", notesJSON)

        return try json.makeResponse()
    }

    /// When consumers call 'POST' on '/notes' with valid JSON
    /// construct and save the note
    func store(_ req: Request) throws -> ResponseRepresentable {
        let note = try req.note()
        try note.save()
        return note
    }

    /// When the consumer calls 'GET' on a specific resource, ie:
    /// '/notes/13rd88' we should show that specific note
    func show(_ req: Request) throws -> ResponseRepresentable {
        let note = try req.parameters.next(Note.self)
        return note
    }

    /// When the consumer calls 'DELETE' on a specific resource, ie:
    /// 'notes/l2jd9' we should remove that resource from the database
    func delete(_ req: Request) throws -> ResponseRepresentable {
        let note = try req.parameters.next(Note.self)
        try note.delete()
        return Response(status: .ok)
    }

    /// When the consumer calls 'DELETE' on the entire table, ie:
    /// '/notes' we should remove the entire table
    func clear(_ req: Request) throws -> ResponseRepresentable {
        try Note.makeQuery().delete()
        return Response(status: .ok)
    }

    /// When the user calls 'PATCH' on a specific resource, we should
    /// update that resource to the new values.
    func update(_ req: Request) throws -> ResponseRepresentable {
        // See `extension Note: Updateable`
        let note = try req.parameters.next(Note.self)
        try note.update(for: req)

        // Save an return the updated note.
        try note.save()
        return note
    }

    /// When a user calls 'PUT' on a specific resource, we should replace any
    /// values that do not exist in the request with null.
    /// This is equivalent to creating a new Note with the same ID.
    func replace(_ req: Request) throws -> ResponseRepresentable {
        // First attempt to create a new Note from the supplied JSON.
        // If any required fields are missing, this request will be denied.
        let new = try req.note()

        // Update the note with all of the properties from
        // the new note
        let note = try req.parameters.next(Note.self)
        note.contents = new.contents
        try note.save()

        // Return the updated note
        return note
    }
}

extension Request {
    /// Create a note from the JSON body
    /// return BadRequest error if invalid
    /// or no JSON
    func note() throws -> Note {
        guard let json = json else { throw Abort.badRequest }
        return try Note(json: json)
    }
}

extension NoteController: EmptyInitializable { }

