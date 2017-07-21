<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>HTML 5 Uploader</title>
	<link rel="stylesheet" href="style.css" type="text/css"/>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/3.51/jquery.form.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.min.js"></script>
	<script src="../build/html5uploader.min.js"<?php echo uniqid(); ?>></script>
</head>
<body>
<form id="upload" action="upload.php" method="POST" enctype="multipart/form-data">
	<fieldset>
		<legend>HTML 5 Uploader</legend>

		<div>
			<label for="fileselect">Files to upload:</label>
			<input type="file" id="fileselect" name="fileselect[]" multiple="multiple"/>
			<input name="_do" value="edit-Gallery-galleryForm-submit" type="hidden">
			<div id="filedrag">or drop files here</div>
		</div>

		<div id="submitbutton">
			<button type="submit">Upload Files</button>
		</div>

	</fieldset>
</form>
<div id="progress"></div>
<div id="previews">

</div>
<button id="alias">File Select 1</button>
<button id="alias2">File Select 2</button>

<script type="text/javascript">
	var uploader = new Html5Uploader.uploader({
		fileSelectId: "fileselect",
		fileSelectAliases: ["alias", "alias2"],
		fileDropAreaId: "filedrag",
		submitButtonId: "submitbutton",
		previewDivId: "previews",
		progressBarDiv: "progress",
		formId: "upload",
		maxSize: 3000000, //bytes
		nette: true,
		handlers: {
			before: function(f){
				console.log('Start');
			},
			after: function(f){
				console.log('End');
			}
		}
	});
</script>
</body>
</html>