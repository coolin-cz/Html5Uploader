<?php
namespace Coolin\Html5Uploader;

class Uploader{

    private $dir;

    function __construct($dir = null){
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
            throw new HandlerException();
        }

        if(!$fn){ //Byl odeslan formular
            foreach($_FILES as $file){
                if($file['error'] == UPLOAD_ERR_OK){
                    $fn = $fileName != null ? $fileName : $file['name'];
                    file_put_contents($this->dir.'/'.$fn, file_get_contents($file['tmp_name']));
                }
            }
        }else{
            $name = $fileName != null ? $fileName : $fn;
            $path = $dir != null ? $dir : $this->getDir();
            $path = $path.'/'.$name;
            try{
                file_put_contents($path, file_get_contents('php://input'));
            }catch(\Exception $e){
                throw new FileException("Error while saving File!", $e->getCode(), $e);
            }

        }

        if(!$this->afterHandler($fileName)){
            throw new HandlerException();
        }

    }


    public function beforeHandler($fileName){
        return true;
    }

    public function afterHandler($fileName){
        return true;
    }

    protected function getDir(){
        return $this->dir != null ? $this->dir : '/*uploads';
    }
}