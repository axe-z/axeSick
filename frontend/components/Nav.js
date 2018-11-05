import Link from 'next/link';
import { Fragment } from 'react';
import NavStyles from './styles/NavStyles.js'
import User from './User.js';
import Signout from './Signout.js';



const Nav = props => {
  return (

    <User>
      {({data : {me}}) => (


    <NavStyles>
      <p>{me && me.name}</p>
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
