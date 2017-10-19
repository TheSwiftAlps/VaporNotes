import Foundation
import Vapor
import HTTP
import ZIPFoundation

final class NoteController {
    lazy var formatter = DateFormatter()

    func index(_ req: Request) throws -> ResponseRepresentable {
        if req.headers["Accept"] == "application/zip" {
            return try zip(req)
        }
        let notes = try req.user().notes.all()
        let notesJSON = try notes.makeJSON()
        return try wrapJSONResponse(with: notesJSON)
    }

    func zip(_ req: Request) throws -> ResponseRepresentable {
        guard let accept = req.headers["Accept"] else { throw Abort.badRequest }
        if accept != "application/zip" { throw Abort.badRequest }
        let fileManager = FileManager()
        do {
            let temp = try fileManager.createTemporaryDirectory()
            let sourceURL = temp.appendingPathComponent("backup")
            try fileManager.createDirectory(at: sourceURL, withIntermediateDirectories: false, attributes: nil)
            let destinationURL = temp.appendingPathComponent("archive.zip")

            // Iterate all notes and save them in the "backup" folder
            let notes = try req.user().notes.all()
            try notes.forEach { note in
                if let id = note.id {
                    let filename = "\(id.wrapped).txt"
                    let fileURL = sourceURL.appendingPathComponent(filename)
                    try note.fullText.write(to: fileURL, atomically: false, encoding: .utf8)
                }
            }

            // Create zip file and send it in the response
            try fileManager.zipItem(at: sourceURL, to: destinationURL)
            let response = try Response(filePath: destinationURL.path)
            response.headers["Content-Type"] = "application/zip"
            response.headers["Content-Disposition"] = "inline; filename=\"archive.zip\""
            return response
        } catch {
            print("Error: \(error)")
            throw Abort.serverError
        }
    }

    /// When consumers call 'POST' on '/notes' with valid JSON
    /// construct and save the note
    func store(_ req: Request) throws -> ResponseRepresentable {
        let note = try req.note()
        try note.save()
        return try wrapJSONResponse(with: note)
    }

    /// When the consumer calls 'GET' on a specific resource, ie:
    /// '/notes/13rd88' we should show that specific note
    func show(_ req: Request) throws -> ResponseRepresentable {
        let note = try req.parameters.next(Note.self)
        return try wrapJSONResponse(with: note)
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
        return try wrapJSONResponse(with: note)
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
        return try wrapJSONResponse(with: note)
    }

    func publish(_ req: Request) throws -> ResponseRepresentable {
        let note = try req.parameters.next(Note.self)
        note.published = true
        try note.save()
        return Response(status: .ok)
    }

    func unpublish(_ req: Request) throws -> ResponseRepresentable {
        let note = try req.parameters.next(Note.self)
        note.published = false
        try note.save()
        return Response(status: .ok)
    }
}

extension NoteController {
    private func wrapJSONResponse(with obj: ResponseRepresentable) throws -> ResponseRepresentable {
        var json = JSON()
        try json.set("data", obj)
        try json.set("version", "1.0")

        let date = Date()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZZ"
        let string = formatter.string(from: date)
        try json.set("timestamp", string)

        return try json.makeResponse()
    }
}

extension Request {
    /// Create a note from the JSON body
    /// return BadRequest error if invalid
    /// or no JSON
    func note() throws -> Note {
        guard let json = json else { throw Abort.badRequest }
        let note = try Note(json: json)
        note.userId = try user().assertExists()
        return note
    }
}

extension NoteController: EmptyInitializable { }

