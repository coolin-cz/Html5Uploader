<?php

namespace Coolin\Html5Uploader;

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
	 * @throws FileException
	 * @throws HandlerException
	 */
	public function upload($fileName = null, $dir = null){
		$fn = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);

		if(!$this->beforeHandler($fileName)){
			throw new HandlerException('Error in beforeHandler!');
		}

		$path = $dir !== null ? $dir : $this->getDir();
		if(!is_dir($path)){
			/** @noinspection MkdirRaceConditionInspection */
			mkdir($path, 0775, true);
		}

		if(!$fn){ //Byl odeslan formular
			foreach($_FILES as $file){
				if($file['error'] === UPLOAD_ERR_OK){
					$fn = $fileName !== null ? $fileName : $file['name'];

					copy($file['tmp_name'], $path.'/'.$fn);
				}
			}
		}else{
			$name = $fileName !== null ? $fileName : $fn;

			$path = $path.'/'.$name;
			try{
				copy('php://input', $path);
			}catch(\Exception $e){
				throw new FileException('Error while saving File!', $e->getCode(), $e);
			}

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