import Foundation

extension String {
    // Courtesy of
    // https://stackoverflow.com/a/33860834/133764
    public static func randomString(_ length: Int) -> String {
        let allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let allowedCharsCount = UInt32(allowedChars.characters.count)
        var randomString = ""

        for _ in 0..<length {
            #if os(Linux)
            // Nope, no arc4random outside of BSD...
            let randomNum = Int(UInt32(random()) % allowedCharsCount)
            #else
            let randomNum = Int(arc4random_uniform(allowedCharsCount))
            #endif

            let randomIndex = allowedChars.index(allowedChars.startIndex, offsetBy: randomNum)
            let newCharacter = allowedChars[randomIndex]
            randomString += String(newCharacter)
        }

        return randomString
    }

    public static func randomEmail() -> String {
        let randomEmail = "\(String.randomString(5))@\(String.randomString(10)).com"
        return randomEmail.lowercased()
    }
}
