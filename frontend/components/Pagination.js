import React, { Component } from 'react';
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { perPage } from '../config';
import Head from 'next/head';
import Link from 'next/link';
import PaginationStyles from './styles/PaginationStyles';


export const PAGINATION_QUERY = gql `
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;


const Pagination = (props) => {
 return (
        <Query
          query={PAGINATION_QUERY} >
          {
            ({ data : { itemsConnection }, loading, error, refetch, networkStatus }) => {
              if (loading) return 'Loading';
              if (error) return `Error!: ${error}`;
               // console.log(itemsConnection.aggregate.count)
               const count = itemsConnection.aggregate.count;
               const pages = Math.ceil(count / perPage);
               const page = props.page;
              return (
                <PaginationStyles>
                  <Head>
                    <title>AXE-Z | Produits {page} de {pages}</title>
                  </Head>
                  <Link
                    prefetch
                    href={{
                      pathname: 'items',
                      query: { page: page - 1 }
                    }}>
                    <a className="prev" aria-disabled={page <= 1}>retour</a>
                  </Link>

                <p>Vous etes sur la page {props.page} de {pages} </p>
                  <p>{count} items total</p>
                    <Link
                      prefetch
                       href={{
                        pathname: 'items',
                        query: { page: page + 1 }
                      }}>
                      <a className="next" aria-disabled={page >= pages}>suivante</a>
                    </Link>
                  </PaginationStyles>
              )
            }
          }
        </Query>
  )
};


export default Pagination;
//      {props.children}
