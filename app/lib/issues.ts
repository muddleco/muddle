export function formatName(name: string, truncate: boolean = false): string {
    const issueLabelRegex = /^\[\w+-\d+\]\s*/;
    let trimmedName = name.replace(issueLabelRegex, '');

    const maxLength = 38;
    if (truncate && trimmedName.length > maxLength) {
        // Truncate and add an ellipsis
        trimmedName = trimmedName.substring(0, maxLength - 3) + '...';
    }
    return trimmedName;
}
