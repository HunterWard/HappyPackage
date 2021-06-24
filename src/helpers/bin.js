import { exception } from 'console';

const fs = require('fs');

function getHeadInfo(path) {
    const PATH_TO_PARAM = path + '\\sce_sys\\param.sfo'

    try {
        if (fs.existsSync(PATH_TO_PARAM)) {
            var bin = fs.readFileSync(path + '\\sce_sys\\param.sfo');
            return String(bin.slice(1180,1216).toString()).trim();
        } else {
            return '';
        }
    } catch(e) {
        console.log(e);
    }

}
export {getHeadInfo}