import Link from 'next/link'
import NavStyles from './styles/NavStyles.js'


const Nav = props => {
  return (
    <NavStyles>
      <Link href="/items">
        <a>Produits</a>
      </Link>
      <Link href="/sell">
        <a>Vente</a>
      </Link>
      <Link href="/signup">
        <a>inscription</a>
      </Link>
      <Link href="/orders">
        <a>commandes</a>
      </Link>
      <Link href="/me">
        <a>Compte</a>
      </Link>


    </NavStyles>
  );
};


export default Nav;
