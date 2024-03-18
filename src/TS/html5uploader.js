define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Html5uploader = void 0;
    var Html5uploader = /** @class */ (function () {
        function Html5uploader(parameters) {
            this.filesCounter = 0;
            this.filesCount = 0;
            this.counter = 0;
            this.params = parameters;
            this.params.replacePreviews = this.params.replacePreviews ? this.params.replacePreviews : false;
            this.elemPreview = document.getElementById(this.params.previewDivId);
            this.elemFileSelect = document.getElementById(this.params.fileSelectId);
            this.elemFileDropArea = document.getElementById(this.params.fileDropAreaId);
            this.elemSubmitBtn = document.getElementById(this.params.submitButtonId);
            this.setEventListeners();
        }
        /**
         * Nastaveni vsech event listeners
         */
        Html5uploader.prototype.setEventListeners = function () {
            var _this = this;
            // file select
            this.elemFileSelect.addEventListener("change", function (e) {
                _this.fileSelectHandler(e);
            });
            // dalsi tlacitka file select
            if (this.params.fileSelectAliases !== undefined && this.params.fileSelectAliases.length > 0) {
                this.params.fileSelectAliases.forEach(function (value) {
                    document.getElementById(value).addEventListener("click", function () {
                        _this.elemFileSelect.click();
                    });
                });
            }
            var xhr = new XMLHttpRequest();
            if (xhr.upload) {
                this.elemFileDropArea.addEventListener("dragenter", function (e) {
                    _this.addHover(e);
                });
                this.elemFileDropArea.addEventListener("dragleave", function (e) {
                    _this.removeHover(e);
                });
                this.elemFileDropArea.addEventListener("dragover", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                this.elemFileDropArea.addEventListener("drop", function (e) {
                    _this.fileSelectHandler(e);
                });
                this.elemFileDropArea.style.display = "block";
                this.elemSubmitBtn.style.display = "none";
            }
        };
        /**
         * Zpracování files po drop nebo file select
         * @param e
         */
        Html5uploader.prototype.fileSelectHandler = function (e) {
            this.removeHover(e);
            this.counter = 0;
            // fetch FileList objects
            var files = e.target.files || e.dataTransfer.files;
            this.filesCount = files.length;
            // spusteni before funkce
            if (this.params.handlers !== undefined && this.params.handlers.before !== undefined) {
                this.params.handlers.before();
            }
            // zpracovani vsech files
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                if (file.size <= this.params.maxSize) {
                    this.parseFile(file);
                    this.uploadFile(file);
                }
                else {
                    if (this.params.progressBarDiv !== undefined) {
                        var bar = this.createProgressBar(file.name);
                        bar.style.width = "100%";
                        bar.className = "bar failure";
                        this.removeProgressBar(bar);
                    }
                    this.showMessage("Obrázek " + file.name + " je příliš velký.", "error");
                }
            }
        };
        /**
         * Zpracovani file pres fileReader
         * @param file
         */
        Html5uploader.prototype.parseFile = function (file) {
            var _this = this;
            if (file.type.indexOf("image") === 0 && this.params.previewDivId !== null) {
                var reader_1 = new FileReader();
                reader_1.onload = function () {
                    _this.showPreview(reader_1.result.toString());
                };
                reader_1.readAsDataURL(file);
            }
        };
        /**
         * Upload pres ajax
         * @param file
         */
        Html5uploader.prototype.uploadFile = function (file) {
            var _this = this;
            var form = document.getElementById(this.params.formId);
            if ((file.type === "image/jpeg" || file.type === "image/png")) {
                var data = new FormData();
                data.append('file-0', file);
                var action = $("[name=_do]", form).attr("value");
                data.append("_do", action);
                $.ajax({
                    xhr: function () {
                        return _this.createXhr(file);
                    },
                    url: form.action,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("X-DRAGDROP", "yes");
                        xhr.setRequestHeader("X-FILENAME", encodeURIComponent(file.name.toLocaleLowerCase()));
                    },
                });
            }
            else {
                this.showMessage("Neplatný formát obrázku.", "error");
                setTimeout(function () {
                    _this.afterHandler();
                }, 500);
            }
        };
        /**
         * Vytvoreni XHR a nastaveni progressBar
         * @param file
         */
        Html5uploader.prototype.createXhr = function (file) {
            var _this = this;
            var xhr = new XMLHttpRequest();
            // create progress bar
            if (this.params.progressBarDiv !== null) {
                var bar_1 = this.createProgressBar(file.name);
                // progress bar
                xhr.upload.addEventListener("progress", function (e) {
                    bar_1.style.width = (e.loaded / e.total * 100) + "%";
                });
                xhr.onprogress = function (e) {
                    bar_1.style.width = (e.loaded / e.total * 100) + "%";
                };
                xhr.upload.onprogress = function (e) {
                    bar_1.style.width = (e.loaded / e.total * 100) + "%";
                };
                // file received/failed
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        bar_1.className = (xhr.status === 200 ? "bar success" : "bar failure");
                        bar_1.style.width = "100%";
                        if (xhr.status !== 200) {
                            _this.showMessage("Při nahrávání obrázku " + file.name + " došlo k chybě.", "error");
                        }
                        _this.removeProgressBar(bar_1);
                        _this.afterHandler();
                    }
                };
            }
            return xhr;
        };
        /**
         * Zobrazeni preview obrazku
         * @param imgUrl
         */
        Html5uploader.prototype.showPreview = function (imgUrl) {
            if (this.params.replacePreviews) {
                this.elemPreview.innerHTML = '';
            }
            var preview = document.createElement("div");
            preview.className = "preview";
            var img = document.createElement("img");
            img.setAttribute("src", imgUrl);
            preview.appendChild(img);
            if (this.params.loaderClass !== undefined) {
                var loader = document.createElement('i');
                loader.className = this.params.loaderClass;
                preview.appendChild(loader);
            }
            this.elemPreview.appendChild(preview);
            return preview;
        };
        /**
         * Zobrazeni flashMessage bud pres flashHandler nebo jeji vytvoreni
         * @param msg
         * @param type
         */
        Html5uploader.prototype.showMessage = function (msg, type) {
            if (this.params.flashHandler !== undefined) {
                this.params.flashHandler(msg, type);
            }
            else {
                var p = document.createElement("p");
                p.textContent = msg;
                var flashMessages = void 0;
                var flashMessage = document.createElement("div");
                flashMessage.className = "flashMessage " + type;
                flashMessage.appendChild(p);
                if (document.getElementsByClassName("flashMessages").length === 0) {
                    flashMessages = document.createElement("section");
                    flashMessages.className = "flashMessages";
                    var snippet = document.getElementById("snippet--flashMessages");
                    if (typeof snippet !== undefined && snippet !== null) {
                        snippet.appendChild(flashMessages);
                    }
                    else {
                        document.body.appendChild(flashMessages);
                    }
                }
                else {
                    flashMessages = document.getElementsByClassName("flashMessages")[0];
                }
                flashMessages.appendChild(flashMessage);
            }
        };
        /**
         * Vykonani after funkce po nahrani fotky
         */
        Html5uploader.prototype.afterHandler = function () {
            this.filesCounter++;
            if (this.filesCount === this.filesCounter) {
                if (this.params.handlers !== undefined && this.params.handlers.after !== undefined) {
                    this.filesCounter = 0; // pokud volame after, musime pak vynulovat filesCounter, aby priste pocital od nuly..
                    this.params.handlers.after();
                }
            }
        };
        /**
         * Zastaveni event a pridani hover
         * @param e
         */
        Html5uploader.prototype.addHover = function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.counter++;
            this.elemFileDropArea.classList.add("hover");
        };
        /**
         * Zastaveni event a odebrani hover
         * @param e
         */
        Html5uploader.prototype.removeHover = function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.counter--;
            if (this.counter === 0) {
                this.elemFileDropArea.classList.remove("hover");
            }
        };
        /**
         * Vytvoreni progress bar
         * @param name
         */
        Html5uploader.prototype.createProgressBar = function (name) {
            var progressDiv = document.getElementById(this.params.progressBarDiv);
            var upload = document.createElement("div");
            var bar = document.createElement("div");
            upload.className = "upload";
            progressDiv.appendChild(upload);
            upload.appendChild(bar);
            bar.className = "bar";
            bar.appendChild(document.createTextNode(name));
            return bar;
        };
        /**
         * Smaze dany progress bar
         * @param bar
         */
        Html5uploader.prototype.removeProgressBar = function (bar) {
            $(bar.parentElement).delay(5000).fadeOut(600, function () {
                bar.parentElement.remove();
            });
        };
        return Html5uploader;
    }());
    exports.Html5uploader = Html5uploader;
});
