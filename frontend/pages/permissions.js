import Permissions from '../components/Permissions.js';
import PleaseSignIn from '../components/PleaseSignIn.js';

const PermissionsPage = (props) => {
 return (
    <div>
    <PleaseSignIn>
        <Permissions />
    </PleaseSignIn>
    </div>
  )
};



export default PermissionsPage;
