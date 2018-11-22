import React, { Component } from 'react';
import  StripeCheckout  from 'react-stripe-checkout';
import { Mutation } from "react-apollo";
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import ErrorMessage from './ErrorMessage.js';
import User ,  { CURRENT_USER_QUERY } from './User';

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION( $token: String! ) {
    createOrder(token: $token){
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;


function totalItems(cart){
//   console.log(cart)
 return cart.reduce((acc, item) =>  acc + item.quantity ,0)
}

class TakeMyMoney extends Component {

  onToken = async (res, createOrder) => {
    NProgress.start()
    //console.log(res); // tout la patente
    //console.log(res.id); // le id du token
    //manuellement caller avec la variable
    const order = await createOrder({
      variables: {
        token: res.id
      }
    }).catch(error =>  alert(error.message))
    //voir le outpout
    console.log(order);

    Router.push({
      pathname: '/order',
      query: {
        id: order.data.createOrder.id
      }
    })

  };

  render() {
    //ON PEUT PAS METTRE LA VARIABLE TOKEN TANT QUE LE CALL EST PAS FAIT , DONC ON LE MET DANS TOKEN ATT.
    return (
      <User>
        {({ data: { me } }) => (
          <Mutation mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{query: CURRENT_USER_QUERY}]}
            >
            {(createOrder, { data, loading, called, error }) => {
              return (
                <StripeCheckout
                  amount={calcTotalPrice(me.cart)}
                  name="axe-z"
                  description={`facture de ${totalItems(me.cart)} items`}
                  image={me.cart.length && me.cart[0].item && me.cart[0].item.image}
                  stripeKey="pk_test_Q7JbjhlJnsnjAn56gT5ZdK8q"
                  currency="CAD"
                  email={me.email}
                  token={res => this.onToken(res, createOrder)}
                >
                  <p>{this.props.children}</p>
                </StripeCheckout>
              );
            }}
          </Mutation>
        )}
      </User>
    );
  }
}



export default TakeMyMoney;
