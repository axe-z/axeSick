import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from './User';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, password: $password, name: $name) {
      id
      email
      name
    }
  }
`;

const initialState = {
  email: "",
  name: "",
  password: ""
};

class Signup extends Component {
  state = initialState
 
  saveToState = e => {
    const { name, type, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    const { email, name, password } = this.state;
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={{ email, name, password }}
        refetchQueries={[
          {query: CURRENT_USER_QUERY }
        ]}
      >
        {(signup, { data, loading, called, error }) => {
          return (
            <Form
              method="post"
              onSubmit={async(e) => {
                e.preventDefault();
                const res = await signup();
                console.log(res.data.signup)
                this.setState(initialState)
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Faites votre compte!</h2>
                <Error error={error} />
                <label htmlFor="email">
                  email
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    value={email}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="name">
                  name
                  <input
                    type="text"
                    name="name"
                    placeholder="name"
                    value={name}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="password">
                  password
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={password}
                    onChange={this.saveToState}
                  />
                </label>
                <button type="submit">Creez votre compte</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Signup;

 