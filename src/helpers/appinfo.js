import * as bin from './bin'

const fs = require('fs');
const sizer = require('get-folder-size')

function getAppInfo(path){
    var app = {};

    app['id'] = getAppId(path);
    app['path'] = path;
    app['type'] = getAppType(path.split('\\')[2].substring(0,4))

    var appSize;;
    sizer(path, (err, size) => {
        if (err) { throw err }

        if (size > 1073741824) {
            appSize = (size / 1073741824).toFixed(2) + ' GB';
        } else if (size > 1024) {
            appSize = (size / 1048576).toFixed(2) + ' MB';
        } else {
            appSize = (size / 1024).toFixed(2) + ' KB';
        }
        app['size'] = appSize;
    })

    app['name'] = getAppName(path, app['id']).trim();

    return app;


}

function getAppType(firstFour) {
    if (firstFour === 'PCSA' ||
        firstFour === 'PCSE' ||
        firstFour === 'PCSG' ||
        firstFour === 'VLJM') {
            return 0;
    } else {
        return 1;
    }
}

function getAppName(paramBIN, id) {
    return bin.getHeadInfo(paramBIN)
}

function getAppId(pathString) {
    return pathString.split('\\')[2];
}



export {getAppInfo}