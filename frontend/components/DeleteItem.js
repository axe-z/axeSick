import React, { Component } from 'react';
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { ALL_ITEMS_QUERY } from './Items';

export const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION ($id: ID!){
    deleteItem(id: $id){
      id
    }
  }
`;

class DeleteItem extends Component {
  update = (cache, payload) => {
    ///manuellement ajuster la cash // cash = tout , payload = retour de ce que la mut. dit retourner
    //1- read la cache
    const data = cache.readQuery({query: ALL_ITEMS_QUERY})
  //  console.log(data) //{items: Array(5), Symbol(id): "ROOT_QUERY"} // tous les items sur la page donc meme lui deleté
  //  console.log(payload) //data: deleteItem: {id: "cjnuwjxm61ewo09953560k1r5", __typename: "Item"} //mut. return le id
    //2-filter lui qu on veut enlever et le mettre dans data.item ( ou c etait avant )
    data.items = data.items.filter(item => {
      return item.id !== payload.data.deleteItem.id
    });
    //3- remmetre les items qu on veut dans la cache
      cache.writeQuery({ query: ALL_ITEMS_QUERY,  data : data })  // ou juste data
      // et pas data: data.item , il y a des truc dans data autre que juste .item
  }
  render() {

    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        >

        {(deleteItem, { data, loading, called, error }) => {
          if (loading) return "Loading";
          if (error) return 'error' ;
          return (

              <button
                onClick={e => {
                  e.preventDefault();
                  if(confirm(" Vous etes sur de voiloir supprimer l'item ?")) {
                     deleteItem();
                  }
                }}
              >
                {this.props.children}
              </button>

          );
        }}
      </Mutation>
    );
  }
}

export default DeleteItem;
