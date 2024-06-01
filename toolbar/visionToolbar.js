class VisionToolbar {

    /* Элемент на странице (кнопка), при нажатии на которую тулбар отображается */
    #launchObjId = "";

    constructor() {
        this.#launchObjId = "";
        this.#Init();
    }

    // заменяет кнопку включения ВДС по умолчанию на другую
    SetLaunchObject(launchObjId) {
        let _objOld = document.getElementById(this.#launchObjId);
        if (_objOld) {
            _objOld.style.display = "none";
        }
        let _obj = document.getElementById(launchObjId);
        let _toolbar = this;
        if (_obj) {
            this.#launchObjId = launchObjId;
            _obj.addEventListener("click",
                function () {
                    _toolbar.Show(); // показать тулбар
                    _obj.style.display = 'none'; // скрыть кнопку
                }
            )
        } else {
            console.log("VisionToolbar: " + launchObjId + " not found.");
        }
    }

    #Init() {
        //console.log("VisionToolbar.#init");

        // создаем html-элемент с тулбаром
        const _toolbarString = `<div id="idVisionToolbar">
        <div id="idFontSize" class="option">
            <div class="caption">Размер шрифта</div>
            <div class="buttons">
                <button id="idFontSize0" class="xmark selected" title="Оригинальный">&ndash;</button>
                <button id="idFontSize1" title="Нормальный">А</button>
                <button id="idFontSize2"  title="Увеличенный">А</button>
                <button id="idFontSize3" title="Большой">А</button>
            </div>
        </div> 
        <div id="idFont" class="option">
            <div class="caption">Шрифт</div>
            <div class="buttons">
                <button id="idFont0" class="xmark selected" title="Оригинальный">&ndash;</button>
                <button id="idFont1" title="Без засечек">А</button>
                <button id="idFont2" title="С засечками">А</button>
            </div>
        </div>    
        <div id="idLetterSpacing" class="option">
            <div class="caption">Межбуквенный интервал</div>
            <div class="buttons">
                <button id="idLS0" class="xmark selected" title="Оригинальный">&ndash;</button>
                <button id="idLS1" title="Нормальный">АА</button>
                <button id="idLS2" title="Увеличенный">АА</button>
                <button id="idLS3" title="Большой">АА</button>
            </div>
        </div> 
        <div id="idPictures" class="option">
            <div class="caption">Изображения</div>
            <div class="buttons">
                <button id="idPictures0" class="xmark selected" title="Оригинальные">&ndash;</button>
                <button id="idPictures1" title="Черно-белые">Черно-белые</button>
                <button id="idPictures2" title="Не показывать">Не показывать</button>
            </div>
        </div>   
        <div id="idTheme" class="option">
            <div class="caption">Тема оформления</div>
            <div class="buttons">
                <button id="idTheme0" class="xmark selected" title="Оригинальная">&ndash;</button>
                <button id="idTheme1" title="Черный текст на белом фоне">А</button>
                <button id="idTheme2" title="Белый текст на черном фоне">А</button>
            </div>
        </div>    
        <div id="idCloseBtn" class="option">
            <div class="caption">Закрыть</div>
            <div class="buttons">
                <button id="idClose" xclass="xmark" title="Вернуться к обычной версии сайта">&#10005;</button>
            </div>
        </div>
    </div>`;
        const _parser = new DOMParser();
        const _doc = _parser.parseFromString(_toolbarString, 'text/html');
        const _toolbar = _doc.body.firstChild;

        // прикрепляем тулбар на страницу так, чтобы он "уплывал" при скроллинге
        const _body = document.getElementsByTagName("body")[0];
        _body.insertBefore(_toolbar, _body.firstChild);

        // навешиваем обработчики нажатия кнопок тулбара и выставляем кнопки по умолчанию
        // размер шрифта
        for (let i = 0; i <= 3; i++) {
            const _btn = document.getElementById('idFontSize' + i);
            _btn.addEventListener('click', () => this.BtnClicked('idFontSize', 3, i));
            if (i == 0) {
                _btn.click();
            }
        }

        // шрифт
        for (let i = 0; i <= 2; i++) {
            const _btn = document.getElementById('idFont' + i);
            _btn.addEventListener('click', () => this.BtnClicked('idFont', 2, i));
            if (i == 0) {
                _btn.click();
            }
        }

        // межбуквенный интервал
        for (let i = 0; i <= 3; i++) {
            const _btn = document.getElementById('idLS' + i);
            _btn.addEventListener('click', () => this.BtnClicked('idLS', 3, i));
            if (i == 0) {
                _btn.click();
            }
        }

        // изображения
        for (let i = 0; i <= 2; i++) {
            const _btn = document.getElementById('idPictures' + i);
            _btn.addEventListener('click', () => this.BtnClicked('idPictures', 2, i));
            if (i == 0) {
                _btn.click();
            }
        }

        // тема
        for (let i = 0; i <= 2; i++) {
            const _btn = document.getElementById('idTheme' + i);
            _btn.addEventListener('click', () => this.BtnClicked('idTheme', 2, i));
            if (i == 0) {
                _btn.click();
            }
        }

        // кнопка закрытия тулбара
        const _btn = document.getElementById('idCloseBtn');
        _btn.addEventListener('click', () => this.Hide());

        // кнопка включения тулбара по умолчанию
        const _toolbarBtnOnString = `<a href="#" id="idVisionToolbarOnBtn"></a>`;
        const _doc2 = _parser.parseFromString(_toolbarBtnOnString, 'text/html');
        const _btn2 = _doc2.body.firstChild;
        _body.insertBefore(_btn2, _body.firstChild);

        // подключаем специальные стили для некоторых сайтов
        const _url = window.location.href;
        const _html = document.getElementsByTagName('html')[0];
        // для sfu-kras.ru, кроме math.sfu-kras.ru
        if (_url.includes('.sfu-kras.ru') && !_url.includes('math.sfu-kras.ru')) {
            _html.classList.add('sfuVisionToolbar');
        }
        if (_url.includes('icm.krasn.ru')) {
            _html.classList.add('icmVisionToolbar');
        }
        if (_url.includes('math.sfu-kras.ru')) {
            _html.classList.add('mathVisionToolbar');
        }

        // добавляем класс для текущей страницы и для текущего домена
        (async () => {
            let pageClass = "page" + await this.#HashValue(window.location.href);
            let domainClass = "domain" + await this.#HashValue(window.location.hostname);
            _html.classList.add(domainClass);
            _html.classList.add(pageClass);
        })();

    }

    BtnClicked(btnName, maxIdx, idx) {
        const _html = document.getElementsByTagName('html')[0];
        for (let i = 0; i <= maxIdx; i++) {
            const _btn = document.getElementById(btnName + i);
            if (i == idx) {
                _btn.classList.add("active");
                _html.classList.add(btnName + i);
            } else {
                _btn.classList.remove("active");
                _html.classList.remove(btnName + i);
            }
        }
        // так как изменилось состояние, обновляем загтовку стиля в редакторе
        try {
            visionEditor.PrepareStyle();
        } catch (err) {
            // nothing to do
        }
    }

    Show() {
        let _toolbar = document.getElementById('idVisionToolbar');
        _toolbar.style.display = 'flex';

        const _html = document.getElementsByTagName('html')[0];
        _html.classList.add('VisionToolbarShown');
        _html.classList.remove('VisionToolbarHidden');

        // установка куки, что тулбар открыт
        setCookie('VDSstyle', 'flex');
    }

    Hide() {
        let _toolbar = document.getElementById('idVisionToolbar');
        _toolbar.style.display = 'none';

        const _html = document.getElementsByTagName('html')[0];
        _html.classList.add('VisionToolbarHidden');
        _html.classList.remove('VisionToolbarShown');

        // показываем кнопку включения ВДС
        let _obj = document.getElementById(this.#launchObjId);
        _obj.style.display = 'inline-block';

        // установка куки, что тулбар закрыт
        setCookie('VDSstyle', 'none');
    }

    async GetState() {
        const _classes = document.getElementsByTagName('html')[0].classList.value.split(" ");
        let state = {
            FontSize: this.#SearchOption(_classes, "idFontSize", 3),
            Font: this.#SearchOption(_classes, "idFont", 2),
            LS: this.#SearchOption(_classes, "idLS", 3),
            Pictures: this.#SearchOption(_classes, "idPictures", 2),
            Theme: this.#SearchOption(_classes, "idTheme", 2),
            PageClass: "page" + await this.#HashValue(window.location.href),
            DomainClass: "domain" + await this.#HashValue(window.location.hostname),
            Width: window.innerWidth
        }
        return state;
    }

    #SearchOption(arr, name, maxIdx) {
        for (let i = 0; i <= maxIdx; i++) {
            if (arr.includes(name + i)) {
                return name + i;
            }
        }
        return "";
    }

    // генерируем хеш-код для заданной строки
    // используется в качестве аналога идентификатора ограниченной длины
    async #HashValue(text) {
        const msgUint8 = new TextEncoder().encode(text); // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""); // convert bytes to hex string
        return hashHex;
    }

}

const visionToolbar = new VisionToolbar();
visionToolbar.SetLaunchObject('idVisionToolbarOnBtn');

//получает значение поля name внутри массива cookie
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {

    options = {
      path: '/',
      // при необходимости добавьте другие значения по умолчанию
      ...options
    };
  
    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }
  
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }
  
    document.cookie = updatedCookie;
}

var sugar = getCookie('VDSstyle');
let req = window.location.hostname;
this.document.cookie = `domain=${req}`
if (sugar == 'flex'){
    visionToolbar.Show();
} else if (sugar == 'none'){
    visionToolbar.Hide();
}

/*export default visionToolbar;*/