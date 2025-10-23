import Layout from "../../components/Layout/Layout";
import AvailableMaterials from "../../components/AvailableMaterials/AvailableMaterials";
import FeatureHeader from "../../components/FeatureHeader/FeatureHeader";
import Header from "../../components/Header/Header";

export const CreateStudySpacePage = ({ type }) => {
  return (
    <>
      <Layout>
        <Header />
        <FeatureHeader />
        <AvailableMaterials type={type} />
      </Layout>
    </>
  );
};
