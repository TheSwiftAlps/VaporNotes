// swift-tools-version:4.0

import PackageDescription

let package = Package(
    name: "VaporNotes",
    products: [
        .library(name: "App", targets: ["App"]),
        .executable(name: "Run", targets: ["Run"])
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", .upToNextMajor(from:
            "2.1.0")),
        .package(url: "https://github.com/vapor/fluent-provider.git",
            .upToNextMajor(from: "1.2.0")),
        .package(url: "https://github.com/vapor/auth-provider.git",
            .upToNextMajor(from: "1.2.0")),
        .package(url:
            "https://github.com/vapor/leaf-provider.git",
            .upToNextMajor(from: "1.1.0")),
        .package(url:
            "https://github.com/vapor-community/markdown-provider.git",
            .upToNextMajor(from: "1.1.0")),
        .package(url: "https://github.com/weichsel/ZIPFoundation.git",
            .upToNextMajor(from: "0.9.2")),
    ],
    targets: [
        .target(name: "App", dependencies: ["Vapor", "LeafProvider",
            "FluentProvider", "MarkdownProvider", "AuthProvider", "ZIPFoundation"],
                exclude: [
                    "Config",
                    "Public",
                    "Resources",
                ]),
        .target(name: "Run", dependencies: ["App"]),
        .testTarget(name: "AppTests", dependencies: ["App", "Testing"])
    ]
)

