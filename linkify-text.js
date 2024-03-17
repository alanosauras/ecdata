// linkify-text.js
document.addEventListener('DOMContentLoaded', function() {
    function linkify(element) {
        if (element.hasChildNodes()) {
            element.childNodes.forEach(child => {
                if (child.nodeType === 3) { // Node.TEXT_NODE
                    let replacedText = child.nodeValue;
                    textLinks.forEach(link => {
                        replacedText = replacedText.replace(new RegExp(link.text, "g"), `<a href="${link.url}" target="_blank">${link.text}</a>`);
                    });
                    if (replacedText !== child.nodeValue) {
                        const newElement = document.createElement('span');
                        newElement.innerHTML = replacedText;
                        child.parentNode.replaceChild(newElement, child);
                    }
                } else if (child.nodeType === 1 && !child.hasAttribute('data-no-linkify')) { // Node.ELEMENT_NODE
                    linkify(child); // Recurse
                }
            });
        }
    }
    window.linkify = linkify; // Make it accessible globally

    linkify(document.body);
});
