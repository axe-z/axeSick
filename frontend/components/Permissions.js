import React, { Fragment} from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';
import PropTypes from 'prop-types';

const possiblePermissions = [
  "ADMIN", "USER", "ITEMCREATE", "ITEMUPDATE", "ITEMDELETE", "PERMISSIONUPDATE"
];

export const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: ID!){
    updatePermissions( permissions: $permissions, userId: $userId){
      id
      permissions
      name
      email
    }
  }
`;

export const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => {
  return (
    <Query query={ALL_USERS_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return "Loading";
        console.log(data) //{users: Array(2)}
        return (
          //console.log(data) || //{users: Array(2)}
          <div>
            <Error error={error} />
            <div>
              <h2>Ajuster les Permissions</h2>
              <Table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Courriel</th>
                    {possiblePermissions.map((permission, i) => <th key={i} className="perm">{permission}</th>)}
                    <th>Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(user => {
                    return <UserPermissions user={user} key={user.id}/>
                  })}

                </tbody>
              </Table>
            </div>
          </div>
        );
      }}
    </Query>
  );
};




class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  };
  state = {
    permissions: this.props.user.permissions // on devrait pas utiliser de props
  };
  handlePermissionChange = (e,updatePermissions) => {
    // console.log(e.target, e.target.value, e.target.checked) // input checkebox , "ITEMUPDATE", true
    const checkbox = e.target;
    //const updatedPermissions = [...this.state] //err, state pas un array
    let updatedPermissions = [...this.state.permissions];
    //console.log(updatedPermissions); // sort les permissions du user sur lequel on click.["USER", "PERMISSIONUPDATE", "ADMIN"]

    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(
        permission => permission !== checkbox.value
      );
    }
    //console.log(updatedPermissions);

    this.setState({ permissions: updatedPermissions }, () => {
          updatePermissions()
    });
    //mutation dans le setstate, pour etre sur que le state est changé
    //updatePermissions()

  };
  render() {
    const { user } = this.props;
    console.log(this.state.permissions);
    return (
      <Mutation mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{ permissions: this.state.permissions, userId:  user.id }}>
        {(updatePermissions, { data, loading, called, error }) => {
          return (
            <Fragment>
              {error && <tr><td colspan="8"><Error error={error} /></td></tr>}
              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {possiblePermissions.map((permission, i) => (
                  <td key={i}>
                    <label htmlFor={`${user.id}-permission-${permission}`}>
                      <input
                        type="checkbox"
                        id={`${user.id}-permission-${permission}`}
                        checked={this.state.permissions.includes(permission)}
                        value={permission}
                        onChange={ (e) => this.handlePermissionChange(e, updatePermissions)}
                      />
                    </label>
                  </td>
                ))}
                <td>
                  <SickButton
                    type="button"
                    disabled={!loading}>
                    {loading ? "En Cours" : "Completé"}
                    </SickButton>
                </td>
              </tr>
            </Fragment>
          );
        }}
      </Mutation>

    );
  }
}




export default Permissions;
// onClick={async(e) => {
// const res = await updatePermissions()
// console.log(res)
// }}>{loading ? "En Cours" : "Modifier"}
