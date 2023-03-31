export const copyTextToClipboard = (text) => {
    return new Promise((resolve, reject) => {
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
