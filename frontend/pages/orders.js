import OrderList from '../components/OrderList.js';
import PleaseSignIn from '../components/PleaseSignIn.js';

const OrdersPage  = (props) => {
 return (
    <div>
    <PleaseSignIn>
      <OrderList />
    </PleaseSignIn>
    </div>
  )
};



export default OrdersPage  ;
