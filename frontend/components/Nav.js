import Link from 'next/link';
import { Fragment } from 'react';
import NavStyles from './styles/NavStyles.js'
import User from './User.js';
import Signout from './Signout.js';
import { Mutation } from "react-apollo"
import { TOGGLE_CART_MUTATION } from './Cart';
import CartCount from './CartCount.js'

const Nav = props => {
  return (

    <User>
      {({data : {me}}) => (

    <NavStyles>
      <h6 style={{color: "#FF0000", maxWidth: "70px", lineHeight: 1.1, textAlign: 'right', marginRight: 20}}>{me && me.name}</h6>
      <Link href="/items">
        <a>Produits</a>
      </Link>

      {me ? (
        <Fragment>
        <Link href="/sell">
          <a>Vendre</a>
        </Link>
        <Link href="/orders">
          <a>commandes</a>
        </Link>
        <Link href="/me">
          <a>Compte</a>
        </Link>

        <Signout />

        <Mutation
          mutation={ TOGGLE_CART_MUTATION } >
          {(toggleCart, { data, loading, called, error }) =>  (

                 <button onClick={toggleCart}>

                   Mon Panier
                   <CartCount count={me.cart.reduce((acc, item) => acc + item.quantity ,0)}/>
                 </button>

              )

          }
        </Mutation>

        </Fragment>
      ) : (
        <Link href="/signup">
          <a>inscription</a>
        </Link>
        )}

    </NavStyles>
  )}
</User>
  );
};


export default Nav;
