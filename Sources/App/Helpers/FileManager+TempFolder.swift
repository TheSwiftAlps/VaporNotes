import Foundation

extension FileManager {
    // Courtesy of
    // https://stackoverflow.com/a/46701313/133764
    func createTemporaryDirectory() throws -> URL {
        let url = URL(fileURLWithPath:NSTemporaryDirectory()).appendingPathComponent(UUID().uuidString)
        try self.createDirectory(at: url, withIntermediateDirectories: true, attributes: nil)
        return url
    }
}

