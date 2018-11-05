import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Item from './Item.js';
import Pagination from './Pagination.js'
import { perPage } from '../config';

export const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      description
      image
      largeImage
      price
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

class Items extends Component {
  render() {
    return (
      <Center>
        <Pagination page={this.props.page}/>
          <Query query={ALL_ITEMS_QUERY}
            // fetchPolicy="network-only"
             variables={{
              skip: this.props.page * perPage - perPage,
              first: 4
            }}>
            {({ data: { items }, loading, error, refetch, networkStatus }) => {
              if (loading) return "Loading";
              if (error) return `Error!: ${error}`;
              return (
                <ItemsList>
                  {items.map(item => <Item item={item} key={item.id} />)}
                </ItemsList>
              );
            }}
          </Query>
        <Pagination page={this.props.page}/>
      </Center>
    );
  }
}


export default Items;
