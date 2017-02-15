var Html5Uploader =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Created by Radim on 24.11.2016.
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (require, exports) {
	    "use strict";
	    var uploader = (function () {
	        function uploader(parameters) {
	            this.objects = { fileSelect: null,
	                fileDropArea: null,
	                submitButton: null,
	                previewDiv: null, };
	            var self = this;
	            this.params = parameters;
	            this.params.nette = this.params.nette ? this.params.nette : false;
	            this.params.replacePreviews = this.params.replacePreviews ? this.params.replacePreviews : false;
	            self.createMessageDiv();
	            this.objects.fileSelect = document.getElementById(this.params.fileSelectId);
	            this.objects.fileSelect.addEventListener("change", function (e) {
	                self.fileSelectHandler(e);
	            }, false);
	            if (typeof this.params.fileSelectAliases !== 'undefined' && this.params.fileSelectAliases.length > 0) {
	                this.params.fileSelectAliases.forEach(function (value) {
	                    document.getElementById(value).addEventListener("click", function (e) {
	                        self.objects.fileSelect.click();
	                    });
	                });
	            }
	            this.objects.previewDiv = document.getElementById(this.params.previewDivId);
	            var xhr;
	            xhr = new XMLHttpRequest();
	            if (xhr.upload) {
	                this.objects.fileDropArea = document.getElementById(this.params.fileDropAreaId);
	                this.objects.fileDropArea.addEventListener("dragover", function (e) {
	                    self.fileDragHover(e);
	                }, false);
	                this.objects.fileDropArea.addEventListener("dragleave", function (e) {
	                    self.fileDragHover(e);
	                }, false);
	                this.objects.fileDropArea.addEventListener("drop", function (e) {
	                    self.fileSelectHandler(e);
	                }, false);
	                this.objects.fileDropArea.style.display = "block";
	                this.objects.submitButton = document.getElementById(this.params.submitButtonId);
	                this.objects.submitButton.style.display = "none";
	            }
	        }
	        uploader.prototype.fileSelectHandler = function (e) {
	            // cancel event and hover styling
	            this.fileDragHover(e);
	            // fetch FileList objects
	            var files = e.target.files || e.dataTransfer.files;
	            // process all File objects
	            for (var i = 0, f = void 0; f = files[i]; i++) {
	                if (f.size <= this.params.maxSize) {
	                    this.parseFile(f);
	                    this.params.nette ? this.uploadFileNette(f) : this.uploadFile(f);
	                }
	                else {
	                    if (typeof this.params.progressBarDiv !== 'undefined') {
	                        var o = document.getElementById(this.params.progressBarDiv);
	                        var progress = document.createElement("div");
	                        var bar = document.createElement("div");
	                        progress.className = "upload";
	                        o.appendChild(progress);
	                        progress.appendChild(bar);
	                        bar.className = "bar";
	                        bar.appendChild(document.createTextNode(f.name));
	                        bar.style.width = "100%";
	                        bar.className = "bar failure";
	                        $(progress).delay(5000).fadeOut(300);
	                    }
	                    this.showMessage("Obrázek " + f.name + " je příliš velký.", "error");
	                }
	            }
	        };
	        uploader.prototype.fileDragHover = function (e) {
	            e.stopPropagation();
	            e.preventDefault();
	            if (e.type == "dragover") {
	                //$(e.target).addClass("hover");
	                this.objects.fileDropArea.classList.add("hover");
	            }
	            else {
	                //$(e.target).removeClass("hover");
	                this.objects.fileDropArea.classList.remove("hover");
	            }
	        };
	        uploader.prototype.parseFile = function (file) {
	            if (file.type.indexOf("image") == 0 && this.params.previewDivId != null) {
	                var reader = new FileReader();
	                var self_1 = this;
	                reader.onload = function (e) {
	                    self_1.showPreview('<img src="' + e.target.result + '" />');
	                };
	                reader.readAsDataURL(file);
	            }
	        };
	        uploader.prototype.uploadFile = function (file) {
	            var xhr = new XMLHttpRequest();
	            if (xhr.upload && (file.type == "image/jpeg" || file.type == "image/png")) {
	                // create progress bar
	                if (this.params.progressBarDiv != null) {
	                    var o = document.getElementById(this.params.progressBarDiv);
	                    var progress_1 = document.createElement("div");
	                    var bar_1 = document.createElement("div");
	                    progress_1.className = "progressBar";
	                    o.appendChild(progress_1);
	                    progress_1.appendChild(bar_1);
	                    bar_1.className = "bar";
	                    bar_1.appendChild(document.createTextNode(file.name));
	                    // progress bar
	                    xhr.upload.addEventListener("progress", function (e) {
	                        var pc = 100 - (e.loaded / e.total * 100);
	                        bar_1.style.width = pc + "%";
	                    }, false);
	                    // file received/failed
	                    var self_2 = this;
	                    xhr.onreadystatechange = function (e) {
	                        if (xhr.readyState == 4) {
	                            bar_1.className = (xhr.status === 200 ? "bar success" : "bar failure");
	                            if (xhr.status !== 200) {
	                                self_2.showMessage("Při nahrávání obrázku " + file.name + " došlo k chybě.", "error");
	                            }
	                            $(progress_1).delay(5000).fadeOut(600);
	                        }
	                    };
	                }
	                var form = document.getElementById(this.params.formId);
	                // start upload
	                xhr.open("POST", form.action, true);
	                xhr.setRequestHeader("X-FILENAME", file.name);
	                xhr.send(file);
	            }
	        };
	        uploader.prototype.uploadFileNette = function (file) {
	            var form = document.getElementById(this.params.formId);
	            var data = new FormData();
	            data.append('file-0', file);
	            var action = $("[name=_do]", form).attr("value");
	            data.append("_do", action);
	            $.ajax({
	                url: form.action,
	                data: data,
	                cache: false,
	                contentType: false,
	                processData: false,
	                type: 'POST',
	                beforeSend: function (xhr) { xhr.setRequestHeader("X-DRAGDROP", "yes"); },
	            });
	        };
	        uploader.prototype.showPreview = function (msg) {
	            if (this.params.replacePreviews) {
	                this.objects.previewDiv.innerHTML = msg;
	            }
	            else {
	                this.objects.previewDiv.innerHTML = this.objects.previewDiv.innerHTML + msg;
	            }
	        };
	        uploader.prototype.createMessageDiv = function () {
	            if (!this.params.nette) {
	                var messageDiv = document.getElementById("uploaderMessages");
	                if (messageDiv === null) {
	                    messageDiv = document.createElement("div");
	                    messageDiv.id = "uploaderMessages";
	                    document.body.appendChild(messageDiv);
	                }
	            }
	        };
	        uploader.prototype.showMessage = function (msg, type) {
	            var p = document.createElement("p");
	            if (this.params.nette) {
	                var flashMessages = void 0;
	                p.textContent = msg;
	                var flashMessage = document.createElement("div");
	                flashMessage.className = "flashMessage " + type;
	                flashMessage.appendChild(p);
	                if (document.getElementsByClassName("flashMessages").length === 0) {
	                    flashMessages = document.createElement("section");
	                    flashMessages.className = "flashMessages";
	                    var snippet = void 0;
	                    if ((snippet = document.getElementById("snippet--flashMessages")) !== null) {
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
	            else {
	                p.textContent = msg;
	                var message = document.createElement("div");
	                message.className = "message";
	                message.appendChild(p);
	                var messagesDiv = document.getElementById('uploaderMessages');
	                messagesDiv.appendChild(message);
	            }
	        };
	        return uploader;
	    }());
	    exports.uploader = uploader;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }
/******/ ]);