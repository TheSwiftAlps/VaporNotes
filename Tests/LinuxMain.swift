#if os(Linux)

import XCTest
@testable import AppTests

XCTMain([
    // AppTests
    testCase(NoteControllerTests.allTests),
    testCase(RouteTests.allTests)
])

#endif
