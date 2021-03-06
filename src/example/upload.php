<?php
require_once __DIR__ .'/../../vendor/autoload.php';
include_once '../Uploader.php';

function generateRandomString($length = 10){
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for($i = 0; $i < $length; $i++){
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }

    return $randomString;
}

$uploader = new Coolin\Html5Uploader\Uploader(__DIR__.'/uploads');
$uploader->upload(generateRandomString().'.jpg');
