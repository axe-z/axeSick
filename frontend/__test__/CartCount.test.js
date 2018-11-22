import CartCount from '../components/CartCount';
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';


describe('Carcount comp.', () => {
    //va voir si il fonctionne tout court 
    it('render t il', () => {
        shallow(<CartCount  count={10}/>)
    });
    //va regarder le component 
    it('match le snapshot', () => {
        const wrapper = shallow(<CartCount  count={10}/>);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
    // peut meme regarder si les props entre biens 
    it('can update via props', () => {
        const wrapper = shallow(<CartCount  count={50}/>);
        expect(toJSON(wrapper)).toMatchSnapshot();
        wrapper.setProps({count: 10}) // on lance sur this.props 
    });
    
})