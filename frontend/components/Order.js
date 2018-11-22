import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query } from "react-apollo";
import { format } from 'date-fns'; //comme moment mais plus functionnal
import { fr } from 'date-fns/locale' //mettre en FR 
import Head from 'next/head';
import gql from 'graphql-tag';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import OrderStyles from './styles/OrderStyles';

const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY ($id : ID!){
    order(id: $id){
      id
      charge
      total
      createdAt
      user {
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity

      }
    }
  }
`;


class Orders extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };
  render() {
    return (
      <Query query={SINGLE_ORDER_QUERY} variables={{id: this.props.id}}>
        {({ data : {order}, loading, error, refetch, networkStatus }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <Error error={error}/> ;
          console.log(order)
          return (
            <OrderStyles>
              <Head>
                <title>Axe-Z commande #{order.id}</title>
              </Head>
              <p>
                <span>Commande #</span>
                <span>{order.id}</span>
              </p>
              <p>
                <span>Montant</span>
                <span>{order.charge}</span>
              </p>
              <p>
                <span>Date</span>
                <span>{format(order.createdAt,'MMMM d, YYYY h:mm a', { locale: fr})}</span>
              </p>
              <p>
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </p>
              <p>
                <span>Nombre d'items</span>
                <span>{order.items.length}</span>
              </p>
              <div className="items">
                {order.items.map(item => (
                  <div className="order-item" key={item.id}>
                    <img src={item.image} alt={item.title} />
                    <div className="item-details">
                      <h2>{item.title}</h2>
                      <p>Qte: {item.quantity} </p>
                      <p>Prix: {item.price} </p>
                      <p>Sous-total: {formatMoney(item.price * item.quantity)}</p>
                      <p> {item.description} </p>
                    </div>
                  </div>
                ))}
            </div>

          </OrderStyles>
          );
        }}
      </Query>
    );
  }
}


export default Orders;
