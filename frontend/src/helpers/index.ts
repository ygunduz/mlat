function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const result = document.execCommand("copy");
        document.body.removeChild(textArea);
        return result;
    } catch (err) {
        document.body.removeChild(textArea);
        return false;
    }
}

export const copyTextToClipboard = (text) => {
    return new Promise((resolve, reject) => {
        if (!navigator.clipboard) {
            resolve(fallbackCopyTextToClipboard(text));
            return;
        }
        navigator?.clipboard?.writeText(text).then(
            function() {
                resolve(true);
            },
            function() {
                reject(false);
            }
        )
    })
}
