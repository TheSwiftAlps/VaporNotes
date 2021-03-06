import Foundation
import Vapor
import FluentProvider
import HTTP

final class Note: Model {
    static let idType: IdentifierType = .uuid

    let storage = Storage()

    // MARK: Properties and database keys

    /// The title of the note
    var title: String = ""

    /// The contents of the note
    var contents: String = ""

    /// The identifier of the user to which the token belongs
    var userId: Identifier? = nil

    /// The string used to show publicly the note
    var slug: String = ""

    var published: Bool = false

    var user: Parent<Note, User> {
        return parent(id: userId)
    }

    var fullText: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .full
        formatter.timeStyle = .full
        let created = formatter.string(from: createdAt!)
        let updated = formatter.string(from: updatedAt!)
        let text = """
        # \(title)

        - Created \(created)
        - Last modified \(updated)

        \(contents)
        """
        return text
    }

    /// The column names for `id` and `contents` in the database
    struct Keys {
        static let id = "id"
        static let title = "title"
        static let contents = "contents"
        static let slug = "slug"
        static let published = "published"
    }

    init() {
        self.slug = generateSlug()
    }

    init(title: String, contents: String, id: Identifier) {
        self.title = title
        self.contents = contents
        self.slug = generateSlug()
        self.id = id
    }

    // MARK: Fluent Serialization

    init(row: Row) throws {
        title = try row.get(Note.Keys.title)
        contents = try row.get(Note.Keys.contents)
        slug = try row.get(Note.Keys.slug)
        published = try row.get(Note.Keys.published)
        userId = try row.get(User.foreignIdKey)
    }

    func makeRow() throws -> Row {
        var row = Row()
        try row.set(Note.Keys.contents, contents)
        try row.set(Note.Keys.title, title)
        try row.set(Note.Keys.slug, slug)
        try row.set(Note.Keys.published, published)
        try row.set(User.foreignIdKey, userId)
        return row
    }

    func generateSlug() -> String {
        var note: Note? = nil
        var slug = ""
        repeat {
            slug = String.randomString(5).lowercased()
            do {
                note = try Note.makeQuery().filter("slug", slug).first()
            }
            catch {
                print("Error checking the slug in the database")
            }
        }
        while note != nil
        return slug
    }
}

// MARK: Fluent Preparation

extension Note: Preparation {
    static func prepare(_ database: Database) throws {
        try database.create(self) { builder in
            builder.id()
            builder.string(Note.Keys.title)
            builder.string(Note.Keys.contents)
            builder.string(Note.Keys.slug)
            builder.bool(Note.Keys.published)
            builder.foreignId(for: User.self)
        }
    }

    /// Undoes what was done in `prepare`
    static func revert(_ database: Database) throws {
        try database.delete(self)
    }
}

// MARK: JSON

extension Note: JSONConvertible {
    convenience init(json: JSON) throws {
        self.init(
            title: try json.get(Note.Keys.title),
            contents: try json.get(Note.Keys.contents),
            id: try json.get(Note.Keys.id)
        )
    }

    func makeJSON() throws -> JSON {
        var json = JSON()
        try json.set(Note.Keys.id, id)
        try json.set(Note.Keys.title, title)
        try json.set(Note.Keys.contents, contents)
        try json.set(Note.Keys.slug, slug)
        try json.set(Note.Keys.published, published)
        try json.set(Note.updatedAtKey, updatedAt)
        try json.set(Note.createdAtKey, createdAt)
        return json
    }
}

/// Since Note doesn't require anything to
/// be initialized we can conform it to EmptyInitializable.
///
/// This will allow it to be passed by type.
extension Note: EmptyInitializable { }

// MARK: HTTP

extension Note: ResponseRepresentable { }

extension Note: Timestampable { }

extension Note: SoftDeletable { }

// MARK: Update

extension Note: Updateable {
    public static var updateableKeys: [UpdateableKey<Note>] {
        return [
            UpdateableKey(Note.Keys.title, String.self) { note, title in
                note.title = title
            },
            UpdateableKey(Note.Keys.contents, String.self) { note, contents in
                note.contents = contents
            },
            UpdateableKey(Note.Keys.slug, String.self) { note, slug in
                note.slug = slug
            },
            UpdateableKey(Note.Keys.published, Bool.self) { note, published in
                note.published = published
            },
        ]
    }
}
