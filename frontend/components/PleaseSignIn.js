import React from "react";
import { Query } from "react-apollo";
import { CURRENT_USER_QUERY } from './User';
import Signin from './Signin';

const PleaseSignIn = props => {
  return (
    <Query query={CURRENT_USER_QUERY}>
      {({ data, loading }) => {
        if (loading) return "Loading";
        if (!data.me) {
          return (
            <div>
              <p>svp vous connecter</p>
              <Signin />
            </div>
          );
        }
        return <div>{props.children}</div>;
      }}
    </Query>
  );
};


export default PleaseSignIn;
