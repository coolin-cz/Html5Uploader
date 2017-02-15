/**
 * Created by Radim on 24.11.2016.
 */

declare var $;

interface Params{
    fileSelectId: string;
    fileSelectAliases: string[];
    fileDropAreaId: string;
    submitButtonId: string;
    previewDivId: string;
    replacePreviews: boolean;
    progressBarDiv: string;
    formId: string;
    maxSize: number;
    nette: boolean;
}

interface UploaderTest{
    fileSelect: HTMLElement;
    fileDropArea: HTMLElement;
    submitButton: HTMLElement;
    previewDiv: HTMLElement;
}

interface FileReaderEventTarget extends EventTarget{
    result: string
}

interface FileReaderEvent extends Event{
    target: FileReaderEventTarget;
    getMessage(): string;
}

export class uploader{

    public objects: UploaderTest = {fileSelect: null,
    fileDropArea: null,
    submitButton: null,
    previewDiv: null,};
    
    private params: Params;


    constructor(parameters: Params){ // TODO (Radim, 24-11-2016): Predelat parametry. Bude jich vic nez je pocet prvku v Uploader
        let self = this;
        this.params = parameters;

        this.params.nette = this.params.nette ? this.params.nette : false;
        this.params.replacePreviews = this.params.replacePreviews ? this.params.replacePreviews : false;

        self.createMessageDiv();

        this.objects.fileSelect = document.getElementById(this.params.fileSelectId);
        this.objects.fileSelect.addEventListener("change", function(e){
            self.fileSelectHandler(e)
        }, false);

        if (typeof this.params.fileSelectAliases !== 'undefined' && this.params.fileSelectAliases.length > 0) {
            this.params.fileSelectAliases.forEach(function(value){
               document.getElementById(value).addEventListener("click", function(e){
                   self.objects.fileSelect.click();
               });
            });
        }

        this.objects.previewDiv = document.getElementById(this.params.previewDivId);
        let xhr;
        xhr = new XMLHttpRequest()
        if(xhr.upload){
            this.objects.fileDropArea = document.getElementById(this.params.fileDropAreaId);
            this.objects.fileDropArea.addEventListener("dragover", function(e){
                self.fileDragHover(e)
            }, false);
            this.objects.fileDropArea.addEventListener("dragleave", function(e){
                self.fileDragHover(e)
            }, false);
            this.objects.fileDropArea.addEventListener("drop", function(e){
                self.fileSelectHandler(e)
            }, false);
            this.objects.fileDropArea.style.display = "block";

            this.objects.submitButton = document.getElementById(this.params.submitButtonId);
            this.objects.submitButton.style.display = "none";
        }
    }

    fileSelectHandler(e: DragEvent|any): void{
        // cancel event and hover styling
        this.fileDragHover(e);

        // fetch FileList objects
        let files = e.target.files || e.dataTransfer.files;

        // process all File objects
        for(let i = 0, f; f = files[i]; i++){
            if(f.size <= this.params.maxSize){
                this.parseFile(f);
                this.params.nette ? this.uploadFileNette(f) : this.uploadFile(f);
            }else{
                if(typeof this.params.progressBarDiv !== 'undefined'){
                    let o: HTMLElement = document.getElementById(this.params.progressBarDiv);
                    let progress = document.createElement("div");
                    let bar = document.createElement("div");

                    progress.className = "upload";
                    o.appendChild(progress);
                    progress.appendChild(bar);

                    bar.className = "bar";
                    bar.appendChild(document.createTextNode(f.name));
                    bar.style.width = "100%"

                    bar.className = "bar failure";

                    $(progress).delay(5000).fadeOut(300);
                }
                this.showMessage("Obrázek "+f.name+" je příliš velký.", "error");
            }
        }
    }

    public fileDragHover(e): void{
        e.stopPropagation();
        e.preventDefault();

        if(e.type == "dragover"){
            //$(e.target).addClass("hover");
            this.objects.fileDropArea.classList.add("hover");
        }else{
            //$(e.target).removeClass("hover");
            this.objects.fileDropArea.classList.remove("hover");
        }
    }

    private parseFile(file: File): void{
        if(file.type.indexOf("image") == 0 && this.params.previewDivId != null){
            let reader = new FileReader();
            let self = this;
            reader.onload = function(e: FileReaderEvent){
                self.showPreview(
                    '<img src="' + e.target.result + '" />'
                );
            };
            reader.readAsDataURL(file);
        }
    }

    private uploadFile(file: File): void{
        let xhr: XMLHttpRequest = new XMLHttpRequest();
        if(xhr.upload && (file.type == "image/jpeg" || file.type == "image/png")){

            // create progress bar
            if(this.params.progressBarDiv != null){
                let o: HTMLElement = document.getElementById(this.params.progressBarDiv);
                let progress = document.createElement("div");
                let bar = document.createElement("div");

                progress.className = "progressBar";
                o.appendChild(progress);
                progress.appendChild(bar);

                bar.className = "bar";
                bar.appendChild(document.createTextNode(file.name));


                // progress bar
                xhr.upload.addEventListener("progress", function(e: ProgressEvent){
                    let pc: number = 100 - (e.loaded / e.total * 100);
                    bar.style.width = pc + "%"
                }, false);

                // file received/failed
                let self = this;
                xhr.onreadystatechange = function(e){
                    if(xhr.readyState == 4){
                        bar.className = (xhr.status === 200 ? "bar success" : "bar failure");
                        if(xhr.status !== 200){
                            self.showMessage("Při nahrávání obrázku "+file.name+" došlo k chybě.", "error");
                        }
                        $(progress).delay(5000).fadeOut(600);
                    }
                };
            }
            let form: HTMLFormElement = <HTMLFormElement>document.getElementById(this.params.formId);

            // start upload
            xhr.open("POST", form.action, true);
            xhr.setRequestHeader("X-FILENAME", file.name);
            xhr.send(file);

        }
    }

    private uploadFileNette(file: File): void{
        let form: HTMLFormElement = <HTMLFormElement>document.getElementById(this.params.formId);
        var data = new FormData();
        data.append('file-0', file);


        let action :String = $("[name=_do]", form).attr("value");
        data.append("_do", action);

        $.ajax({
                url: form.action,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                beforeSend: function(xhr){xhr.setRequestHeader("X-DRAGDROP", "yes")},
            });
    }

    private showPreview(msg: string): void{
        if(this.params.replacePreviews){
            this.objects.previewDiv.innerHTML = msg;
        }else{
            this.objects.previewDiv.innerHTML = this.objects.previewDiv.innerHTML + msg;
        }

    }

    private createMessageDiv(){
        if(!this.params.nette){ // pokud nepouzivame Nette vytvorime si div. pokud se pouziva Nette vyuzijeme flashmesages
            let messageDiv = document.getElementById("uploaderMessages");
            if(messageDiv === null){
                messageDiv = document.createElement("div");
                messageDiv.id = "uploaderMessages";
                document.body.appendChild(messageDiv);
            }
        }
    }

    private showMessage(msg: string, type: string){
        let p = document.createElement("p");

        if(this.params.nette){
            let flashMessages;
            p.textContent = msg;

            let flashMessage = document.createElement("div");
            flashMessage.className = "flashMessage " + type;
            flashMessage.appendChild(p);

            if(document.getElementsByClassName("flashMessages").length === 0){
                flashMessages = document.createElement("section");
                flashMessages.className = "flashMessages";
                let snippet;
                if((snippet = document.getElementById("snippet--flashMessages")) !== null){
                    snippet.appendChild(flashMessages);
                }else{
                    document.body.appendChild(flashMessages);
                }
            }else{
                flashMessages = document.getElementsByClassName("flashMessages")[0];
            }
            flashMessages.appendChild(flashMessage);

        }else{
            p.textContent = msg;

            let message = document.createElement("div");
            message.className = "message";
            message.appendChild(p);

            let messagesDiv = document.getElementById('uploaderMessages');
            messagesDiv.appendChild(message);
        }
    }
}