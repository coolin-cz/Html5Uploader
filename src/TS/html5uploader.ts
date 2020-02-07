/**
 * HTML5 Uploader by COOLIN
 */
declare const $: any;

interface IParams{
	fileSelectId: string;
	fileSelectAliases: string[];
	fileDropAreaId: string;
	submitButtonId: string;
	previewDivId: string;
	replacePreviews: boolean;
	loaderClass: string;
	progressBarDiv: string;
	formId: string;
	maxSize: number;
	flashHandler: Function;
	handlers: {
		before: Function,
		after: Function
	};
}

export class Html5uploader{
	private params: IParams;

	private elemPreview: HTMLElement;
	private elemFileSelect: HTMLElement;
	private elemFileDropArea: HTMLElement;
	private elemSubmitBtn: HTMLElement;

	private filesCounter = 0;
	private filesCount = 0;

	private counter = 0;

	constructor(parameters: IParams){
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
	private setEventListeners(): void {
		// file select
		this.elemFileSelect.addEventListener("change", (e) =>{
			this.fileSelectHandler(e)
		});
		// dalsi tlacitka file select
		if(this.params.fileSelectAliases !== undefined && this.params.fileSelectAliases.length > 0){
			this.params.fileSelectAliases.forEach((value) =>{
				document.getElementById(value).addEventListener("click", () =>{
					this.elemFileSelect.click();
				});
			});
		}
		let xhr = new XMLHttpRequest();
		if(xhr.upload){
			this.elemFileDropArea.addEventListener("dragenter", (e) =>{
				this.addHover(e);
			});
			this.elemFileDropArea.addEventListener("dragleave", (e) => {
				this.removeHover(e);
			});
			this.elemFileDropArea.addEventListener("dragover", (e) =>{
				e.preventDefault();
				e.stopPropagation();
			});
			this.elemFileDropArea.addEventListener("drop", (e) =>{
				this.fileSelectHandler(e)
			});
			this.elemFileDropArea.style.display = "block";
			this.elemSubmitBtn.style.display = "none";
		}
	}

	/**
	 * Zpracování files po drop nebo file select
	 * @param e
	 */
	private fileSelectHandler(e): void{
		this.removeHover(e);
		this.counter = 0;
		// fetch FileList objects
		let files = e.target.files || e.dataTransfer.files;
		this.filesCount = files.length;
		// spusteni before funkce
		if(this.params.handlers !== undefined && this.params.handlers.before !== undefined){
			this.params.handlers.before();
		}
		// zpracovani vsech files
		for(const file of files){
			if(file.size <= this.params.maxSize){
				this.parseFile(file);
				this.uploadFile(file);
			}else{
				if(this.params.progressBarDiv !== undefined){
					let bar = this.createProgressBar(file.name);
					bar.style.width = "100%";
					bar.className = "bar failure";
					this.removeProgressBar(bar);
				}
				this.showMessage("Obrázek " + file.name + " je příliš velký.", "error");
			}
		}
	}

	/**
	 * Zpracovani file pres fileReader
	 * @param file
	 */
	private parseFile(file: File): void{
		if(file.type.indexOf("image") === 0 && this.params.previewDivId !== null){
			let reader = new FileReader();
			reader.onload = () =>{
				this.showPreview(reader.result.toString());
			};
			reader.readAsDataURL(file);
		}
	}

	/**
	 * Upload pres ajax
	 * @param file
	 */
	private uploadFile(file: File): void{
		let form: HTMLFormElement = <HTMLFormElement>document.getElementById(this.params.formId);
		if((file.type === "image/jpeg" || file.type === "image/png")){
			let data = new FormData();
			data.append('file-0', file);

			let action: string = $("[name=_do]", form).attr("value");
			data.append("_do", action);
			$.ajax({
				xhr: () =>{
					return this.createXhr(file);
				},
				url: form.action,
				data: data,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				beforeSend: (xhr) =>{
					xhr.setRequestHeader("X-DRAGDROP", "yes");
					xhr.setRequestHeader("X-FILENAME", file.name.toLocaleLowerCase());
				},
			});
		}else{
			this.showMessage("Neplatný formát obrázku.", "error");
			setTimeout(() =>{ // flashmessage se nekdy ani nestihla vytvorit, proto mensi zpozdeni pro afterhandler
				this.afterHandler();
			}, 500);
		}
	}

	/**
	 * Vytvoreni XHR a nastaveni progressBar
	 * @param file
	 */
	private createXhr(file: File){
		let xhr: XMLHttpRequest = new XMLHttpRequest();
		// create progress bar
		if(this.params.progressBarDiv !== null){
			let bar = this.createProgressBar(file.name);
			// progress bar
			xhr.upload.addEventListener("progress", (e: ProgressEvent) =>{
				bar.style.width = (e.loaded / e.total * 100) + "%"
			});
			xhr.onprogress = (e: ProgressEvent) =>{
				bar.style.width = (e.loaded / e.total * 100) + "%"
			};
			xhr.upload.onprogress = (e: ProgressEvent) =>{
				bar.style.width = (e.loaded / e.total * 100) + "%"
			};

			// file received/failed
			xhr.onreadystatechange = () =>{
				if(xhr.readyState === 4){
					bar.className = (xhr.status === 200 ? "bar success" : "bar failure");
					bar.style.width = "100%";
					if(xhr.status !== 200){
						this.showMessage("Při nahrávání obrázku " + file.name + " došlo k chybě.", "error");
					}
					this.removeProgressBar(bar);
					this.afterHandler();
				}
			};
		}
		return xhr;
	}

	/**
	 * Zobrazeni preview obrazku
	 * @param imgUrl
	 */
	private showPreview(imgUrl: string): HTMLDivElement{
		if(this.params.replacePreviews){
			this.elemPreview.innerHTML = '';
		}

		let preview = document.createElement("div");
		preview.className = "preview";

		let img = document.createElement("img");
		img.setAttribute("src", imgUrl);
		preview.appendChild(img);

		if(this.params.loaderClass !== undefined){
			let loader = document.createElement('i');
			loader.className = this.params.loaderClass;
			preview.appendChild(loader);
		}
		this.elemPreview.appendChild(preview);

		return preview;
	}

	/**
	 * Zobrazeni flashMessage bud pres flashHandler nebo jeji vytvoreni
	 * @param msg
	 * @param type
	 */
	private showMessage(msg: string, type: string){
		if(this.params.flashHandler !== undefined){
			this.params.flashHandler(msg, type);
		}
		else{
			let p = document.createElement("p");
			p.textContent = msg;
			let flashMessages;

			let flashMessage = document.createElement("div");
			flashMessage.className = "flashMessage " + type;
			flashMessage.appendChild(p);

			if(document.getElementsByClassName("flashMessages").length === 0){
				flashMessages = document.createElement("section");
				flashMessages.className = "flashMessages";
				let snippet = document.getElementById("snippet--flashMessages");
				if(typeof snippet !== undefined && snippet !== null){
					snippet.appendChild(flashMessages);
				}else{
					document.body.appendChild(flashMessages);
				}
			}else{
				flashMessages = document.getElementsByClassName("flashMessages")[0];
			}
			flashMessages.appendChild(flashMessage);
		}
	}

	/**
	 * Vykonani after funkce po nahrani fotky
	 */
	private afterHandler(){
		this.filesCounter++;
		if(this.filesCount === this.filesCounter){
			if(this.params.handlers !== undefined && this.params.handlers.after !== undefined){
				this.filesCounter = 0; // pokud volame after, musime pak vynulovat filesCounter, aby priste pocital od nuly..
				this.params.handlers.after();
			}
		}
	}

	/**
	 * Zastaveni event a pridani hover
	 * @param e
	 */
	private addHover(e): void{
		e.preventDefault();
		e.stopPropagation();
		this.counter++;
		this.elemFileDropArea.classList.add("hover");
	}

	/**
	 * Zastaveni event a odebrani hover
	 * @param e
	 */
	private removeHover(e): void{
		e.preventDefault();
		e.stopPropagation();
		this.counter--;
		if(this.counter === 0){
			this.elemFileDropArea.classList.remove("hover");
		}
	}

	/**
	 * Vytvoreni progress bar
	 * @param name
	 */
	private createProgressBar(name: string): HTMLElement{
		let progressDiv: HTMLElement = document.getElementById(this.params.progressBarDiv);
		let upload = document.createElement("div");
		let bar = document.createElement("div");

		upload.className = "upload";
		progressDiv.appendChild(upload);
		upload.appendChild(bar);

		bar.className = "bar";
		bar.appendChild(document.createTextNode(name));
		return bar;
	}

	/**
	 * Smaze dany progress bar
	 * @param bar
	 */
	private removeProgressBar(bar: HTMLElement): void{
		$(bar.parentElement).delay(5000).fadeOut(600, () =>{
			bar.parentElement.remove();
		});
	}
}