import React  from 'react';
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import User from './User.js'
import CartItem from './CartItem.js'
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import TakeMyMoney from './TakeMyMoney.js';

// va sur le localstate et non la DB
export const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

export const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;



const Cart = props => {
  return (
    <User>
      {({ data: { me } }) => {
         //console.log(me)
        if (!me) return null;
        return (
          <Mutation mutation={TOGGLE_CART_MUTATION}>
            {(toggleCart, { data, loading, called, error }) => {
              return (
                <div>
                  <Query query={LOCAL_STATE_QUERY}>
                    {({ data, error }) => {
                      if (error) return `Error!: ${error}`;
                      return (
                        <CartStyles open={data.cartOpen}>
                          <header>
                            <CloseButton title="fermer" onClick={toggleCart}>
                              X
                            </CloseButton>
                            <Supreme>Panier de {me.name}</Supreme>
                            <p>Vous avez { me.cart.length } Item{ me.cart.length > 1 && 's'}</p>
                          </header>
                          <ul>
                            {me.cart.map(cartItem => (
                              <CartItem key={cartItem.id}  cartItem={cartItem} />
                            ))}
                          </ul>
                          <footer>
                            <p>{ formatMoney(calcTotalPrice(me.cart)) }</p>
                            {me.cart.length > 0 && (
                              <TakeMyMoney>
                                <SickButton>Terminer</SickButton>
                              </TakeMyMoney>
                            )}
                          </footer>
                        </CartStyles>
                      );
                    }}
                  </Query>
                </div>
              );
            }}
          </Mutation>
        );
      }}
    </User>
  );
};



export default Cart;
