import CreateItem from '../components/CreateItem.js';
import PleaseSignIn from '../components/PleaseSignIn.js';

const Sell = (props) => {
 return (
    <div>
    <PleaseSignIn>
      <CreateItem />
    </PleaseSignIn>
    </div>
  )
};



export default Sell;
