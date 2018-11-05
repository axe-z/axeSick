import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";


const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION(
    $email: String!
  ) {
    requestReset(email: $email) {
    message
    }
  }
`;
const initialState = {
  email: ""

};

class RequestReset extends Component {
  state = initialState

  saveToState = e => {
    const { value } = e.target;
    this.setState({ email: value });
  };

  render() {
    const { email  } = this.state;
    return (
      <Mutation
        mutation={REQUEST_RESET_MUTATION}
        variables={{ email }}

      >
        {(requestReset, { data, loading, called, error }) => {
          return (
            <Form
              method="post"
              onSubmit={async(e) => {
                e.preventDefault();
                const res = await requestReset();
                console.log(res.data.requestReset)
                this.setState(initialState)
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Réinitialiser votre mot de passe</h2>
                <Error error={error} />
                {!error && !loading && called &&  <p>Un courriel de vous sera envoyé dans quelques secondes!</p> }
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

                <button type="submit">Mot de passe oublié ?</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default RequestReset;
