import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from './User';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION(
    $email: String!
    $password: String!
  ) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`;
const initialState = {
  email: "",
  password: ""
};

class Signin extends Component {
  state = initialState

  saveToState = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    const { email, password } = this.state;
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={{ email, password }}
        refetchQueries={[
          {query: CURRENT_USER_QUERY }
        ]}
      >
        {(signin, { data, loading, called, error }) => {
          return (
            <Form
              method="post"
              onSubmit={async(e) => {
                e.preventDefault();
                const res = await signin();
                console.log(res.data.signin)
                this.setState(initialState)
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Authentifiez-Vous</h2>
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
                <button type="submit">Connectez Vous</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Signin;
