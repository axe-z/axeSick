import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Form from "./styles/Form";
import ErrorMessage from "./ErrorMessage.js";
import formatMoney from "./../lib/formatMoney.js";
import Router from "next/router";
import gql from "graphql-tag";
import styled from "styled-components";
//import { ALL_ITEMS_QUERY } from './Items';


export const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: "",
    description: "",
    image: "",
    largeImage: "",
    price: 1000
  };

  handleChange = e => {
    const { name, type, value } = e.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

   uploadFile = async (e) => {
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
     const file = await res.json();
      console.log(file)
      //enreigistrer le string qui est retourné
      this.setState({
        image: file.secure_url,
        largeImage: file.eager[0].secure_url
      });
  }


  render() {
    const { title, price, description, image } = this.state;
     // console.log(this.props)
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION}
        variables={this.state}

        >
        {(createItem, { data, loading, called, error }) => (
          <Form
            onSubmit={async (e) => {
              //si on passe createItem en arg, ca chi
              //arreter le submit
              e.preventDefault();
              //faire la mutation
              const res = await createItem();
              console.log(res.data.createItem);
              //redirect
              Router.push({
                pathname: "/item",
                query: { id: res.data.createItem.id }
              });
            }}
          >
            <ErrorMessage error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Inserer Image"
                  required
                  onChange={this.uploadFile}
                />
              </label>
              {image && <img src={image} width="50px" alt={title}/>}
              <label htmlFor="title">
                Titre
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Titre"
                  required
                  value={title}
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
                  step=".01"
                  required
                  value={price}
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
                  value={description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Enregistrer</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
