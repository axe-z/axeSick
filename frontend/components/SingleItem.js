import React, { Component } from 'react';
import gql from "graphql-tag";
import { Query } from "react-apollo";
import ErrorMessage from './ErrorMessage.js';
import styled from 'styled-components';
import Head from 'next/head';
import formatMoney from '../lib/formatMoney.js'

const SingleItemStyles = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-right: 0.5px solid ${props => props.theme.red};
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`;

export const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
      largeImage
    }
  }
`;

class SingleItem extends Component {
  render() {
    return (
      <Query
        query={SINGLE_ITEM_QUERY}
        variables={{id : this.props.id}}>
        {
          ({  data : { item }, loading, error, refetch, networkStatus }) => {
            if (loading) return 'Loading';
            if (error) return <ErrorMessage error={error}/> ;
            if (!item) return <p>Aucun Item Retrouvé</p>;
             console.log(item)
            return (
              <SingleItemStyles>
                <Head>
                  <title>AXE-Z | {item.title}</title>
                </Head>
                <img src={item.largeImage} alt={item.title} />
                <div className="details">
                  <h2>Ici Le {item.title}</h2>
                  <p>{item.description}</p>
                  <p>{formatMoney(item.price)}</p>
                </div>
              </SingleItemStyles>
            )
          }
        }
      </Query>

    );
  }
}

export default SingleItem;
