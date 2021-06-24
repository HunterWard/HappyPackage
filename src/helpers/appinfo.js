/**
 * appinfo.js
 *
 * Helper file to get application info straight from application files.
 */
import * as bin from './bin'

const fs = require('fs');
const sizer = require('get-folder-size')

/** Base Driver Function to get App Info
 *
 * @param {string} path Path to App
 * @returns App Object
 */
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

/** Find whether an APP is a licensed game or Homebrew
 *
 * @param {string} firstFour First four characters in app ID
 * @returns 0 if Licensed, 1 if Homebrew
 */
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

/** Function to attempt to extract app name from binary files
 *
 * @param {*} path App Path
 * @param {*} id App Id
 * @returns Name of app if found else ''
 */
function getAppName(path, id) {
    return bin.getHeadInfo(path)
}

/** Get App ID from apps folder name
 *
 * @param {string} path App Path
 * @returns ID of app
 */
function getAppId(path) {
    return path.split('\\')[2];
}



export {getAppInfo}