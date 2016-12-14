/**
 * Created by Radim on 24.11.2016.
 */
define(["require", "exports"], function (require, exports) {
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
                    var o = document.getElementById(this.params.progressBarDiv);
                    var progress = document.createElement("p");
                    o.appendChild(progress);
                    progress.appendChild(document.createTextNode("upload " + f.name));
                    progress.className = "failure";
                }
            }
        };
        uploader.prototype.fileDragHover = function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (e.type == "dragover") {
                $(e.target).addClass("hover");
            }
            else {
                $(e.target).removeClass("hover");
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
            if (xhr.upload && file.type == "image/jpeg") {
                // create progress bar
                if (this.params.progressBarDiv != null) {
                    var o = document.getElementById(this.params.progressBarDiv);
                    var progress_1 = document.createElement("p");
                    o.appendChild(progress_1);
                    progress_1.appendChild(document.createTextNode("upload " + file.name));
                    // progress bar
                    xhr.upload.addEventListener("progress", function (e) {
                        var pc = 100 - (e.loaded / e.total * 100);
                        progress_1.style.backgroundPosition = pc + "% 0";
                    }, false);
                    // file received/failed
                    xhr.onreadystatechange = function (e) {
                        if (xhr.readyState == 4) {
                            progress_1.className = (xhr.status == 200 ? "success" : "failure");
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
        return uploader;
    }());
    exports.uploader = uploader;
});
