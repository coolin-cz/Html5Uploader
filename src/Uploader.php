<?php

namespace Coolin\Html5Uploader;

use GuzzleHttp\Psr7\ServerRequest;

/**
 * Class Uploader
 * @author Coolin.cz
 * @package Coolin\Html5Uploader
 */
class Uploader{

	private $dir;

	public function __construct($dir = null){
		$this->dir = $dir;
	}

	/**
	 * @param string $fileName
	 * @param string $dir
	 * @throws HandlerException
	 * @throws \RuntimeException
	 */
	public function upload($fileName = null, $dir = null){

		if(!$this->beforeHandler($fileName)){
			throw new HandlerException('Error in beforeHandler!');
		}

		$path = $dir !== null ? $dir : $this->getDir();
		if(!is_dir($path)){
			/** @noinspection MkdirRaceConditionInspection */
			mkdir($path, 0775, true);
		}

		$request = ServerRequest::fromGlobals();
		$uploadedFiles = $request->getUploadedFiles();

		if(count($uploadedFiles) > 0){
			foreach($uploadedFiles as $uploadedFile){
				/** @var $uploadedFile \GuzzleHttp\Psr7\UploadedFile */
				$name = $fileName ? $fileName : $uploadedFile->getClientFilename();
				file_put_contents($path.'/'.$name, $uploadedFile->getStream()->getContents());
			}
		}else if($request->hasHeader('X-FILENAME')){
			$name = $fileName ? $fileName : $request->getHeader('X-FILENAME');
			file_put_contents($path.'/'.$name, $request->getBody()->getContents());
		}

		if(!$this->afterHandler($fileName)){
			throw new HandlerException('Error in afterHandler!');
		}

	}

	/**
	 * Metoda určená k přetížení ve vlastním rozšíření.
	 * Volá se před zahájením uploadu každého souboru. Pro případ, že bychom si chtěli zalogovat začátek uploadu apod.
	 *
	 * @param string $fileName
	 * @return bool
	 */
	public function beforeHandler($fileName){
		return true;
	}

	/**
	 * Metoda určená k přetížení ve vlastním rozšíření.
	 * Volá se po dokončení uploadu každé fotky. Např. pokud si cheme zalogovat dokončení nahrávání, změnu galerie apod.
	 *
	 * @param string $fileName
	 * @return bool
	 */
	public function afterHandler($fileName){
		return true;
	}

	protected function getDir(){
		return $this->dir !== null ? $this->dir : '/*uploads';
	}
}