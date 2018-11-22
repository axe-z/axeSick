import Order from '../components/Order.js';
import PleaseSignIn from '../components/PleaseSignIn.js';

const OrderPage  = (props) => {
 return (
    <div>
    <PleaseSignIn>
      <Order  id={props.query.id} />
    </PleaseSignIn>
    </div>
  )
};



export default OrderPage ;
