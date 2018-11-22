import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';
import { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION } from '../components/Cart';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === "development" ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: "include"
        },
        headers
      });
    },
    // le data local - pas sur la db , mais data pour nous et facilement tranportable de component a l autre.
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart: (_, variables, { cache }) => {   //(_, variables, client)
            //1- read la valeur cache de cartOpen ... bummer il faut gql, mais c est notre query deja faite (LOCAL_STATE_QUERY)
            const { cartOpen } = cache.readQuery({  // retourne data.cartOpen, donc { cartOpen }
              query: LOCAL_STATE_QUERY
            });
            //  console.log(cartOpen); // ATTENTION REFRESH TOTAL QUAND LOCAL true PAS DE HMR
            //2- write la nouvelle valeur inversée de cartOpen, avec la forme graphql
            const data = {
              data: { cartOpen : !cartOpen}
            };// mieux de mettre ca sur une variable .
            cache.writeData(data); //writeData sur local
           return data; // sinon warning d object {} vide
          }
        }
      },
      defaults: {
        cartOpen: false
      }
    }
  });
}


export default withApollo(createClient);
