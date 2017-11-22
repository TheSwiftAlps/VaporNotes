export interface ToolbarDelegate {
    onCreate(): void;
    onBackup(): void;
    onSearch(query: String): void;
    onReset(): void;
}
