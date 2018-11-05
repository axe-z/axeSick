import UpdateItem from '../components/UpdateItem.js';

const Update = (props) => {
 return (
    <div>
    <UpdateItem id={props.query.id}/>
    </div>
  )
};



export default Update;
