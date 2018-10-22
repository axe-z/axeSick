import Link from 'next/link'

const Home = (props) => {
 return (
    <div>
      home
      <Link href="/sell">
        <a>Vend!</a>
      </Link>
    </div>
  )
};



export default Home;
