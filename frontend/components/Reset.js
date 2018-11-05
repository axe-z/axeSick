import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from './User';

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

const initialState = {
  password: "",
  confirmPassword: ""
};
class Reset extends Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired
  };
  state = initialState;

  saveToState = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    const { password, confirmPassword } = this.state;
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{
          resetToken: this.props.resetToken,
          password,
          confirmPassword
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { data, loading, called, error }) => {
          return (
            <Form
              method="post"
              onSubmit={async e => {
                e.preventDefault();
                const res = await resetPassword();
                console.log(res.data.resetPassword);
                this.setState(initialState);
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Réinitialiser votre mot de passe</h2>
                <Error error={error} />

                <label htmlFor="password">
                  nouveau Password
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={password}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor="confirmPassword">
                  confirmer le nouveau Password
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="confirmPassword"
                    value={confirmPassword}
                    onChange={this.saveToState}
                  />
                </label>
               <button type="submit">Réinitialiser mot de passe</button>
              </fieldset>
            </Form>
          );
        }}
      </Mutation>
    );
  }
}

export default Reset;
