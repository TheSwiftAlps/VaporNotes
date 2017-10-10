import XCTest
import Testing
import HTTP
import Sockets
@testable import Vapor
@testable import App

/// This file shows an example of testing an
/// individual controller without initializing
/// a Droplet.

class NoteControllerTests: TestCase {
    let initialMessage = "I'm a note"
    let updatedMessage = "I have been updated \(Date())"

    /// For these tests, we won't be spinning up a live
    /// server, and instead we'll be passing our constructed
    /// requests programmatically
    /// this is usually an effective way to test your
    /// application in a convenient and safe manner
    /// See RouteTests for an example of a live server test
    let controller = NoteController()

    func testNoteRoutes() throws {
        guard let noteOne = try storeNewNote(), let idOne = noteOne.id?.int else {
            XCTFail()
            return
        }

        try fetchOne(id: idOne)
        try fetchAll(expectCount: 1)
        try patch(id: idOne)
        try put(id: idOne)

        guard let noteTwo = try storeNewNote(), let idTwo = noteTwo.id?.int else {
            XCTFail()
            return
        }

        try fetchAll(expectCount: 2)

        try deleteOne(id: idOne)
        try fetchAll(expectCount: 1)

        try deleteOne(id: idTwo)
        try fetchAll(expectCount: 0)

        for _ in 1...5 {
            _ = try storeNewNote()
        }
        try fetchAll(expectCount: 5)
        try deleteAll()
        try fetchAll(expectCount: 0)
    }

    func storeNewNote() throws -> Note? {
        let req = Request.makeTest(method: .post)
        req.json = try JSON(node: ["contents": initialMessage, "title": "Title"])
        let res = try controller.store(req).makeResponse()

        let json = res.json
        XCTAssertNotNil(json)
        let newId: Int? = try json?.get("id")
        XCTAssertNotNil(newId)
        XCTAssertNotNil(json?["contents"])
        XCTAssertEqual(json?["contents"], req.json?["contents"])
        return try Note.find(newId)
    }

    func fetchOne(id: Int) throws {
        let req = Request.makeTest(method: .get)
        let note = try Note.find(id)!
        let res = try controller.show(req, note: note).makeResponse()

        let json = res.json
        XCTAssertNotNil(json)
        XCTAssertNotNil(json?["contents"])
        XCTAssertNotNil(json?["id"])
        XCTAssertEqual(json?["id"]?.int, id)
        XCTAssertEqual(json?["contents"]?.string, initialMessage)
    }

    func fetchAll(expectCount count: Int) throws {
        let req = Request.makeTest(method: .get)
        let res = try controller.index(req).makeResponse()

        let json = res.json
        XCTAssertNotNil(json?.array)
        XCTAssertEqual(json?.array?.count, count)
    }

    func patch(id: Int) throws {
        let req = Request.makeTest(method: .patch)
        req.json = try JSON(node: ["contents": updatedMessage])
        let note = try Note.find(id)!
        let res = try controller.update(req, note: note).makeResponse()

        let json = res.json
        XCTAssertNotNil(json)
        XCTAssertNotNil(json?["contents"])
        XCTAssertNotNil(json?["id"])
        XCTAssertEqual(json?["id"]?.int, id)
        XCTAssertEqual(json?["contents"]?.string, updatedMessage)
    }

    func put(id: Int) throws {
        let req = Request.makeTest(method: .put)
        req.json = try JSON(node: ["contents": updatedMessage, "title": "New title"])
        let note = try Note.find(id)!
        let res = try controller.replace(req, note: note).makeResponse()

        let json = res.json
        XCTAssertNotNil(json)
        XCTAssertNotNil(json?["contents"])
        XCTAssertNotNil(json?["id"])
        XCTAssertEqual(json?["id"]?.int, id)
        XCTAssertEqual(json?["contents"]?.string, updatedMessage)
    }

    func deleteOne(id: Int) throws {
        let req = Request.makeTest(method: .delete)

        let note = try Note.find(id)!
        _ = try controller.delete(req, note: note)
    }

    func deleteAll() throws {
        let req = Request.makeTest(method: .delete)
        _ = try controller.clear(req)
    }
}

// MARK: Manifest

extension NoteControllerTests {
    /// This is a requirement for XCTest on Linux
    /// to function properly.
    /// See ./Tests/LinuxMain.swift for examples
    static let allTests = [
        ("testNoteRoutes", testNoteRoutes),
    ]
}
