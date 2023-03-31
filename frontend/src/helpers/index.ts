function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        return  document.execCommand("copy");
    } catch (err) {
        return false;
    }

    document.body.removeChild(textArea);
}

export const copyTextToClipboard = (text) => {
    return new Promise((resolve, reject) => {
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(text);
            return;
        }
        navigator?.clipboard?.writeText(text).then(
            function() {
                resolve(true);
            },
            function(err) {
                reject(false);
            }
        )
    })
}
