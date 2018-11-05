import Items from '../components/Items.js'

const Home = (props) => {
  // console.log(props.query.page)
 return (
    <div>
      <Items page={parseFloat(props.query.page) || 1}/>
    </div>
  )
};



export default Home;
