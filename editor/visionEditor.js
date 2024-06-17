class VisionEditor {

    constructor() {
        this.#Init();
    }

    #styles = []; // внедренные стили

    #Init() {
        // создаем html-элемент с редактором
        const _editorString = `
    <div id="idVisionEditor">
        <div id="idVisionEditorCaption">
            Другой взгляд 1.0.1
            <button id="idVECloseBtn" title="Закрыть">&#10005;</button>
        </div>
        <div id="idVisionEdotorTB1">
            <button id="idVELoadExtraStylesBtn">Загрузить стили со страницы</button>
            <button id="idVELoadStylesBtn">Загрузить сохраненые стили</button>
            <button id="idVESaveStylesBtn">Сохранить стили</button>
            <button id="idVEZipBtn">Скачать zip-архив</button>
            <button id="idVECheckPdfsBtn">Проверить PDF на странице</button>
        </div>
        <div id="idVisionEditorBody">
        </div>
    <div  id="idVisionEditorTextarea">
        <textarea id="IDVblock" placeholder="Type some CSS to inject"></textarea>
    </div>
    <div id="idVisionEdotorTB2">
        <button id="idVEAddBtn">Добавить стиль</button>
    </div>
    </div>`;
        const _parser = new DOMParser();
        const _doc = _parser.parseFromString(_editorString, 'text/html');
        const _editor = _doc.body.firstChild;

        // прикрепляем редактор
        const _body = document.getElementsByTagName("body")[0];
        _body.insertBefore(_editor, _body.lastElementChild);

        // навешиваем обработчик кнопки "Закрыть"
        let _btn = document.getElementById('idVECloseBtn');
        _btn.addEventListener('click', () => this.Hide());

        // подготовка правила
        this.PrepareStyle();

        // навешиваем обработчик кнопки "Добавить стиль"
        _btn = document.getElementById('idVEAddBtn');
        _btn.addEventListener('click', () => this.AddStyle());

        // навешиваем обработчик кнопки "Сохранить стили"
        _btn = document.getElementById('idVESaveStylesBtn');
        _btn.addEventListener('click', () => this.SaveStyles());

        // навешиваем обработчик кнопки "Загрузить стили"
        _btn = document.getElementById('idVELoadStylesBtn');
        _btn.addEventListener('click', () => this.LoadStyles());

        // навешиваем обработчик кнопки "Скачать zip-архив"
        _btn = document.getElementById('idVEZipBtn');
        _btn.addEventListener('click', () => this.DownloadZip());

        // навешиваем обработчик кнопки "Загрузить стили со страницы"
        _btn = document.getElementById('idVELoadExtraStylesBtn');
        _btn.addEventListener('click', () => this.LoadExtraStyles());

        // навешиваем обработчик кнопки "Проверить PDF на странице"
        _btn = document.getElementById('idVECheckPdfsBtn');
        _btn.addEventListener('click', () => this.CheckPDF());
    }

    Show() {
        let _toolbar = document.getElementById('idVisionEditor');
        _toolbar.style.display = 'flex';
    }

    Hide() {
        let _toolbar = document.getElementById('idVisionEditor');
        _toolbar.style.display = 'none';
    }

    PrepareStyle() {
        let _ts = this.#RequestToolbarState();
        //console.log("ToolbarState:", _ts);
        let _textarea = document.getElementById("idVETextarea");
        let _style = "";
        _ts.then((result) => {
            _style = "@media screen and (max-width: " + result.Width + "px) { \n";
            _style += "html.VisionToolbarShown." + result.FontSize + "." + result.Font + "." + result.LS + "." + result.Pictures + "." + result.Theme
                + "." + result.DomainClass + "." + result.PageClass + "\n...\n{\n...\n} }";
        }).then(() => { _textarea.value = _style; });
    }

    AddStyle(style = null) {
        // если параметр style указан, то берем его, иначе берем из textarea
        let _style = style == null ? document.getElementById("IDVblock").value : style;
        this.#styles.push(_style);
        let _num = this.#styles.length - 1;
        let _html = `<div class="VisionStyleItem">${_style}<button class="CloseStyleBtn" id="idCloseStyleBtn${_num}" title="Закрыть">&#10005;</button></div></div>`;
        const _node = new DOMParser().parseFromString(_html, "text/html").body.firstElementChild;
        const _cont = document.getElementById("idVisionEditorBody");
        _cont.appendChild(_node);
        let _btn = document.getElementById("idCloseStyleBtn" + _num);
        _btn.addEventListener('click', () => this.DeleteStyle(_num));
        const response = chrome.runtime.sendMessage({ popupAction: "InjectStyle", options: { Style: _style } });
    }

    DeleteStyle(num) {
        let _btn = document.getElementById("idCloseStyleBtn" + num);
        let _style = this.#styles[num];
        delete this.#styles[num];
        const response = chrome.runtime.sendMessage({ popupAction: "RemoveStyle", options: { Style: _style } });
        _btn.parentElement.remove();
    }

    SaveStyles() {
        // стили сохраняются для текущего домена
        window.localStorage.setItem("VEStyles", JSON.stringify(this.#styles));
        alert("Текущие стили сохранены.");
    }

    LoadStyles() {
        if (confirm("Загрузить сохраненные стили? Текущие стили будут потеряны.")) {
            // загружаем сохраненные стили
            let _styles = window.localStorage.getItem("VEStyles");
            //console.log("Загружены стили", _styles);
            _styles = _styles == null ? [] : JSON.parse(_styles);
            // очищаем текущие стили
            for (var i = 0; i < this.#styles.length; i++) {
                if (this.#styles[i] == null) continue;
                this.DeleteStyle(i);
            }
            this.#styles = [];
            // добавляем сохраненные
            for (var i = 0; i < _styles.length; i++) {
                if (_styles[i] == null) continue;
                this.AddStyle(_styles[i]);
            }
        }
    }

    DownloadZip() {
        let _styles = JSON.stringify(this.#styles);
        const response = chrome.runtime.sendMessage({ popupAction: "DownloadZip", options: { Styles: _styles } });
    }

    async LoadExtraStyles() {
        console.log("LoadExtraStyles...");
        let _sheet = null;
        let _sheetIdx = null;
        // ищем прикрепленный css-файл
        for (let i = 0; i < document.styleSheets.length; i++) {
            let s = document.styleSheets[i];
            if (s.href.includes("visionToolbarExtra")) {
                _sheet = s;
                _sheetIdx = i;
            }
        }
        if ((_sheet != null) && confirm("Загрузить стили со страницы? Текущие стили будут потеряны.")) {
            //console.log(_sheet.href);
            // очищаем текущие стили
            for (var i = 0; i < this.#styles.length; i++) {
                if (this.#styles[i] == null) continue;
                this.DeleteStyle(i);
            }
            this.#styles = [];
            //  загружаем стили со страницы
            await fetch(_sheet.href).then((response) => response.text())
                .then((fileText) => {
                    console.log(fileText);
                    let _sep = "/*" + "-".repeat(20) + "*/";
                    let _styles = fileText.split(_sep);
                    for (let i = 0; i < _styles.length; i++) {
                        let _style = _styles[i].trim();
                        if (_style.length == 0) continue;
                        //console.log(i, ')',_style);
                        this.AddStyle(_style);
                    }
                });
            // открепляем файл со стилем со страницы, чтобы стили не мешали (todo: возможно нужно откреплять и в другой ситуации)
            document.querySelector('link[rel=stylesheet][href*="visionToolbarExtra"]').remove();
        }
    }

    CheckPDF() {
        var links = document.getElementsByTagName('a');
        for (var i = 0; i < links.length; ++i){
            let url = links[i].href;
            extension = links[i].split('.').pop();
            if (extension == 'pdf'){
                // how to check, does text exist in PDF or no?
                console.log(links[i]);
            }
        }
    }

    #RequestToolbarState() {
        return visionToolbar.GetState();
    }

}

const visionEditor = new VisionEditor();
//$(visionEditor).addClassName(Editor)
//export default visionEditor;
