import React, { Component } from 'react';
import Downshift, { resetIdCounter } from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce'; //ralentie les input events
import { DropDown, DropDownItem, SearchStyles} from './styles/DropDown';


//pour sortir l un ou l autre et non pas les deux si la description a un match et le title
const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!){
    items(where: {
      OR: [
        {title_contains: $searchTerm},
        {description_contains: $searchTerm}
      ]
    }) {
    id
    image
    title
    }
  }
`;

//fn qui converti l object en item utilisable=== string
function routeToItem(item){
  //console.log(item)// donne tous les info de l item sellectionné
  Router.push({   //renvois a la page de l item selectioné
    pathname: '/item',
    query: {
        id: item.id
    }
  })
}

//on ne veut pas la query onpageload, donc le query component n est pas la solution
// donc faudra lancer la query manuellement avec ApolloConsumer
class AutoComplete extends Component {
  state = {
    items: [],
    loading: false
  }

  onChange = debounce( async (e, client) => {
    //1- mettre le loading a on
    this.setState({loading: true})
    // catcher la val de l input
    const search = e.target.value;
    //manuellement query apollo
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm : search }
    });
    //mettons que je rentre "a"
     console.log(res.data) //{items: Array(3), Symbol(id): "ROOT_QUERY"}
     //mettre dnas le state
     this.setState({items: res.data.items, loading: false})
  },350)



  render() {
    resetIdCounter()  //sinon warning de label
    return (

      <SearchStyles>
        <Downshift
          itemToString={item => item === null ? '' : item.title}
          onChange={routeToItem}
          >
          {({getInputProps, getItemProps, isOpen, inputValue, highlightedIndex}) => (

        <div>
          <ApolloConsumer>

            {(client) => (
                <input
                  {...getInputProps({
                    type: "search",
                    placeholder: "Rechercher un item...",
                    id: "search",
                    className: this.state.loading ? 'loading':'',
                    onChange: (e) => {
                      e.persist()
                     this.onChange(e, client)
                     }
                  })}
                />
            )}

        </ApolloConsumer>
        {isOpen && (
          <DropDown>
             {this.state.items.map((item, index) => (
               <DropDownItem
                 {...getItemProps({ item })}
                 key={item.id}
                 highlighted={index === highlightedIndex}>
                 <img src={item.image} width="50px" alt={item.title} />
                  {item.title}
               </DropDownItem>
             )
             )}
             {!this.state.items.length && !this.state.loading && (
               <DropDownItem>
                 Rien pour {inputValue}
               </DropDownItem>
              )}
        </DropDown>
        )}
      </div>
    )}
  </Downshift>
      </SearchStyles>
    );
  }
}

export default AutoComplete;
