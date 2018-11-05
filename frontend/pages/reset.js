import Reset from '../components/Reset.js';

const resetPage = (props) => {
 return (
    <div>
      {/*<p>Réinitialiser votre mot de passe {props.query.resetToken}</p>*/}
      <Reset resetToken={props.query.resetToken}/>
    </div>
  )
};



export default resetPage;
