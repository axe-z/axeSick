import React, { Component } from 'react';
import { Mutation } from "react-apollo"
import PropTypes from 'prop-types';
import styled from "styled-components";
import gql from 'graphql-tag';
import {CURRENT_USER_QUERY} from './User';


const REMOVE_FROM_CART_MUTATION = gql`
 mutation removeFromCart($id: ID!){
   removeFromCart(id: $id) {
     id
   }
 }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: none;
  &:hover {
    color: ${props => props.theme.red};
    cursor: pointer;
  }
`;




class RemoveFromCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  }

  update = (cache, payload) => {
    //console.log('update apres delete')
    //1- lire la cache
    const data = cache.readQuery({query: CURRENT_USER_QUERY})
    //console.log(data) //{me: {…}, y a le cart et son array la dedans..
    //2- remove that item from le cart ( payload.data.removeFromCart.id  est le id retourné par la mutation )
    const cartItemId = payload.data.removeFromCart.id
    data.me.cart = data.me.cart.filter(item => item.id !== cartItemId) // tout remettre sauf lui du Id de la mutation
    //3- write dans la cache
    cache.writeQuery({query: CURRENT_USER_QUERY, data: data }) // on remet le data modifier
  }

  render() {
    return (
      <Mutation
        mutation={ REMOVE_FROM_CART_MUTATION }
        variables={{id: this.props.id}}
        //refetchQueries={[{query: CURRENT_USER_QUERY}]}
        //update va p-e etre plus vite que refetchQueries
        update={this.update}
        optimisticResponse={{
          __typename: "Mutation",
          removeFromCart: {
            __typename: "cartItem",
            id: this.props.id
          }
        }}
      >
        {(removeFromCart, { data, loading, called, error }) => {
          // console.log(called, data)
          return (
            <BigButton
              title="Supprime Item"
                disabled={loading}
                onClick={ () => {
                  removeFromCart().catch(error => alert(error.message))
                }}
              > X </BigButton>
            )
          }
        }
      </Mutation>

    );
  }
}


export default RemoveFromCart;
