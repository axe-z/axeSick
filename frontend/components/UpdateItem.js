import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import Form from "./styles/Form";
import ErrorMessage from "./ErrorMessage.js";
import formatMoney from "./../lib/formatMoney.js";
import Router from "next/router";
import gql from "graphql-tag";
import styled from "styled-components";

export const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
      image
      largeImage
    }
  }
`;

export const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
    $image: String
    $largeImage: String
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
      title
      description
      price
    }
  }
`;



class UpdateItem extends Component {
  state = {};

  handleChange = e => {
    const { name, type, value } = e.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

handleUpdateItem = async (e, updateItem, refetch) => {
  e.preventDefault();

  console.log(this.props.id);
  console.log(this.state);
  const res = await updateItem({
    variables: {
      id: this.props.id,
      ...this.state
    }
  });
  // console.log(res.data.updateItem);
  await refetch();
  console.log("update fait", res);

  //redirect
  // Router.push({
  //   pathname: "/items",
//    query: { id: this.props.id }
  // });
};


uploadFile = async (e, refetch) => {
//   console.log('upload', e.target.files);
  const files = e.target.files;
  const data = new FormData();
  data.append('file', files[0]);
  data.append('upload_preset', 'sickaxe') //pour cloudnary , le nom de notre upload folder.
  //envoyer l image
  const res = await fetch('https://api.cloudinary.com/v1_1/benoit-lafrance/image/upload', {
    method: 'POST',
    body: data
  });
  const file = await res.json()
   console.log('file', file)
   //enreigistrer le string qui est retourné

     this.setState({
       image: file.secure_url,
       largeImage: file.eager[0].secure_url
     });

     await refetch();

}

  render() {
    // const { title, price, description, image } = this.state;
    // const id = this.props.id
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data , loading, error, refetch, networkStatus }) => {
          if (loading) return "Loading";
          if (error) return 'eroor' ;
          if(!data.item.id) return <p>Il n'y a pas d'item pour ce id: {this.props.id}</p>
           //console.log(data.item)
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}
              refetchQueries={ () => [
                {query: SINGLE_ITEM_QUERY, variables: { id: this.props.id }}   //si dans les favoris
              ]}>
              {(updateItem, {loading, error }) => (
                <Form
                  onSubmit={(e) => this.handleUpdateItem(e,updateItem , refetch) }
                >
                  <ErrorMessage error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                      {/*//image label a rajouter apres.*/}
                      <label htmlFor="file">
                        Image
                        <input
                          type="file"
                          id="file"
                          name="file"
                          placeholder="Inserer Image"
                          onChange={(e) => this.uploadFile(e, refetch)}
                        />
                      </label>
                        {data.item.image && <img src={data.item.image} width="50px" alt={data.item.title}/>}
                    <label htmlFor="title">
                      Titre
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Titre"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="price">
                      Prix
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Prix"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Entrez Une Description"
                        required
                          defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>
                    <button type="submit">Enregist{loading ? 'rement' : 'rer'}</button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default UpdateItem;
