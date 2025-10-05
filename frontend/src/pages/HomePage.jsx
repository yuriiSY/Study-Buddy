import MainMenu from '../components/MainMenu/MainMenu';
import Layout from '../components/Layout/Layout';
import Modules from '../components/Modules/Modules';
import Footer from '../components/Footer/Footer';


export const HomePage = () => {
  return (
  <>
    <Layout>
        <MainMenu />
        <Modules />
    </Layout>
    {/* <Footer /> */}
  </>
  );
};