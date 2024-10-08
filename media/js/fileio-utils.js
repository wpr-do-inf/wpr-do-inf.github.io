
function isFileAPISupported() {
    var result = false;
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        result = true;
    } 
    return result;
}


function setTextFileDownloadLink(ahref, textContent, filename, downloadReadyLabel, downloadFinishedLabel) {
    const MIME_TYPE = 'text/plain';

    window.URL = window.webkitURL || window.URL;
    window.Blob = window.Blob || window.WebKitBlob ||
                         window.MozBlob;

    var prevLink = $(ahref).attr('href');
    if (prevLink) {
        // Release previous URL object
        window.URL.revokeObjectURL(prevLink.href);
    }

    var bb = new Blob([textContent], { "type" : MIME_TYPE });

    var a = $(ahref).get(0);
    a.download = filename;
    a.href = window.URL.createObjectURL(bb);
    a.textContent = downloadReadyLabel;

    a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
    a.dataset.disabled = false;

    var cleanUp = function(a) {
      a.textContent = downloadFinishedLabel;
      a.dataset.disabled = true;

      // Need a small delay for the revokeObjectURL to work properly.
      setTimeout(function() {
        window.URL.revokeObjectURL(a.href);
      }, 1500);
    };

    $(ahref).click(function(e) {
        if (('disabled' in this.dataset) && this.dataset['disabled'] == true) {
          return false;
        }
        cleanUp(this);
      });
}


function readTextFile(fileInputElement, successCallback) {
    var files = $(fileInputElement).get(0).files;
    if (!files.length) {
        alert('Please select a file!');
        return;
    }

    var file = files[0];
    var start = 0;
    var stop = file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            if (typeof(successCallback) === 'function') {
                successCallback(evt.target.result);
            }
        }
    };
    reader.readAsText(file);
}
