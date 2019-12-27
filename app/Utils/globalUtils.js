import AppsUtils from './appsUtils';
import ElectronUtils from './electronUtils';
import DockerUtils from './dockerUtils';
import ManagerUtils from './managerUtils';
import OsUtils from './osUtils';
import MiscUtils from './miscUtils';
import constants from '../Constants/constants.json';


export default {
    electron: new ElectronUtils(),
    apps: new AppsUtils(),
    docker: new DockerUtils(),
    manager: new ManagerUtils(),
    os: new OsUtils(),
    misc: new MiscUtils(),
    const: constants
}