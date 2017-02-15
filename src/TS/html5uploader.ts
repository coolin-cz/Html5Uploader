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
                let o: HTMLElement = document.getElementById(this.params.progressBarDiv);
                let progress = document.createElement("p");
                o.appendChild(progress);
                progress.appendChild(document.createTextNode("upload " + f.name));
                progress.className = "failure";
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
        if(xhr.upload && file.type == "image/jpeg"){

            // create progress bar
            if(this.params.progressBarDiv != null){
                let o: HTMLElement = document.getElementById(this.params.progressBarDiv);
                let progress = document.createElement("p");
                o.appendChild(progress);
                progress.appendChild(document.createTextNode("upload " + file.name));


                // progress bar
                xhr.upload.addEventListener("progress", function(e: ProgressEvent){
                    let pc: number = 100 - (e.loaded / e.total * 100);
                    progress.style.backgroundPosition = pc + "% 0"
                }, false);

                // file received/failed
                xhr.onreadystatechange = function(e){
                    if(xhr.readyState == 4){
                        progress.className = (xhr.status == 200 ? "success" : "failure");
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
}