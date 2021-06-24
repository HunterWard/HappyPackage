import * as fs from 'fs';


function initDirs(path) {
    var library = path + '\\Library'
    fs.mkdir(library, () => {
        console.log("Library Exists");
    })

    fs.mkdir(library + '\\Downloads', () => {
        console.log("Download Exists");
    })
    fs.mkdir(library + '\\Unpacked', () => {
        console.log("Unpacked Exists");
    })
}

export {initDirs};