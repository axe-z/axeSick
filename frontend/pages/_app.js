import App, { Container } from 'next/app';
import Page from './../components/Page.js';
import { ApolloProvider } from "react-apollo";
import withData from '../lib/withData.js';

class myApp extends App {
  //ceci roule avant tout , ajoutera pageProps a this.props
  // sert a lancer les query le fetch de data avant chaque page , en server render.
  static async getInitialProps({Component, ctx}) {
    let pageProps = {};
    if(Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    //ceci expose les url query au user (/id2-3-4...)
    pageProps.query = ctx.query;
    return { pageProps }
  }
  render() {
    const { Component, apollo, pageProps } = this.props;
    return (
      <Container>
        <ApolloProvider client={apollo}>
        <Page>
          <Component {...pageProps}/>
        </Page>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withData(myApp);
