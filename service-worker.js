import './libs/jszip.min.js';

chrome.action.onClicked.addListener(async (tab) => {
    TryTurnToolbarOn();
    TryTurnEditorOn();
})

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.popupAction === "TurnToolbarOn") {
            // внедряем тулбар на страницу и только потом включаем
            InjectToolbar().then(() => {
                TurnToolbarOn();
            });
            sendResponse({ result: "Done" });
        }
        if (request.popupAction === "TurnEditorOn") {
            // внедряем тулбар на страницу и только потом включаем
            InjectEditor().then(() => {
                TurnEditorOn();
            });
            sendResponse({ result: "Done" });
        }
        if (request.popupAction === "InjectStyle") {
            let _style = request.options.Style;
            InjectStyle(_style);
            sendResponse({ result: "Done" });
        }
        if (request.popupAction === "RemoveStyle") {
            let _style = request.options.Style;
            RemoveStyle(_style);
            sendResponse({ result: "Done" });
        }
        if (request.popupAction === "DownloadZip") {
            let _stylesJSON = request.options.Styles;
            DownloadZip(_stylesJSON);
            sendResponse({ result: "Done" });
        }
        sendResponse({});
    }
);

async function TryTurnToolbarOn() {
    const tab = await GetCurrentTab();
    await chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: () => {
                try { // если тулбар внедрен, то его показываем
                    visionToolbar.Show();
                }
                catch (err) { // иначе просим внедрить и включить его
                    const response = chrome.runtime.sendMessage({ popupAction: "TurnToolbarOn" });
                }
            },
        }
    );
}

async function TryTurnEditorOn() {
    const tab = await GetCurrentTab();
    await chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: () => {
                try { // если тулбар внедрен, то его показываем
                    visionEditor.Show();
                }
                catch (err) { // иначе просим внедрить и включить его
                    const response = chrome.runtime.sendMessage({ popupAction: "TurnEditorOn" });
                }
            },
        }
    );
}

async function TurnToolbarOn() {
    //console.log("turnToolbarOn");
    const tab = await GetCurrentTab();
    await chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: () => {
                try {
                    visionToolbar.Show();
                } catch (err) {
                    // console.log("Error: no toolbar found."); // иногда слишком быстро срабатывает
                };
            }
        }
    );
}

async function TurnEditorOn() {
    //console.log("turnEditorOn");
    const tab = await GetCurrentTab();
    await chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: () => {
                try {
                    visionEditor.Show();
                } catch (err) {
                    // console.log("Error: no vision editor found.");
                };
            }
        }
    );
}

async function InjectToolbar() {
    const tab = await GetCurrentTab();
    // внедряем стили тулбара
    chrome.scripting.insertCSS({
        files: ["toolbar/visionToolbar.css"],
        target: { tabId: tab.id },
    });
    // внедраем скрипт тулбара
    chrome.scripting.executeScript(
        {
            files: ["toolbar/visionToolbar.js"],
            target: { tabId: tab.id },
        }
    );
}

async function InjectEditor() {
    const tab = await GetCurrentTab();
    // внедряем стили редактора
    chrome.scripting.insertCSS({
        files: ["editor/visionEditor.css"],
        target: { tabId: tab.id },
    });
    // внедраем скрипт редактора
    chrome.scripting.executeScript(
        {
            files: ["editor/visionEditor.js"],
            target: { tabId: tab.id },
        }
    );
}

async function InjectStyle(style) {
    const tab = await GetCurrentTab();
    chrome.scripting.insertCSS({
        css: style,
        target: { tabId: tab.id },
    });
}

async function RemoveStyle(style) {
    const tab = await GetCurrentTab();
    chrome.scripting.removeCSS({
        css: style,
        target: { tabId: tab.id },
    });
}

async function DownloadZip(_stylesJSON) {
    let _styles = JSON.parse(_stylesJSON);
    let _css = "";
    let _sep = "\n/*" + "-".repeat(20) + "*/\n\n";
    for (let i = 0; i < _styles.length; i++) {
        if (_styles[i] == null) continue;
        _css += _sep + _styles[i];
    }
    let today = String(new Date().toDateString());
    var zip = new JSZip();

    zip.file("toolbar/visionToolbarExtra-" + today + ".css", _css);

    let url = chrome.runtime.getURL('toolbar/visionToolbar.css');
    await fetch(url)
        .then((response) => response.text())
        .then((fileText) => { zip.file("toolbar/visionToolbar.css", fileText); });

    url = chrome.runtime.getURL('toolbar/visionToolbar.js');
    await fetch(url)
        .then((response) => response.text())
        .then((fileText) => { zip.file("toolbar/visionToolbar.js", fileText); });

    zip.generateAsync({ type: "base64" })
        .then(function (content) {
            const cssUrl = 'data:application/zip;base64,' + content
            chrome.downloads.download({
                url: cssUrl,
                filename: "VisionToolbar-" + today + ".zip",
                //saveAs: true
            });
        });
}

async function GetCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}